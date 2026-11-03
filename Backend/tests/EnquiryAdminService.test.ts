import { describe, expect, it } from 'vitest';
import { EnquiryAdminService } from '../src/application/EnquiryAdminService.js';
import { IN_MEMORY_DATABASE_PATH } from '../src/config/constants.js';
import { EnquiryStatus } from '../src/domain/Enquiry.js';
import { SqliteEnquiryRepository } from '../src/infrastructure/SqliteEnquiryRepository.js';
import { seedEnquiries } from './helpers/seedEnquiries.js';

const buildService = async () => {
  const repository = new SqliteEnquiryRepository(IN_MEMORY_DATABASE_PATH);
  await seedEnquiries(repository, [
    ['a', EnquiryStatus.SENT],
    ['b', EnquiryStatus.FAILED],
    ['c', EnquiryStatus.PENDING],
  ]);
  return new EnquiryAdminService(repository);
};

describe('EnquiryAdminService', () => {
  it('uses the total of all statuses without a filter', async () => {
    const listing = await (await buildService()).list({ page: 1, pageSize: 2 });

    expect(listing).toMatchObject({ total: 3, hasNextPage: true, statusCounts: { pending: 1, sent: 1, failed: 1 } });
    expect(listing.items.map((item) => item.id)).toEqual(['c', 'b']);
  });

  it('uses the count of the filtered status as total', async () => {
    const listing = await (await buildService()).list({ status: EnquiryStatus.FAILED, page: 1, pageSize: 5 });

    expect(listing).toMatchObject({ total: 1, hasNextPage: false });
    expect(listing.items.map((item) => item.id)).toEqual(['b']);
  });
});
