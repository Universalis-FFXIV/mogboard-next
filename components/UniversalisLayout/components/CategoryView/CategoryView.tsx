import Image from 'next/image';
import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import useClickOutside from '../../../../hooks/useClickOutside';
import { CategoryItem } from '../../../../types/game/CategoryItem';

interface CategoryViewProps {
  isOpen: boolean;
  closeView: () => void;
  items: CategoryItem[];
}

export default function CategoryView({ isOpen, closeView, items }: CategoryViewProps) {
  const viewRef = useClickOutside<HTMLDivElement>(null, closeView);

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
        {items.map((item) => (
          <Link key={item.id} href={`/market/${item.id}`}>
            <a className={`rarity-${item.rarity}`}>
              <span>
                <Image src={item.icon} alt="" width={32} height={32} />
              </span>
              <span>
                <div>
                  <span className="item-level">{item.levelItem}</span> {item.name}
                </div>
                <small>{item.classJobs}</small>
              </span>
            </a>
          </Link>
        ))}
        <div className="gap" />
        <div className="gap" />
      </SimpleBar>
    </div>
  );
}
