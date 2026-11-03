import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as enquiryApi from '../api/enquiryApi';
import { ApiError } from '../api/ApiError';
import { makeProduct } from '../test/fixtures';
import EnquirySection from './EnquirySection';

vi.mock('../api/enquiryApi');

const product = makeProduct(7, { title: 'Blue Shirt' });

const renderOpenForm = async () => {
  const user = userEvent.setup();
  render(<EnquirySection product={product} />);
  await user.click(screen.getByRole('button', { name: 'Enquire' }));
  return user;
};

const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Message'), 'Is this in stock?');
};

describe('EnquirySection', () => {
  it('shows the form only after clicking Enquire and hides it on a second click', async () => {
    const user = userEvent.setup();
    render(<EnquirySection product={product} />);
    const enquireButton = screen.getByRole('button', { name: 'Enquire' });

    expect(screen.queryByRole('heading', { name: /Enquire about/ })).not.toBeInTheDocument();
    expect(enquireButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(enquireButton);
    expect(screen.getByRole('heading', { name: 'Enquire about Blue Shirt' })).toBeInTheDocument();
    expect(enquireButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(enquireButton);
    expect(screen.queryByRole('heading', { name: /Enquire about/ })).not.toBeInTheDocument();
  });

  it('has a hidden honeypot field that is skipped by keyboard and assistive technology', async () => {
    await renderOpenForm();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
    expect(honeypot?.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(honeypot?.parentElement).toHaveClass('visually-hidden');
  });

  it('shows errors for every invalid field on submit and focuses the first one', async () => {
    const user = await renderOpenForm();
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your message.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveFocus();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Enter your name.');
    expect(enquiryApi.submitEnquiry).not.toHaveBeenCalled();
  });

  it('shows a field error on blur and clears it once the value is fixed', async () => {
    const user = await renderOpenForm();
    const email = screen.getByLabelText('Email');

    await user.type(email, 'nope');
    await user.tab();
    expect(screen.getByText(/Enter a valid email address/)).toBeInTheDocument();
    expect(screen.queryByText('Enter your name.')).not.toBeInTheDocument();

    await user.type(email, '@example.com');
    expect(screen.queryByText(/Enter a valid email address/)).not.toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows an error for an invalid optional phone number', async () => {
    const user = await renderOpenForm();
    await user.type(screen.getByLabelText('Phone (optional)'), 'abc');
    await user.tab();

    expect(screen.getByText('Use only digits, spaces, + - and brackets.')).toBeInTheDocument();
  });

  it('submits the values and replaces the form with a thank you message', async () => {
    vi.mocked(enquiryApi.submitEnquiry).mockResolvedValue({ id: 'abc', status: 'received' });
    const user = await renderOpenForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByRole('heading', { name: 'Thank you' })).toBeInTheDocument();
    expect(screen.getByText(/sales team will be in touch/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    expect(enquiryApi.submitEnquiry).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ name: 'Ada Lovelace', email: 'ada@example.com', message: 'Is this in stock?' }),
      expect.any(AbortSignal),
    );
  });

  it('offers to send another enquiry with an empty form', async () => {
    vi.mocked(enquiryApi.submitEnquiry).mockResolvedValue({ id: 'abc', status: 'received' });
    const user = await renderOpenForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await user.click(await screen.findByRole('button', { name: 'Send another enquiry' }));

    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('disables the button and shows Sending... while submitting', async () => {
    vi.mocked(enquiryApi.submitEnquiry).mockReturnValue(new Promise(() => {}));
    const user = await renderOpenForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    const button = await screen.findByRole('button', { name: 'Sending...' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(enquiryApi.submitEnquiry).toHaveBeenCalledTimes(1);
  });

  it('shows an error, keeps the input and allows a retry after a server failure', async () => {
    vi.mocked(enquiryApi.submitEnquiry)
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_ERROR', 'x'))
      .mockResolvedValueOnce({ id: 'abc', status: 'received' });
    const user = await renderOpenForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be sent');
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('Message')).toHaveValue('Is this in stock?');

    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByRole('heading', { name: 'Thank you' })).toBeInTheDocument();
  });

  it.each([
    [429, /several enquiries/],
    [0, /could not reach the server/],
    [400, /not accepted/],
  ])('shows a friendly message for status %i', async (status, pattern) => {
    vi.mocked(enquiryApi.submitEnquiry).mockRejectedValue(new ApiError(status, 'CODE', 'x'));
    const user = await renderOpenForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(pattern));
  });

  it('moves focus to the form heading when the panel opens', async () => {
    await renderOpenForm();
    expect(screen.getByRole('heading', { name: 'Enquire about Blue Shirt' })).toHaveFocus();
  });

  it('moves focus to the Thank you heading after a successful send', async () => {
    vi.mocked(enquiryApi.submitEnquiry).mockResolvedValue({ id: 'abc', status: 'received' });
    const user = await renderOpenForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByRole('heading', { name: 'Thank you' })).toHaveFocus();
  });

  it('has a live region from the start that announces the success', async () => {
    vi.mocked(enquiryApi.submitEnquiry).mockResolvedValue({ id: 'abc', status: 'received' });
    const user = userEvent.setup();
    render(<EnquirySection product={product} />);
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'Enquire' }));
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    await waitFor(() => expect(status).toHaveTextContent('Your enquiry was sent.'));
  });

  it('always has the element that aria-controls points to', async () => {
    render(<EnquirySection product={product} />);
    const button = screen.getByRole('button', { name: 'Enquire' });
    const panelId = button.getAttribute('aria-controls') ?? '';

    expect(document.getElementById(panelId)).toBeInTheDocument();
    await userEvent.setup().click(button);
    expect(document.getElementById(panelId)).toContainElement(screen.getByLabelText('Name'));
  });

  it('sends only once when the form is submitted twice while sending', async () => {
    vi.mocked(enquiryApi.submitEnquiry).mockReturnValue(new Promise(() => {}));
    const user = await renderOpenForm();
    await fillValidForm(user);
    const form = screen.getByLabelText('Name').closest('form') as HTMLFormElement;

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(enquiryApi.submitEnquiry).toHaveBeenCalledTimes(1);
  });

  it('aborts the request when the page is left while sending', async () => {
    vi.mocked(enquiryApi.submitEnquiry).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    const { unmount } = render(<EnquirySection product={product} />);
    await user.click(screen.getByRole('button', { name: 'Enquire' }));
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
    const signal = vi.mocked(enquiryApi.submitEnquiry).mock.calls[0]?.[2];

    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
