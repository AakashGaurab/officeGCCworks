import type { EnquiryField } from '../constants/Text';

export type EnquiryValues = Record<EnquiryField, string>;

export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

// Mirrors the backend response. The send status of the email is deliberately not exposed.
export type EnquiryReceipt = {
  id: string;
  status: string;
};
