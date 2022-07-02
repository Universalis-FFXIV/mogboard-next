import Image, { ImageLoader } from 'next/image';
import { useEffect, useState } from 'react';

interface GameItemIconProps {
  id: number;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export default function GameItemIcon({
  id,
  width,
  height,
  className,
  priority,
}: GameItemIconProps) {
  const [url, setUrl] = useState(
    `https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`
  );
  useEffect(
    () => setUrl(`https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`),
    [id]
  );
  return (
    <div className={className}>
      <Image
        src={url}
        alt=""
        width={width}
        height={height}
        onError={() => {
          setUrl('/i/universalis/error.png');
        }}
        priority={priority}
        className={className}
      />
    </div>
  );
}
