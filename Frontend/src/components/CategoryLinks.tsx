import { NavLink } from 'react-router-dom';
import { CommonText } from '../constants/Text';
import { RoutePath } from '../constants/Routes';
import type { Category } from '../types/Product';
import { buildCategoryPath } from '../utils/routePaths';
import './CategoryLinks.css';

type CategoryLinksProps = {
  categories: Category[];
  label: string;
};

type NavLinkState = { isActive: boolean };

const LINK_CLASS = 'category-link';
const ACTIVE_LINK_CLASS = 'category-link category-link-active';

// NavLink tells us whether the link points at the page being viewed, so the current category is highlighted.
// NavLink also sets aria-current="page" on it, which screen readers announce.
const getLinkClassName = ({ isActive }: NavLinkState): string => (isActive ? ACTIVE_LINK_CLASS : LINK_CLASS);

const CategoryLinks = ({ categories, label }: CategoryLinksProps) => {
  const renderCategoryLink = (category: Category) => (
    <li key={category}>
      <NavLink className={getLinkClassName} to={buildCategoryPath(category)}>
        {category}
      </NavLink>
    </li>
  );

  if (categories.length === 0) return null;

  return (
    <nav aria-label={label}>
      <ul className="category-links">
        <li>
          {/* end: the home link is only active on exactly "/", not on every page under it */}
          <NavLink className={getLinkClassName} to={RoutePath.HOME} end>
            {CommonText.ALL_PRODUCTS_LINK}
          </NavLink>
        </li>
        {categories.map(renderCategoryLink)}
      </ul>
    </nav>
  );
};

export default CategoryLinks;
