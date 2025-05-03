import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import { testUserMockWithPassword } from './mocks/user.mock';
import { TaskStatus } from '../src/tasks/entities/task.entity';

let app: INestApplication;
let accessToken: string;
let taskId: number;
let commentId: number;
let refreshToken: string;
let projectId: number;

describe('E2E Flow', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.get(DataSource).synchronize(true);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Register user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...testUserMockWithPassword,
      })
      .expect(201);
  });

  it('Login user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...testUserMockWithPassword })
      .expect(201);

    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('Refresh token should return new access token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
  });

  it('Refresh token should fail if refresh_token is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({})
      .expect(400);

    expect(res.body.message).toStrictEqual([
      'refresh_token must be a string',
      'refresh_token should not be empty',
    ]);
  });

  it('Update user profile', async () => {
    await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: testUserMockWithPassword.email.concat('m'),
        username: 'changeduser',
      })
      .expect(200);
  });

  it('should create project first', async () => {
    const res = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Project' })
      .expect(201);

    projectId = res.body.id;
    expect(projectId).toBeDefined();
  });

  it('Create task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Task',
        description: 'Test description',
        projectId: projectId,
      })
      .expect(201);

    taskId = res.body.id;
    expect(taskId).toBeDefined();
    expect(res.body.project.id).toBe(projectId);
  });

  it('Get tasks', async () => {
    const res = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Update task status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: TaskStatus.IN_PROGRESS })
      .expect(200);

    expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('Assign task', async () => {
    const res = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: 1 })
      .expect(201);

    expect(res.body.assignee.id).toBe(1);
  });

  it('Add comment to task', async () => {
    const res = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'First comment' })
      .expect(201);

    commentId = res.body.id;
    expect(commentId).toBeDefined();
  });

  it('Get comments for task', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Delete comment', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('Get own profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(testUserMockWithPassword.email.concat('m'));
  });

  it('Change password', async () => {
    await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: testUserMockWithPassword.password,
        newPassword: testUserMockWithPassword.password.concat('123'),
      })
      .expect(200);
  });

  it('Delete task', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
  it('Logout user (invalidate refresh token)', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refresh_token: refreshToken })
      .expect(201);

    // მერე ვცადოთ იგივე refresh token-ით განახლება -> უნდა ჩაფლავდეს
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(401);
  });
});
