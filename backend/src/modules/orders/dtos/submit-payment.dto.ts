import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitPaymentDto {
  @ApiProperty({ description: 'Payment reference or transfer details' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  paymentReference: string;

  @ApiPropertyOptional({ description: 'Optional customer payment notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  paymentNotes?: string;

  @ApiPropertyOptional({
    description: 'Payment proof file path/URL (upload module will populate)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  paymentProof?: string;
}
