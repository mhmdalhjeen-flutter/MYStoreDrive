import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductAvailability, ProductCondition } from '@prisma/client';

export class CreateVariantDto {
  @ApiProperty({ description: 'Variant name (e.g., Red)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Variant value (e.g., #FF0000)' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Variant type (e.g., color, size)' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Price adjustment' })
  @IsOptional()
  @IsNumber()
  priceAdjustment?: number = 0;

  @ApiPropertyOptional({ description: 'Variant stock' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number = 0;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name (Arabic)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Product name (English)' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: 'Product description (Arabic)' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Product description (English)' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Value contributing to free delivery target' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryValue?: number = 0;

  @ApiPropertyOptional({ description: 'Availability type', enum: ProductAvailability })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability = ProductAvailability.UNLIMITED;

  @ApiPropertyOptional({ description: 'Stock quantity (only for LIMITED)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number = 0;

  @ApiPropertyOptional({ description: 'Is product available in catalog' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

  @ApiPropertyOptional({ description: 'Is recommended product' })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean = false;

  @ApiPropertyOptional({ description: 'Product condition', enum: ProductCondition })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition = ProductCondition.NEW;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @ApiPropertyOptional({ description: 'Image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[] = [];

  @ApiPropertyOptional({ description: 'Product variants' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
