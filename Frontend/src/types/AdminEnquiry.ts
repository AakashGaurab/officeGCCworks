import type { EnquiryStatus } from '../constants/AppConstants';

// Mirrors the backend response of GET /admin/enquiries.
export type AdminEnquiry = {
  id: string;
  productId: number;
  productTitle: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  sentAt: string | null;
  errorMessage: string | null;
};

export type StatusCounts = Record<EnquiryStatus, number>;

export type AdminEnquiryPage = {
  items: AdminEnquiry[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  statusCounts: StatusCounts;
};

// No status means all enquiries.
export type AdminEnquiryParams = {
  status?: EnquiryStatus;
  page: number;
  pageSize: number;
};
