import { AdminColumnText, AdminText } from '../constants/Text';
import type { AdminEnquiry } from '../types/AdminEnquiry';
import AdminEnquiryRow from './AdminEnquiryRow';
import './AdminEnquiryTable.css';

type AdminEnquiryTableProps = {
  enquiries: AdminEnquiry[];
};

const COLUMNS = Object.values(AdminColumnText);

const renderColumnHeader = (column: AdminColumnText) => (
  <th key={column} scope="col">
    {column}
  </th>
);

const AdminEnquiryTable = ({ enquiries }: AdminEnquiryTableProps) => {
  const renderRow = (enquiry: AdminEnquiry) => <AdminEnquiryRow key={enquiry.id} enquiry={enquiry} />;

  return (
    // Scrolls sideways on small screens; tabIndex lets keyboard users scroll it.
    <div className="admin-table-wrapper" tabIndex={0} role="region" aria-label={AdminText.TABLE_CAPTION}>
      <table className="admin-table">
        <caption className="visually-hidden">{AdminText.TABLE_CAPTION}</caption>
        <thead>
          <tr>{COLUMNS.map(renderColumnHeader)}</tr>
        </thead>
        <tbody>{enquiries.map(renderRow)}</tbody>
      </table>
    </div>
  );
};

export default AdminEnquiryTable;
