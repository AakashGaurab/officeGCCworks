import { Link } from 'react-router-dom';
import type { Category } from '../types/Product';
import { buildCategoryPath } from '../utils/routePaths';
import './CategoryLinks.css';

type CategoryLinksProps = {
  categories: Category[];
  label: string;
};

const CategoryLinks = ({ categories, label }: CategoryLinksProps) => {
  const renderCategoryLink = (category: Category) => (
    <li key={category}>
      <Link className="category-link" to={buildCategoryPath(category)}>
        {category}
      </Link>
    </li>
  );

  if (categories.length === 0) return null;

  return (
    <nav aria-label={label}>
      <ul className="category-links">{categories.map(renderCategoryLink)}</ul>
    </nav>
  );
};

export default CategoryLinks;
