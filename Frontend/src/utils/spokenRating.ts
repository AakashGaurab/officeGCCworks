import { MAX_RATING } from '../constants/AppConstants';
import { RatingText } from '../constants/Text';
import type { Rating } from '../types/Product';

// Screen readers get one full sentence instead of a star glyph followed by bare numbers.
export const spokenRating = (rating: Rating): string =>
  `${RatingText.RATED} ${rating.rate} ${RatingText.OUT_OF_MAX} ${MAX_RATING}, ${rating.count} ${RatingText.REVIEWS}`;
