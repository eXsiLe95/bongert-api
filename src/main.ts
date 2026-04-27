import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.enableShutdownHooks();

  const logger = app.get(Logger);
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const dataSource = app.get(DataSource);

  await dataSource.query('SELECT 1');
  logger.log('Database connection verified', 'Bootstrap');

  await app.listen(config.port, '0.0.0.0');
  logger.log(`Application listening on port ${config.port}`, 'Bootstrap');
}

void bootstrap();
