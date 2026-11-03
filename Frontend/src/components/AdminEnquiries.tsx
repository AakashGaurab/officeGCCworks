import { useEffect, useRef, useState } from 'react';
import { HEADING_TAB_INDEX, type EnquiryStatus } from '../constants/AppConstants';
import { AdminText } from '../constants/Text';
import { useAdminEnquiries } from '../hooks/useAdminEnquiries';
import AdminEnquiryTable from './AdminEnquiryTable';
import AdminStatusTabs from './AdminStatusTabs';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';
import './AdminEnquiries.css';

type AdminEnquiriesProps = {
  token: string;
  onSignOut: () => void;
  onUnauthorized: () => void;
};

// The signed-in view: filter tabs, the table and "Load more". Only mounted while a token exists.
const AdminEnquiries = ({ token, onSignOut, onUnauthorized }: AdminEnquiriesProps) => {
  const [selectedStatus, setSelectedStatus] = useState<EnquiryStatus | undefined>(undefined);
  const enquiries = useAdminEnquiries(token, selectedStatus, onUnauthorized);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // After signing in, move focus to the list so keyboard and screen reader users land on it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const renderContent = () => {
    if (enquiries.isLoading) return <LoadingState />;
    if (enquiries.isFirstLoadFailed) return <ErrorState onRetry={enquiries.retry} />;
    if (enquiries.items.length === 0) {
      return selectedStatus ? (
        <EmptyState title={AdminText.EMPTY_FILTERED_TITLE} message={AdminText.EMPTY_FILTERED_MESSAGE} />
      ) : (
        <EmptyState title={AdminText.EMPTY_ALL_TITLE} message={AdminText.EMPTY_ALL_MESSAGE} />
      );
    }
    return (
      <>
        <AdminEnquiryTable enquiries={enquiries.items} />
        {enquiries.isLoadingMore && <LoadingState />}
        {enquiries.error && <ErrorState onRetry={enquiries.retry} />}
        {enquiries.hasNextPage && !enquiries.isLoadingMore && !enquiries.error && (
          <button className="button admin-load-more" type="button" onClick={enquiries.loadMore}>
            {AdminText.LOAD_MORE}
          </button>
        )}
      </>
    );
  };

  return (
    <section>
      <div className="admin-toolbar">
        <h2 ref={headingRef} tabIndex={HEADING_TAB_INDEX}>
          {AdminText.LIST_HEADING}
        </h2>
        <div className="admin-toolbar-actions">
          <button className="button" type="button" onClick={enquiries.refresh}>
            {AdminText.REFRESH}
          </button>
          <button className="button" type="button" onClick={onSignOut}>
            {AdminText.SIGN_OUT}
          </button>
        </div>
      </div>
      <p className="admin-note">{AdminText.SENT_NOTE}</p>
      <AdminStatusTabs
        selectedStatus={selectedStatus}
        statusCounts={enquiries.statusCounts}
        onSelect={setSelectedStatus}
      />
      {renderContent()}
    </section>
  );
};

export default AdminEnquiries;
