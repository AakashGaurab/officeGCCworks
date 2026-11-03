import { HEADING_TAB_INDEX } from '../constants/AppConstants';
import { EnquiryText } from '../constants/Text';
import './EnquiryForm.css';

type EnquiryThanksProps = {
  onSendAnother: () => void;
};

const EnquiryThanks = ({ onSendAnother }: EnquiryThanksProps) => (
  <section className="enquiry-form">
    <h2 tabIndex={HEADING_TAB_INDEX}>{EnquiryText.THANKS_TITLE}</h2>
    <p>{EnquiryText.THANKS_MESSAGE}</p>
    <button className="button" type="button" onClick={onSendAnother}>
      {EnquiryText.SEND_ANOTHER}
    </button>
  </section>
);

export default EnquiryThanks;
