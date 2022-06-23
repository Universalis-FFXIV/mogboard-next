import useSWRImmutable from 'swr/immutable';
import { filterItemSearchCategories } from '../../../../data/game/isc';
import { getSearchIcon } from '../../../../data/game/xiv-font';
import useClickOutside from '../../../../hooks/useClickOutside';
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

  const isc = useSWRImmutable<ItemSearchCategory[]>(
    'https://xivapi.com/ItemSearchCategory?columns=ID,Name,Category,Order',
    async (path) => {
      const isc: XIVAPIItemSearchCategoryIndex = await fetch(path).then((res) => res.json());
      return isc.Results.map((r) => ({
        id: r.ID,
        name: r.Name,
        category: r.Category,
        order: r.Order,
      }));
    }
  );

  const catItems = useSWRImmutable('/data/categories_en.js', async (path) => {
    const categories: Record<number, [string, string, string, string, string, string][]> =
      await fetch(path).then((res) => res.json());
    return categories;
  });

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

  if (catItems.error) {
    console.error(catItems.error);
  }

  if (isc.error) {
    console.error(isc.error);
  }

  if (!isc.data || !catItems.data) {
    return (
      <div ref={boxRef} className={`market-board-container ${isOpen ? 'open' : ''}`}>
        <div className="market-board"></div>
      </div>
    );
  }

  const iscData = isc.data;
  const catItemsData = catItems.data;

  const weapons = filterItemSearchCategories(iscData, 1);
  const armor = filterItemSearchCategories(iscData, 2);
  const items = filterItemSearchCategories(iscData, 3);
  const housing = filterItemSearchCategories(iscData, 4);

  return (
    <div ref={boxRef} className={`market-board-container ${isOpen ? 'open' : ''}`}>
      <div className="market-board">
        <div className="categories">
          <h2>WEAPONS</h2>
          <div className="categories-list">
            {weapons.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={catItemsData[cat.id].map<CategoryItem>(parseItem)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
        <div className="categories">
          <h2>ARMOR</h2>
          <div className="categories-list">
            {armor.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={catItemsData[cat.id].map<CategoryItem>(parseItem)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
        <div className="categories">
          <h2>ITEMS</h2>
          <div className="categories-list">
            {items.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={catItemsData[cat.id].map<CategoryItem>(parseItem)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
        <div className="categories">
          <h2>HOUSING</h2>
          <div className="categories-list">
            {housing.map((cat) => (
              <SearchCategoryButton
                key={cat.id}
                category={cat}
                categoryItems={catItemsData[cat.id].map<CategoryItem>(parseItem)}
                onCategoryOpen={onCategoryOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
