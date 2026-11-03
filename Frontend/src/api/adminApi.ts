import { AUTHORIZATION_HEADER, BEARER_PREFIX } from '../constants/AppConstants';
import { ApiPath } from '../constants/Routes';
import type { AdminEnquiryPage, AdminEnquiryParams } from '../types/AdminEnquiry';
import { apiGet } from './apiClient';

// The token travels only in the Authorization header, never in the URL.
export const listEnquiries = (
  token: string,
  { status, page, pageSize }: AdminEnquiryParams,
  signal?: AbortSignal,
): Promise<AdminEnquiryPage> =>
  apiGet<AdminEnquiryPage>(ApiPath.ADMIN_ENQUIRIES, {
    params: { status, page, pageSize },
    headers: { [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${token}` },
    signal,
  });
