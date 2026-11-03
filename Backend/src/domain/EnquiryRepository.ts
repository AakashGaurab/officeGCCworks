import type { Enquiry, NewEnquiry } from './Enquiry.js';

// Port: enquiries are stored through this interface, so SQLite can be replaced by Postgres/RDS
// without touching the service.
export interface EnquiryRepository {
  // Stores the enquiry with status "pending".
  save(enquiry: NewEnquiry): Promise<void>;
  markSent(id: string, sentAt: string): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  // Pending and failed enquiries, oldest first. A future retry job would read this.
  findUnsent(): Promise<Enquiry[]>;
  close(): Promise<void>;
}
