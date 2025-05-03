// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: bcrypt.hashSync('oldpassword', 10),
};

describe('UsersService - changePassword', () => {
  let service: UsersService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(undefined),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should change password when old password matches', async () => {
    const result = await service.changePassword(mockUser.id, {
      oldPassword: 'oldpassword',
      newPassword: 'newstrongpassword',
    });
    expect(userRepo.update).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Password changed successfully' });
  });

  it('should throw if old password is incorrect', async () => {
    await expect(
      service.changePassword(mockUser.id, {
        oldPassword: 'wrongpassword',
        newPassword: 'newstrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if old and new passwords are the same', async () => {
    await expect(
      service.changePassword(mockUser.id, {
        oldPassword: 'oldpassword',
        newPassword: 'oldpassword',
      }),
    ).rejects.toThrow();
  });

  describe('updateProfile', () => {
    it('should update username and email', async () => {
      const updatedUser = {
        ...mockUser,
        username: 'newname',
        email: 'new@example.com',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(updatedUser);

      const result = await service.updateUser(mockUser.id, {
        username: 'newname',
        email: 'new@example.com',
      });

      expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
        username: 'newname',
        email: 'new@example.com',
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        passwordHash: 'hashed',
      };

      const result = await service.create(newUser);

      expect(userRepo.create).toHaveBeenCalledWith(newUser);
      expect(userRepo.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const result = await service.findById(1);
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const result = await service.findByEmail('test@example.com');
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
