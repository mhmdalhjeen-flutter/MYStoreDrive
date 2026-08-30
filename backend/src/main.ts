import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { validateEnvForRuntime } from "./config/env.validation";

async function bootstrap() {
  validateEnvForRuntime();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, trace }) => {
                return `${timestamp} [${context || "Application"}] ${level}: ${message}${trace ? "\n" + trace : ""}`;
              },
            ),
          ),
        }),
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads/",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const storeOrigin = process.env.STORE_FRONTEND_URL || "http://localhost:3000";
  const adminOrigin = process.env.ADMIN_FRONTEND_URL || "http://localhost:3002";

  app.enableCors({
    origin: [storeOrigin, adminOrigin],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const apiPrefix = process.env.API_PREFIX || "api";
  app.setGlobalPrefix(apiPrefix, {
    exclude: ["health", "health/db"],
  });

  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Arabic E-Commerce API")
      .setDescription("Backend API for Arabic RTL E-commerce Platform")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  await app.listen(port, "0.0.0.0");
  console.log(`Backend API is running on port ${port} (prefix: /${apiPrefix})`);
  console.log(`Health: http://localhost:${port}/health`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`API docs: http://localhost:${port}/${apiPrefix}/docs`);
  }
}

bootstrap();
