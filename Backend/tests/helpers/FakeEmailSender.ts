import type { EmailMessage, EmailSender } from '../../src/domain/EmailSender.js';

// Records emails instead of sending them; can be told to fail.
export class FakeEmailSender implements EmailSender {
  readonly sent: EmailMessage[] = [];

  constructor(private readonly error?: Error) {}

  async send(message: EmailMessage): Promise<void> {
    if (this.error) throw this.error;
    this.sent.push(message);
  }
}
