import useSWR from 'swr';

interface PatreonSubscriber {
  name: string;
}

interface PatreonRandomSubscriberResponse {
  subscriber: PatreonSubscriber | null;
}

export default function usePatreonSubscriber() {
  return useSWR('/api/web/patreon', (url) =>
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
      .then((res) => res as PatreonRandomSubscriberResponse)
      .catch(console.error)
  );
}
