import { Module } from "@nestjs/common";
import { DeliveryService } from "./delivery.service";
import { DeliveryController } from "./delivery.controller";
import { AdminDeliveryController } from "./admin-delivery.controller";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [SettingsModule],
  controllers: [DeliveryController, AdminDeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
