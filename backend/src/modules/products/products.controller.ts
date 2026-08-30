import { Controller, Get, Query, Param } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { ProductsService } from "./products.service";
import { PaginationDto } from "../../common/dtos/pagination.dto";

@Controller("products")
@Public()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query("categoryId") categoryId?: string,
  ) {
    return this.productsService.findAll({
      skip: paginationDto.skip,
      take: paginationDto.limit,
      where: {
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: {
        [paginationDto.sortBy]: paginationDto.sortOrder,
      },
    });
  }

  @Get("recommended")
  async getRecommended() {
    return this.productsService.findRecommended();
  }

  @Get("offers")
  async getOffers() {
    return this.productsService.findOffers();
  }

  @Get("search")
  async search(@Query("q") query: string) {
    return this.productsService.search(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.productsService.findOneActive(id);
  }
}
