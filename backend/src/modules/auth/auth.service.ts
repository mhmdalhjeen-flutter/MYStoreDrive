import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { UserRole } from "../users/enums/user-role.enum";
import { InvalidOTPException } from "../../common/exceptions/business.exception";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateOTP(phoneNumber: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        parseInt(
          this.configService
            .get<string>("OTP_EXPIRES_IN", "10m")
            .replace("m", ""),
        ),
    );

    const existingOtp = await this.prisma.otpRecord.findFirst({
      where: {
        phoneNumber,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (existingOtp) {
      throw new ConflictException("Please wait before requesting another OTP");
    }

    await this.prisma.otpRecord.create({
      data: {
        phoneNumber,
        code: await this.hashOTP(otp),
        expiresAt,
      },
    });

    // TODO: replace with real SMS provider
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `OTP generated for ${phoneNumber} (dev only — not logged in production)`,
      );
    }

    return otp;
  }

  async verifyOTP(
    phoneNumber: string,
    code: string,
  ): Promise<{ valid: boolean; isNewUser: boolean }> {
    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        phoneNumber,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      throw new InvalidOTPException("Invalid or expired OTP");
    }

    if (
      otpRecord.attempts >=
      parseInt(this.configService.get<string>("OTP_MAX_ATTEMPTS", "3"))
    ) {
      throw new InvalidOTPException(
        "Too many attempts. Please request a new OTP",
      );
    }

    const isValid = await this.compareOTP(code, otpRecord.code);

    if (!isValid) {
      await this.prisma.otpRecord.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      throw new InvalidOTPException("Invalid OTP");
    }

    await this.prisma.otpRecord.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    const isNewUser = !user;

    if (isNewUser) {
      await this.usersService.create({
        phoneNumber,
        role: UserRole.CUSTOMER,
      });
    } else if (!user.isPhoneVerified) {
      await this.usersService.verifyPhone(user.id);
    }

    return { valid: true, isNewUser };
  }

  async loginWithOTP(phoneNumber: string, code: string) {
    await this.verifyOTP(phoneNumber, code);
    const user = await this.usersService.findByPhoneNumber(phoneNumber);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
      },
      ...tokens,
    };
  }

  async adminLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException("Admin must have a password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
      },
      ...tokens,
    };
  }

  async generateTokens(userId: string, role: UserRole) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        "JWT_REFRESH_EXPIRES_IN",
        "30d",
      ),
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return this.generateTokens(user.id, user.role);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(
      parseInt(this.configService.get<string>("BCRYPT_ROUNDS", "12")),
    );
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async hashOTP(code: string): Promise<string> {
    const salt = await bcrypt.genSalt(
      parseInt(this.configService.get<string>("BCRYPT_ROUNDS", "12")),
    );
    return bcrypt.hash(code, salt);
  }

  private async compareOTP(code: string, hash: string): Promise<boolean> {
    return bcrypt.compare(code, hash);
  }
}
