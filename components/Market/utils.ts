import { MarketV2, Sale } from '../../types/universalis/MarketV2';

export const enum Quality {
  NormalQuality,
  HighQuality,
}

/**
 * Calculates the reference price used for %Diff calculations.
 *
 * @param market The API response to use for the calculation.
 * @param quality The quality to limit the calculation to.
 */
export function calculateReferencePrice(market: MarketV2, quality: Quality): number;
export function calculateReferencePrice(market: Record<string, MarketV2>, quality: Quality): number;
export function calculateReferencePrice(
  market: MarketV2 | Record<string, MarketV2>,
  quality: Quality
): number {
  // The reference price is the median of the last 7 days of sales
  const sales = concatSales(market).filter(isQuality(quality)).filter(withinDays(7));
  if (sales.length === 0) {
    return 0;
  }

  const averageUnitPrice = median(sales.map((sale) => sale.pricePerUnit));
  return averageUnitPrice;
}

/**
 * Returns all sales from the provided API responses.
 *
 * @param marketOrMarkets The input market data.
 * @returns The concatenated sales.
 */
function concatSales(marketOrMarkets: MarketV2 | Record<string, MarketV2>): Sale[] {
  if ('recentHistory' in marketOrMarkets) {
    const market = marketOrMarkets as MarketV2;
    return market.recentHistory ?? [];
  } else {
    const markets = marketOrMarkets as Record<string, MarketV2>;
    const sales = Object.values(markets)
      .map((market) => market.recentHistory ?? [])
      .flat();
    return sales;
  }
}

function median(values: number[]): number {
  const sortedValues = values.slice().sort((a, b) => a - b);

  const length = sortedValues.length;
  const medianIndex = Math.floor(length / 2);
  if (length % 2 !== 0) {
    return sortedValues[medianIndex];
  } else {
    return (sortedValues[medianIndex - 1] + sortedValues[medianIndex]) / 2;
  }
}

function isDistinctMedianIndex(idx: number): boolean {
  return Math.trunc(idx) === idx;
}

const SECONDS_PER_DAY = 86400;

function withinDays(days: number) {
  const maxTimeDiff = days * SECONDS_PER_DAY;
  const now = Date.now() / 1000;
  return function (sale: Sale): boolean {
    return now - sale.timestamp <= maxTimeDiff;
  };
}

function isQuality(quality: Quality) {
  return function (sale: Sale): boolean {
    if (quality === Quality.HighQuality) {
      return sale.hq;
    } else {
      return !sale.hq;
    }
  };
}
