import type { Enquiry, EnquiryStatus, NewEnquiry } from './Enquiry.js';

export type EnquiryPageQuery = { status?: EnquiryStatus; limit: number; offset: number };

export type StatusCounts = Record<EnquiryStatus, number>;

// Port: enquiries are stored through this interface, so SQLite can be replaced by Postgres/RDS
// without touching the service.
export interface EnquiryRepository {
  // Stores the enquiry with status "pending".
  save(enquiry: NewEnquiry): Promise<void>;
  markSent(id: string, sentAt: string): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  // Pending and failed enquiries, oldest first. A future retry job would read this.
  findUnsent(): Promise<Enquiry[]>;
  // One page of enquiries, newest first, optionally only one status.
  findPage(query: EnquiryPageQuery): Promise<Enquiry[]>;
  // How many enquiries each status has, regardless of any filter.
  countByStatus(): Promise<StatusCounts>;
  close(): Promise<void>;
}
