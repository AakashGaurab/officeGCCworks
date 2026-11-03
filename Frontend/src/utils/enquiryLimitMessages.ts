import {
  ENQUIRY_EMAIL_MAX_LENGTH,
  ENQUIRY_MESSAGE_MAX_LENGTH,
  ENQUIRY_NAME_MAX_LENGTH,
  ENQUIRY_PHONE_MAX_LENGTH,
  ENQUIRY_PHONE_MIN_LENGTH,
} from '../constants/AppConstants';
import { EnquiryLimitTemplate } from '../constants/Text';

type TemplateValues = { min?: number; max?: number };

const fillTemplate = (template: string, { min, max }: TemplateValues): string =>
  template.replace('{min}', String(min)).replace('{max}', String(max));

// Built from the same constants the validation uses, so a message can never show a stale number.
export const EnquiryLimitMessage = {
  NAME_TOO_LONG: fillTemplate(EnquiryLimitTemplate.NAME_TOO_LONG, { max: ENQUIRY_NAME_MAX_LENGTH }),
  EMAIL_TOO_LONG: fillTemplate(EnquiryLimitTemplate.EMAIL_TOO_LONG, { max: ENQUIRY_EMAIL_MAX_LENGTH }),
  PHONE_LENGTH: fillTemplate(EnquiryLimitTemplate.PHONE_LENGTH, {
    min: ENQUIRY_PHONE_MIN_LENGTH,
    max: ENQUIRY_PHONE_MAX_LENGTH,
  }),
  MESSAGE_TOO_LONG: fillTemplate(EnquiryLimitTemplate.MESSAGE_TOO_LONG, { max: ENQUIRY_MESSAGE_MAX_LENGTH }),
} as const;
