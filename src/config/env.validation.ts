import * as Joi from 'joi';
import { AppEnvironment } from './config.types';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  APP_PORT: Joi.number().integer().port().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().port().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});

export function getNodeEnv(env: NodeJS.ProcessEnv): AppEnvironment {
  return (env.NODE_ENV ?? 'development') as AppEnvironment;
}

export function getEnvFilePaths(env: NodeJS.ProcessEnv): string[] {
  const nodeEnv = getNodeEnv(env);

  return [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env'];
}
