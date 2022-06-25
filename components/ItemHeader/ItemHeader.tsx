import Link from 'next/link';
import { useItem } from '../ItemProvider/ItemProvider';

export default function ItemHeader() {
  const item = useItem();

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
