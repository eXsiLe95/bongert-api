import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AppLoggerModule } from './logger/logger.module';

@Module({
  imports: [AppConfigModule, AppLoggerModule, DatabaseModule, HealthModule],
})
export class AppModule {}
