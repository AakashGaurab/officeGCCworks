import { ApiPath } from '../constants/Routes';
import type { EnquiryReceipt, EnquiryValues } from '../types/Enquiry';
import { toEnquiryRequest } from '../utils/toEnquiryRequest';
import { apiPost } from './apiClient';

// Hooks import this function; tests replace this module with a mock.
export const submitEnquiry = (
  productId: number,
  values: EnquiryValues,
  signal?: AbortSignal,
): Promise<EnquiryReceipt> => apiPost<EnquiryReceipt>(ApiPath.ENQUIRIES, toEnquiryRequest(productId, values), { signal });
