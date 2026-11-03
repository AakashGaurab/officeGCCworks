import { listEnquiries } from './adminApi';
import { apiGet } from './apiClient';

vi.mock('./apiClient');

describe('listEnquiries', () => {
  it('sends the token as a Bearer header and never in the query', async () => {
    vi.mocked(apiGet).mockResolvedValue({});
    const signal = new AbortController().signal;

    await listEnquiries('secret-token', { status: undefined, page: 2, pageSize: 20 }, signal);

    expect(apiGet).toHaveBeenCalledWith('/admin/enquiries', {
      params: { status: undefined, page: 2, pageSize: 20 },
      headers: { Authorization: 'Bearer secret-token' },
      signal,
    });
  });
});
