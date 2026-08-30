import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { SupportService } from './support.service';
import { CreateSupportMessageDto } from './dtos/create-support-message.dto';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
@Roles(UserRole.CUSTOMER)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('messages')
  findMine(@CurrentUser('id') userId: string) {
    return this.supportService.findMine(userId);
  }

  @Post('messages')
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSupportMessageDto,
  ) {
    return this.supportService.createCustomerMessage(userId, dto);
  }
}
