import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { DatabaseConfig } from '../config/config.types';

function getEntityPaths() {
  return [join(__dirname, '..', '**', '*.entity{.ts,.js}')];
}

function getMigrationPaths() {
  return [join(__dirname, '..', 'migrations', '*{.ts,.js}')];
}

export function buildDataSourceOptions(
  dbConfig: DatabaseConfig,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: getEntityPaths(),
    migrations: getMigrationPaths(),
    synchronize: false,
  };
}

export function buildNestTypeOrmOptions(
  dbConfig: DatabaseConfig,
): TypeOrmModuleOptions {
  return {
    ...buildDataSourceOptions(dbConfig),
    autoLoadEntities: true,
  };
}
