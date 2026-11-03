import { EnquiryStatus, type NewEnquiry } from '../../src/domain/Enquiry.js';
import type { EnquiryRepository } from '../../src/domain/EnquiryRepository.js';

export const buildNewEnquiry = (id: string, createdAt: string): NewEnquiry => ({
  id,
  productId: 1,
  productTitle: 'Blue Shirt',
  name: `Name ${id}`,
  email: `${id}@example.com`,
  phone: null,
  message: `Message ${id}`,
  createdAt,
});

// Saves one enquiry per id, one minute apart (first id is the oldest), and applies the given status.
export const seedEnquiries = async (
  repository: EnquiryRepository,
  entries: [id: string, status: EnquiryStatus][],
): Promise<void> => {
  for (const [index, [id, status]] of entries.entries()) {
    await repository.save(buildNewEnquiry(id, new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString()));
    if (status === EnquiryStatus.SENT) await repository.markSent(id, '2026-02-01T00:00:00.000Z');
    if (status === EnquiryStatus.FAILED) await repository.markFailed(id, 'smtp down');
  }
};
