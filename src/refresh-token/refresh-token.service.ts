import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async create(user: User, token: string, expiresIn: string) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.parseExpire(expiresIn));

    const refreshToken = this.refreshTokenRepo.create({
      user,
      token,
      expiresAt,
    });

    return this.refreshTokenRepo.save(refreshToken);
  }

  async findByToken(token: string) {
    return this.refreshTokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async delete(token: string) {
    await this.refreshTokenRepo.delete({ token });
  }

  async deleteAllForUser(userId: number) {
    await this.refreshTokenRepo.delete({ user: { id: userId } });
  }

  private parseExpire(expireStr: string): number {
    // EX: "7d" -> 7 * 86400 seconds
    const match = expireStr.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 0;
    }
  }
}
