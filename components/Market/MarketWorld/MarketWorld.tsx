import { t, Trans } from '@lingui/macro';
import { Suspense } from 'react';
import ago from 's-ago';
import { Item } from '../../../types/game/Item';
import { World } from '../../../types/game/World';
import { Language } from '../../../types/universalis/lang';
import ListingsTable from '../../ListingsTable/ListingsTable';
import SalesTable from '../../SalesTable/SalesTable';
import MarketHistoryGraph from '../MarketHistoryGraph/MarketHistoryGraph';
import MarketStackSizeHistogram from '../MarketStackSizeHistogram/MarketStackSizeHistogram';
import NoMarketData from '../NoMarketData/NoMarketData';
import { useWorldMarket } from '../../../hooks/market';
import ContentLoader from 'react-content-loader';

interface MarketWorldProps {
  item: Item;
  world: World;
  market: any;
  lang: Language;
  open: boolean;
}

function entriesToShow(entries: {}[]) {
  return Math.max(Math.floor(entries.length * 0.1), 10);
}

export default function MarketWorld({ item, world, market, lang, open }: MarketWorldProps) {
  if (market == null) {
    return <></>;
  }

  if (!market.lastUploadTime) {
    return <NoMarketData worldName={world.name} />;
  }

  return (
    <>
      <div className="tab-market-tables">
        <div className="cw-table cw-prices">
          <h4>
            <Trans>PRICES</Trans>{' '}
            <small>
              <Suspense>
                <Trans>Updated:</Trans> {ago(new Date(market.lastUploadTime))}
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
            start={0}
            end={entriesToShow(market.listings)}
          />
        </div>
      </div>
      <br />
      <br />
      <h6>
        <Trans>Purchase history (500 sales)</Trans>
      </h6>
      {open && <MarketHistoryGraph server={world.name} itemId={item.id} />}
      {item.stackSize > 1 && market.stackSizeHistogram && (
        <div>
          <h4
            dangerouslySetInnerHTML={{
              __html: t`STACK SIZE HISTOGRAM <small>Last 20 Sales</small>`,
            }}
          ></h4>
          {open && <MarketStackSizeHistogram item={item} data={market.recentHistory} />}
        </div>
      )}
    </>
  );
}

MarketWorld.Skeleton = function SkeletonMarketWorld() {
  return (
    <div className="tab-market-tables">
      <div className="cw-table cw-prices">
        <h4>
          <Trans>PRICES</Trans>{' '}
          <small>
            <Suspense>
              <Trans>Updated:</Trans>
            </Suspense>
          </small>
        </h4>
        <ContentLoader
          uniqueKey="market-world-listings-table"
          width="100%"
          height="400"
          backgroundColor="#282b34"
          foregroundColor="#434856"
        >
          <rect rx="2" ry="2" width="100%" height="400" />
        </ContentLoader>
      </div>
      <div className="cw-table cw-history">
        <h4>
          <Trans>HISTORY</Trans>
        </h4>
        <ContentLoader
          uniqueKey="market-world-sales-table"
          width="100%"
          height="400"
          backgroundColor="#282b34"
          foregroundColor="#434856"
        >
          <rect rx="2" ry="2" width="100%" height="400" />
        </ContentLoader>
      </div>
    </div>
  );
};

export interface DynamicMarketWorldProps extends Omit<MarketWorldProps, 'market'> {}

MarketWorld.Dynamic = function DynamicMarketWorld(props: DynamicMarketWorldProps) {
  const { data: market } = useWorldMarket(props.world.id, props.item.id);
  if (!market) {
    return <MarketWorld.Skeleton />;
  }

  return <MarketWorld {...props} market={market} />;
};
