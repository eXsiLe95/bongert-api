export type AppEnvironment = 'development' | 'test' | 'production';

export interface AppConfig {
  env: AppEnvironment;
  port: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
