import { Trans } from '@lingui/macro';
import Image from 'next/image';
import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import useClickOutside from '../../../../hooks/useClickOutside';
import { CategoryItem } from '../../../../types/game/CategoryItem';
import { ItemSearchCategory } from '../../../../types/game/ItemSearchCategory';

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
  return (
    <div ref={resultsRef} className={`market-category-container ${isOpen ? 'open' : ''}`}>
      <div className="market-category">
        <div className="item-category-header">
          <div>
            <Trans>
              {category?.name} - {items.length} items
            </Trans>
          </div>
          <div>&nbsp;</div>
        </div>
        <SimpleBar style={{ height: '73vh' }}>
          <div className="gap" />
          {items.map((item) => (
            <Link key={item.id} href={`/market/${item.id}`}>
              <a className={`rarity-${item.rarity}`}>
                <span>
                  <Image src={item.icon} alt="" width={40} height={40} />
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
