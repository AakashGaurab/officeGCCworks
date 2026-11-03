import { z } from 'zod';

// Shape of one product as returned by the Fake Store API. Anything else is rejected.
export const fakeStoreProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
  rating: z.object({
    rate: z.number(),
    count: z.number(),
  }),
});

export const fakeStoreProductListSchema = z.array(fakeStoreProductSchema);

export type FakeStoreProduct = z.infer<typeof fakeStoreProductSchema>;
