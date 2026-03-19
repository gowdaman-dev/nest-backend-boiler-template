import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule } from '@app/config';
import { EmailModule } from '@app/email';

@Module({
  imports: [ConfigModule, EmailModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
