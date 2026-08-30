import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserRole } from "../users/enums/user-role.enum";
import { FavoritesService } from "./favorites.service";

@ApiTags("favorites")
@ApiBearerAuth()
@Controller("favorites")
@Roles(UserRole.CUSTOMER)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.favoritesService.findAll(userId);
  }

  @Get(":productId/status")
  status(
    @CurrentUser("id") userId: string,
    @Param("productId") productId: string,
  ) {
    return this.favoritesService.isFavorite(userId, productId);
  }

  @Post(":productId")
  add(
    @CurrentUser("id") userId: string,
    @Param("productId") productId: string,
  ) {
    return this.favoritesService.add(userId, productId);
  }

  @Delete(":productId")
  remove(
    @CurrentUser("id") userId: string,
    @Param("productId") productId: string,
  ) {
    return this.favoritesService.remove(userId, productId);
  }
}
