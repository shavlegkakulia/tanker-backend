import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let repo: Repository<RefreshToken>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    repo = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
  });

  describe('create', () => {
    it('should calculate expiresAt and save token', async () => {
      const user = { id: 1 } as User;
      const token = 'test-token';
      const expiresIn = '7d';

      const mockEntity = { user, token, expiresAt: new Date() } as RefreshToken;

      (repo.create as jest.Mock).mockReturnValue(mockEntity);
      (repo.save as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.create(user, token, expiresIn);

      expect(repo.create).toHaveBeenCalledWith({
        user,
        token,
        expiresAt: expect.any(Date),
      });
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findByToken', () => {
    it('should call findOne with correct parameters', async () => {
      const token = 'test-token';
      const mockToken = { token } as RefreshToken;

      (repo.findOne as jest.Mock).mockResolvedValue(mockToken);

      const result = await service.findByToken(token);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { token },
        relations: ['user'],
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('delete', () => {
    it('should call delete with token', async () => {
      const token = 'test-token';

      await service.delete(token);

      expect(repo.delete).toHaveBeenCalledWith({ token });
    });
  });

  describe('deleteAllForUser', () => {
    it('should call delete with user id', async () => {
      const userId = 1;

      await service.deleteAllForUser(userId);

      expect(repo.delete).toHaveBeenCalledWith({ user: { id: userId } });
    });
  });

  describe('parseExpire', () => {
    it('should parse seconds', () => {
      expect((service as any).parseExpire('10s')).toBe(10);
    });

    it('should parse minutes', () => {
      expect((service as any).parseExpire('5m')).toBe(300);
    });

    it('should parse hours', () => {
      expect((service as any).parseExpire('2h')).toBe(7200);
    });

    it('should parse days', () => {
      expect((service as any).parseExpire('7d')).toBe(604800);
    });

    it('should return 0 for invalid format', () => {
      expect((service as any).parseExpire('invalid')).toBe(0);
    });
  });
});
