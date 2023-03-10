import { Injectable } from '@nestjs/common';
import { isValidNumber, parsePhoneNumber } from 'libphonenumber-js';
import { Whatsapp, create, SocketState } from 'venom-bot';

export type QRcode = {
  base64Qrimg: string;
  asciiQR: string;
  attempts: number;
};
@Injectable()
export class AppService {
  private client: Whatsapp;
  private conected: boolean;
  private qrCode: QRcode;

  constructor() {
    this.initialize();
  }

  get isConected(): boolean {
    return this.conected;
  }

  get qrCodeQ(): QRcode {
    return this.qrCode;
  }

  async sendText(to: string, body: string) {
    this.client.sendText(to, body).catch((error) => console.error(error));
  }

  qr = (base64Qrimg: string, asciiQR: string, attempts: number) => {
    this.qrCode = { base64Qrimg, asciiQR, attempts };
  };

  status = (statusSession: string, session: string) => {
    this.conected = ['isLogged', 'qrReadSuccess', 'chatsAvailable'].includes(
      statusSession
    );
  };

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
    client.onStateChange((state) => {
      this.conected = state === SocketState.CONNECTED;
    });
  };

  private initialize() {
    create('whatsapp-chat-bot', this.qr, this.status)
      .then((client) => this.start(client))
      .catch((error) => console.error(error));
  }
}
