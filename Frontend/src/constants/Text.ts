// Every user-facing string lives here so wording and translation changes happen in one place.
export enum CommonText {
  APP_NAME = 'Product Catalogue',
  RETRY = 'Retry',
  LOADING = 'Loading...',
  BACK_TO_HOME = 'Back to home',
  MAIN_NAV_LABEL = 'Categories',
  SKIP_TO_CONTENT = 'Skip to content',
  TITLE_SEPARATOR = ' | ',
}

export enum HeaderText {
  SEARCH_LABEL = 'Search products',
  SEARCH_PLACEHOLDER = 'Search by product name',
  SEARCH_BUTTON = 'Search',
  SEARCH_ROLE_LABEL = 'Product search',
  CATEGORIES_ERROR = 'Categories could not be loaded.',
}

export enum ErrorText {
  TITLE = 'Something went wrong',
  MESSAGE = 'We could not load this content. Please try again.',
  BOUNDARY_MESSAGE = 'The page ran into an unexpected problem. Please reload and try again.',
  RELOAD = 'Reload page',
}

export enum EmptyText {
  NO_PRODUCTS_TITLE = 'No products found',
  NO_PRODUCTS_MESSAGE = 'Try a different search term or browse one of our categories.',
}

export enum HomeText {
  PAGE_TITLE = 'Welcome',
  TOP_RATED = 'Top rated',
}

export enum CategoryText {
  TOP_RATED_IN = 'Top rated in',
  MORE_IN = 'More in',
  NOT_FOUND_TITLE = 'Category not found',
  NOT_FOUND_MESSAGE = 'We could not find that category. Pick one from the menu instead.',
}

export enum SearchText {
  NO_TERM_TITLE = 'Search our catalogue',
  RESULTS_FOR = 'Results for',
  RESULT_SINGULAR = 'result',
  RESULT_PLURAL = 'results',
  NO_TERM_MESSAGE = 'Type a product name in the search bar to get started.',
}

export enum ProductText {
  PAGE_TITLE = 'Product',
  NOT_FOUND_TITLE = 'Product not found',
  NOT_FOUND_MESSAGE = 'This product does not exist or is no longer available.',
  DESCRIPTION = 'Description',
  CATEGORY = 'Category',
  IMAGE_UNAVAILABLE = 'Image unavailable',
}

export enum RatingText {
  REVIEWS = 'reviews',
  OUT_OF_MAX = 'out of',
  RATED = 'Rated',
  STAR = '★',
}

export enum NotFoundText {
  TITLE = 'Page not found',
  MESSAGE = 'The page you are looking for does not exist.',
}

export enum ApiErrorText {
  NETWORK = 'Could not reach the server',
  UNKNOWN = 'Unexpected response from the server',
  NETWORK_CODE = 'NETWORK_ERROR',
  UNKNOWN_CODE = 'UNKNOWN_ERROR',
}
