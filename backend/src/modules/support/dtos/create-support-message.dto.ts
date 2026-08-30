import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSupportMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderId?: string;
}
