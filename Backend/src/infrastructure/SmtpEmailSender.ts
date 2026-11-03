import type { EmailMessage, EmailSender } from '../domain/EmailSender.js';

// The part of a nodemailer transport we use. Tests pass a fake, so no network is needed.
export interface MailTransport {
  sendMail(options: {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
}

// Sends through any SMTP server. To use a cloud service (e.g. SES) write another EmailSender.
// Only the plain `text` field is set, so user input is never sent as HTML.
export class SmtpEmailSender implements EmailSender {
  constructor(
    private readonly transport: MailTransport,
    private readonly from: string,
  ) {}

  async send({ to, replyTo, subject, text }: EmailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.from, to, replyTo, subject, text });
  }
}
