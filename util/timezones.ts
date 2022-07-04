export interface TimeZone {
  id: string;
  offset: number;
  name: string;
}

export async function getTimeZones(): Promise<TimeZone[]> {
  return await fetch('https://universalis.app/api/v3/misc/time-zones').then((res) => res.json());
}
