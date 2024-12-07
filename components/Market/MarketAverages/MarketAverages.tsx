import { Trans } from '@lingui/macro';
import Image from 'next/image';
import { Item } from '../../../types/game/Item';

interface MarketAveragesProps {
  item: Item;
  averagePpuHq: number;
  averagePpuNq: number;
  averageTotalHq: number;
  averageTotalNq: number;
}

export default function MarketAverages({
  item,
  averagePpuHq,
  averagePpuNq,
  averageTotalHq,
  averageTotalNq,
}: MarketAveragesProps) {
  return (
    <div className="flex census_box">
      <div>
        <h5>
          <Trans>Avg. Per Unit</Trans>
        </h5>
        <br />
        <div className="flex avg_prices">
          {item.canBeHq && (
            <div className="flex_50 price-hq">
              <Image src="/i/game/hq.png" alt="High Quality" height={16} width={16} />{' '}
              {averagePpuHq.toLocaleString()}
            </div>
          )}
          <div className={item.canBeHq ? 'flex_50' : 'flex_100'}>
            {averagePpuNq.toLocaleString()}
          </div>
        </div>
      </div>
      <div>
        {/* TODO: Why is this useful? Maybe it should just be removed. */}
        <h5>
          <Trans>Avg. Total</Trans>
        </h5>
        <br />
        <div className="flex avg_prices">
          {item.canBeHq && (
            <div className="flex_50 price-hq">
              <Image src="/i/game/hq.png" alt="High Quality" height={16} width={16} />{' '}
              {averageTotalHq.toLocaleString()}
            </div>
          )}
          <div className={item.canBeHq ? 'flex_50' : 'flex_100'}>
            {averageTotalNq.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
