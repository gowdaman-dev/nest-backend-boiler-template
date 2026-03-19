import { EmailService } from '@app/email';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  constructor(private readonly emailService: EmailService) {}

  getHello(): string {
    return 'Hello World!';
  }
  async sendTestEmail() {
    await this.emailService.sendMail({
      to: 'damangowdaman@gmail.com',
      subject: 'Test Email from Gateway',
      template: 'welcome',
      templateData: { name: 'gowdaman' },
    });
  }
}
