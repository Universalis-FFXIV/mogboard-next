import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import useClickOutside from '../../hooks/useClickOutside';
import { CategoryItem } from '../../types/game/CategoryItem';
import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';

interface SearchCategoryResultsProps {
  items: CategoryItem[];
  category?: ItemSearchCategory;
  isOpen: boolean;
  closeResults: () => void;
}

export default function SearchCategoryResults({
  items,
  category,
  isOpen,
  closeResults,
}: SearchCategoryResultsProps) {
  const resultsRef = useClickOutside<HTMLDivElement>(null, closeResults);
  const searchHeight = 695;

  return (
    <div ref={resultsRef} className={`market-category-container ${isOpen ? 'open' : ''}`}>
      <div className="market-category">
        <div className="item-category-header">
          <div>
            {category?.name} - {items.length} items
          </div>
          <div>&nbsp;</div>
        </div>
        <SimpleBar style={{ height: searchHeight }}>
          <div className="gap" />
          {items.map((item) => (
            <Link key={item.id} href={`/market/${item.id}`}>
              <a className={`rarity-${item.rarity}`}>
                <span>
                  <img src={item.icon} alt="" />
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
    </div>
  );
}
