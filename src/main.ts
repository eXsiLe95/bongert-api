import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.enableShutdownHooks();

    const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
    const dataSource = app.get(DataSource);

    await dataSource.query('SELECT 1');
    logger.log('Database connection verified');

    await app.listen(config.port, '0.0.0.0');
    logger.log(`Application listening on port ${config.port}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown bootstrap error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(`Application failed to start: ${errorMessage}`, errorStack);
    process.exitCode = 1;
  }
}

void bootstrap();
