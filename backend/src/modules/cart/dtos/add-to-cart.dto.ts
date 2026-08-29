import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsOptional()
  @IsString()
  variantId?: string;
}
