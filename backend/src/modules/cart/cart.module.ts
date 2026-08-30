import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { ProductsModule } from "../products/products.module";
import { DeliveryModule } from "../delivery/delivery.module";

@Module({
  imports: [ProductsModule, DeliveryModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
