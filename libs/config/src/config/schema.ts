import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string().optional(),

  // RabbitMQ
  RABBITMQ_URL: z.string().optional(),

  // Email (SMTP)
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.enum(['true', 'false']).default('false'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  MAIL_FROM: z.string(),

  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173')
    .refine((val) => {
      const origins = val.split(',').map((origin) => origin.trim());
      return origins.every((origin) => {
        try {
          new URL(origin);
          return true;
        } catch {
          return false;
        }
      });
    }, 'ALLOWED_ORIGINS must be a comma-separated list of valid URLs'),
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.message);
    // retry logic or fallback to defaults can be implemented here
    setTimeout(() => {
      Promise.resolve().then(() => validateEnv());
    }, 5000); // Retry after 5 seconds
  }
  return result.data;
};
const validatedEnv = validateEnv();
export { validatedEnv };
