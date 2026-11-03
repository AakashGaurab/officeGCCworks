import { ADMIN_DATE_FORMAT, LOCALE } from '../constants/AppConstants';

const formatter = new Intl.DateTimeFormat(LOCALE, ADMIN_DATE_FORMAT);

// Shows the ISO timestamp from the API in the viewer's local time. An unreadable value is shown as it is.
export const formatEnquiryDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? isoDate : formatter.format(date);
};
