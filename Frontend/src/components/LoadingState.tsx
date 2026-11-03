import { CommonText } from '../constants/Text';
import './StateMessage.css';

type LoadingStateProps = {
  label?: string;
};

const LoadingState = ({ label = CommonText.LOADING }: LoadingStateProps) => (
  <div className="state-message" role="status">
    {label}
  </div>
);

export default LoadingState;
