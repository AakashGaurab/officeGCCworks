import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { listEnquiries } from '../api/adminApi';
import { ApiError } from '../api/ApiError';
import { ADMIN_TOKEN_STORAGE_KEY, EnquiryStatus } from '../constants/AppConstants';
import { makeAdminEnquiry, makeAdminPage } from '../test/fixtures';
import AdminPage from './AdminPage';

vi.mock('../api/adminApi');

const renderAdmin = () =>
  render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  );

const signIn = async (token = 'good-token') => {
  await userEvent.type(screen.getByLabelText('Admin token'), token);
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
};

afterEach(() => sessionStorage.clear());

describe('AdminPage noindex', () => {
  it('adds a robots noindex meta while mounted and removes it on unmount', () => {
    const { unmount } = renderAdmin();
    expect(document.head.querySelector('meta[name="robots"][content="noindex"]')).not.toBeNull();

    unmount();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });
});

describe('AdminPage sign in', () => {
  it('uses a password input and moves focus to the list heading after sign in', async () => {
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([1], false));
    renderAdmin();
    expect(screen.getByLabelText('Admin token')).toHaveAttribute('type', 'password');

    await signIn();

    expect(await screen.findByRole('heading', { name: 'Enquiries' })).toHaveFocus();
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBe('good-token');
    expect(screen.queryByLabelText('Admin token')).not.toBeInTheDocument();
  });

  it.each([
    [401, 'That token is not correct.'],
    [429, 'Too many attempts. Try again in a minute.'],
    [404, 'Admin access is not enabled on this server.'],
    [500, 'We could not sign you in. Check your connection and try again.'],
  ])('shows the message for %i and stays on the form with focus on it', async (status, message) => {
    vi.mocked(listEnquiries).mockRejectedValue(new ApiError(status, 'CODE', 'text'));
    renderAdmin();

    await signIn('bad-token');

    const error = await screen.findByText(message);
    expect(error).toHaveFocus();
    expect(screen.getByLabelText('Admin token')).toBeInTheDocument();
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('lets the user try again after a failure', async () => {
    vi.mocked(listEnquiries)
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'down'))
      .mockResolvedValue(makeAdminPage([1], false));
    renderAdmin();

    await signIn();
    await screen.findByText(/could not sign you in/);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Enquiries' })).toBeInTheDocument();
  });

  it('works when sessionStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([1], false));
    renderAdmin();

    await signIn();

    expect(await screen.findByRole('heading', { name: 'Enquiries' })).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});

describe('AdminPage session', () => {
  beforeEach(() => sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'good-token'));

  it('signs out, clearing the token and showing the form', async () => {
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([1], false));
    renderAdmin();

    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

    expect(screen.getByLabelText('Admin token')).toBeInTheDocument();
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('signs out with a notice when a later request returns 401', async () => {
    vi.mocked(listEnquiries)
      .mockResolvedValueOnce(makeAdminPage([1], false))
      .mockRejectedValueOnce(new ApiError(401, 'UNAUTHORIZED', 'no'));
    renderAdmin();
    await userEvent.click(await screen.findByRole('button', { name: 'Refresh' }));

    expect(await screen.findByText(/signed out/)).toBeInTheDocument();
    expect(screen.getByLabelText('Admin token')).toBeInTheDocument();
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
  });
});

describe('AdminPage list', () => {
  beforeEach(() => sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'good-token'));

  it('renders every column of a row', async () => {
    vi.mocked(listEnquiries).mockResolvedValue({
      ...makeAdminPage([], false),
      items: [
        makeAdminEnquiry(4, {
          productTitle: 'Blue Shirt',
          name: 'Ada Lovelace',
          email: 'ada+x@example.com',
          phone: '+44 20 7946 0000',
          message: 'Is it in stock?',
          status: EnquiryStatus.FAILED,
          errorMessage: 'smtp down',
        }),
      ],
    });
    renderAdmin();

    const row = within(await screen.findByRole('row', { name: /Ada Lovelace/ }));
    expect(row.getByText(/Blue Shirt/)).toBeInTheDocument();
    expect(row.getByText(/#4/)).toBeInTheDocument();
    expect(row.getByText(/2026/)).toBeInTheDocument();
    expect(row.getByRole('link', { name: 'ada+x@example.com' })).toHaveAttribute('href', 'mailto:ada%2Bx%40example.com');
    expect(row.getByText('+44 20 7946 0000')).toBeInTheDocument();
    expect(row.getByText('Failed')).toBeInTheDocument();
    expect(row.getByText('Is it in stock?')).toBeInTheDocument();
    expect(row.getByText(/smtp down/)).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Date',
      'Product',
      'Name',
      'Email',
      'Phone',
      'Status',
      'Message',
    ]);
  });

  it('shows message text literally, never as HTML', async () => {
    const message = '<img src=x onerror=alert(1)> <b>bold</b>';
    vi.mocked(listEnquiries).mockResolvedValue({
      ...makeAdminPage([], false),
      items: [makeAdminEnquiry(1, { message, name: '<script>x</script>' })],
    });
    const { container } = renderAdmin();

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByText('<script>x</script>')).toBeInTheDocument();
    expect(container.querySelector('img, b, script')).toBeNull();
  });

  it('shows tabs with counts, and filters when a tab is pressed', async () => {
    vi.mocked(listEnquiries)
      .mockResolvedValueOnce(makeAdminPage([1, 2], false, { pending: 1, sent: 2, failed: 1 }))
      .mockResolvedValueOnce(makeAdminPage([3], false, { pending: 1, sent: 2, failed: 1 }));
    renderAdmin();

    expect(await screen.findByRole('button', { name: 'All (4)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Pending (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sent (2)' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Failed (1)' }));

    expect(await screen.findByText('Customer 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Failed (1)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All (4)' })).toHaveAttribute('aria-pressed', 'false');
    expect(vi.mocked(listEnquiries).mock.calls[1]?.[1]).toMatchObject({ status: 'failed', page: 1 });
  });

  it('appends the next page on Load more and hides the button at the end', async () => {
    vi.mocked(listEnquiries)
      .mockResolvedValueOnce(makeAdminPage([1], true))
      .mockResolvedValueOnce(makeAdminPage([2], false));
    renderAdmin();

    await userEvent.click(await screen.findByRole('button', { name: 'Load more' }));

    expect(await screen.findByText('Customer 2')).toBeInTheDocument();
    expect(screen.getByText('Customer 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('shows the empty state for no enquiries and for an empty filter', async () => {
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([], false, { pending: 0, sent: 0, failed: 0 }));
    renderAdmin();
    expect(await screen.findByText('No enquiries yet')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Pending/ }));
    expect(await screen.findByText('No enquiries with this status')).toBeInTheDocument();
  });

  it('shows an error with Retry and recovers', async () => {
    vi.mocked(listEnquiries)
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_ERROR', 'x'))
      .mockResolvedValueOnce(makeAdminPage([1], false));
    renderAdmin();

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Customer 1')).toBeInTheDocument();
  });

  it('explains what Sent means', async () => {
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([1], false));
    renderAdmin();

    expect(await screen.findByText(/nothing is actually emailed/)).toBeInTheDocument();
  });
});
