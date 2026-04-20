import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.types';

export default registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV as AppConfig['env'],
    port: parseInt(process.env.APP_PORT!, 10),
  }),
);
