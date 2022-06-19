import { City } from '../../types/game/City';
import GameIcon from '../GameIcon/GameIcon';

const icons = {
  [City.LimsaLominsa]: {
    bin: '060000',
    id: '060881',
  },
  [City.Gridania]: {
    bin: '060000',
    id: '060882',
  },
  [City.Uldah]: {
    bin: '060000',
    id: '060883',
  },
  [City.Ishgard]: {
    bin: '060000',
    id: '060884',
  },
  [City.Kugane]: {
    bin: '060000',
    id: '060885',
  },
  [City.Crystarium]: {
    bin: '060000',
    id: '060886',
  },
  [City.OldSharlayan]: {
    bin: '060000',
    id: '060887',
  },
};

interface GameCityIconProps {
  city: City;
  width: number;
  height: number;
  className?: string;
}

const GameCityIcon = ({ city, width, height, className }: GameCityIconProps) => {
  return (
    <GameIcon
      ext="png"
      size="1x"
      width={width}
      height={height}
      className={className}
      {...icons[city]}
    />
  );
};

export default GameCityIcon;
