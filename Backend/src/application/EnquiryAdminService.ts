import type { Enquiry, EnquiryStatus } from '../domain/Enquiry.js';
import type { EnquiryRepository, StatusCounts } from '../domain/EnquiryRepository.js';

export type EnquiryListQuery = { status?: EnquiryStatus; page: number; pageSize: number };

export type EnquiryListing = {
  items: Enquiry[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  statusCounts: StatusCounts;
};

// Read-only view of the stored enquiries for the site owner.
export class EnquiryAdminService {
  constructor(private readonly enquiries: EnquiryRepository) {}

  async list({ status, page, pageSize }: EnquiryListQuery): Promise<EnquiryListing> {
    const offset = (page - 1) * pageSize;
    const [items, statusCounts] = await Promise.all([
      this.enquiries.findPage({ status, limit: pageSize, offset }),
      this.enquiries.countByStatus(),
    ]);
    // The counts cover all enquiries, so the total of the current filter comes from them too.
    const total = status ? statusCounts[status] : sumCounts(statusCounts);
    return { items, page, pageSize, total, hasNextPage: offset + items.length < total, statusCounts };
  }
}

const sumCounts = (counts: StatusCounts): number =>
  Object.values(counts).reduce((sum, count) => sum + count, 0);
