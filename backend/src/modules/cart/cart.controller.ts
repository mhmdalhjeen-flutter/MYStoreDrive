import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dtos/add-to-cart.dto";
import { UpdateCartItemDto } from "./dtos/update-cart-item.dto";
import { UserRole } from "../users/enums/user-role.enum";

@Controller("cart")
@Roles(UserRole.CUSTOMER)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(
    @CurrentUser("id") userId: string,
    @Query("deliveryAreaId") deliveryAreaId?: string,
  ) {
    return this.cartService.getCart(userId, deliveryAreaId);
  }

  @Get("summary")
  async getSummary(
    @CurrentUser("id") userId: string,
    @Query("deliveryAreaId") deliveryAreaId?: string,
  ) {
    return this.cartService.getSummary(userId, deliveryAreaId);
  }

  @Post("items")
  async addToCart(
    @CurrentUser("id") userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(
      userId,
      addToCartDto.productId,
      addToCartDto.quantity,
      addToCartDto.variantId,
    );
  }

  @Put("items/:id")
  async updateCartItem(
    @CurrentUser("id") userId: string,
    @Param("id") cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      userId,
      cartItemId,
      updateCartItemDto.quantity,
    );
  }

  @Delete("items/:id")
  async removeFromCart(
    @CurrentUser("id") userId: string,
    @Param("id") cartItemId: string,
  ) {
    return this.cartService.removeFromCart(userId, cartItemId);
  }

  @Delete()
  async clearCart(@CurrentUser("id") userId: string) {
    return this.cartService.clearCart(userId);
  }
}
