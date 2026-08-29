import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Public()
  @Get('delivery')
  async getDeliverySettings() {
    return this.settingsService.getDeliverySettings();
  }

  @Public()
  @Get('store-status')
  async getStoreStatus() {
    return this.settingsService.getStoreStatus();
  }
}
