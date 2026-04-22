import { ConfigType } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import databaseConfig from '../config/database.config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [databaseConfig.KEY],
  useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => ({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    autoLoadEntities: true,
    synchronize: false,
  }),
};
