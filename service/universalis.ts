import { MarketV2 } from '../types/universalis/MarketV2';

export function getBaseUrl(): string {
  return (
    process.env['API_URL'] || process.env['NEXT_PUBLIC_API_URL'] || 'https://universalis.app/api'
  );
}

export async function getServerMarket(server: string | number, itemId: number): Promise<MarketV2> {
  return fetch(`${getBaseUrl()}/v2/${server}/${itemId}`).then((res) => res.json());
}
