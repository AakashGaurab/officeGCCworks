import {
  ENQUIRY_EMAIL_MAX_LENGTH,
  ENQUIRY_EMAIL_PATTERN,
  ENQUIRY_MESSAGE_MAX_LENGTH,
  ENQUIRY_NAME_MAX_LENGTH,
  ENQUIRY_PHONE_MAX_LENGTH,
  ENQUIRY_PHONE_MIN_LENGTH,
  ENQUIRY_PHONE_PATTERN,
} from '../constants/AppConstants';
import { EnquiryErrorText, EnquiryField } from '../constants/Text';
import type { EnquiryErrors, EnquiryValues } from '../types/Enquiry';
import { EnquiryLimitMessage } from './enquiryLimitMessages';

// Visible fields in screen order; this is also the order used to find the first invalid one.
export const VALIDATED_FIELDS = [
  EnquiryField.NAME,
  EnquiryField.EMAIL,
  EnquiryField.PHONE,
  EnquiryField.MESSAGE,
] as const;

type ValidatedField = (typeof VALIDATED_FIELDS)[number];

const validateName = (value: string): string | undefined => {
  if (!value) return EnquiryErrorText.NAME_REQUIRED;
  if (value.length > ENQUIRY_NAME_MAX_LENGTH) return EnquiryLimitMessage.NAME_TOO_LONG;
  return undefined;
};

const validateEmail = (value: string): string | undefined => {
  if (!value) return EnquiryErrorText.EMAIL_REQUIRED;
  if (value.length > ENQUIRY_EMAIL_MAX_LENGTH) return EnquiryLimitMessage.EMAIL_TOO_LONG;
  if (!ENQUIRY_EMAIL_PATTERN.test(value)) return EnquiryErrorText.EMAIL_INVALID;
  return undefined;
};

// The phone number is optional: an empty value is valid.
const validatePhone = (value: string): string | undefined => {
  if (!value) return undefined;
  if (!ENQUIRY_PHONE_PATTERN.test(value)) return EnquiryErrorText.PHONE_INVALID;
  if (value.length < ENQUIRY_PHONE_MIN_LENGTH || value.length > ENQUIRY_PHONE_MAX_LENGTH) {
    return EnquiryLimitMessage.PHONE_LENGTH;
  }
  return undefined;
};

const validateMessage = (value: string): string | undefined => {
  if (!value) return EnquiryErrorText.MESSAGE_REQUIRED;
  if (value.length > ENQUIRY_MESSAGE_MAX_LENGTH) return EnquiryLimitMessage.MESSAGE_TOO_LONG;
  return undefined;
};

const VALIDATORS: Record<ValidatedField, (value: string) => string | undefined> = {
  [EnquiryField.NAME]: validateName,
  [EnquiryField.EMAIL]: validateEmail,
  [EnquiryField.PHONE]: validatePhone,
  [EnquiryField.MESSAGE]: validateMessage,
};

export const validateEnquiryField = (field: ValidatedField, values: EnquiryValues): string | undefined =>
  VALIDATORS[field](values[field].trim());

export const validateEnquiry = (values: EnquiryValues): EnquiryErrors => {
  const errors: EnquiryErrors = {};
  VALIDATED_FIELDS.forEach((field) => {
    const error = validateEnquiryField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
};

export const findFirstInvalidField = (errors: EnquiryErrors): ValidatedField | undefined =>
  VALIDATED_FIELDS.find((field) => errors[field]);
