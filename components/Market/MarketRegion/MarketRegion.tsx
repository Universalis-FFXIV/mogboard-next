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

interface MarketRegionProps {
  item: Item;
  region: string;
  dcs: DataCenter[];
  dcMarkets: Record<string, any>;
  lang: Language;
  open: boolean;
}

function entriesToShow(entries: {}[]) {
  return Math.max(Math.floor(entries.length * 0.1), 10);
}

export default function MarketRegion({
  item,
  region,
  dcs,
  dcMarkets,
  lang,
  open,
}: MarketRegionProps) {
  const allListings = dcs
    .filter((dc) => dcMarkets[dc.name] != null)
    .map((dc) => dcMarkets[dc.name].listings)
    .flat()
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit);
  const allSales = dcs
    .filter((dc) => dcMarkets[dc.name] != null)
    .map((dc) => dcMarkets[dc.name].recentHistory)
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp);

  const hqListings = allListings?.filter((listing: any) => listing.hq) ?? [];
  const nqListings = allListings?.filter((listing: any) => !listing.hq) ?? [];
  const hqSales = allSales?.filter((sale: any) => sale.hq) ?? [];
  const nqSales = allSales?.filter((sale: any) => !sale.hq) ?? [];

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
                {sprintf(t`%s Prices`, 'HQ')} {t`(Includes 5% GST)`}
              </h6>
              <ListingsTable
                listings={hqListings}
                averageHq={hqListingsAveragePpu}
                averageNq={nqListingsAveragePpu}
                crossWorld={true}
                crossDc={true}
                dcs={dcs}
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
            crossDc={true}
            dcs={dcs}
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
                crossDc={true}
                dcs={dcs}
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
            crossDc={true}
            dcs={dcs}
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
      {open && <MarketHistoryGraph server={region} itemId={item.id} entries={4800} />}
      {item.stackSize > 1 && (
        <div>
          <h6>
            <Trans>STACK SIZE HISTOGRAM</Trans>
          </h6>
          {open && <MarketStackSizeHistogram item={item} data={allSales} />}
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
