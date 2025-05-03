import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import {
  testUserEntity,
  testUserMockWithId,
  testUserMockWithPassword,
} from '../../test/mocks/user.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-refresh-secret'),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            deleteAllForUser: jest.fn(),
            create: jest.fn(),
            findByToken: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  describe('register', () => {
    it('should hash the password and create a user', async () => {
      jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(testUserMockWithId as User);

      const result = await authService.register(testUserMockWithPassword);

      expect(result).toEqual({
        id: testUserMockWithId.id,
        username: testUserMockWithId.username,
        email: testUserMockWithId.email,
      });
    });
  });

  describe('login', () => {
    it('should throw if user does not exist', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login(testUserMockWithPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password does not match', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(testUserEntity);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(testUserMockWithPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens if login is successful and save refresh token', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(testUserEntity);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login(testUserMockWithPassword);

      expect(refreshTokenService.deleteAllForUser).toHaveBeenCalledWith(
        testUserEntity.id,
      );

      expect(refreshTokenService.create).toHaveBeenCalled();

      expect(result).toEqual({
        access_token: 'fake-jwt-token',
        refresh_token: 'fake-jwt-token',
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw if refresh token is not found', async () => {
      jest.spyOn(refreshTokenService, 'findByToken').mockResolvedValue(null);

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if refresh token is expired', async () => {
      const expiredToken = {
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // expired
        user: testUserEntity,
      };

      jest
        .spyOn(refreshTokenService, 'findByToken')
        .mockResolvedValue(expiredToken as any);

      await expect(authService.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(refreshTokenService.delete).toHaveBeenCalledWith('expired-token');
    });

    it('should generate new tokens if refresh token is valid', async () => {
      const validToken = {
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // valid
        user: testUserEntity,
      };

      jest
        .spyOn(refreshTokenService, 'findByToken')
        .mockResolvedValue(validToken as any);

      const result = await authService.refreshToken('valid-token');

      expect(refreshTokenService.delete).toHaveBeenCalledWith('valid-token');
      expect(refreshTokenService.create).toHaveBeenCalled();

      expect(result).toEqual({
        access_token: 'fake-jwt-token',
      });
    });
  });
});
