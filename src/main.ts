import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigType } from '@nestjs/config';
import appConfig from './config/app.config';

async function bootstrap() {
  // Initialize app
  const app = await NestFactory.create(AppModule);

  // Instantiate config service
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  // Start app
  await app.listen(config.port, '0.0.0.0');
}

bootstrap();
