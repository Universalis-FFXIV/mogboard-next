declare module 'patreon' {
  export interface APIResponse {
    store: JsonApiDataStore;
  }

  export interface JsonApiDataStore {
    findAll(type: string): any[];
    find(type: string, id: string): any;
  }

  export interface PatreonAPIClient {
    (pathname: string): Promise<APIResponse>;
  }

  export interface Patron {
    id: string;
    _type: 'user';
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    created: string;
    url: string;
    image_url: string;
    thumb_url: string;
    vanity: string | null;
    about: string | null;
    discord_vanity: string | null;
  }

  export interface Pledge {
    id: string;
    _type: 'pledge';
    amount_cents: number;
    created_at: string;
    declined_since: string | null;
    pledge_cap_cents: number | null;
    patron_pays_fees: boolean;
    total_historical_amount_cents: number;
    patron: Patron;
  }

  export interface Campaign {
    id: string;
    _type: 'campaign';
    summary: string;
    creation_name: string;
    pay_per_name: string;
    one_liner: string | null;
    main_video_embed: string | null;
    main_video_url: string | null;
    image_small_url: string;
    image_url: string;
    thanks_video_url: string | null;
    thanks_embed: string | null;
    thanks_msg: string | null;
    is_charged_immediately: boolean;
    is_monthly: boolean;
    is_nsfw: boolean;
    created_at: string;
    published_at: string;
    patron_count: number;
    pledge_sum: number;
    pledge_url: string;
  }

  export function patreon(accessToken: string): PatreonAPIClient;
}
