export function getBaseUrl(): string {
  return process.env['NEXT_PUBLIC_API_URL'] || 'https://mogboard.universalis.app/api';
}
