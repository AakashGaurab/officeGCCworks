import { randomUUID } from 'node:crypto';
import { MAX_STORED_ERROR_LENGTH } from '../config/constants.js';
import type { EmailSender } from '../domain/EmailSender.js';
import type { NewEnquiry } from '../domain/Enquiry.js';
import type { EnquiryRepository } from '../domain/EnquiryRepository.js';
import type { Logger } from '../domain/Logger.js';
import { NotFoundError } from '../domain/NotFoundError.js';
import type { ProductRepository } from '../domain/ProductRepository.js';
import { buildEnquiryEmail } from './buildEnquiryEmail.js';

// Already validated by the HTTP layer. `website` is the honeypot field that real users never fill.
export type EnquiryInput = {
  productId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  website?: string;
};

export type EnquiryReceipt = { id: string };

export enum EnquiryErrorMessage {
  PRODUCT_NOT_FOUND = 'Product not found',
  UNKNOWN_SEND_ERROR = 'Unknown email error',
}

export enum EnquiryLogMessage {
  EMAIL_FAILED = 'Enquiry email could not be sent; the enquiry is stored for a retry',
  HONEYPOT_DROPPED = 'Enquiry dropped: honeypot field was filled in',
  STATUS_UPDATE_FAILED = 'Enquiry status could not be updated',
}

export class EnquiryService {
  constructor(
    private readonly enquiries: EnquiryRepository,
    private readonly emailSender: EmailSender,
    private readonly products: ProductRepository,
    private readonly salesInboxEmail: string,
    private readonly logger: Logger,
  ) {}

  async submit(input: EnquiryInput): Promise<EnquiryReceipt> {
    // Bots fill hidden fields. Pretend it worked, but store and send nothing.
    // Warn without any submitted data, so spam bursts are visible but no PII is logged.
    if (input.website) {
      this.logger.warn({}, EnquiryLogMessage.HONEYPOT_DROPPED);
      return { id: randomUUID() };
    }

    const product = await this.products.getById(input.productId);
    if (!product) throw new NotFoundError(EnquiryErrorMessage.PRODUCT_NOT_FOUND);

    const enquiry: NewEnquiry = {
      id: randomUUID(),
      productId: product.id,
      productTitle: product.title,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
      createdAt: new Date().toISOString(),
    };

    // Save first: if this fails the error is real (500) and nothing is lost silently.
    await this.enquiries.save(enquiry);
    await this.sendAndRecord(enquiry);

    return { id: enquiry.id };
  }

  // The enquiry is already stored, so an email problem must not fail the customer's request.
  private async sendAndRecord(enquiry: NewEnquiry): Promise<void> {
    try {
      await this.emailSender.send(buildEnquiryEmail(enquiry, this.salesInboxEmail));
    } catch (error) {
      this.logger.error({ err: error, enquiryId: enquiry.id }, EnquiryLogMessage.EMAIL_FAILED);
      await this.recordOutcome(enquiry.id, () =>
        this.enquiries.markFailed(enquiry.id, toStoredErrorMessage(error)),
      );
      return;
    }
    await this.recordOutcome(enquiry.id, () =>
      this.enquiries.markSent(enquiry.id, new Date().toISOString()),
    );
  }

  // A failed status update is logged, not thrown: the enquiry itself is safe.
  private async recordOutcome(enquiryId: string, update: () => Promise<void>): Promise<void> {
    try {
      await update();
    } catch (error) {
      this.logger.error({ err: error, enquiryId }, EnquiryLogMessage.STATUS_UPDATE_FAILED);
    }
  }
}

const toStoredErrorMessage = (error: unknown): string =>
  (error instanceof Error ? error.message : EnquiryErrorMessage.UNKNOWN_SEND_ERROR).slice(
    0,
    MAX_STORED_ERROR_LENGTH,
  );
