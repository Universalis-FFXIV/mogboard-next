import Link from 'next/link';
import { getClassJobCategory, getItemKind, getItemSearchCategory } from '../../data/game';
import useSettings from '../../hooks/useSettings';
import { Item } from '../../types/game/Item';

interface ItemHeaderProps {
  item?: Item;
}

export default function ItemHeader({ item }: ItemHeaderProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

  if (item == null) {
    return <></>;
  }

  const itemSearchCategory = getItemSearchCategory(item.itemSearchCategory, lang);
  const classJobCategory = getClassJobCategory(item.classJobCategory, lang);
  const itemKind = getItemKind(item.itemKind, lang);

  return (
    <>
      {item.levelItem > 1 && <em className="ilv">{item.levelItem}</em>}
      <Link href="/market/[itemId]" as={`/market/${item.id}`}>
        <a className={`rarity-${item.rarity}`}>{item.name}</a>
      </Link>
      {classJobCategory?.name && <span>{classJobCategory.name}</span>}
      <span>
        {itemKind?.name} - {itemSearchCategory?.name}
      </span>
    </>
  );
}
