import { Link } from 'react-router-dom';
import { CommonText, HeaderText } from '../constants/Text';
import { RoutePath } from '../constants/Routes';
import type { Category } from '../types/Product';
import CategoryLinks from './CategoryLinks';
import SearchBar from './SearchBar';
import './Header.css';

type HeaderProps = {
  categories: Category[];
  searchTerm: string;
  onSearch: (term: string) => void;
  hasCategoriesError: boolean;
  onCategoriesRetry: () => void;
};

const Header = ({ categories, searchTerm, onSearch, hasCategoriesError, onCategoriesRetry }: HeaderProps) => (
  <header className="site-header">
    <div className="site-header-inner">
      <Link className="site-title" to={RoutePath.HOME}>
        {CommonText.APP_NAME}
      </Link>
      {/* key remounts the bar when the URL term changes so the input shows the current search */}
      <SearchBar key={searchTerm} initialTerm={searchTerm} onSearch={onSearch} />
    </div>
    <CategoryLinks categories={categories} label={CommonText.MAIN_NAV_LABEL} />
    {hasCategoriesError && (
      <div className="header-categories-error" role="alert">
        <span>{HeaderText.CATEGORIES_ERROR}</span>
        <button className="button" type="button" onClick={onCategoriesRetry}>
          {CommonText.RETRY}
        </button>
      </div>
    )}
  </header>
);

export default Header;
