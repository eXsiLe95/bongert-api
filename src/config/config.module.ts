import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from './app.config';
import databaseConfig from './database.config';
import { AppEnvironment } from './config.types';

const nodeEnv = (process.env.NODE_ENV ?? 'development') as AppEnvironment;
const envFilePaths = [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
      load: [appConfig, databaseConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        APP_PORT: Joi.number().integer().port().required(),

        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().integer().port().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
  ],
})
export class AppConfigModule {}
