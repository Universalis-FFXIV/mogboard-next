import Image from 'next/image';
import { useState } from 'react';

interface GameItemIconProps {
  id: number;
  width: number;
  height: number;
  className?: string;
}

export default function GameItemIcon({ id, width, height, className }: GameItemIconProps) {
  const [url, setUrl] = useState(
    `https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`
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
        className={className}
      />
    </div>
  );
}
