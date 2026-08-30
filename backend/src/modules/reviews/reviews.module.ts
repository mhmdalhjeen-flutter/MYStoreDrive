import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { AdminReviewsController } from "./admin-reviews.controller";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [ProductsModule],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
