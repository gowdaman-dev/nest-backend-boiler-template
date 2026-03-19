import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SendMailDto } from './dto/send-mail.dto';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<SendMailDto>): Promise<void> {
    const { to, subject, html, text, from, template, templateData } = job.data;

    const configuredFrom =
      this.config.get<string>('MAIL_FROM') ??
      this.config.get<string>('EMAIL_FROM') ??
      this.config.get<string>('SMTP_USER');
    if (!configuredFrom) {
      this.logger.warn(
        'No default FROM configured (MAIL_FROM/EMAIL_FROM/SMTP_USER). SMTP servers may reject relaying.',
      );
    }

    const effectiveFrom = from ?? configuredFrom;

    const mailOptions: any = { to, subject, from: effectiveFrom };
    // Ensure SMTP envelope uses the configured sender to avoid relay blocking
    if (configuredFrom) {
      mailOptions.envelope = { from: configuredFrom, to };
    }
    if (template) {
      mailOptions.template = template;
      mailOptions.context = templateData || {};
    } else {
      if (html) mailOptions.html = html;
      if (text) mailOptions.text = text;
    }

    try {
      await this.mailer.sendMail(mailOptions);
      this.logger.log(`Sent email to ${to} (job id=${job.id})`);
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${to} (job id=${job.id}): ${(err as Error).message || err}`,
      );
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  handleFailed(job: Job, error: Error) {
    this.logger.error(`Email job failed (id=${job.id})`, error.stack);
  }
}
