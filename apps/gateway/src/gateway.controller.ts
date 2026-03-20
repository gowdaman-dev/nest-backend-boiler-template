import { Controller, Get, Post } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  getHello(): string {
    return this.gatewayService.getHello();
  }
  @Post('testMail')
  async testMail() {
    await this.gatewayService.sendTestEmail();
    return { message: 'Test email sent (check logs)' };
  }

  @Get("auth-health")
  async getAuthHealth() {
    return await this.gatewayService.getAuthHealth();
  }
}
