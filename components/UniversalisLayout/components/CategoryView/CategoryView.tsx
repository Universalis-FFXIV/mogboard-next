import Image from 'next/image';
import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import { getClassJobCategory } from '../../../../data/game';
import useClickOutside from '../../../../hooks/useClickOutside';
import useSettings from '../../../../hooks/useSettings';
import { Item } from '../../../../types/game/Item';
import GameIcon from '../../../GameIcon/GameIcon';

interface CategoryViewProps {
  isOpen: boolean;
  closeView: () => void;
  items: Item[];
}

export default function CategoryView({ isOpen, closeView, items }: CategoryViewProps) {
  const viewRef = useClickOutside<HTMLDivElement>(null, closeView);

  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

  if (!isOpen) {
    return (
      <div className="market-category-view">
        <div className="item-category-list2" id="item-category-list2"></div>
      </div>
    );
  }

  return (
    <div ref={viewRef} className="market-category-view open">
      <SimpleBar className="item-category-list2" id="item-category-list2">
        <div className="gap" />
        {items
          .sort((a, b) => b.levelItem - a.levelItem)
          .map((item) => {
            const classJobCategory = getClassJobCategory(item.classJobCategory, lang);
            return (
              <Link key={item.id} href={`/market/${item.id}`}>
                <a className={`rarity-${item.rarity}`} onClick={closeView}>
                  <span>
                    <GameIcon id={item.iconId} ext="png" size="1x" width={32} height={32} />
                  </span>
                  <span>
                    <div>
                      <span className="item-level">{item.levelItem}</span> {item.name}
                    </div>
                    <small>{classJobCategory?.name}</small>
                  </span>
                </a>
              </Link>
            );
          })}
        <div className="gap" />
        <div className="gap" />
      </SimpleBar>
    </div>
  );
}
