export function getBaseUrl(): string {
  return process.env.API_URL || 'https://universalis.app/api';
}
