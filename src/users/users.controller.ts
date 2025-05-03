import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile info' })
  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile info' })
  @Patch('me')
  async updateMe(@Request() req, @Body() body: UpdateProfileDto) {
    return this.usersService.updateUser(req.user.userId, body); // ველი: username/email
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @Patch('me/password')
  async updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.usersService.changePassword(req.user.userId, dto);
  }
}
