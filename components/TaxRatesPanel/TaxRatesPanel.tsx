import { t } from '@lingui/macro';
import { sprintf } from 'sprintf-js';
import { City } from '../../types/game/City';
import GameCityIcon from '../GameCityIcon/GameCityIcon';

interface TaxRatesPanelProps {
  data: Record<City, number>;
  world: string;
}

const TaxRatesPanel = ({ data, world }: TaxRatesPanelProps) => {
  const header = sprintf(t`Current Market Tax Rates on %s`, world);
  return (
    <div className="flex updates_box" style={{ marginBottom: 20 }}>
      <div>
        <h5>{header}</h5>
        <br />
        <div className="flex avg_prices">
          {(Object.keys(City) as Array<keyof typeof City>)
            .filter((k) => isNaN(parseInt(k)))
            .map((k) => (
              <div key={k} className="flex_50">
                <div style={{ margin: '0 2px 0 0' }}>
                  <GameCityIcon city={City[k]} width={28} height={28} className="price-city-flag" />
                </div>
                {data[City[k]]}%
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TaxRatesPanel;
