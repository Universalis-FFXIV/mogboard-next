import { t } from '@lingui/macro';
import { useState, useEffect } from 'react';
import { getItems, getItemSearchCategories } from '../../../../data/game';
import { filterItemSearchCategories } from '../../../../data/game/isc';
import { getSearchIcon } from '../../../../data/game/xiv-font';
import useSettings from '../../../../hooks/useSettings';
import { Item } from '../../../../types/game/Item';
import { ItemSearchCategory } from '../../../../types/game/ItemSearchCategory';
import { XIVAPIItemSearchCategoryIndex } from '../../../../types/xivapi/XIVAPIItemSearchCategoryIndex';

interface NavCategoryProps {
  type: string;
  onOpen: (items: Item[]) => void;
  category: ItemSearchCategory;
  categoryItems: Item[];
  divider?: boolean;
}

interface NavCategoryGroupProps {
  sectionName: string;
  type: string;
  onCategoryOpen: (items: Item[]) => void;
  categories: ItemSearchCategory[];
  categoryItems: Item[];
  breakCategories?: number[];
}

interface CategoriesNavbarProps {
  onCategoryOpen: (items: Item[]) => void;
}

function NavCategory({ type, onOpen, category, categoryItems, divider }: NavCategoryProps) {
  return (
    <>
      {divider && <hr />}
      <button
        id={category.id.toString()}
        className={`type-${type}`}
        onClick={() => {
          onOpen(categoryItems);
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
            categoryItems={categoryItems.filter((item) => item.itemSearchCategory === cat.id)}
            divider={breakCategories?.includes(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function CategoriesNavbar({ onCategoryOpen }: CategoriesNavbarProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

  const categoriesIndex = getItemSearchCategories(lang);

  const weapons = filterItemSearchCategories(categoriesIndex, 1);
  const armor = filterItemSearchCategories(categoriesIndex, 2);
  const items = filterItemSearchCategories(categoriesIndex, 3);
  const housing = filterItemSearchCategories(categoriesIndex, 4);

  const categoryItems = getItems(lang).filter((item) => item.itemSearchCategory > 0);

  return (
    <div>
      <NavCategoryGroup
        sectionName={t`WEAPONS`}
        type="weapons"
        onCategoryOpen={onCategoryOpen}
        categories={weapons}
        categoryItems={categoryItems}
        breakCategories={[14, 19, 27]}
      />
      <NavCategoryGroup
        sectionName={t`ARMOR`}
        type="armor"
        onCategoryOpen={onCategoryOpen}
        categories={armor}
        categoryItems={categoryItems}
      />
      <NavCategoryGroup
        sectionName={t`ITEMS`}
        type="items"
        onCategoryOpen={onCategoryOpen}
        categories={items}
        categoryItems={categoryItems}
      />
      <NavCategoryGroup
        sectionName={t`HOUSING`}
        type="housing"
        onCategoryOpen={onCategoryOpen}
        categories={housing}
        categoryItems={categoryItems}
      />
      <div className="nav-gap" />
    </div>
  );
}
