import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@InjectQueue('mail-queue') private readonly queue: Queue) {}

  async sendMail(data: SendMailDto) {
    const { to } = data;
    try {
      await this.queue.add('send-mail', data, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 200 },
        removeOnComplete: true,
      });
      this.logger.log(`Enqueued email to ${to}`);
      return { enqueued: true };
    } catch (err) {
      this.logger.error(
        `Failed to enqueue email to ${to}: ${(err as Error).message || err}`,
      );
      throw err;
    }
  }
}
