import { City } from '../../types/game/City';
import GameCityIcon from '../GameCityIcon/GameCityIcon';

interface TaxRatesPanelProps {
  data: Record<City, number>;
}

const TaxRatesPanel = ({ data }: TaxRatesPanelProps) => {
  return (
    <div className="flex updates_box" style={{ marginBottom: 20 }}>
      <div>
        <h5>Current Market Tax Rates on Phoenix</h5>
        <br />
        <div className="flex avg_prices">
          {(Object.keys(City) as Array<keyof typeof City>)
            .filter((k) => isNaN(parseInt(k)))
            .map((k) => (
              <div key={k} className="flex_50">
                <GameCityIcon city={City[k]} width={28} height={28} className="price-city-flag" />
                {data[City[k]]}%
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TaxRatesPanel;
