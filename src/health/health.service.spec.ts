import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(() => {
    healthService = new HealthService();
  });

  it('should return ok status with an ISO timestamp', () => {
    const health = healthService.getHealth();

    expect(health.status).toBe('ok');
    expect(health.timestamp).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(health.timestamp))).toBe(false);
  });
});
