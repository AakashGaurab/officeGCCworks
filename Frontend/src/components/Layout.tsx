import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { CommonText } from '../constants/Text';
import { SearchQueryKey } from '../constants/Routes';
import { useCategories } from '../hooks/useCategories';
import { buildSearchPath } from '../utils/routePaths';
import Header from './Header';
import './Layout.css';

const MAIN_CONTENT_ID = 'main-content';

// Shared page frame: the header on top and the current page rendered below it.
const Layout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // The header menu is a bonus: if categories fail to load we still show the page, with a small Retry in the header.
  const { data: categories, error: categoriesError, retry: retryCategories } = useCategories();
  const currentTerm = searchParams.get(SearchQueryKey.TERM) ?? '';

  const handleHeaderSearch = (term: string) => navigate(buildSearchPath(term));

  return (
    <>
      <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
        {CommonText.SKIP_TO_CONTENT}
      </a>
      <Header
        categories={categories ?? []}
        searchTerm={currentTerm}
        onSearch={handleHeaderSearch}
        hasCategoriesError={categoriesError !== null}
        onCategoriesRetry={retryCategories}
      />
      <main id={MAIN_CONTENT_ID} className="layout-main">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
