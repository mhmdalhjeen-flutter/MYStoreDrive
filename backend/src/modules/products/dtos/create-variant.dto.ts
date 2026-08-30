import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateVariantDto {
  @ApiProperty({ description: "Variant name (e.g., Red)" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Variant value (e.g., #FF0000)" })
  @IsString()
  value: string;

  @ApiProperty({ description: "Variant type (e.g., color, size)" })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: "Price adjustment" })
  @IsOptional()
  @IsNumber()
  priceAdjustment?: number = 0;

  @ApiPropertyOptional({ description: "Variant stock" })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number = 0;
}
