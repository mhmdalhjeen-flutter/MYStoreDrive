import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity' })
  @IsInt()
  @Min(0)
  quantity: number;
}
