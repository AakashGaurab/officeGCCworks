import { AdminText } from '../constants/Text';
import type { AdminEnquiry } from '../types/AdminEnquiry';
import { buildMailtoHref } from '../utils/buildMailtoHref';
import { formatEnquiryDate } from '../utils/formatEnquiryDate';
import EnquiryStatusBadge from './EnquiryStatusBadge';

type AdminEnquiryRowProps = {
  enquiry: AdminEnquiry;
};

// Everything from the customer is rendered as plain text (React escapes it), never as HTML.
const AdminEnquiryRow = ({ enquiry }: AdminEnquiryRowProps) => (
  <tr>
    <td>{formatEnquiryDate(enquiry.createdAt)}</td>
    <td>
      {enquiry.productTitle}
      <span className="admin-table-muted"> (#{enquiry.productId})</span>
    </td>
    <td>{enquiry.name}</td>
    <td>
      <a href={buildMailtoHref(enquiry.email)}>{enquiry.email}</a>
    </td>
    <td>{enquiry.phone ?? AdminText.NO_PHONE}</td>
    <td>
      <EnquiryStatusBadge status={enquiry.status} />
    </td>
    <td>
      <details>
        <summary>{AdminText.VIEW_MESSAGE}</summary>
        <p className="admin-message">{enquiry.message}</p>
        {enquiry.errorMessage && (
          <p className="admin-message admin-message-error">
            {AdminText.SEND_ERROR_PREFIX} {enquiry.errorMessage}
          </p>
        )}
      </details>
    </td>
  </tr>
);

export default AdminEnquiryRow;
