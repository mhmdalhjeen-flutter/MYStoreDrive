import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  async getSettings() {
    return this.settingsService.getPublicSettings();
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

  @Public()
  @Get('payment')
  async getPaymentSettings() {
    return this.settingsService.getPaymentSettings();
  }
}
