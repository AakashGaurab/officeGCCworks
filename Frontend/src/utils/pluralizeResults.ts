import { SearchText } from '../constants/Text';

const SINGLE_RESULT = 1;

export const describeResultCount = (count: number): string =>
  `${count} ${count === SINGLE_RESULT ? SearchText.RESULT_SINGULAR : SearchText.RESULT_PLURAL}`;
