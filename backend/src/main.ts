import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import * as winston from 'winston';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { corsOrigins } from './config/env.validation';

const isProduction = process.env.NODE_ENV === 'production';

function createTransports(): winston.transport[] {
  if (isProduction) {
    return [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    ];
  }

  return [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? '\n' + trace : ''}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({ transports: createTransports() }),
  });

  // Security headers. CSP is enabled in production only: its defaults block the
  // inline scripts Swagger UI needs, and Swagger is a development tool here.
  app.use(helmet({ contentSecurityPolicy: isProduction }));

  // Required for correct client IPs (rate limiting) behind a cloud load balancer
  app.set('trust proxy', 1);
  app.enableShutdownHooks();

  // Global validation pipe
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

  // Global exception filter and response transform
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS configuration
  const allowedOrigins = corsOrigins(process.env);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // API prefix. Health checks stay unprefixed so cloud probes can use /health.
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix, { exclude: ['health', 'health/db'] });

  // Swagger documentation (disabled in production unless explicitly enabled)
  if (!isProduction || process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Arabic E-Commerce API')
      .setDescription('Backend API for Arabic RTL E-commerce Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  const logger = new Logger('Bootstrap');
  const port = parseInt(process.env.PORT || process.env.BACKEND_PORT || '3001', 10);

  await app.listen(port, '0.0.0.0');

  logger.log(`Backend API listening on port ${port} (prefix: /${apiPrefix})`);
  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ') || 'none'}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(`Failed to start backend: ${error.message}`);
  process.exit(1);
});
