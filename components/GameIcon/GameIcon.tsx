type GameIconSize = '1x' | '2x';
type GameIconExt = 'png';

interface GameIconProps {
  bin: string;
  id: string;
  ext: GameIconExt;
  size: GameIconSize;
  width: number;
  height: number;
  className?: string;
}

const getIconUrl = (bin: string, id: string, ext: GameIconExt, size: GameIconSize) => {
  switch (size) {
    case '1x':
      return `https://xivapi.com/i/${bin}/${id}.${ext}`;
    case '2x':
      return `https://xivapi.com/i2/ls2/${bin}/${id}.${ext}`;
  }
};

const GameIcon = ({ bin, id, ext, size, width, height, className }: GameIconProps) => {
  return (
    <img
      src={getIconUrl(bin, id, ext, size)}
      width={width}
      height={height}
      alt=""
      className={className}
    />
  );
};

export default GameIcon;
