import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(userId: number, data: UpdateProfileDto) {
    await this.userRepository.update(userId, data);
    return this.findById(userId);
  }

  async changePassword(
    userId: number,
    dto: { oldPassword: string; newPassword: string },
  ) {
    const user = await this.findById(userId);

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { passwordHash: hashed });

    return { message: 'Password changed successfully' };
  }
}
