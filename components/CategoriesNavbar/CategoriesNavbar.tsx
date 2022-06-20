import useSWR from 'swr';
import { getSearchIcon } from '../../data/game/xiv-font';

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
  sectionName: string;
  type: string;
  categories: ItemSearchCategory[];
  breakCategories?: number[];
}

function NavCategory({ sectionName, type, categories, breakCategories }: NavCategoryProps) {
  return (
    <div className="nav-box">
      <div className="nav-heading">{sectionName}</div>
      <div>
        {categories.map((cat) => (
          <>
            {breakCategories?.includes(cat.id) && <hr key={`hr-${cat.id}`} />}
            <button key={cat.id} id={cat.id.toString()} className={`type-${type}`}>
              <i className={`xiv-${getSearchIcon(cat.id)}`} />
              <span>{cat.name}</span>
            </button>
          </>
        ))}
      </div>
    </div>
  );
}

function filterItemSearchCategories(data: ItemSearchCategory[], category: number) {
  return data.filter((isc) => isc.category === category).sort((a, b) => a.order - b.order);
}

export default function CategoriesNavbar() {
  const { data, error } = useSWR<ItemSearchCategory[]>(
    '/ItemSearchCategory?columns=ID,Name,Category,Order',
    async () => {
      const isc: XIVAPIItemSearchCategoryIndex = await fetch(
        'https://xivapi.com/ItemSearchCategory?columns=ID,Name,Category,Order'
      ).then((res) => res.json());
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
      <NavCategory
        sectionName="WEAPONS"
        type="weapons"
        categories={weapons}
        breakCategories={[14, 19, 27]}
      />
      <NavCategory sectionName="ARMOR" type="armor" categories={armor} />
      <NavCategory sectionName="ITEMS" type="items" categories={items} />
      <NavCategory sectionName="HOUSING" type="housing" categories={housing} />
      <div className="nav-gap" />
    </div>
  );
}
