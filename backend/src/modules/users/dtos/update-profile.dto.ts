import { IsOptional, IsString, MinLength, IsEmail } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "User name" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ description: "User email" })
  @IsOptional()
  @IsEmail()
  email?: string;
}
