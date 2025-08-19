import { ConfigService } from '@nestjs/config';

export interface InfobipConfig {
  baseUrl: string;
  apiKey: string;
  username: string;
  password: string;
  timeout: number;
  retries: number;
}

export const getInfobipConfig = (
  configService: ConfigService,
): InfobipConfig => {
  let baseUrl = configService.get(
    'INFOBIP_BASE_URL',
    'https://api.infobip.com',
  );

  // Ensure the URL has a protocol
  if (
    baseUrl &&
    !baseUrl.startsWith('http://') &&
    !baseUrl.startsWith('https://')
  ) {
    baseUrl = `https://${baseUrl}`;
  }

  return {
    baseUrl,
    apiKey: configService.get('INFOBIP_API_KEY') || '',
    username: configService.get('INFOBIP_USERNAME') || '',
    password: configService.get('INFOBIP_PASSWORD') || '',
    timeout: parseInt(configService.get('INFOBIP_TIMEOUT', '30000')),
    retries: parseInt(configService.get('INFOBIP_RETRIES', '3')),
  };
};

export const INFOBIP_ENDPOINTS = {
  EMAIL: {
    SEND: '/email/3/send',
    VALIDATE: '/email/2/validation',
    REPORTS: '/email/1/reports',
    MESSAGE_LOGS: '/email/1/logs',
  },
  WHATSAPP: {
    SEND_TEXT: '/whatsapp/1/message/text',
    SEND_DOCUMENT: '/whatsapp/1/message/document',
    SEND_IMAGE: '/whatsapp/1/message/image',
    SEND_VIDEO: '/whatsapp/1/message/video',
    SEND_AUDIO: '/whatsapp/1/message/audio',
    SEND_LOCATION: '/whatsapp/1/message/location',
    SEND_CONTACT: '/whatsapp/1/message/contact',
    SEND_STICKER: '/whatsapp/1/message/sticker',
    SEND_TEMPLATE: '/whatsapp/1/message/template',
    REPORTS: '/whatsapp/1/reports',
    TEMPLATES: '/whatsapp/2/templates',
  },
  AUTH: {
    OAUTH_TOKEN: '/auth/1/oauth2/token',
    IBSSO_SESSION: '/auth/1/session',
  },
} as const;
