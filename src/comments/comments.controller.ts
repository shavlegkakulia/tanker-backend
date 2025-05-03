import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment' })
  @Post()
  create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.create(+taskId, dto, req.user);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comments for task' })
  @Get()
  findAll(@Param('taskId') taskId: string, @Request() req) {
    return this.commentsService.findByTask(+taskId, req.user.userId);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  @Delete(':commentId')
  remove(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.commentsService.remove(+taskId, +commentId, req.user.userId);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update comment' })
  @Patch(':commentId')
  update(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(
      +taskId,
      +commentId,
      dto,
      req.user.userId,
    );
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to comment' })
  @Post(':commentId/replies')
  reply(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() dto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.replyToComment(
      +taskId,
      +commentId,
      dto,
      req.user,
    );
  }
}
