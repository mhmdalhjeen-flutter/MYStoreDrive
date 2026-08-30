import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { SupportService } from './support.service';
import { AdminReplySupportDto } from './dtos/admin-reply-support.dto';

@ApiTags('admin-support')
@ApiBearerAuth()
@Controller('admin/support')
@Roles(UserRole.ADMIN)
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('messages')
  findAll(@Query('unreadOnly') unreadOnly?: string) {
    return this.supportService.findAllAdmin(unreadOnly === 'true');
  }

  @Get('threads/:userId')
  findThread(@Param('userId') userId: string) {
    return this.supportService.findThreadAdmin(userId);
  }

  @Post('threads/:userId/reply')
  reply(@Param('userId') userId: string, @Body() dto: AdminReplySupportDto) {
    return this.supportService.replyAdmin(userId, dto);
  }

  @Patch('threads/:userId/read')
  markRead(@Param('userId') userId: string) {
    return this.supportService.markThreadRead(userId);
  }
}
