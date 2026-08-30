import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(32, {
    message: "JWT_SECRET must be at least 32 characters in production",
  })
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_SECRET?: string;

  @IsOptional()
  @IsString()
  BACKEND_URL?: string;

  @IsOptional()
  @IsString()
  STORE_FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  ADMIN_FRONTEND_URL?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .flatMap((e) => Object.values(e.constraints ?? {}))
      .join("; ");
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validated;
}

export function validateEnvForRuntime() {
  const isProduction = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test";

  if (isTest) {
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "JWT_SECRET must be at least 32 characters in production",
      );
    }
    if (!process.env.STORE_FRONTEND_URL || !process.env.ADMIN_FRONTEND_URL) {
      throw new Error(
        "STORE_FRONTEND_URL and ADMIN_FRONTEND_URL are required in production",
      );
    }
  }
}
