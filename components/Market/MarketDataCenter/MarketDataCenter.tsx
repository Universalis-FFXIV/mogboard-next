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
import MarketStackSizeHistogram from '../MarketStackSizeHistogram/MarketStackSizeHistogram';
import { useDataCenterMarket } from '../../../hooks/market';
import MarketWorld from '../MarketWorld/MarketWorld';

interface MarketDataCenterProps {
  item: Item;
  dc: DataCenter;
  market: any;
  lang: Language;
  open: boolean;
}

function entriesToShow(entries: {}[]) {
  return Math.max(Math.floor(entries.length * 0.1), 10);
}

export default function MarketDataCenter({ item, dc, market, lang, open }: MarketDataCenterProps) {
  const hqListings = market.listings?.filter((listing: any) => listing.hq) ?? [];
  const nqListings = market.listings?.filter((listing: any) => !listing.hq) ?? [];
  const hqSales = market.recentHistory?.filter((sale: any) => sale.hq) ?? [];
  const nqSales = market.recentHistory?.filter((sale: any) => !sale.hq) ?? [];

  const hqListingsAveragePpu =
    Math.ceil(
      hqListings
        .map((listing: any) => listing.pricePerUnit)
        .reduce((agg: any, next: any) => agg + next, 0) / hqListings.length
    ) || 0;
  const nqListingsAveragePpu =
    Math.ceil(
      nqListings
        .map((listing: any) => listing.pricePerUnit)
        .reduce((agg: any, next: any) => agg + next, 0) / nqListings.length
    ) || 0;
  const hqListingsAverageTotal =
    Math.ceil(
      hqListings
        .map((listing: any) => listing.total)
        .reduce((agg: any, next: any) => agg + next, 0) / hqListings.length
    ) || 0;
  const nqListingsAverageTotal =
    Math.ceil(
      nqListings
        .map((listing: any) => listing.total)
        .reduce((agg: any, next: any) => agg + next, 0) / nqListings.length
    ) || 0;
  const hqSalesAveragePpu =
    Math.ceil(
      hqSales.map((sale: any) => sale.pricePerUnit).reduce((agg: any, next: any) => agg + next, 0) /
        hqSales.length
    ) || 0;
  const nqSalesAveragePpu =
    Math.ceil(
      nqSales.map((sale: any) => sale.pricePerUnit).reduce((agg: any, next: any) => agg + next, 0) /
        nqSales.length
    ) || 0;
  const hqSalesAverageTotal =
    Math.ceil(
      hqSales.map((sale: any) => sale.total).reduce((agg: any, next: any) => agg + next, 0) /
        hqSales.length
    ) || 0;
  const nqSalesAverageTotal =
    Math.ceil(
      nqSales.map((sale: any) => sale.total).reduce((agg: any, next: any) => agg + next, 0) /
        nqSales.length
    ) || 0;

  return (
    <>
      <div className="cross_world_markets">
        <MarketCheapest item={item} listings={hqListings} quality="HQ" />
        <MarketCheapest item={item} listings={nqListings} quality="NQ" />
      </div>
      <br />
      <br />
      <div className="cross_world_markets">
        <div>
          {item.canBeHq && (
            <>
              <h6>
                <Image src="/i/game/hq.png" alt="High Quality" height={15} width={15} />{' '}
                {sprintf(t`%s Prices`, 'HQ')}
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
          <h6>{sprintf(t`%s Prices`, 'NQ')}</h6>
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
            start={0}
            end={entriesToShow(nqSales)}
          />
        </div>
      </div>
      <br />
      <br />
      <h6>
        <Trans>Cross-World Purchase history (500 sales)</Trans>
      </h6>
      {open && <MarketHistoryGraph server={dc.name} itemId={item.id} />}
      {item.stackSize > 1 && (
        <div>
          <h6>
            <Trans>STACK SIZE HISTOGRAM</Trans>
          </h6>
          {open && <MarketStackSizeHistogram item={item} data={market.recentHistory} />}
        </div>
      )}
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

export interface DynamicMarketDataCenterProps extends Omit<MarketDataCenterProps, 'market'> {}

MarketDataCenter.Dynamic = function DynamicMarketDataCenter(props: DynamicMarketDataCenterProps) {
  const { data: market } = useDataCenterMarket(props.dc.name, props.item.id);
  if (!market) {
    return <MarketWorld.Skeleton />;
  }

  return <MarketDataCenter {...props} market={market} />;
};
