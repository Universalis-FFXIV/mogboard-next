import Link from 'next/link';
import { getClassJobCategory, getItemKind, getItemSearchCategory } from '../../../data/game';
import { Item } from '../../../types/game/Item';
import { Language } from '../../../types/universalis/lang';
import CopyTextButton from '../../CopyTextButton/CopyTextButton';

interface ListItemHeaderProps {
  item?: Item;
  lang: Language;
}

export default function ListItemHeader({ item, lang }: ListItemHeaderProps) {
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
      <CopyTextButton text={item.name} />
      {classJobCategory?.name && <span>{classJobCategory.name}</span>}
      <span>
        {itemKind?.name} - {itemSearchCategory?.name}
      </span>
    </>
  );
}
