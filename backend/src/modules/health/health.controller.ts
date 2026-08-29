import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @SkipThrottle()
  @Get()
  check() {
    return this.healthService.check();
  }

  @Public()
  @SkipThrottle()
  @Get('db')
  checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
