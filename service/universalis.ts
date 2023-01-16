export function getBaseUrl(): string {
  return (
    process.env['API_URL'] || process.env['NEXT_PUBLIC_API_URL'] || 'https://universalis.app/api'
  );
}
