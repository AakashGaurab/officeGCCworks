import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnquiryLogMessage, EnquiryService, type EnquiryInput } from '../src/application/EnquiryService.js';
import { IN_MEMORY_DATABASE_PATH, MAX_STORED_ERROR_LENGTH } from '../src/config/constants.js';
import { EnquiryStatus } from '../src/domain/Enquiry.js';
import { NotFoundError } from '../src/domain/NotFoundError.js';
import { SqliteEnquiryRepository } from '../src/infrastructure/SqliteEnquiryRepository.js';
import { buildProduct } from './helpers/buildProduct.js';
import { FakeEmailSender } from './helpers/FakeEmailSender.js';
import { InMemoryProductRepository } from './helpers/InMemoryProductRepository.js';
import { buildSpyLogger } from './helpers/silentLogger.js';

const SALES_INBOX = 'sales@example.com';

const input: EnquiryInput = {
  productId: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+44 20 7946 0000',
  message: 'Is this in stock?',
};

const products = new InMemoryProductRepository([buildProduct({ id: 1, title: 'Blue Shirt' })]);

let repository: SqliteEnquiryRepository;
let logger: ReturnType<typeof buildSpyLogger>;

const buildService = (emailSender: FakeEmailSender) =>
  new EnquiryService(repository, emailSender, products, SALES_INBOX, logger);

beforeEach(() => {
  repository = new SqliteEnquiryRepository(IN_MEMORY_DATABASE_PATH);
  logger = buildSpyLogger();
});

describe('EnquiryService.submit', () => {
  it('stores the enquiry, emails the sales inbox and marks it sent', async () => {
    const emailSender = new FakeEmailSender();
    const { id } = await buildService(emailSender).submit(input);

    expect(emailSender.sent).toHaveLength(1);
    expect(emailSender.sent[0]).toMatchObject({ to: SALES_INBOX, replyTo: 'ada@example.com' });
    expect(emailSender.sent[0]?.text).toContain('Blue Shirt (id 1)');
    expect(await repository.findUnsent()).toEqual([]);
    expect(id).toBeTruthy();
  });

  it('still succeeds when the email fails, keeping the enquiry marked as failed', async () => {
    const emailSender = new FakeEmailSender(new Error('smtp down'));
    const { id } = await buildService(emailSender).submit(input);

    const [stored] = await repository.findUnsent();
    expect(stored).toMatchObject({
      id,
      status: EnquiryStatus.FAILED,
      errorMessage: 'smtp down',
      productId: 1,
      productTitle: 'Blue Shirt',
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('truncates a very long email error before storing it', async () => {
    const emailSender = new FakeEmailSender(new Error('x'.repeat(MAX_STORED_ERROR_LENGTH * 3)));
    await buildService(emailSender).submit(input);

    const [stored] = await repository.findUnsent();
    expect(stored?.errorMessage).toHaveLength(MAX_STORED_ERROR_LENGTH);
  });

  it('throws NotFoundError for an unknown product and stores nothing', async () => {
    const emailSender = new FakeEmailSender();
    await expect(buildService(emailSender).submit({ ...input, productId: 99 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(emailSender.sent).toEqual([]);
    expect(await repository.findUnsent()).toEqual([]);
  });

  it('ignores honeypot submissions: success, but nothing stored or sent', async () => {
    const emailSender = new FakeEmailSender();
    const { id } = await buildService(emailSender).submit({ ...input, website: 'http://spam.example' });

    expect(id).toBeTruthy();
    expect(emailSender.sent).toEqual([]);
    expect(await repository.findUnsent()).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith({}, expect.stringContaining('honeypot'));
  });

  it('still succeeds when markSent throws after a successful send', async () => {
    vi.spyOn(repository, 'markSent').mockRejectedValue(new Error('db locked'));
    const emailSender = new FakeEmailSender();
    const { id } = await buildService(emailSender).submit(input);

    expect(id).toBeTruthy();
    expect(emailSender.sent).toHaveLength(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ enquiryId: id }),
      EnquiryLogMessage.STATUS_UPDATE_FAILED,
    );
  });

  it('still succeeds when markFailed throws after a failed send', async () => {
    vi.spyOn(repository, 'markFailed').mockRejectedValue(new Error('db locked'));
    const { id } = await buildService(new FakeEmailSender(new Error('smtp down'))).submit(input);

    expect(id).toBeTruthy();
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ enquiryId: id }),
      EnquiryLogMessage.STATUS_UPDATE_FAILED,
    );
  });

  it('rejects when the database save fails (a real error)', async () => {
    await repository.close();
    await expect(buildService(new FakeEmailSender()).submit(input)).rejects.toThrow();
  });
});
