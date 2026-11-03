import { CategoryText, CommonText, SearchText } from '../constants/Text';

export const buildTopRatedTitle = (category: string): string => `${CategoryText.TOP_RATED_IN} ${category}`;

export const buildMoreInTitle = (category: string): string => `${CategoryText.MORE_IN} ${category}`;

export const buildResultsForTitle = (term: string): string => `${SearchText.RESULTS_FOR} "${term}"`;

export const buildDocumentTitle = (title: string): string =>
  `${title}${CommonText.TITLE_SEPARATOR}${CommonText.APP_NAME}`;
