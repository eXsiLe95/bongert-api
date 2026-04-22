import { ConfigType } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import databaseConfig from '../config/database.config';
import { buildNestTypeOrmOptions } from './typeorm.options';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [databaseConfig.KEY],
  useFactory: (dbConfig: ConfigType<typeof databaseConfig>) =>
    buildNestTypeOrmOptions(dbConfig),
};
