import type { EnquiryStatus } from '../constants/AppConstants';
import { STATUS_LABELS } from '../utils/adminStatus';
import './EnquiryStatusBadge.css';

type EnquiryStatusBadgeProps = {
  status: EnquiryStatus;
};

// The status is written out, so it never depends on colour alone.
const EnquiryStatusBadge = ({ status }: EnquiryStatusBadgeProps) => (
  <span className={`enquiry-status-badge enquiry-status-${status}`}>{STATUS_LABELS[status]}</span>
);

export default EnquiryStatusBadge;
