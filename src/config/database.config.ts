import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseConfig } from './config.types';

export const databaseConfigSchema = Joi.object<DatabaseConfig>({
  host: Joi.string().required(),
  port: Joi.number().integer().port().required(),
  user: Joi.string().required(),
  password: Joi.string().required(),
  database: Joi.string().required(),
});

export function getDatabaseConfigFromEnv(
  env: NodeJS.ProcessEnv,
): DatabaseConfig {
  return {
    host: env.DB_HOST!,
    port: parseInt(env.DB_PORT!, 10),
    user: env.DB_USER!,
    password: env.DB_PASSWORD!,
    database: env.DB_NAME!,
  };
}

export function validateDatabaseConfig(env: NodeJS.ProcessEnv): DatabaseConfig {
  const validationResult = databaseConfigSchema.validate(
    getDatabaseConfigFromEnv(env),
    {
      abortEarly: true,
      allowUnknown: false,
    },
  );

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.value;
}

export default registerAs(
  'database',
  (): DatabaseConfig => validateDatabaseConfig(process.env),
);
