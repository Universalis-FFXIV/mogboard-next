import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { Suspense } from 'react';
import { Item } from '../../../types/game/Item';
import { World } from '../../../types/game/World';
import { Language } from '../../../types/universalis/lang';
import ListingsTable from '../../ListingsTable/ListingsTable';
import SalesTable from '../../SalesTable/SalesTable';
import MarketHistoryGraph from '../MarketHistoryGraph/MarketHistoryGraph';
import MarketStackSizeHistogram from '../MarketStackSizeHistogram/MarketStackSizeHistogram';
import NoMarketData from '../NoMarketData/NoMarketData';

interface MarketWorldProps {
  item: Item;
  world: World;
  market: any;
  lang: Language;
}

function entriesToShow(entries: {}[]) {
  return Math.max(Math.floor(entries.length * 0.1), 10);
}

export default function MarketWorld({ item, world, market, lang }: MarketWorldProps) {
  let relativeTime: RelativeTime;
  try {
    relativeTime = new RelativeTime({ locale: lang });
  } catch (err) {
    console.error(err);
    return <></>;
  }

  if (market == null) {
    return <></>;
  }

  if (!market.lastUploadTime) {
    return <NoMarketData worldName={world.name} />;
  }

  return (
    <>
      <MarketHistoryGraph server={world.name} itemId={item.id} />
      {item.stackSize > 1 && market.stackSizeHistogram && (
        <div>
          <h4
            dangerouslySetInnerHTML={{
              __html: t`STACK SIZE HISTOGRAM <small>Last 20 Sales</small>`,
            }}
          ></h4>
          <MarketStackSizeHistogram item={item} data={market.recentHistory} />
        </div>
      )}
      <div className="tab-market-tables">
        <div className="cw-table cw-prices">
          <h4>
            <Trans>PRICES</Trans>{' '}
            <small>
              <Suspense>
                <Trans>Updated:</Trans> {relativeTime.from(new Date(market.lastUploadTime))}{' '}
                {t`(Includes 5% GST)`}
              </Suspense>
            </small>
          </h4>
          <ListingsTable
            listings={market.listings}
            averageHq={market.currentAveragePriceHQ}
            averageNq={market.currentAveragePriceNQ}
            crossWorld={false}
            includeDiff={true}
            lang={lang}
            start={0}
            end={entriesToShow(market.listings)}
          />
        </div>
        <div className="cw-table cw-history">
          <h4>
            <Trans>HISTORY</Trans>
          </h4>
          <SalesTable
            sales={market.recentHistory}
            averageHq={market.averagePriceHQ}
            averageNq={market.averagePriceNQ}
            crossWorld={false}
            includeDiff={true}
            lang={lang}
            start={0}
            end={entriesToShow(market.listings)}
          />
        </div>
      </div>
    </>
  );
}
