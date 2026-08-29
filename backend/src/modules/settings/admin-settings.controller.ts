import { Controller, Put, Body } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('admin/settings')
@Roles(UserRole.ADMIN)
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put()
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }
}
