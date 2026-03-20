import { EmailService } from '@app/email';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class GatewayService {
  constructor(
    private readonly emailService: EmailService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

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
  async getAuthHealth() {
    return await this.authClient.send({ cmd: 'health' }, {}).toPromise();
  }
}
