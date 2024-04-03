export interface Listing {
  lastReviewTime: number;
  pricePerUnit: number;
  quantity: number;
  worldName?: string;
  worldID?: number;
  hq: boolean;
  retainerCity: number;
  retainerName: string;
  total: number;
  tax: number;
}

export interface Sale {
  hq: boolean;
  pricePerUnit: number;
  quantity: number;
  timestamp: number;
  worldName?: string;
  worldID?: number;
  buyerName: string;
  total: number;
}

export interface MarketV2 {
  itemID: number;
  worldID?: number;
  lastUploadTime: number;
  listings: Listing[];
  recentHistory: Sale[];
  worldName?: string;
  dcName?: string;
  regionName?: string;
  worldUploadTimes?: Record<number, number>;
}
