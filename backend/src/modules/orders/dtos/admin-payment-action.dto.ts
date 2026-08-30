import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminPaymentActionDto {
  @ApiPropertyOptional({ description: 'Admin notes about the payment decision' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminPaymentNotes?: string;
}
