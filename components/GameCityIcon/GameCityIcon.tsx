import { City } from '../../types/game/City';
import GameIcon from '../GameIcon/GameIcon';

const icons = {
  [City.LimsaLominsa]: {
    id: 60881,
  },
  [City.Gridania]: {
    id: 60882,
  },
  [City.Uldah]: {
    id: 60883,
  },
  [City.Ishgard]: {
    id: 60884,
  },
  [City.Kugane]: {
    id: 60885,
  },
  [City.Crystarium]: {
    id: 60886,
  },
  [City.OldSharlayan]: {
    id: 60887,
  },
  [City.Tuliyollal]: {
    id: 60888,
  },
};

interface GameCityIconProps {
  city: City;
  width: number;
  height: number;
  className?: string;
}

const GameCityIcon = ({ city, width, height, className }: GameCityIconProps) => {
  const cityIconInfo = icons[city];
  if (cityIconInfo) {
    return (
      <GameIcon
        ext="png"
        size="1x"
        width={width}
        height={height}
        className={className}
        {...cityIconInfo}
      />
    );
  } else {
    return <div className={className} />;
  }
};

export default GameCityIcon;
