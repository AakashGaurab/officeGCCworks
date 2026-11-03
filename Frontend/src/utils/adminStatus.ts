import { EnquiryStatus } from '../constants/AppConstants';
import { AdminFilterText } from '../constants/Text';
import type { StatusCounts } from '../types/AdminEnquiry';

// No status = "All". Declared once so the tabs are a loop.
export const STATUS_TABS: { status: EnquiryStatus | undefined; label: AdminFilterText }[] = [
  { status: undefined, label: AdminFilterText.ALL },
  { status: EnquiryStatus.PENDING, label: AdminFilterText.PENDING },
  { status: EnquiryStatus.SENT, label: AdminFilterText.SENT },
  { status: EnquiryStatus.FAILED, label: AdminFilterText.FAILED },
];

export const STATUS_LABELS: Record<EnquiryStatus, AdminFilterText> = {
  [EnquiryStatus.PENDING]: AdminFilterText.PENDING,
  [EnquiryStatus.SENT]: AdminFilterText.SENT,
  [EnquiryStatus.FAILED]: AdminFilterText.FAILED,
};

// The "All" count is the sum of the three statuses.
export const getTabCount = (counts: StatusCounts | null, status: EnquiryStatus | undefined): number | null => {
  if (!counts) return null;
  if (status) return counts[status];
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
};

// "Sent (3)"; just the label while the counts are still loading.
export const buildTabLabel = (label: string, count: number | null): string =>
  count === null ? label : `${label} (${count})`;
