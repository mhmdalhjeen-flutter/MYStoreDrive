import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateOrderDto {
  @ApiProperty({ description: "Active delivery area id" })
  @IsString()
  @IsNotEmpty()
  deliveryAreaId: string;

  @ApiProperty({ description: "Detailed delivery address in Arabic" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  deliveryAddress: string;

  @ApiPropertyOptional({ description: "Optional customer notes" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
