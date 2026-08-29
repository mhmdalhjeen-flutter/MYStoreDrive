import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

@Controller('categories')
@Public()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
