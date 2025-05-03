import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TestSafeThrottle } from '../common/decorators/test-safe-throttle.decorator';
import { RefreshDto } from './dto/refresh.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: 'Create account' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @ApiOperation({ summary: 'Log in' })
  @TestSafeThrottle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);

    return result;
  }
  @ApiOperation({ summary: 'Refresh token' })
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    if (!dto.refresh_token) {
      throw new UnauthorizedException('No refresh token');
    }
    return this.authService.refreshToken(dto.refresh_token);
  }
  @ApiOperation({ summary: 'Logout token' })
  @Post('logout')
  async logout(@Body() dto: RefreshDto) {
    if (!dto.refresh_token) {
      throw new UnauthorizedException('No refresh token');
    }

    await this.authService.logout(dto.refresh_token);

    return { message: 'Logged out successfully' };
  }
}
