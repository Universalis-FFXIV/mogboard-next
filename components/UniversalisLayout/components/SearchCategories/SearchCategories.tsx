import { Trans } from '@lingui/macro';
import { useEffect, useState } from 'react';
import { getItems, getItemSearchCategories } from '../../../../data/game';
import { filterItemSearchCategories } from '../../../../service/isc';
import { getSearchIcon } from '../../../../theme/xiv-font';
import useClickOutside from '../../../../hooks/useClickOutside';
import useSettings from '../../../../hooks/useSettings';
import { Item } from '../../../../types/game/Item';
import { ItemSearchCategory } from '../../../../types/game/ItemSearchCategory';
import { XIVAPIItemSearchCategoryIndex } from '../../../../types/xivapi/XIVAPIItemSearchCategoryIndex';
import Tooltip from '../../../Tooltip/Tooltip';

interface SearchCategoryButtonProps {
  category: ItemSearchCategory;
  categoryItems: Item[];
  onCategoryOpen: (category: ItemSearchCategory, categoryItems: Item[]) => void;
}

interface SearchCategoriesProps {
  isOpen: boolean;
  closeBox: () => void;
  onCategoryOpen: (category: ItemSearchCategory, categoryItems: Item[]) => void;
}

function SearchCategoryButton({
  category,
  categoryItems,
  onCategoryOpen,
}: SearchCategoryButtonProps) {
  return (
    <Tooltip label={category.name}>
      <button id={category.id.toString()} onClick={() => onCategoryOpen(category, categoryItems)}>
        <span className={`xiv-${getSearchIcon(category.id)}`}></span>
      </button>
    </Tooltip>
  );
}

export default function SearchCategories({
  isOpen,
  closeBox,
  onCategoryOpen,
}: SearchCategoriesProps) {
  const boxRef = useClickOutside<HTMLDivElement>(null, closeBox);
  const [settings] = useSettings();

  const lang = settings['mogboard_language'] ?? 'en';
  const categories = getItemSearchCategories(lang);
  const categoryItems = getItems(lang).filter((item) => item.itemSearchCategory > 0);

  const weapons = filterItemSearchCategories(categories, 1);
  const armor = filterItemSearchCategories(categories, 2);
  const items = filterItemSearchCategories(categories, 3);
  const housing = filterItemSearchCategories(categories, 4);

  return (
    <div ref={boxRef} className={`market-board-container ${isOpen ? 'open' : ''}`}>
      <div className="market-board">
        <div className="categories">
          <h2>
            <Trans>WEAPONS</Trans>
          </h2>
          <div className="categories-list">
            {weapons.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={categoryItems.filter((item) => item.itemSearchCategory === cat.id)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
        <div className="categories">
          <h2 style={{ textTransform: 'uppercase' }}>
            <Trans>ARMOR</Trans>
          </h2>
          <div className="categories-list">
            {armor.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={categoryItems.filter((item) => item.itemSearchCategory === cat.id)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
        <div className="categories">
          <h2 style={{ textTransform: 'uppercase' }}>
            <Trans>ITEMS</Trans>
          </h2>
          <div className="categories-list">
            {items.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={categoryItems.filter((item) => item.itemSearchCategory === cat.id)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
        <div className="categories">
          <h2 style={{ textTransform: 'uppercase' }}>
            <Trans>HOUSING</Trans>
          </h2>
          <div className="categories-list">
            {housing.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={categoryItems.filter((item) => item.itemSearchCategory === cat.id)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
