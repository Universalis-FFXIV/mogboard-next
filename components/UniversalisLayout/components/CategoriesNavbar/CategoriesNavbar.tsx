import { t } from '@lingui/macro';
import { useState, useEffect } from 'react';
import useSWRImmutable from 'swr';
import { filterItemSearchCategories } from '../../../../data/game/isc';
import { getRepositoryUrl } from '../../../../data/game/repository';
import { getSearchIcon } from '../../../../data/game/xiv-font';
import useSettings from '../../../../hooks/useSettings';
import { CategoryItem } from '../../../../types/game/CategoryItem';
import { ItemSearchCategory } from '../../../../types/game/ItemSearchCategory';
import { XIVAPIItemSearchCategoryIndex } from '../../../../types/xivapi/XIVAPIItemSearchCategoryIndex';

interface NavCategoryProps {
  type: string;
  onOpen: (categoryItems: CategoryItem[]) => void;
  category: ItemSearchCategory;
  categoryItems: [string, string, string, string, string, string][];
  divider?: boolean;
}

interface NavCategoryGroupProps {
  sectionName: string;
  type: string;
  onCategoryOpen: (categoryItems: CategoryItem[]) => void;
  categories: ItemSearchCategory[];
  categoryItems: Record<number, [string, string, string, string, string, string][]>;
  breakCategories?: number[];
}

interface CategoriesNavbarProps {
  onCategoryOpen: (categoryItems: CategoryItem[]) => void;
}

function NavCategory({ type, onOpen, category, categoryItems, divider }: NavCategoryProps) {
  return (
    <>
      {divider && <hr />}
      <button
        id={category.id.toString()}
        className={`type-${type}`}
        onClick={() => {
          onOpen(
            categoryItems.map<CategoryItem>((item) => ({
              id: parseInt(item[0]),
              name: item[1],
              icon: `https://xivapi.com${item[2]}`,
              levelItem: parseInt(item[3]),
              rarity: parseInt(item[4]),
              classJobs: item[5],
            }))
          );
        }}
      >
        <i className={`xiv-${getSearchIcon(category.id)}`} />
        <span>{category.name}</span>
      </button>
    </>
  );
}

function NavCategoryGroup({
  sectionName,
  type,
  onCategoryOpen,
  categories,
  categoryItems,
  breakCategories,
}: NavCategoryGroupProps) {
  return (
    <div className="nav-box">
      <div className="nav-heading" style={{ textTransform: 'uppercase' }}>
        {sectionName}
      </div>
      <div>
        {categories.map((cat) => (
          <NavCategory
            key={cat.id}
            type={type}
            onOpen={onCategoryOpen}
            category={cat}
            categoryItems={categoryItems[cat.id] ?? []}
            divider={breakCategories?.includes(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function CategoriesNavbar({ onCategoryOpen }: CategoriesNavbarProps) {
  const [settings] = useSettings();
  const lang: string = settings['mogboard_language'] ?? 'en';

  const [categoriesIndex, setCategoriesIndex] = useState<ItemSearchCategory[]>([]);
  useEffect(() => {
    (async () => {
      const baseUrl = getRepositoryUrl(lang);
      const isc: XIVAPIItemSearchCategoryIndex = await fetch(
        `${baseUrl}/ItemSearchCategory?columns=ID,Name,Category,Order&language=${lang}`
      ).then((res) => res.json());
      setCategoriesIndex(
        isc.Results.map((r) => ({
          id: r.ID,
          name: r.Name,
          category: r.Category,
          order: r.Order,
        }))
      );
    })();
  }, [lang]);

  const categoryItems = useSWRImmutable(`/data/categories_${lang}.js`, async (path) => {
    const categories: Record<number, [string, string, string, string, string, string][]> =
      await fetch(path).then((res) => res.json());
    return categories;
  });

  if (categoryItems.error) {
    console.error(categoryItems.error);
    return <div />;
  }

  const catItemsData = categoryItems.data ?? {};

  const weapons = filterItemSearchCategories(categoriesIndex, 1);
  const armor = filterItemSearchCategories(categoriesIndex, 2);
  const items = filterItemSearchCategories(categoriesIndex, 3);
  const housing = filterItemSearchCategories(categoriesIndex, 4);

  return (
    <div>
      <NavCategoryGroup
        sectionName={t`WEAPONS`}
        type="weapons"
        onCategoryOpen={onCategoryOpen}
        categories={weapons}
        categoryItems={catItemsData}
        breakCategories={[14, 19, 27]}
      />
      <NavCategoryGroup
        sectionName={t`ARMOR`}
        type="armor"
        onCategoryOpen={onCategoryOpen}
        categories={armor}
        categoryItems={catItemsData}
      />
      <NavCategoryGroup
        sectionName={t`ITEMS`}
        type="items"
        onCategoryOpen={onCategoryOpen}
        categories={items}
        categoryItems={catItemsData}
      />
      <NavCategoryGroup
        sectionName={t`HOUSING`}
        type="housing"
        onCategoryOpen={onCategoryOpen}
        categories={housing}
        categoryItems={catItemsData}
      />
      <div className="nav-gap" />
    </div>
  );
}
