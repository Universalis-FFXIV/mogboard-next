import Image from 'next/image';

interface GameItemIconProps {
  id: number;
}

const GameItemIcon = ({ id }: GameItemIconProps) => {
  const url = `https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`;
  return <Image src={url} alt="" />;
};

export default GameItemIcon;
