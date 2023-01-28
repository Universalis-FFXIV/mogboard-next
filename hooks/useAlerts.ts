import useSWR from 'swr';
import { UserAlert } from '../types/universalis/user';

export default function useAlerts() {
  return useSWR('/api/web/alerts', (url) =>
    fetch(url)
      .then((res) => res.json())
      .then((res) => res as UserAlert[])
      .catch(console.error)
  );
}
