import type { EnquiryStatus } from '../constants/AppConstants';
import { AdminText } from '../constants/Text';
import type { StatusCounts } from '../types/AdminEnquiry';
import { getTabCount, STATUS_TABS } from '../utils/adminStatus';
import AdminStatusTab from './AdminStatusTab';
import './AdminStatusTabs.css';

type AdminStatusTabsProps = {
  selectedStatus: EnquiryStatus | undefined;
  statusCounts: StatusCounts | null;
  onSelect: (status: EnquiryStatus | undefined) => void;
};

const AdminStatusTabs = ({ selectedStatus, statusCounts, onSelect }: AdminStatusTabsProps) => {
  const renderTab = ({ status, label }: (typeof STATUS_TABS)[number]) => (
    <AdminStatusTab
      key={label}
      status={status}
      label={label}
      count={getTabCount(statusCounts, status)}
      isSelected={status === selectedStatus}
      onSelect={onSelect}
    />
  );

  return (
    <div className="admin-status-tabs" role="group" aria-label={AdminText.TABS_LABEL}>
      {STATUS_TABS.map(renderTab)}
    </div>
  );
};

export default AdminStatusTabs;
