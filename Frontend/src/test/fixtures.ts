import { EnquiryStatus } from '../constants/AppConstants';
import type { AdminEnquiry, AdminEnquiryPage, StatusCounts } from '../types/AdminEnquiry';
import type { CategoryListing, Paginated } from '../types/Paginated';
import type { Product } from '../types/Product';

export const makeProduct = (id: number, overrides: Partial<Product> = {}): Product => ({
  id,
  title: `Product ${id}`,
  price: 10 + id,
  description: `Description ${id}`,
  category: "men's clothing",
  imageUrl: `https://example.com/${id}.png`,
  rating: { rate: 4.5, count: 100 },
  ...overrides,
});

export const makeProducts = (ids: number[]): Product[] => ids.map((id) => makeProduct(id));

export const makePage = (ids: number[], hasNextPage: boolean, total = ids.length): Paginated<Product> => ({
  items: makeProducts(ids),
  page: 1,
  pageSize: 10,
  total,
  hasNextPage,
});

export const makeCategoryListing = (
  topRatedIds: number[],
  ids: number[],
  hasNextPage: boolean,
): CategoryListing => ({ ...makePage(ids, hasNextPage), topRated: makeProducts(topRatedIds) });

export const makeAdminEnquiry = (id: number, overrides: Partial<AdminEnquiry> = {}): AdminEnquiry => ({
  id: `enquiry-${id}`,
  productId: id,
  productTitle: `Product ${id}`,
  name: `Customer ${id}`,
  email: `customer${id}@example.com`,
  phone: null,
  message: `Message ${id}`,
  status: EnquiryStatus.SENT,
  createdAt: '2026-03-01T10:30:00.000Z',
  sentAt: '2026-03-01T10:30:05.000Z',
  errorMessage: null,
  ...overrides,
});

export const makeAdminPage = (
  ids: number[],
  hasNextPage: boolean,
  statusCounts: StatusCounts = { pending: 1, sent: 2, failed: 1 },
): AdminEnquiryPage => ({
  items: ids.map((id) => makeAdminEnquiry(id)),
  page: 1,
  pageSize: 20,
  total: ids.length,
  hasNextPage,
  statusCounts,
});
