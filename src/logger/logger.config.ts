import { ConfigType } from '@nestjs/config';
import type { LoggerModuleAsyncParams } from 'nestjs-pino';
import appConfig from '../config/app.config';

export const loggerConfig: LoggerModuleAsyncParams = {
  inject: [appConfig.KEY],
  useFactory: (config: ConfigType<typeof appConfig>) => ({
    pinoHttp: {
      level: config.env === 'test' ? 'silent' : 'info',
      transport:
        config.env !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
    },
  }),
};
