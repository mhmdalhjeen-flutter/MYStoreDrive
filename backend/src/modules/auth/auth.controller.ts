import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { SendOtpDto } from "./dtos/send-otp.dto";
import { VerifyOtpDto } from "./dtos/verify-otp.dto";
import { AdminLoginDto } from "./dtos/admin-login.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { Public } from "../../common/decorators/public.decorator";

@Controller("auth")
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("send-otp")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    await this.authService.generateOTP(sendOtpDto.phoneNumber);
    return { message: "OTP sent successfully" };
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.loginWithOTP(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.code,
    );
  }

  @Post("admin/login")
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(
      adminLoginDto.email,
      adminLoginDto.password,
    );
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
