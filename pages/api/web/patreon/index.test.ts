import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler, { PatreonRandomSubscriberResponse } from './index';

// Mock the patreon service
jest.mock('../../../../service/patreon', () => ({
  getPatreonSubscribers: jest.fn(),
  getRandomSubscriber: jest.fn(),
}));

import {
  getPatreonSubscribers,
  getRandomSubscriber,
  PatreonSubscriber,
} from '../../../../service/patreon';

// Type the mocked functions
const mockedGetPatreonSubscribers = getPatreonSubscribers as jest.MockedFunction<
  typeof getPatreonSubscribers
>;
const mockedGetRandomSubscriber = getRandomSubscriber as jest.MockedFunction<
  typeof getRandomSubscriber
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('/api/web/patreon', () => {
  test('returns random subscriber data when subscribers exist', async () => {
    const mockSubscribers: PatreonSubscriber[] = [
      {
        name: 'John Doe',
      },
      {
        name: 'Jane Smith',
      },
    ];

    const mockSelectedSubscriber = mockSubscribers[0];

    mockedGetPatreonSubscribers.mockResolvedValue(mockSubscribers);
    mockedGetRandomSubscriber.mockReturnValue(mockSelectedSubscriber);

    const { req, res } = createMocks<
      NextApiRequest,
      NextApiResponse<PatreonRandomSubscriberResponse>
    >({
      method: 'GET',
      url: '/api/web/patreon',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toMatchObject({
      'cache-control': 'public, max-age=300, stale-while-revalidate=600',
    });

    const responseData = JSON.parse(res._getData()) as PatreonRandomSubscriberResponse;
    expect(responseData).toEqual({
      subscriber: {
        name: 'John Doe',
      },
    });

    expect(mockedGetPatreonSubscribers).toHaveBeenCalledTimes(1);
    expect(mockedGetRandomSubscriber).toHaveBeenCalledWith(mockSubscribers);
  });

  test('returns null subscriber when no subscribers exist', async () => {
    const mockSubscribers: PatreonSubscriber[] = [];

    mockedGetPatreonSubscribers.mockResolvedValue(mockSubscribers);
    mockedGetRandomSubscriber.mockReturnValue(null);

    const { req, res } = createMocks<
      NextApiRequest,
      NextApiResponse<PatreonRandomSubscriberResponse>
    >({
      method: 'GET',
      url: '/api/web/patreon',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toMatchObject({
      'cache-control': 'public, max-age=300, stale-while-revalidate=600',
    });

    const responseData = JSON.parse(res._getData()) as PatreonRandomSubscriberResponse;
    expect(responseData).toEqual({
      subscriber: null,
    });

    expect(mockedGetPatreonSubscribers).toHaveBeenCalledTimes(1);
    expect(mockedGetRandomSubscriber).toHaveBeenCalledWith(mockSubscribers);
  });

  test('returns fallback response when service throws error', async () => {
    mockedGetPatreonSubscribers.mockRejectedValue(new Error('API Error'));

    const { req, res } = createMocks<
      NextApiRequest,
      NextApiResponse<PatreonRandomSubscriberResponse>
    >({
      method: 'GET',
      url: '/api/web/patreon',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);

    const responseData = JSON.parse(res._getData()) as PatreonRandomSubscriberResponse;
    expect(responseData).toEqual({
      subscriber: null,
    });

    expect(mockedGetPatreonSubscribers).toHaveBeenCalledTimes(1);
    expect(mockedGetRandomSubscriber).not.toHaveBeenCalled();
  });

  test('filters out sensitive subscriber data', async () => {
    const mockSubscribers: PatreonSubscriber[] = [
      {
        name: 'John Doe',
      },
    ];

    mockedGetPatreonSubscribers.mockResolvedValue(mockSubscribers);
    mockedGetRandomSubscriber.mockReturnValue(mockSubscribers[0]);

    const { req, res } = createMocks<
      NextApiRequest,
      NextApiResponse<PatreonRandomSubscriberResponse>
    >({
      method: 'GET',
      url: '/api/web/patreon',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const responseData = JSON.parse(res._getData()) as PatreonRandomSubscriberResponse;

    // Should only include name
    expect(responseData.subscriber).toEqual({
      name: 'John Doe',
    });
  });

  test('sets proper cache headers', async () => {
    const mockSubscribers: PatreonSubscriber[] = [
      {
        name: 'John Doe',
      },
    ];

    mockedGetPatreonSubscribers.mockResolvedValue(mockSubscribers);
    mockedGetRandomSubscriber.mockReturnValue(mockSubscribers[0]);

    const { req, res } = createMocks<
      NextApiRequest,
      NextApiResponse<PatreonRandomSubscriberResponse>
    >({
      method: 'GET',
      url: '/api/web/patreon',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const cacheHeader = res._getHeaders()['cache-control'];
    expect(cacheHeader).toBe('public, max-age=300, stale-while-revalidate=600');
  });

  test('handles edge case where getRandomSubscriber returns different subscriber', async () => {
    const mockSubscribers: PatreonSubscriber[] = [
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

    const mockSelectedSubscriber = mockSubscribers[2]; // Third subscriber

    mockedGetPatreonSubscribers.mockResolvedValue(mockSubscribers);
    mockedGetRandomSubscriber.mockReturnValue(mockSelectedSubscriber);

    const { req, res } = createMocks<
      NextApiRequest,
      NextApiResponse<PatreonRandomSubscriberResponse>
    >({
      method: 'GET',
      url: '/api/web/patreon',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const responseData = JSON.parse(res._getData()) as PatreonRandomSubscriberResponse;
    expect(responseData).toEqual({
      subscriber: {
        name: 'Bob Johnson',
      },
    });
  });

  test('response structure is consistent', async () => {
    mockedGetPatreonSubscribers.mockResolvedValue([]);
    mockedGetRandomSubscriber.mockReturnValue(null);

    const { req, res } = createMocks<
      NextApiRequest,
      NextApiResponse<PatreonRandomSubscriberResponse>
    >({
      method: 'GET',
      url: '/api/web/patreon',
    });

    await handler(req, res);

    const responseData = JSON.parse(res._getData()) as PatreonRandomSubscriberResponse;

    // Ensure response always has the expected structure
    expect(responseData).toHaveProperty('subscriber');

    // subscriber can be null or an object with name
    if (responseData.subscriber !== null) {
      expect(responseData.subscriber).toHaveProperty('name');
    }
  });
});
