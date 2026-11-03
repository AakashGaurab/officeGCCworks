export enum RoutePath {
  HOME = '/',
  CATEGORY = '/category/:category',
  SEARCH = '/search',
  PRODUCT = '/products/:id',
  NOT_FOUND = '*',
}

export enum RouteParam {
  CATEGORY = 'category',
  PRODUCT_ID = 'id',
}

export enum SearchQueryKey {
  TERM = 'q',
}

export enum ApiPath {
  FEATURED_PRODUCTS = '/products/featured',
  PRODUCTS = '/products',
  CATEGORIES = '/categories',
  ENQUIRIES = '/enquiries',
}
