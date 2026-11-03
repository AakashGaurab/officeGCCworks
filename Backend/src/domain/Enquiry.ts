export enum EnquiryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

// What the customer typed plus a snapshot of the product, so the record stays meaningful
// even if the product changes or disappears later.
export type NewEnquiry = {
  id: string;
  productId: number;
  productTitle: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
};

export type Enquiry = NewEnquiry & {
  status: EnquiryStatus;
  sentAt: string | null;
  errorMessage: string | null;
};
