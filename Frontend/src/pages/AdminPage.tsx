import { useEffect } from 'react';
import AdminEnquiries from '../components/AdminEnquiries';
import AdminLoginForm from '../components/AdminLoginForm';
import PageTitle from '../components/PageTitle';
import { AdminText } from '../constants/Text';
import { useAdminSession } from '../hooks/useAdminSession';

const ROBOTS_META_NAME = 'robots';
const NOINDEX = 'noindex';

// Not linked from the site menu. Showing the login form is not security: the API checks the token.
const AdminPage = () => {
  const session = useAdminSession();

  // Keep the admin page out of search results while it is mounted.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = ROBOTS_META_NAME;
    meta.content = NOINDEX;
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <>
      <PageTitle title={AdminText.PAGE_TITLE} />
      {session.token ? (
        <AdminEnquiries token={session.token} onSignOut={session.signOut} onUnauthorized={session.expireSession} />
      ) : (
        <AdminLoginForm
          error={session.loginError}
          notice={session.notice}
          isSigningIn={session.isSigningIn}
          onSignIn={session.signIn}
        />
      )}
    </>
  );
};

export default AdminPage;
