// Every user-facing string lives here so wording and translation changes happen in one place.
export enum CommonText {
  APP_NAME = 'Product Catalogue',
  RETRY = 'Retry',
  LOADING = 'Loading...',
  BACK_TO_HOME = 'Back to home',
  MAIN_NAV_LABEL = 'Categories',
  SKIP_TO_CONTENT = 'Skip to content',
  TITLE_SEPARATOR = ' | ',
  ALL_PRODUCTS_LINK = 'All products',
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
  PAGE_TITLE = 'Discover our products',
  INTRO = 'Browse the catalogue, search for what you need, and send us an enquiry.',
  TOP_RATED = 'Top rated',
  ALL_PRODUCTS = 'All products',
}

export enum ListText {
  END_OF_LIST = "You've reached the end of the list",
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
  BACK_TO = 'Back to',
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
  TIMEOUT = 'The server took too long to answer',
  NETWORK_CODE = 'NETWORK_ERROR',
  TIMEOUT_CODE = 'TIMEOUT_ERROR',
  UNKNOWN_CODE = 'UNKNOWN_ERROR',
}

export enum ModalText {
  CLOSE = 'Close',
}

export enum EnquiryField {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  MESSAGE = 'message',
  WEBSITE = 'website',
}

export enum EnquiryText {
  ENQUIRE_BUTTON = 'Enquire',
  HEADING_PREFIX = 'Enquire about',
  NAME_LABEL = 'Name',
  EMAIL_LABEL = 'Email',
  PHONE_LABEL = 'Phone (optional)',
  MESSAGE_LABEL = 'Message',
  HONEYPOT_LABEL = 'Leave this field empty',
  SUBMIT = 'Send enquiry',
  SUBMITTING = 'Sending...',
  THANKS_TITLE = 'Thank you',
  THANKS_ANNOUNCEMENT = 'Your enquiry was sent.',
  THANKS_MESSAGE = 'Your enquiry has been received. Our sales team will be in touch soon.',
  SEND_ANOTHER = 'Send another enquiry',
}

export enum EnquiryErrorText {
  NAME_REQUIRED = 'Enter your name.',
  EMAIL_REQUIRED = 'Enter your email address.',
  EMAIL_INVALID = 'Enter a valid email address, for example name@example.com.',
  PHONE_INVALID = 'Use only digits, spaces, + - and brackets.',
  MESSAGE_REQUIRED = 'Enter your message.',
  SUBMIT_FAILED = 'Your enquiry could not be sent. Your details are still here, please try again.',
  SUBMIT_TIMEOUT = 'The server took too long to answer. Your details are still here, please try again.',
  SUBMIT_NETWORK = 'We could not reach the server. Check your connection and try again.',
  SUBMIT_RATE_LIMITED = 'You have sent several enquiries in a short time. Please wait a minute and try again.',
  SUBMIT_INVALID = 'Some details were not accepted. Please check the form and try again.',
}

// Messages that contain a limit. {min} and {max} are filled from the constants (see enquiryLimitMessages).
export enum EnquiryLimitTemplate {
  NAME_TOO_LONG = 'Your name must be {max} characters or fewer.',
  EMAIL_TOO_LONG = 'Your email address must be {max} characters or fewer.',
  PHONE_LENGTH = 'A phone number must have {min} to {max} characters.',
  MESSAGE_TOO_LONG = 'Your message must be {max} characters or fewer.',
}

export enum AdminText {
  PAGE_TITLE = 'Admin',
  LIST_HEADING = 'Enquiries',
  TOKEN_LABEL = 'Admin token',
  SIGN_IN = 'Sign in',
  SIGNING_IN = 'Signing in...',
  SIGN_OUT = 'Sign out',
  REFRESH = 'Refresh',
  LOAD_MORE = 'Load more',
  TABS_LABEL = 'Filter by status',
  SENT_NOTE = 'Sent means the email sender accepted the message. With the default log sender nothing is actually emailed.',
  TABLE_CAPTION = 'Submitted enquiries',
  NO_PHONE = '-',
  VIEW_MESSAGE = 'View message',
  SEND_ERROR_PREFIX = 'Send error:',
  EMPTY_ALL_TITLE = 'No enquiries yet',
  EMPTY_ALL_MESSAGE = 'Enquiries sent from product pages will appear here.',
  EMPTY_FILTERED_TITLE = 'No enquiries with this status',
  EMPTY_FILTERED_MESSAGE = 'Pick another status to see more.',
}

export enum AdminFilterText {
  ALL = 'All',
  PENDING = 'Pending',
  SENT = 'Sent',
  FAILED = 'Failed',
}

export enum AdminColumnText {
  DATE = 'Date',
  PRODUCT = 'Product',
  NAME = 'Name',
  EMAIL = 'Email',
  PHONE = 'Phone',
  STATUS = 'Status',
  MESSAGE = 'Message',
}

export enum AdminLoginErrorText {
  TOKEN_REQUIRED = 'Enter the admin token.',
  INVALID_TOKEN = 'That token is not correct.',
  RATE_LIMITED = 'Too many attempts. Try again in a minute.',
  DISABLED = 'Admin access is not enabled on this server.',
  FAILED = 'We could not sign you in. Check your connection and try again.',
  SESSION_EXPIRED = 'You were signed out because the token is no longer accepted. Please sign in again.',
}
