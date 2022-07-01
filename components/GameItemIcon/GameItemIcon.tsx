import { useState } from 'react';

interface GameItemIconProps {
  id: number;
  width: number;
  height: number;
}

export default function GameItemIcon({ id, width, height }: GameItemIconProps) {
  const [url, setUrl] = useState(
    `https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`
  );
  return (
    <img
      src={url}
      alt=""
      width={width}
      height={height}
      onError={() => {
        setUrl('/i/universalis/error.png');
      }}
    />
  );
}
