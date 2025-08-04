import { Campaign, Patron, Pledge } from 'patreon';
import { getRandomSubscriber, PatreonSubscriber } from './patreon';

// Mock the patreon module
jest.mock('patreon', () => ({
  patreon: jest.fn(),
}));

// Store original environment variables
const originalEnv = process.env;

// Mock patreon client response data
const mockCampaign: Campaign = {
  id: 'campaign-123',
  _type: 'campaign',
  patron_count: 5,
  summary: '',
  creation_name: '',
  pay_per_name: '',
  one_liner: null,
  main_video_embed: null,
  main_video_url: null,
  image_small_url: '',
  image_url: '',
  thanks_video_url: null,
  thanks_embed: null,
  thanks_msg: null,
  is_charged_immediately: false,
  is_monthly: false,
  is_nsfw: false,
  created_at: '',
  published_at: '',
  pledge_sum: 0,
  pledge_url: '',
};

const mockPatrons: Patron[] = [
  {
    id: 'patron-1',
    _type: 'user',
    full_name: 'John Doe',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    created: '2023-01-01T00:00:00Z',
    url: 'https://patreon.com/john',
    image_url: 'https://example.com/john.jpg',
    thumb_url: 'https://example.com/john_thumb.jpg',
    vanity: null,
    about: null,
  },
  {
    id: 'patron-2',
    _type: 'user',
    full_name: 'Jane Smith',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    created: '2023-01-02T00:00:00Z',
    url: 'https://patreon.com/jane',
    image_url: 'https://example.com/jane.jpg',
    thumb_url: 'https://example.com/jane_thumb.jpg',
    vanity: 'jane',
    about: 'A loyal supporter',
  },
  {
    id: 'patron-3',
    _type: 'user',
    full_name: 'Bob Johnson',
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob@example.com',
    created: '2023-01-03T00:00:00Z',
    url: 'https://patreon.com/bob',
    image_url: 'https://example.com/bob.jpg',
    thumb_url: 'https://example.com/bob_thumb.jpg',
    vanity: null,
    about: null,
  },
];

const mockPledges: Pledge[] = [
  {
    id: 'pledge-1',
    _type: 'pledge',
    amount_cents: 1000,
    created_at: '2023-01-01T00:00:00Z',
    declined_since: null,
    pledge_cap_cents: null,
    patron_pays_fees: false,
    total_historical_amount_cents: 12000,
    patron: mockPatrons[0],
  },
  {
    id: 'pledge-2',
    _type: 'pledge',
    amount_cents: 500,
    created_at: '2023-01-02T00:00:00Z',
    declined_since: null,
    pledge_cap_cents: null,
    patron_pays_fees: true,
    total_historical_amount_cents: 6000,
    patron: mockPatrons[1],
  },
  {
    id: 'pledge-3',
    _type: 'pledge',
    amount_cents: 2000,
    created_at: '2023-01-03T00:00:00Z',
    declined_since: '2023-06-01T00:00:00Z', // Declined pledge
    pledge_cap_cents: null,
    patron_pays_fees: false,
    total_historical_amount_cents: 24000,
    patron: mockPatrons[2],
  },
];

const createMockPatreonClient = () => {
  return jest.fn((endpoint: string) => {
    if (endpoint === '/current_user') {
      return Promise.resolve({
        store: {
          findAll: jest.fn((type: string) => {
            if (type === 'campaign') return [mockCampaign];
            return [];
          }),
        },
      });
    }

    if (endpoint.startsWith('/campaigns/campaign-123/pledges')) {
      return Promise.resolve({
        store: {
          findAll: jest.fn((type: string) => {
            if (type === 'pledge') return mockPledges;
            return [];
          }),
          find: jest.fn((type: string, id: string) => {
            if (type === 'user') {
              return mockPatrons.find((patron) => patron.id === id);
            }
            return null;
          }),
        },
        links: {
          next: null, // No pagination for test
        },
      });
    }

    return Promise.resolve({});
  });
};

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };

  // Clear any cached data by requiring a fresh instance
  delete require.cache[require.resolve('./patreon')];

  // Reset mocks
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = originalEnv;
});

describe('getPatreonSubscribers', () => {
  test('returns empty array when environment variables are missing', async () => {
    delete process.env.PATREON_ACCESS_TOKEN;

    const { getPatreonSubscribers } = require('./patreon');
    const subscribers = await getPatreonSubscribers();

    expect(subscribers).toEqual([]);
  });

  test('returns active subscribers when API call succeeds', async () => {
    process.env.PATREON_ACCESS_TOKEN = 'test-access-token';

    const patreon = require('patreon').patreon as jest.MockedFunction<any>;
    patreon.mockReturnValue(createMockPatreonClient());

    const { getPatreonSubscribers } = require('./patreon');
    const subscribers = await getPatreonSubscribers();

    expect(subscribers).toHaveLength(2); // Only active pledges (not declined)
    expect(subscribers[0]).toEqual({
      name: 'John Doe',
    });
    expect(subscribers[1]).toEqual({
      name: 'Jane Smith',
    });
  });

  test('returns empty array when no campaigns found', async () => {
    process.env.PATREON_ACCESS_TOKEN = 'test-access-token';

    const mockEmptyResponse = {
      store: {
        findAll: jest.fn(() => []), // No campaigns
      },
    };

    const patreon = require('patreon').patreon as jest.MockedFunction<any>;
    patreon.mockReturnValue(jest.fn(() => Promise.resolve(mockEmptyResponse)));

    const { getPatreonSubscribers } = require('./patreon');
    const subscribers = await getPatreonSubscribers();

    expect(subscribers).toEqual([]);
  });

  test('returns empty array when API call fails', async () => {
    process.env.PATREON_ACCESS_TOKEN = 'test-access-token';

    const patreon = require('patreon').patreon as jest.MockedFunction<any>;
    patreon.mockReturnValue(jest.fn(() => Promise.reject(new Error('API Error'))));

    const { getPatreonSubscribers } = require('./patreon');
    const subscribers = await getPatreonSubscribers();

    expect(subscribers).toEqual([]);
  });

  test('handles pagination correctly', async () => {
    process.env.PATREON_ACCESS_TOKEN = 'test-access-token';

    const page1Pledges = [mockPledges[0]];
    const page2Pledges = [mockPledges[1]];

    const mockClient = jest.fn((endpoint: string) => {
      if (endpoint === '/current_user') {
        return Promise.resolve({
          store: {
            findAll: jest.fn((type: string) => {
              if (type === 'campaign') return [mockCampaign];
              return [];
            }),
          },
        });
      }

      if (endpoint.includes('page[count]=100')) {
        // First page
        return Promise.resolve({
          store: {
            findAll: jest.fn(() => page1Pledges),
            find: jest.fn((type: string, id: string) => {
              if (type === 'user') {
                return mockPatrons.find((patron) => patron.id === id);
              }
              return null;
            }),
          },
          links: {
            next: 'https://patreon.com/api/oauth2/v2/campaigns/campaign-123/pledges?page[cursor]=next_page',
          },
        });
      }

      if (endpoint.includes('page[cursor]=next_page')) {
        // Second page
        return Promise.resolve({
          store: {
            findAll: jest.fn(() => page2Pledges),
            find: jest.fn((type: string, id: string) => {
              if (type === 'user') {
                return mockPatrons.find((patron) => patron.id === id);
              }
              return null;
            }),
          },
          links: {
            next: null, // No more pages
          },
        });
      }

      return Promise.resolve({});
    });

    const patreon = require('patreon').patreon as jest.MockedFunction<any>;
    patreon.mockReturnValue(mockClient);

    const { getPatreonSubscribers } = require('./patreon');
    const subscribers = await getPatreonSubscribers();

    expect(subscribers).toHaveLength(2);
    expect(subscribers[0]).toEqual({ name: 'John Doe' });
    expect(subscribers[1]).toEqual({ name: 'Jane Smith' });
    expect(mockClient).toHaveBeenCalledTimes(3); // current_user + 2 pages
  });
});

describe('getRandomSubscriber', () => {
  test('returns null for empty array', () => {
    const result = getRandomSubscriber([]);
    expect(result).toBeNull();
  });

  test('returns the only subscriber for single-item array', () => {
    const subscribers: PatreonSubscriber[] = [
      {
        name: 'John Doe',
      },
    ];

    const result = getRandomSubscriber(subscribers);
    expect(result).toEqual(subscribers[0]);
  });

  test('returns a random subscriber from multiple items', () => {
    const subscribers: PatreonSubscriber[] = [
      {
        name: 'John Doe',
      },
      {
        name: 'Jane Smith',
      },
      {
        name: 'Bob Johnson',
      },
    ];

    // Test multiple times to ensure randomness
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      const result = getRandomSubscriber(subscribers);
      expect(result).not.toBeNull();
      expect(subscribers).toContain(result);
      results.add(result?.name);
    }

    expect(results.size).toBeGreaterThan(1);
  });

  test('always returns valid subscriber object structure', () => {
    const subscribers: PatreonSubscriber[] = [
      {
        name: 'John Doe',
      },
    ];

    const result = getRandomSubscriber(subscribers);
    expect(result).toMatchObject({
      name: expect.any(String),
    });
  });
});
