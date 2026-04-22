import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HealthController } from './../src/health/health.controller';
import { HealthService } from './../src/health/health.service';
import { HealthResponse } from './../src/health/health.types';

describe('HealthController (integration)', () => {
  let app: INestApplication;
  let healthController: HealthController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    healthController = app.get(HealthController);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health returns status and timestamp through the application container', () => {
    const response: HealthResponse = healthController.getHealth();

    expect(response.status).toBe('ok');
    expect(typeof response.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
  });
});
