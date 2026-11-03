import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { IN_MEMORY_DATABASE_PATH } from '../src/config/constants.js';
import { EnquiryStatus, type NewEnquiry } from '../src/domain/Enquiry.js';
import { SqliteEnquiryRepository } from '../src/infrastructure/SqliteEnquiryRepository.js';

const buildEnquiry = (id: string, createdAt: string): NewEnquiry => ({
  id,
  productId: 1,
  productTitle: 'Blue Shirt',
  name: 'Ada',
  email: 'ada@example.com',
  phone: null,
  message: "Robert'); DROP TABLE enquiries;--",
  createdAt,
});

let repository: SqliteEnquiryRepository;

beforeEach(() => {
  repository = new SqliteEnquiryRepository(IN_MEMORY_DATABASE_PATH);
});

describe('SqliteEnquiryRepository', () => {
  it('saves an enquiry as pending and stores text safely', async () => {
    await repository.save(buildEnquiry('a', '2026-01-01T00:00:00.000Z'));

    const [stored] = await repository.findUnsent();
    expect(stored).toMatchObject({
      id: 'a',
      status: EnquiryStatus.PENDING,
      phone: null,
      sentAt: null,
      errorMessage: null,
      message: "Robert'); DROP TABLE enquiries;--",
    });
  });

  it('removes a sent enquiry from the unsent list', async () => {
    await repository.save(buildEnquiry('a', '2026-01-01T00:00:00.000Z'));
    await repository.markSent('a', '2026-01-01T00:01:00.000Z');

    expect(await repository.findUnsent()).toEqual([]);
  });

  it('lists failed and pending enquiries oldest first', async () => {
    await repository.save(buildEnquiry('late', '2026-01-02T00:00:00.000Z'));
    await repository.save(buildEnquiry('early', '2026-01-01T00:00:00.000Z'));
    await repository.markFailed('late', 'boom');

    const unsent = await repository.findUnsent();
    expect(unsent.map((enquiry) => [enquiry.id, enquiry.status])).toEqual([
      ['early', EnquiryStatus.PENDING],
      ['late', EnquiryStatus.FAILED],
    ]);
    expect(unsent[1]?.errorMessage).toBe('boom');
  });

  it('creates the database directory for a file path', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'enquiries-'));
    const filePath = join(directory, 'nested', 'enquiries.sqlite');
    const fileRepository = new SqliteEnquiryRepository(filePath);
    await fileRepository.close();

    expect(existsSync(filePath)).toBe(true);
    rmSync(directory, { recursive: true });
  });
});
