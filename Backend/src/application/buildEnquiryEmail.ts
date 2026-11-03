import type { EmailMessage } from '../domain/EmailSender.js';
import type { NewEnquiry } from '../domain/Enquiry.js';
import { sanitizeHeaderValue } from './sanitizeHeaderValue.js';

export enum EnquiryEmailText {
  SUBJECT_PREFIX = 'New product enquiry:',
  NO_PHONE = 'not provided',
}

// Plain text only, so customer input is never interpreted as HTML.
// Only header fields (subject, reply-to) are sanitised; the body may contain line breaks.
export const buildEnquiryEmail = (enquiry: NewEnquiry, salesInboxEmail: string): EmailMessage => ({
  enquiryId: enquiry.id,
  to: salesInboxEmail,
  subject: sanitizeHeaderValue(`${EnquiryEmailText.SUBJECT_PREFIX} ${enquiry.productTitle}`),
  replyTo: sanitizeHeaderValue(enquiry.email),
  text: [
    `Product: ${enquiry.productTitle} (id ${enquiry.productId})`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone ?? EnquiryEmailText.NO_PHONE}`,
    '',
    'Message:',
    enquiry.message,
  ].join('\n'),
});
