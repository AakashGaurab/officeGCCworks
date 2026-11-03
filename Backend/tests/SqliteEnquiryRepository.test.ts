import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { IN_MEMORY_DATABASE_PATH } from '../src/config/constants.js';
import { EnquiryStatus, type NewEnquiry } from '../src/domain/Enquiry.js';
import { seedEnquiries } from './helpers/seedEnquiries.js';
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

  it('lists a page newest first, with id as tie-break, optionally by status', async () => {
    await seedEnquiries(repository, [
      ['a', EnquiryStatus.SENT],
      ['b', EnquiryStatus.FAILED],
      ['c', EnquiryStatus.SENT],
    ]);
    await repository.save(buildEnquiry('tie-1', '2026-01-01T00:02:00.000Z'));

    const ids = async (query: Parameters<typeof repository.findPage>[0]) =>
      (await repository.findPage(query)).map((enquiry) => enquiry.id);
    expect(await ids({ limit: 10, offset: 0 })).toEqual(['tie-1', 'c', 'b', 'a']);
    expect(await ids({ limit: 2, offset: 1 })).toEqual(['c', 'b']);
    expect(await ids({ status: EnquiryStatus.SENT, limit: 10, offset: 0 })).toEqual(['c', 'a']);
  });

  it('counts enquiries per status, with zero for missing statuses', async () => {
    expect(await repository.countByStatus()).toEqual({ pending: 0, sent: 0, failed: 0 });

    await seedEnquiries(repository, [
      ['a', EnquiryStatus.SENT],
      ['b', EnquiryStatus.SENT],
      ['c', EnquiryStatus.FAILED],
    ]);
    expect(await repository.countByStatus()).toEqual({ pending: 0, sent: 2, failed: 1 });
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
