import { DataSource } from 'typeorm';
import {
  getDatabaseConfigFromEnv,
  validateDatabaseConfig,
} from '../config/database.config';
import { buildDataSourceOptions } from './typeorm.options';

validateDatabaseConfig(process.env);

export default new DataSource(
  buildDataSourceOptions(getDatabaseConfigFromEnv(process.env)),
);
