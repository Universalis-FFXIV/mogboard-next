import useSWR from 'swr';
import { getSearchIcon } from '../../data/game/xiv-font';
import { CategoryItem } from '../../types/game/CategoryItem';

interface ItemSearchCategory {
  id: number;
  name: string;
  category: number;
  order: number;
}

interface XIVAPIItemSearchCategoryIndex {
  Results: {
    ID: number;
    Name: string;
    Category: number;
    Order: number;
  }[];
}

interface NavCategoryProps {
  type: string;
  onOpen: (categoryItems: CategoryItem[]) => void;
  category: ItemSearchCategory;
  divider?: boolean;
}

interface NavCategoryGroupProps {
  sectionName: string;
  type: string;
  onCategoryOpen: (categoryItems: CategoryItem[]) => void;
  categories: ItemSearchCategory[];
  breakCategories?: number[];
}

interface CategoriesNavbarProps {
  onCategoryOpen: (categoryItems: CategoryItem[]) => void;
}

function NavCategory({ type, onOpen, category, divider }: NavCategoryProps) {
  const { data, error } = useSWR('/data/categories_en.js', async (path) => {
    const categories: Record<number, [string, string, string, string, string, string][]> =
      await fetch(path).then((res) => res.json());
    return categories;
  });

  if (error) {
    console.error(error);
  }

  return (
    <>
      {divider && <hr />}
      <button
        id={category.id.toString()}
        className={`type-${type}`}
        onClick={() => {
          console.log(data);
          if (data != null) {
            onOpen(
              data[category.id].map<CategoryItem>((item) => ({
                id: parseInt(item[0]),
                name: item[1],
                icon: `https://xivapi.com${item[2]}`,
                levelItem: parseInt(item[3]),
                rarity: parseInt(item[4]),
                classJobs: item[5],
              }))
            );
          }
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
  breakCategories,
}: NavCategoryGroupProps) {
  return (
    <div className="nav-box">
      <div className="nav-heading">{sectionName}</div>
      <div>
        {categories.map((cat) => (
          <NavCategory
            key={cat.id}
            type={type}
            onOpen={onCategoryOpen}
            category={cat}
            divider={breakCategories?.includes(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

function filterItemSearchCategories(data: ItemSearchCategory[], category: number) {
  return data.filter((isc) => isc.category === category).sort((a, b) => a.order - b.order);
}

export default function CategoriesNavbar({ onCategoryOpen }: CategoriesNavbarProps) {
  const { data, error } = useSWR<ItemSearchCategory[]>(
    '/ItemSearchCategory?columns=ID,Name,Category,Order',
    async (path) => {
      const isc: XIVAPIItemSearchCategoryIndex = await fetch(`https://xivapi.com${path}`).then(
        (res) => res.json()
      );
      return isc.Results.map((r) => ({
        id: r.ID,
        name: r.Name,
        category: r.Category,
        order: r.Order,
      }));
    }
  );

  if (error) {
    console.error(error);
    return <div />;
  }

  if (!data) {
    return <div />;
  }

  const weapons = filterItemSearchCategories(data, 1);
  const armor = filterItemSearchCategories(data, 2);
  const items = filterItemSearchCategories(data, 3);
  const housing = filterItemSearchCategories(data, 4);

  return (
    <div>
      <NavCategoryGroup
        sectionName="WEAPONS"
        type="weapons"
        onCategoryOpen={onCategoryOpen}
        categories={weapons}
        breakCategories={[14, 19, 27]}
      />
      <NavCategoryGroup
        sectionName="ARMOR"
        type="armor"
        onCategoryOpen={onCategoryOpen}
        categories={armor}
      />
      <NavCategoryGroup
        sectionName="ITEMS"
        type="items"
        onCategoryOpen={onCategoryOpen}
        categories={items}
      />
      <NavCategoryGroup
        sectionName="HOUSING"
        type="housing"
        onCategoryOpen={onCategoryOpen}
        categories={housing}
      />
      <div className="nav-gap" />
    </div>
  );
}
