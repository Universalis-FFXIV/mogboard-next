import useSWR from 'swr';
import { useCookies } from 'react-cookie';
import { UserAlert } from '../types/universalis/user';

const DEMO_ALERTS: UserAlert[] = [
  {
    id: 'demo-1',
    userId: 'demo',
    name: 'Demo Alert',
    itemId: 44015,
    worldId: 55,
    discordWebhook: null,
    triggerVersion: 0,
    trigger: {
      filters: ['hq'],
      mapper: 'quantity',
      reducer: 'max',
      comparison: { gt: { target: 5 } },
    },
  },
  {
    id: 'demo-2',
    userId: 'demo',
    name: 'Demo Alert 2',
    itemId: 44015,
    worldId: 55,
    discordWebhook: null,
    triggerVersion: 0,
    trigger: {
      filters: [],
      mapper: 'pricePerUnit',
      reducer: 'min',
      comparison: { lt: { target: 1000 } },
    },
  },
];

export default function useAlerts() {
  const [cookies] = useCookies(['demo_loggedin']);
  const isDemo =
    process.env.NEXT_PUBLIC_ENABLE_DEMO === 'true' && cookies.demo_loggedin === 'yes';

  return useSWR(isDemo ? null : '/api/web/alerts', (url) =>
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }
        return await res.json();
      })
      .then((res) => res as UserAlert[]),
    isDemo ? { fallbackData: DEMO_ALERTS } : undefined,
  );
}
