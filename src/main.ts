import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigType } from '@nestjs/config';
import { DataSource } from 'typeorm';
import appConfig from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Initialize app
  const app = await NestFactory.create(AppModule);

  // Instantiate config service
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const dataSource = app.get(DataSource);

  await dataSource.query('SELECT 1');
  logger.log('Database connection verified');

  // Start app
  await app.listen(config.port, '0.0.0.0');
}

bootstrap();
