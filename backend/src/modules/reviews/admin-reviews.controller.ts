import { Controller, Get } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { ReviewsService } from "./reviews.service";
import { UserRole } from "../users/enums/user-role.enum";

@Controller("admin/reviews")
@Roles(UserRole.ADMIN)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll() {
    return this.reviewsService.findAllAdmin();
  }
}
