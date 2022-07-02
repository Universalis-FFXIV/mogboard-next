import { Trans } from '@lingui/macro';
import Image from 'next/image';
import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import { getClassJobCategory } from '../../../../data/game';
import useClickOutside from '../../../../hooks/useClickOutside';
import useSettings from '../../../../hooks/useSettings';
import { Item } from '../../../../types/game/Item';
import { ItemSearchCategory } from '../../../../types/game/ItemSearchCategory';
import GameIcon from '../../../GameIcon/GameIcon';

interface SearchCategoryResultsProps {
  items: Item[];
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
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

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
          {items
            .sort((a, b) => b.levelItem - a.levelItem)
            .map((item) => {
              const classJobCategory = getClassJobCategory(item.classJobCategory, lang);
              return (
                <Link key={item.id} href={`/market/${item.id}`}>
                  <a className={`rarity-${item.rarity}`}>
                    <span>
                      <GameIcon id={item.iconId} ext="png" size="1x" width={40} height={40} />
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
    </div>
  );
}
