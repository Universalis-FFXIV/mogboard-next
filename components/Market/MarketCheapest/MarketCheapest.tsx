import { t, Trans } from '@lingui/macro';
import { sprintf } from 'sprintf-js';
import { Item } from '../../../types/game/Item';

interface MarketCheapestProps {
  item: Item;
  listings: any[];
  quality: 'NQ' | 'HQ';
}

export default function MarketCheapest({ item, listings, quality }: MarketCheapestProps) {
  return (
    <div className="cheapest">
      <h2>{sprintf(t`Cheapest %s`, quality)}</h2>
      {(quality === 'NQ' || (quality === 'HQ' && item.canBeHq)) && (
        <>
          {listings.length > 0 && (
            <div className="cheapest_price">
              <i className="xiv-Gil"></i> <em>{listings[0].quantity.toLocaleString()} x</em>
              <span className="cheapest_value">
                &nbsp;
                {listings[0].pricePerUnit.toLocaleString()}
              </span>
              &nbsp;
              <span className="cheapest_price_info">
                <Trans>Server:</Trans> <strong>{listings[0].worldName}</strong> -&nbsp;
                <Trans>Total:</Trans> <strong>{listings[0].total.toLocaleString()}</strong>
              </span>
            </div>
          )}
          {listings.length === 0 && sprintf(t`No %s for sale.`, quality)}
        </>
      )}
      {quality === 'HQ' && !item.canBeHq && t`Item has no HQ variant.`}
    </div>
  );
}
