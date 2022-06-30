import { Trans } from '@lingui/macro';
import { useEffect, useState } from 'react';
import { filterItemSearchCategories } from '../../../../data/game/isc';
import { getSearchIcon } from '../../../../data/game/xiv-font';
import useClickOutside from '../../../../hooks/useClickOutside';
import useSettings from '../../../../hooks/useSettings';
import { CategoryItem } from '../../../../types/game/CategoryItem';
import { ItemSearchCategory } from '../../../../types/game/ItemSearchCategory';
import { XIVAPIItemSearchCategoryIndex } from '../../../../types/xivapi/XIVAPIItemSearchCategoryIndex';
import Tooltip from '../../../Tooltip/Tooltip';

interface SearchCategoryButtonProps {
  category: ItemSearchCategory;
  categoryItems: CategoryItem[];
  onCategoryOpen: (category: ItemSearchCategory, categoryItems: CategoryItem[]) => void;
}

interface SearchCategoriesProps {
  isOpen: boolean;
  closeBox: () => void;
  onCategoryOpen: (category: ItemSearchCategory, categoryItems: CategoryItem[]) => void;
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

  const [isc, setIsc] = useState<ItemSearchCategory[]>([]);
  useEffect(() => {
    fetch(`https://xivapi.com/ItemSearchCategory?columns=ID,Name,Category,Order&language=${lang}`)
      .then((res) => res.json())
      .then((isc: XIVAPIItemSearchCategoryIndex) =>
        setIsc(
          isc.Results.map((r) => ({
            id: r.ID,
            name: r.Name,
            category: r.Category,
            order: r.Order,
          }))
        )
      )
      .catch(console.error);
  }, [lang]);

  const [categoryItems, setCategoryItems] = useState<
    Record<number, [string, string, string, string, string, string][]>
  >({});
  useEffect(() => {
    fetch(`/data/categories_${lang}.js`)
      .then((res) => res.json())
      .then(setCategoryItems)
      .catch(console.error);
  }, [lang]);

  const parseItem = (item: [string, string, string, string, string, string]): CategoryItem => {
    return {
      id: parseInt(item[0]),
      name: item[1],
      icon: `https://xivapi.com${item[2]}`,
      levelItem: parseInt(item[3]),
      rarity: parseInt(item[4]),
      classJobs: item[5],
    };
  };

  if (!isc || !categoryItems) {
    return (
      <div ref={boxRef} className={`market-board-container ${isOpen ? 'open' : ''}`}>
        <div className="market-board"></div>
      </div>
    );
  }

  const weapons = filterItemSearchCategories(isc, 1);
  const armor = filterItemSearchCategories(isc, 2);
  const items = filterItemSearchCategories(isc, 3);
  const housing = filterItemSearchCategories(isc, 4);

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
                categoryItems={categoryItems[cat.id].map<CategoryItem>(parseItem)}
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
                categoryItems={categoryItems[cat.id].map<CategoryItem>(parseItem)}
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
                categoryItems={categoryItems[cat.id].map<CategoryItem>(parseItem)}
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
                categoryItems={categoryItems[cat.id].map<CategoryItem>(parseItem)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
