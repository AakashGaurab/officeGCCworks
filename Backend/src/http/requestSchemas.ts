import { z } from 'zod';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../config/constants.js';

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
