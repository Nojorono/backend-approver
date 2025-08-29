import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfobipAuthService } from './services/infobip-auth.service';
import { InfobipEmailService } from './services/infobip-email.service';
import { InfobipWhatsAppService } from './services/infobip-whatsapp.service';
import { InfobipEmailController } from './controllers/infobip-email.controller';
import { InfobipWhatsAppController } from './controllers/infobip-whatsapp.controller';
import { NotificationTrack } from '../core/domain/entities/notification-track.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NotificationTrack]),
  ],
  controllers: [InfobipEmailController, InfobipWhatsAppController],
  providers: [InfobipAuthService, InfobipEmailService, InfobipWhatsAppService],
  exports: [InfobipAuthService, InfobipEmailService, InfobipWhatsAppService],
})
export class InfobipModule {}
