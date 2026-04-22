import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('getHealth', () => {
    it('should return health status and timestamp', () => {
      const health = healthController.getHealth();

      expect(health.status).toBe('ok');
      expect(health.timestamp).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(health.timestamp))).toBe(false);
    });
  });
});
