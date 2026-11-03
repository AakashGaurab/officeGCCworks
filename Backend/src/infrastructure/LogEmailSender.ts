import type { EmailMessage, EmailSender } from '../domain/EmailSender.js';
import type { Logger } from '../domain/Logger.js';

export enum LogEmailText {
  WOULD_SEND = 'Email not sent (log provider)',
}

// Development stand-in only, never use it in production: nothing is delivered.
// It logs metadata, not the body or the reply-to address, so customer data does not end up in the logs.
export class LogEmailSender implements EmailSender {
  constructor(private readonly logger: Logger) {}

  async send(message: EmailMessage): Promise<void> {
    this.logger.info(
      {
        enquiryId: message.enquiryId,
        subject: message.subject,
        to: message.to,
        bodyLength: message.text.length,
      },
      LogEmailText.WOULD_SEND,
    );
  }
}
