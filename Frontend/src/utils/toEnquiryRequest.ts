import { EnquiryField } from '../constants/Text';
import type { EnquiryValues } from '../types/Enquiry';

// Trims the text and leaves out an empty phone number, which the backend treats as optional.
export const toEnquiryRequest = (productId: number, values: EnquiryValues) => {
  const phone = values[EnquiryField.PHONE].trim();
  return {
    productId,
    name: values[EnquiryField.NAME].trim(),
    email: values[EnquiryField.EMAIL].trim(),
    ...(phone ? { phone } : {}),
    message: values[EnquiryField.MESSAGE].trim(),
    website: values[EnquiryField.WEBSITE],
  };
};
