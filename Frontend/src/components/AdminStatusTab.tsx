import type { EnquiryStatus } from '../constants/AppConstants';
import { buildTabLabel } from '../utils/adminStatus';

type AdminStatusTabProps = {
  status: EnquiryStatus | undefined;
  label: string;
  count: number | null;
  isSelected: boolean;
  onSelect: (status: EnquiryStatus | undefined) => void;
};

// A toggle button (aria-pressed): it filters the list, it does not switch to another page.
const AdminStatusTab = ({ status, label, count, isSelected, onSelect }: AdminStatusTabProps) => {
  const handleTabClick = () => onSelect(status);

  return (
    <button
      type="button"
      className="admin-status-tab"
      aria-pressed={isSelected}
      onClick={handleTabClick}
    >
      {buildTabLabel(label, count)}
    </button>
  );
};

export default AdminStatusTab;
