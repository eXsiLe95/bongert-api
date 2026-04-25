import { DataSource } from 'typeorm';
import { validateDatabaseConfig } from '../config/database.config';
import { buildDataSourceOptions } from './typeorm.options';

const databaseConfig = validateDatabaseConfig(process.env);

export default new DataSource(buildDataSourceOptions(databaseConfig));
