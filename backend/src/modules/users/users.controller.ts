import { Controller, Get, UseGuards, Put, Body } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dtos/update-profile.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  async getProfile(@CurrentUser("id") userId: string) {
    return this.usersService.findById(userId);
  }

  @Put("profile")
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.update(userId, updateProfileDto);
  }
}
