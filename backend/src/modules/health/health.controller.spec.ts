import { INestApplication, Logger } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import helmet from 'helmet';
import * as request from 'supertest';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('Health endpoints', () => {
  let app: INestApplication;
  const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 1 }])],
      controllers: [HealthController],
      providers: [
        HealthService,
        Reflector,
        { provide: PrismaService, useValue: prisma },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(helmet({ contentSecurityPolicy: false }));
    app.setGlobalPrefix('api', { exclude: ['health', 'health/db'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves GET /health outside the API prefix, unauthenticated and unthrottled', async () => {
    for (let i = 0; i < 3; i++) {
      const response = await request(app.getHttpServer()).get('/health').expect(200);
      expect(response.body.status).toBe('ok');
    }

    await request(app.getHttpServer()).get('/api/health').expect(404);
  });

  it('sets security headers from helmet', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('serves GET /health/db when the database responds', async () => {
    const response = await request(app.getHttpServer()).get('/health/db').expect(200);

    expect(response.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('returns 503 without database details when the database is down', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(
      new Error('Can\'t reach database server at postgresql://user:secret@host:5432/db'),
    );
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const response = await request(app.getHttpServer()).get('/health/db').expect(503);

    expect(JSON.stringify(response.body)).not.toContain('secret');
  });
});
