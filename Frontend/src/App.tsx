import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { RoutePath } from './constants/Routes';
import AdminPage from './pages/AdminPage';
import CategoryPage from './pages/CategoryPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';

const App = () => (
  <ErrorBoundary>
    <Routes>
      <Route element={<Layout />}>
        <Route path={RoutePath.HOME} element={<HomePage />} />
        <Route path={RoutePath.CATEGORY} element={<CategoryPage />} />
        <Route path={RoutePath.SEARCH} element={<SearchPage />} />
        <Route path={RoutePath.PRODUCT} element={<ProductPage />} />
        <Route path={RoutePath.ADMIN} element={<AdminPage />} />
        <Route path={RoutePath.NOT_FOUND} element={<NotFoundPage />} />
      </Route>
    </Routes>
  </ErrorBoundary>
);

export default App;
