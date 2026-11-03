import type { FastifyInstance } from 'fastify';
import type { CatalogueService } from '../application/CatalogueService.js';
import {
  categoryListingQuerySchema,
  categoryParamsSchema,
  listProductsQuerySchema,
  productParamsSchema,
} from './requestSchemas.js';

export enum RoutePath {
  HEALTH = '/health',
  FEATURED_PRODUCTS = '/products/featured',
  PRODUCTS = '/products',
  PRODUCT = '/products/:id',
  CATEGORIES = '/categories',
  CATEGORY_PRODUCTS = '/categories/:category/products',
}

export enum HealthStatus {
  OK = 'ok',
}

const HEALTH_OK = { status: HealthStatus.OK };

// Routes only parse input and call the service; all logic lives in the application layer.
export const registerRoutes = (app: FastifyInstance, service: CatalogueService): void => {
  app.get(RoutePath.HEALTH, async () => HEALTH_OK);

  app.get(RoutePath.FEATURED_PRODUCTS, () => service.getFeaturedProducts());

  app.get(RoutePath.CATEGORIES, () => service.getCategories());

  app.get(RoutePath.PRODUCTS, (request) =>
    service.listProducts(listProductsQuerySchema.parse(request.query)),
  );

  app.get(RoutePath.CATEGORY_PRODUCTS, (request) => {
    const { category } = categoryParamsSchema.parse(request.params);
    const { page, pageSize } = categoryListingQuerySchema.parse(request.query);
    return service.getCategoryListing(category, page, pageSize);
  });

  app.get(RoutePath.PRODUCT, (request) => {
    const { id } = productParamsSchema.parse(request.params);
    return service.getProduct(id);
  });
};
