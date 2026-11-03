import { describe, expect, it, vi } from 'vitest';
import { buildEnquiryEmail } from '../src/application/buildEnquiryEmail.js';
import { sanitizeHeaderValue } from '../src/application/sanitizeHeaderValue.js';
import type { EmailMessage } from '../src/domain/EmailSender.js';
import type { NewEnquiry } from '../src/domain/Enquiry.js';
import { LogEmailSender } from '../src/infrastructure/LogEmailSender.js';
import { SmtpEmailSender } from '../src/infrastructure/SmtpEmailSender.js';
import { buildSpyLogger } from './helpers/silentLogger.js';

const message: EmailMessage = {
  enquiryId: 'enquiry-1',
  to: 'sales@example.com',
  subject: 'Subject',
  text: 'Body',
  replyTo: 'ada@example.com',
};

const enquiry: NewEnquiry = {
  id: 'a',
  productId: 3,
  productTitle: 'Blue Shirt',
  name: 'Ada',
  email: 'ada@example.com',
  phone: null,
  message: '<script>alert(1)</script>\nSecond line',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('LogEmailSender', () => {
  it('logs only the id, subject, recipient and body length, never the customer data', async () => {
    const logger = buildSpyLogger();
    await new LogEmailSender(logger).send(message);

    expect(logger.info).toHaveBeenCalledWith(
      { enquiryId: 'enquiry-1', subject: 'Subject', to: 'sales@example.com', bodyLength: 4 },
      expect.any(String),
    );
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain('ada@example.com');
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain('Body');
  });
});

describe('SmtpEmailSender', () => {
  it('passes the message and sender address to the transport as plain text', async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    await new SmtpEmailSender({ sendMail }, 'site@example.com').send(message);

    expect(sendMail).toHaveBeenCalledWith({
      from: 'site@example.com',
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
    });
    expect(sendMail.mock.calls[0]?.[0]).not.toHaveProperty('html');
  });

  it('rejects when the transport fails', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('connection refused'));
    await expect(new SmtpEmailSender({ sendMail }, 'site@example.com').send(message)).rejects.toThrow(
      'connection refused',
    );
  });
});

describe('buildEnquiryEmail', () => {
  it('builds a plain text email with all details and Reply-To', () => {
    const email = buildEnquiryEmail(enquiry, 'sales@example.com');

    expect(email).toMatchObject({ to: 'sales@example.com', replyTo: 'ada@example.com' });
    expect(email.subject).toContain('Blue Shirt');
    expect(email.text).toContain('Blue Shirt (id 3)');
    expect(email.text).toContain('Name: Ada');
    expect(email.text).toContain('Phone: not provided');
  });

  it('keeps customer markup as literal text', () => {
    expect(buildEnquiryEmail(enquiry, 'sales@example.com').text).toContain('<script>alert(1)</script>');
  });

  it('removes line breaks from header fields (header injection)', () => {
    const email = buildEnquiryEmail(
      { ...enquiry, productTitle: 'Shirt\r\nBcc: spy@evil.com', email: 'a@b.com\r\nBcc: spy@evil.com' },
      'sales@example.com',
    );

    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.replyTo).not.toMatch(/[\r\n]/);
  });
});

describe('sanitizeHeaderValue', () => {
  it.each(['a\nb', 'a\rb', 'a\r\nb', 'a\n\n\rb'])('replaces line breaks in %j', (value) => {
    expect(sanitizeHeaderValue(value)).toBe('a b');
  });
});
