import { validatedEnv } from './schema';

export default () => ({
  port: validatedEnv?.PORT,
  database_url: validatedEnv?.DATABASE_URL,
  redis_url: validatedEnv?.REDIS_URL,
  rabbitmq_url: validatedEnv?.RABBITMQ_URL,

  smtp_host: validatedEnv?.SMTP_HOST,
  smtp_port: validatedEnv?.SMTP_PORT,
  smtp_secure: validatedEnv?.SMTP_SECURE,
  smtp_user: validatedEnv?.SMTP_USER,
  smtp_pass: validatedEnv?.SMTP_PASS,
  mail_from: validatedEnv?.MAIL_FROM,

  allowed_origins: validatedEnv?.ALLOWED_ORIGINS,
});
