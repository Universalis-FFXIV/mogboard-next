import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import SimpleBar from 'simplebar-react';
import { CategoryItem } from '../../types/game/CategoryItem';

interface CategoryViewProps {
  isOpen: boolean;
  closeView: () => void;
  items: CategoryItem[];
}

export default function CategoryView({ isOpen, closeView, items }: CategoryViewProps) {
  // https://stackoverflow.com/a/42234988/14226597
  const viewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (e.target != null && viewRef.current && !viewRef.current.contains(e.target)) {
        closeView();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

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
