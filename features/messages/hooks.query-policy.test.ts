import { useConversationMessages, useConversations } from './hooks';

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (options: unknown) => mockUseQuery(options),
  };
});

describe('messages query policy', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
  });

  it('disables polling for conversations', () => {
    useConversations();

    const queryOptions = mockUseQuery.mock.calls[0][0] as { refetchInterval?: boolean };
    expect(queryOptions.refetchInterval).toBe(false);
  });

  it('disables thread polling regardless of fallback flag', () => {
    useConversationMessages('c-1', true);
    useConversationMessages('c-1', false);

    const pollingEnabled = mockUseQuery.mock.calls[0][0] as { refetchInterval?: boolean };
    const pollingDisabled = mockUseQuery.mock.calls[1][0] as { refetchInterval?: boolean };

    expect(pollingEnabled.refetchInterval).toBe(false);
    expect(pollingDisabled.refetchInterval).toBe(false);
  });
});
