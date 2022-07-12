import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { sprintf } from 'sprintf-js';
import { Item } from '../../../types/game/Item';
import { Language } from '../../../types/universalis/lang';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import ListingsTable from '../../ListingsTable/ListingsTable';
import SalesTable from '../../SalesTable/SalesTable';

interface ListItemMarketProps {
  item?: Item;
  market: any;
  showHomeWorld: boolean;
  lang: Language;
}

export default function ListItemMarket({ item, market, showHomeWorld, lang }: ListItemMarketProps) {
  if (item == null) {
    return <div />;
  }

  const marketFailed = t`Market info could not be fetched for: %s at this time.`;
  if (market == null) {
    return <div className="alert-light">{sprintf(marketFailed, item.name)}</div>;
  }

  let relativeTime: RelativeTime;
  try {
    relativeTime = new RelativeTime({ locale: lang });
  } catch (err) {
    console.error(err);
    relativeTime = new RelativeTime({ locale: 'en' });
  }

  return (
    <div className="flex">
      <div className="flex_50 pl_mt_p">
        <div className="pl-mt">
          <h3>
            <Trans>Top 5 cheapest</Trans>
          </h3>
          <div>
            <ErrorBoundary>
              <ListingsTable
                listings={market.listings}
                averageHq={market.currentAveragePriceHQ}
                averageNq={market.currentAveragePriceNQ}
                crossWorld={!showHomeWorld}
                includeDiff={false}
                lang={lang}
                start={0}
                end={5}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <div className="flex_50 pl_mt_h">
        <div className="pl-mt">
          <h3>
            <Trans>Last 5 sales</Trans>
          </h3>
          <div>
            <ErrorBoundary>
              <SalesTable
                sales={market.recentHistory}
                averageHq={market.averagePriceHQ}
                averageNq={market.averagePriceNQ}
                crossWorld={!showHomeWorld}
                includeDiff={false}
                lang={lang}
                start={0}
                end={5}
              />
            </ErrorBoundary>
          </div>
          <small>
            <Trans>Last updated:</Trans> {relativeTime.from(new Date(market.lastUploadTime))}
          </small>
        </div>
      </div>
    </div>
  );
}
