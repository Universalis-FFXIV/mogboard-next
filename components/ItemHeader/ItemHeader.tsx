import Link from 'next/link';
import { Item } from '../../types/game/Item';

interface ItemHeaderProps {
  item?: Item;
}

export default function ItemHeader({ item }: ItemHeaderProps) {
  if (item == null) {
    return <></>;
  }

  return (
    <>
      {item.levelItem > 1 && <em className="ilv">{item.levelItem}</em>}
      <Link href={`/market/${item.id}`}>
        <a className={`rarity-${item.rarity}`}>{item.name}</a>
      </Link>
      {item.classJobCategory?.name && <span>{item.classJobCategory.name}</span>}
      <span>
        {item.itemKind} - {item.itemSearchCategory.name}
      </span>
    </>
  );
}
