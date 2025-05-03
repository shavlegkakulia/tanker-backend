import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';

@Module({
  imports: [UsersModule, RefreshTokenModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // თუ AuthService-ს სხვაგანაც იყენებ
})
export class AuthModule {}
