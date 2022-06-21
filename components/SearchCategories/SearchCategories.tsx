import useSWRImmutable from 'swr/immutable';
import { filterItemSearchCategories } from '../../data/game/isc';
import { getSearchIcon } from '../../data/game/xiv-font';
import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';
import { XIVAPIItemSearchCategoryIndex } from '../../types/xivapi/XIVAPIItemSearchCategoryIndex';

export default function SearchCategories() {
  const { data, error } = useSWRImmutable<ItemSearchCategory[]>(
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
    <div className="market-board-container">
      <div className="market-board">
        <div className="categories">
          <h2>WEAPONS</h2>
          <div className="categories-list">
            {weapons.map((cat) => (
              <button key={cat.id} id={cat.id.toString()} data-tippy-content={cat.name}>
                <span className={`xiv-${getSearchIcon(cat.id)}`}></span>
              </button>
            ))}
          </div>
        </div>
        <div className="categories">
          <h2>ARMOR</h2>
          <div className="categories-list">
            {armor.map((cat) => (
              <button key={cat.id} id={cat.id.toString()} data-tippy-content={cat.name}>
                <span className={`xiv-${getSearchIcon(cat.id)}`}></span>
              </button>
            ))}
          </div>
        </div>
        <div className="categories">
          <h2>ITEMS</h2>
          <div className="categories-list">
            {items.map((cat) => (
              <button key={cat.id} id={cat.id.toString()} data-tippy-content={cat.name}>
                <span className={`xiv-${getSearchIcon(cat.id)}`}></span>
              </button>
            ))}
          </div>
        </div>
        <div className="categories">
          <h2>HOUSING</h2>
          <div className="categories-list">
            {housing.map((cat) => (
              <button key={cat.id} id={cat.id.toString()} data-tippy-content={cat.name}>
                <span className={`xiv-${getSearchIcon(cat.id)}`}></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
