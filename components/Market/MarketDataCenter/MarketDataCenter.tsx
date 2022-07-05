import { t, Trans } from '@lingui/macro';
import Image from 'next/image';
import { sprintf } from 'sprintf-js';
import { DataCenter } from '../../../types/game/DataCenter';
import { Item } from '../../../types/game/Item';
import { Language } from '../../../types/universalis/lang';
import ListingsTable from '../../ListingsTable/ListingsTable';
import SalesTable from '../../SalesTable/SalesTable';
import MarketAverages from '../MarketAverages/MarketAverages';
import MarketCheapest from '../MarketCheapest/MarketCheapest';
import MarketHistoryGraph from '../MarketHistoryGraph/MarketHistoryGraph';
import MarketServerUpdateTimes from '../MarketServerUpdateTimes/MarketServerUpdateTimes';
import MarketStackSizeHistogram from '../MarketStackSizeHistogram/MarketStackSizeHistogram';

interface MarketDataCenterProps {
  item: Item;
  dc: DataCenter;
  markets: Record<number, any>;
  lang: Language;
}

function entriesToShow(entries: {}[]) {
  return Math.max(Math.floor(entries.length * 0.1), 10);
}

export default function MarketDataCenter({ item, dc, markets, lang }: MarketDataCenterProps) {
  const worldsSorted = dc.worlds.sort((a, b) => a.name.localeCompare(b.name));

  if (Object.keys(markets).length !== dc.worlds.length) {
    return <></>;
  }

  const allListings = Object.values(markets)
    .map((market) =>
      market.listings.map((listing: any) => {
        listing.worldName = market.worldName;
        return listing;
      })
    )
    .flat()
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit);
  const allSales = Object.values(markets)
    .map((market) =>
      market.recentHistory.map((listing: any) => {
        listing.worldName = market.worldName;
        return listing;
      })
    )
    .flat()
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit);

  const hqListings = allListings.filter((listing) => listing.hq);
  const nqListings = allListings.filter((listing) => !listing.hq);
  const hqSales = allSales.filter((sale) => sale.hq);
  const nqSales = allSales.filter((sale) => !sale.hq);

  const hqListingsAveragePpu =
    Math.ceil(
      hqListings.map((listing) => listing.pricePerUnit).reduce((agg, next) => agg + next, 0) /
        hqListings.length
    ) || 0;
  const nqListingsAveragePpu =
    Math.ceil(
      nqListings.map((listing) => listing.pricePerUnit).reduce((agg, next) => agg + next, 0) /
        nqListings.length
    ) || 0;
  const hqListingsAverageTotal =
    Math.ceil(
      hqListings.map((listing) => listing.total).reduce((agg, next) => agg + next, 0) /
        hqListings.length
    ) || 0;
  const nqListingsAverageTotal =
    Math.ceil(
      nqListings.map((listing) => listing.total).reduce((agg, next) => agg + next, 0) /
        nqListings.length
    ) || 0;
  const hqSalesAveragePpu =
    Math.ceil(
      hqSales.map((sale) => sale.pricePerUnit).reduce((agg, next) => agg + next, 0) / hqSales.length
    ) || 0;
  const nqSalesAveragePpu =
    Math.ceil(
      nqSales.map((sale) => sale.pricePerUnit).reduce((agg, next) => agg + next, 0) / nqSales.length
    ) || 0;
  const hqSalesAverageTotal =
    Math.ceil(
      hqSales.map((sale) => sale.total).reduce((agg, next) => agg + next, 0) / hqSales.length
    ) || 0;
  const nqSalesAverageTotal =
    Math.ceil(
      nqSales.map((sale) => sale.total).reduce((agg, next) => agg + next, 0) / nqSales.length
    ) || 0;

  return (
    <>
      <MarketServerUpdateTimes worlds={worldsSorted} uploadTimes={markets} />
      <div className="cross_world_markets">
        <MarketCheapest item={item} listings={hqListings} quality="HQ" />
        <MarketCheapest item={item} listings={nqListings} quality="NQ" />
      </div>
      <br />
      <br />
      <h6>
        <Trans>Cross-World Purchase history (500 sales)</Trans>
      </h6>
      <MarketHistoryGraph server={dc.name} itemId={item.id} />
      {item.stackSize > 1 && (
        <div>
          <h6>
            <Trans>STACK SIZE HISTOGRAM</Trans>
          </h6>
          <MarketStackSizeHistogram item={item} data={allSales} />
        </div>
      )}
      <div className="cross_world_markets">
        <div>
          {item.canBeHq && (
            <>
              <h6>
                <Image src="/i/game/hq.png" alt="High Quality" height={15} width={15} />{' '}
                {sprintf(t`%s Prices`, 'HQ')} {t`(Includes 5% GST)`}
              </h6>
              <ListingsTable
                listings={hqListings}
                averageHq={hqListingsAveragePpu}
                averageNq={nqListingsAveragePpu}
                crossWorld={true}
                includeDiff={true}
                lang={lang}
                start={0}
                end={entriesToShow(hqListings)}
              />
              <br />
            </>
          )}
          <h6>
            {sprintf(t`%s Prices`, 'NQ')} {t`(Includes 5% GST)`}
          </h6>
          <ListingsTable
            listings={nqListings}
            averageHq={hqListingsAveragePpu}
            averageNq={nqListingsAveragePpu}
            crossWorld={true}
            includeDiff={true}
            lang={lang}
            start={0}
            end={entriesToShow(nqListings)}
          />
        </div>
        <div>
          {item.canBeHq && (
            <>
              <h6>
                <Image src="/i/game/hq.png" alt="High Quality" height={15} width={15} />{' '}
                {sprintf(t`%s Purchase History`, 'HQ')}
              </h6>
              <SalesTable
                sales={hqSales}
                averageHq={hqSalesAveragePpu}
                averageNq={nqSalesAveragePpu}
                crossWorld={true}
                includeDiff={true}
                lang={lang}
                start={0}
                end={entriesToShow(hqSales)}
              />
              <br />
            </>
          )}
          <h6>{sprintf(t`%s Purchase History`, 'NQ')}</h6>
          <SalesTable
            sales={nqSales}
            averageHq={hqSalesAveragePpu}
            averageNq={nqSalesAveragePpu}
            crossWorld={true}
            includeDiff={true}
            lang={lang}
            start={0}
            end={entriesToShow(nqSales)}
          />
        </div>
      </div>
      <br />
      <br />
      <div className="cross_world_markets">
        <div>
          <h6>
            <Trans>Listings</Trans>
          </h6>
          <MarketAverages
            item={item}
            averagePpuHq={hqListingsAveragePpu}
            averagePpuNq={nqListingsAveragePpu}
            averageTotalHq={hqListingsAverageTotal}
            averageTotalNq={nqListingsAverageTotal}
          />
        </div>
        <div>
          <h6>
            <Trans>Sales</Trans>
          </h6>
          <MarketAverages
            item={item}
            averagePpuHq={hqSalesAveragePpu}
            averagePpuNq={nqSalesAveragePpu}
            averageTotalHq={hqSalesAverageTotal}
            averageTotalNq={nqSalesAverageTotal}
          />
        </div>
      </div>
    </>
  );
}
