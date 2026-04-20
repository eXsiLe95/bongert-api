import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './config.types';

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  }),
);
