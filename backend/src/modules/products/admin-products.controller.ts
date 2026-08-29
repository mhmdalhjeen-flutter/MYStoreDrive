import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('admin/products')
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.productsService.findAll({
      skip: paginationDto.skip,
      take: paginationDto.limit,
      orderBy: { [paginationDto.sortBy]: paginationDto.sortOrder },
      includeInactive: includeInactive === 'true',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
