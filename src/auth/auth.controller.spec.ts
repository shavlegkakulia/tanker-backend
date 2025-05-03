import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import {
  testUserMockWithId,
  testUserMockWithPassword,
} from '../../test/mocks/user.mock';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      (authService.register as jest.Mock).mockResolvedValue(testUserMockWithId);

      const result = await controller.register(testUserMockWithPassword as any);

      expect(result).toEqual(testUserMockWithId);
      expect(authService.register).toHaveBeenCalledWith(
        testUserMockWithPassword,
      );
    });
  });

  describe('login', () => {
    it('should call authService.login and return tokens', async () => {
      const tokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      (authService.login as jest.Mock).mockResolvedValue(tokens);

      const result = await controller.login(testUserMockWithPassword as any);

      expect(result).toEqual(tokens);
      expect(authService.login).toHaveBeenCalledWith(testUserMockWithPassword);
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refresh token is missing', async () => {
      await expect(
        controller.refresh({ refresh_token: undefined }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call authService.refreshToken and return new access token', async () => {
      const newAccessToken = { access_token: 'new-access-token' };

      (authService.refreshToken as jest.Mock).mockResolvedValue(newAccessToken);

      const result = await controller.refresh({
        refresh_token: 'valid-refresh-token',
      });

      expect(result).toEqual(newAccessToken);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });
  });
  describe('logout', () => {
    it('should throw UnauthorizedException if refresh token is missing', async () => {
      await expect(
        controller.logout({ refresh_token: undefined }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call authService.logout and return success message', async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.logout({ refresh_token: 'valid-token' });

      expect(authService.logout).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
