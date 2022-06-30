import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { useState, useEffect } from 'react';
import { Item } from '../../../types/game/Item';
import ListingsTable from '../../ListingsTable/ListingsTable';
import SalesTable from '../../SalesTable/SalesTable';
import MarketHistoryGraph from '../MarketHistoryGraph/MarketHistoryGraph';
import MarketStackSizeHistogram from '../MarketStackSizeHistogram/MarketStackSizeHistogram';
import NoMarketData from '../NoMarketData/NoMarketData';

interface MarketWorldProps {
  item: Item;
  worldName: string;
}

function entriesToShow(entries: {}[]) {
  return Math.max(Math.floor(entries.length * 0.1), 10);
}

export default function MarketWorld({ item, worldName }: MarketWorldProps) {
  const [market, setMarket] = useState<any>(null);
  useEffect(() => {
    (async () => {
      setMarket(null);

      const market = await fetch(`https://universalis.app/api/v2/${worldName}/${item.id}`).then(
        (res) => res.json()
      );
      setMarket(market);
    })();
  }, [worldName, item.id]);

  const relativeTime = new RelativeTime();

  if (market == null) {
    return <></>;
  }

  if (!market.lastUploadTime) {
    return <NoMarketData worldName={worldName} />;
  }

  return (
    <>
      <MarketHistoryGraph server={worldName} itemId={item.id} />
      {item.stackSize && item.stackSize > 1 && market.stackSizeHistogram && (
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
              <Trans>Updated:</Trans> {relativeTime.from(new Date(market.lastUploadTime))}{' '}
              {t`(Includes 5% GST)`}
            </small>
          </h4>
          <ListingsTable
            listings={market.listings}
            averageHq={market.currentAveragePriceHQ}
            averageNq={market.currentAveragePriceNQ}
            crossWorld={false}
            includeDiff={true}
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
    </>
  );
}
