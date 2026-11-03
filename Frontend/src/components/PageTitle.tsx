import { useEffect } from 'react';
import { buildDocumentTitle } from '../utils/sentences';

type PageTitleProps = {
  title: string;
};

// The visible h1 and the browser tab title always say the same thing.
const PageTitle = ({ title }: PageTitleProps) => {
  useEffect(() => {
    document.title = buildDocumentTitle(title);
  }, [title]);

  return <h1>{title}</h1>;
};

export default PageTitle;
