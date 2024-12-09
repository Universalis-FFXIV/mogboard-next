import { MarketV2, Sale } from '../../types/universalis/MarketV2';

export const enum Quality {
  NormalQuality,
  HighQuality,
}

export function shouldDisplayDiffTooltopEver(percentDiff: number): boolean {
  return isFinite(percentDiff);
}

/**
 * Returns the CSS class that should be used when displaying the provided percent difference.
 *
 * @param percentDiff The percentage, expressed as a number where 100 means 100%.
 * @returns The class to use for the label.
 */
export function getPercentDiffLabelClass(percentDiff: number): string {
  if (isDiffNegligible(percentDiff) || !isFinite(percentDiff)) {
    return 'price-diff-equal';
  }

  if (percentDiff >= 20) {
    return 'price-diff-bad';
  }

  if (percentDiff < -10) {
    return 'price-diff-good';
  }

  return '';
}

export interface PercentDiffTooltipBodyProps {
  diff: number;
  nounSingular: string;
  price: number;
  referencePrice: number;
  quality: Quality;
}

export function PercentDiffTooltipBody({
  diff,
  nounSingular,
  price,
  referencePrice,
  quality,
}: PercentDiffTooltipBodyProps) {
  const qualityStr = quality === Quality.HighQuality ? 'HQ' : 'NQ';

  if (price === referencePrice) {
    return (
      <>
        This {nounSingular} is equal to the <strong>Median Unit Sale Price ({qualityStr})</strong>{' '}
        over the past 7 days: <strong>{referencePrice.toLocaleString()}</strong>
      </>
    );
  }

  const percentDiffStr = formatPercentDiff(diff / 100, 4, false);
  return (
    <>
      This {nounSingular} is{' '}
      <strong>
        {percentDiffStr} {diff > 0 ? 'more' : 'less'}
      </strong>{' '}
      than the <strong>Median Unit Sale Price ({qualityStr})</strong> over the past 7 days:{' '}
      <strong>{referencePrice.toLocaleString()}</strong>
    </>
  );
}

/**
 * Formats the provided percent difference.
 *
 * @param percentDiff The percentage, expressed as a number where 100 means 100%.
 * @returns The formatted percentage.
 */
export function formatPercentDiffSimple(percentDiff: number): string {
  // Special case as we have a different tooltip for the equals case ("price is equal to...").
  // We also don't display a tooltip when the difference is infinity.
  if (percentDiff === 0 || !isFinite(percentDiff)) {
    return '-';
  }

  // Display values with only a fractional component as "<1%"
  if (isDiffNegligible(percentDiff)) {
    return `<${formatPercentDiff(0.01, 1, false)}`;
  }

  // Display all other values as exact integer percentages
  const simpleDiff = easePercentDiff(percentDiff);
  return formatPercentDiff(simpleDiff, undefined);
}

function formatPercentDiff(
  percentDiff: number,
  significantDigits: number | undefined,
  displaySign: boolean = true
): string {
  return percentDiff.toLocaleString(undefined, {
    style: 'percent',
    signDisplay: displaySign ? 'exceptZero' : 'never',
    maximumSignificantDigits: significantDigits,
  });
}

function isDiffNegligible(percentDiff: number): boolean {
  const simpleDiff = easePercentDiff(percentDiff);
  return simpleDiff === 0;
}

function easePercentDiff(percentDiff: number): number {
  return roundByMagnitude(percentDiff) / 100;
}

/**
 * Rounds the provided value away from zero (e.g. by its magnitude, not its sign).
 *
 * @param value The value to round.
 * @returns The rounded value.
 */
function roundByMagnitude(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
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
