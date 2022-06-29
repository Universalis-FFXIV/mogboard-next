import { useEffect, useState } from 'react';

interface GameItemIconProps {
  id: number;
  width: number;
  height: number;
}

export default function GameItemIcon({ id, width, height }: GameItemIconProps) {
  const [url, setUrl] = useState('');

  // For some reason, changing market item pages doesn't trigger a rerender of this component,
  // so this needs to be in a useEffect hook with a dependency array to force a proper update.
  useEffect(
    () => setUrl(`https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`),
    [id]
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
