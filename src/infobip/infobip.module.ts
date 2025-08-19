import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfobipAuthService } from './services/infobip-auth.service';
import { InfobipEmailService } from './services/infobip-email.service';
import { InfobipWhatsAppService } from './services/infobip-whatsapp.service';
import { InfobipEmailController } from './controllers/infobip-email.controller';
import { InfobipWhatsAppController } from './controllers/infobip-whatsapp.controller';

@Module({
  imports: [ConfigModule],
  controllers: [InfobipEmailController, InfobipWhatsAppController],
  providers: [InfobipAuthService, InfobipEmailService, InfobipWhatsAppService],
  exports: [InfobipAuthService, InfobipEmailService, InfobipWhatsAppService],
})
export class InfobipModule {}
