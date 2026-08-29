import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliveryAreaDto {
  @ApiProperty({ description: 'Area name (Arabic)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Area name (English)' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: 'Delivery fee' })
  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @ApiPropertyOptional({ description: 'Eligible for free delivery', default: true })
  @IsOptional()
  @IsBoolean()
  eligibleForFreeDelivery?: boolean = true;

  @ApiPropertyOptional({ description: 'Is area active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
