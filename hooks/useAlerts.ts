import useSWR from 'swr';
import { UserAlert } from '../types/universalis/user';

export default function useAlerts() {
  return useSWR('/api/web/alerts', (url) =>
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
      .then((res) => res as UserAlert[])
      .catch(console.error)
  );
}
