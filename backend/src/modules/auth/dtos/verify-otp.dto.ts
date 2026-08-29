import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ description: 'Phone number', example: '0591234567' })
  @IsString()
  @Matches(/^(059|056)\d{7}$/, {
    message: 'Phone number must start with 059 or 056 followed by 7 digits',
  })
  @Length(10, 10)
  phoneNumber: string;

  @ApiProperty({ description: 'OTP code', example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  code: string;
}
