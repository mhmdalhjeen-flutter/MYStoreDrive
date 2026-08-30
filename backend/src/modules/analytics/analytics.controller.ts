import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../users/enums/user-role.enum";
import { AnalyticsService } from "./analytics.service";

@ApiTags("admin-analytics")
@ApiBearerAuth()
@Controller("admin/analytics")
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("overview")
  getOverview() {
    return this.analyticsService.getOverview();
  }
}
