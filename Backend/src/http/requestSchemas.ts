import { z } from 'zod';
import { EnquiryStatus } from '../domain/Enquiry.js';
import {
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_MAX_PAGE_SIZE,
  DEFAULT_PAGE,
  CONTROL_CHARACTER_PATTERN,
  DEFAULT_PAGE_SIZE,
  ENQUIRY_HONEYPOT_MAX_LENGTH,
  ENQUIRY_EMAIL_MAX_LENGTH,
  ENQUIRY_MESSAGE_MAX_LENGTH,
  ENQUIRY_NAME_MAX_LENGTH,
  ENQUIRY_PHONE_MAX_LENGTH,
  ENQUIRY_PHONE_MIN_LENGTH,
  ENQUIRY_PHONE_PATTERN,
} from '../config/constants.js';

// Query values arrive as strings, so numbers are coerced and then checked.
const positiveInt = z.coerce.number().int().positive();

// pageSize above the maximum is clamped later by paginate(), not rejected.
const paginationShape = {
  page: positiveInt.default(DEFAULT_PAGE),
  pageSize: positiveInt.default(DEFAULT_PAGE_SIZE),
};

export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  ...paginationShape,
});

export const categoryListingQuerySchema = z.object(paginationShape);

export const categoryParamsSchema = z.object({ category: z.string().min(1) });

export const productParamsSchema = z.object({ id: positiveInt });

// Control characters (CR/LF included) are rejected in the name, which can reach an email header.
// The email needs no extra check: z.email() already rejects them.
const hasNoControlCharacters = (value: string) => !CONTROL_CHARACTER_PATTERN.test(value);

export const enquiryBodySchema = z.object({
  productId: positiveInt,
  name: z.string().trim().min(1).max(ENQUIRY_NAME_MAX_LENGTH).refine(hasNoControlCharacters),
  email: z.string().trim().max(ENQUIRY_EMAIL_MAX_LENGTH).pipe(z.email()),
  phone: z
    .string()
    .trim()
    .min(ENQUIRY_PHONE_MIN_LENGTH)
    .max(ENQUIRY_PHONE_MAX_LENGTH)
    .regex(ENQUIRY_PHONE_PATTERN)
    .optional(),
  message: z.string().trim().min(1).max(ENQUIRY_MESSAGE_MAX_LENGTH),
  // Honeypot: hidden in the form, so only bots fill it in.
  website: z.string().max(ENQUIRY_HONEYPOT_MAX_LENGTH).optional(),
});

// Unlike the public listings, an oversized pageSize is rejected here (400) instead of clamped.
export const adminEnquiriesQuerySchema = z.object({
  status: z.enum(EnquiryStatus).optional(),
  page: positiveInt.default(DEFAULT_PAGE),
  pageSize: positiveInt.max(ADMIN_MAX_PAGE_SIZE).default(ADMIN_DEFAULT_PAGE_SIZE),
});
