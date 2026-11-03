import { CommonText, ErrorText } from '../constants/Text';
import './StateMessage.css';

type ErrorStateProps = {
  onRetry: () => void;
  title?: string;
  message?: string;
};

const ErrorState = ({ onRetry, title = ErrorText.TITLE, message = ErrorText.MESSAGE }: ErrorStateProps) => (
  <section className="state-message state-message-error" role="alert">
    <h2 className="state-message-title">{title}</h2>
    <p>{message}</p>
    <button className="button" type="button" onClick={onRetry}>
      {CommonText.RETRY}
    </button>
  </section>
);

export default ErrorState;
