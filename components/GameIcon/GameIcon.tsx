import Image from 'next/image';

type GameIconSize = '1x' | '2x';
type GameIconExt = 'png';

interface GameIconProps {
  id: number;
  ext: GameIconExt;
  size: GameIconSize;
  width: number;
  height: number;
  className?: string;
}

const getIconUrl = (id: number, ext: GameIconExt, size: GameIconSize) => {
  const idPadded = id.toString().padStart(6, '0');
  const bin = idPadded.slice(0, 3) + '000';
  switch (size) {
    case '1x':
      return `https://xivapi.com/i/${bin}/${idPadded}.${ext}`;
    case '2x':
      return `https://xivapi.com/i2/ls2/${bin}/${idPadded}.${ext}`;
  }
};

export default function GameIcon({ id, ext, size, width, height, className }: GameIconProps) {
  return (
    <div className={className}>
      <Image
        src={getIconUrl(id, ext, size)}
        width={width}
        height={height}
        alt=""
        className={className}
      />
    </div>
  );
}
