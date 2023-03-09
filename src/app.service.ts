import { Injectable } from '@nestjs/common';
import { isValidNumber, parsePhoneNumber } from 'libphonenumber-js';
import { Whatsapp, create } from 'venom-bot';

@Injectable()
export class AppService {
  private client: Whatsapp;

  constructor() {
    this.initialize();
  }

  async sendText(to: string, body: string) {
    this.client.sendText(to, body).catch((error) => console.error(error));
  }

  qr = (base64Qrimg: string) => {};

  status = (statusSession: string, session: string) => {};

  validatePhoneNumber(number: string) {
    if (!isValidNumber(number, 'BR')) {
      throw new Error('Número inválido');
    }

    let phoneNumber = parsePhoneNumber(number, 'BR')
      .format('E.164')
      .replace('+', '') as string;

    phoneNumber = phoneNumber.includes('@c.us')
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    return phoneNumber;
  }

  start = (client: Whatsapp) => {
    const numberToSend = this.validatePhoneNumber(process.env.NUMBER_TO_SEND);
    this.client = client;
    this.sendText(numberToSend, 'Olá, tudo bem?');
  };

  private initialize() {
    create('whatsapp-chat-bot', this.qr, this.status)
      .then((client) => this.start(client))
      .catch((error) => console.error(error));
  }

  getHello(): string {
    return 'Hello World!';
  }
}
