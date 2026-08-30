import { Type } from "class-transformer";
import { IsOptional, IsInt, Min, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: "Search query" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Sort field" })
  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Sort order (asc or desc)",
    default: "desc",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }
}
