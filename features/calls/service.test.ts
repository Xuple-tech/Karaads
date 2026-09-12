import { KaraApiError } from '@/lib/errors/api-error';

import { callsService, shouldRetryStartCallWithoutMode } from './service';

jest.mock('@/lib/api/http', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('@/features/auth/store', () => ({
  useAuthStore: {
    getState: () => ({ token: 'token-1' }),
  },
}));

const { apiRequest } = jest.requireMock('@/lib/api/http') as {
  apiRequest: jest.Mock;
};

describe('callsService.startCall', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('only retries without mode for validation errors tied to the mode field', async () => {
    apiRequest
      .mockRejectedValueOnce(new KaraApiError('VALIDATION_ERROR', 'The mode field is invalid.', 422, { mode: ['Invalid mode'] }))
      .mockResolvedValueOnce({
        data: {
          call_id: 'call-1',
          conversation_id: 'c-1',
          status: 'ringing',
        },
      });

    await expect(callsService.startCall('c-1', 'video')).resolves.toMatchObject({ call_id: 'call-1' });
    expect(apiRequest).toHaveBeenCalledTimes(2);
    expect(apiRequest.mock.calls[1][1]).not.toHaveProperty('body');
  });

  it('does not retry unrelated failures without mode', async () => {
    const error = new KaraApiError('HTTP_ERROR', 'Request failed with status 500', 500);
    apiRequest.mockRejectedValueOnce(error);

    await expect(callsService.startCall('c-1', 'video')).rejects.toBe(error);
    expect(apiRequest).toHaveBeenCalledTimes(1);
  });
});

describe('shouldRetryStartCallWithoutMode', () => {
  it('detects mode validation failures', () => {
    expect(
      shouldRetryStartCallWithoutMode(
        new KaraApiError('VALIDATION_ERROR', 'The mode field is invalid.', 422, { mode: ['Invalid mode'] }),
        'audio',
      ),
    ).toBe(true);
  });

  it('ignores non-mode validation failures', () => {
    expect(
      shouldRetryStartCallWithoutMode(
        new KaraApiError('VALIDATION_ERROR', 'The conversation field is required.', 422, { conversation_id: ['Required'] }),
        'audio',
      ),
    ).toBe(false);
  });
});
