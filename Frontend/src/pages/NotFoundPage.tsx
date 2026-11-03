import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageTitle from '../components/PageTitle';
import { RoutePath } from '../constants/Routes';
import { CommonText, NotFoundText } from '../constants/Text';

const NotFoundPage = () => (
  <>
    <PageTitle title={NotFoundText.TITLE} />
    <EmptyState title={NotFoundText.TITLE} message={NotFoundText.MESSAGE}>
      <Link to={RoutePath.HOME}>{CommonText.BACK_TO_HOME}</Link>
    </EmptyState>
  </>
);

export default NotFoundPage;
