import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { AdminOrdersController } from "./admin-orders.controller";
import { CartModule } from "../cart/cart.module";
import { DeliveryModule } from "../delivery/delivery.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [CartModule, DeliveryModule, SettingsModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
