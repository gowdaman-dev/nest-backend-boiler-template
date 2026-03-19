import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        // configure transport options from environment variables with sensible defaults
        const host =
          config.get<string>('SMTP_HOST') ?? config.get<string>('EMAIL_HOST');
        const port = Number(
          config.get<string | number>('SMTP_PORT') ??
            config.get<string | number>('EMAIL_PORT') ??
            587,
        );
        const secureRaw =
          config.get<string>('SMTP_SECURE') ??
          config.get<string>('EMAIL_SECURE');
        const secure = String(secureRaw) === 'true';
        const user =
          config.get<string>('SMTP_USER') ?? config.get<string>('EMAIL_USER');
        const pass =
          config.get<string>('SMTP_PASS') ?? config.get<string>('EMAIL_PASS');
        const from =
          config.get<string>('MAIL_FROM') ?? config.get<string>('EMAIL_FROM');

        const candidates = [
          join(__dirname, 'templates'),
          join(process.cwd(), 'libs', 'email', 'src', 'templates'),
          join(process.cwd(), 'dist', 'libs', 'email', 'templates'),
          join(process.cwd(), 'dist', 'apps', 'gateway', 'templates'),
        ];
        const templateDir =
          candidates.find((p) => existsSync(p)) || join(__dirname, 'templates');
        return {
          transport: {
            host,
            port,
            secure,
            auth: user && pass ? { user, pass } : undefined,
            pool: true,
            maxConnections: 20,
            maxMessages: 200,
          },
          defaults: {
            from: from ? `"No Reply" <${from}>` : undefined,
          },
          template: {
            dir: templateDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    // BullMQ configuration for mail queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379',
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'mail-queue' }),
  ],
  providers: [EmailService, MailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
