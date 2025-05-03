import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      passwordHash: hashedPassword,
    });

    return { id: user.id, username: user.username, email: user.email };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.generateAccessToken(user.id, user.email);
    const refresh_token = this.generateRefreshToken(user.id, user.email);

    await this.refreshTokenService.deleteAllForUser(user.id); // OPTIONAL: removes old tokens
    await this.refreshTokenService.create(
      user,
      refresh_token,
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(oldToken: string) {
    const storedToken = await this.refreshTokenService.findByToken(oldToken);
    if (!storedToken) throw new UnauthorizedException('Refresh token invalid');

    if (storedToken.expiresAt.getTime() < new Date().getTime()) {
      await this.refreshTokenService.delete(oldToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = storedToken.user;

    const newAccessToken = this.generateAccessToken(user.id, user.email);
    const newRefreshToken = this.generateRefreshToken(user.id, user.email);

    // Replace old refresh token
    await this.refreshTokenService.delete(oldToken);
    await this.refreshTokenService.create(
      user,
      newRefreshToken,
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    );

    return { access_token: newAccessToken };
  }

  // Access Token გენერირება - მოკლე ვადით
  generateAccessToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
  // Refresh Token გენერირება - გრძელვადიანი
  generateRefreshToken(userId: number, email: string) {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    );
  }
  async logout(refreshToken: string) {
    await this.refreshTokenService.delete(refreshToken);
  }
}
