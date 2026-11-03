import { RatingText } from '../constants/Text';
import type { Rating } from '../types/Product';
import { spokenRating } from '../utils/spokenRating';
import './StarRating.css';

type StarRatingProps = {
  rating: Rating;
};

const StarRating = ({ rating }: StarRatingProps) => {
  return (
    <p className="star-rating" aria-label={spokenRating(rating)}>
      <span className="star-rating-star" aria-hidden="true">
        {RatingText.STAR}
      </span>{' '}
      <span aria-hidden="true">
        {rating.rate} ({rating.count})
      </span>
    </p>
  );
};

export default StarRating;
