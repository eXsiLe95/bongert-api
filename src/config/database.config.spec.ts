import {
  getDatabaseConfigFromEnv,
  validateDatabaseConfig,
} from './database.config';
import { getEnvFilePaths, getNodeEnv } from './env.validation';

describe('config helpers', () => {
  it('uses development as default node environment', () => {
    expect(getNodeEnv({})).toBe('development');
    expect(getEnvFilePaths({})).toEqual([
      '.env.development.local',
      '.env.development',
      '.env',
    ]);
  });

  it('maps database env vars into the database config shape', () => {
    expect(
      getDatabaseConfigFromEnv({
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USER: 'postgres',
        DB_PASSWORD: 'postgres',
        DB_NAME: 'bongert',
      }),
    ).toEqual({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'bongert',
    });
  });

  it('throws for incomplete database config', () => {
    expect(() =>
      validateDatabaseConfig({
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USER: 'postgres',
        DB_PASSWORD: 'postgres',
      }),
    ).toThrow('"database" is required');
  });
});
