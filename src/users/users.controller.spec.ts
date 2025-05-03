import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };

  const mockUsersService = {
    findById: jest.fn().mockResolvedValue(mockUser),
    updateUser: jest.fn().mockResolvedValue(mockUser),
    changePassword: jest
      .fn()
      .mockResolvedValue({ message: 'Password changed successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should return current user (getMe)', async () => {
    const result = await controller.getMe({ user: { userId: 1 } });
    expect(service.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });

  it('should update user profile', async () => {
    const dto: UpdateProfileDto = {
      username: 'newname',
      email: 'new@example.com',
    };
    const result = await controller.updateMe({ user: { userId: 1 } }, dto);
    expect(service.updateUser).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(mockUser);
  });

  it('should change user password', async () => {
    const dto: UpdatePasswordDto = {
      oldPassword: 'oldpass',
      newPassword: 'newpass',
    };
    const result = await controller.updatePassword(
      { user: { userId: 1 } },
      dto,
    );
    expect(service.changePassword).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ message: 'Password changed successfully' });
  });
});
