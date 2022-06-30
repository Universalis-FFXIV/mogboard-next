import { CategoryItem } from '../../types/game/CategoryItem';
import { Item } from '../../types/game/Item';
import { getRepositoryUrl } from './repository';

export async function getItems(
  lang: 'en' | 'ja' | 'de' | 'fr' | 'chs'
): Promise<Record<number, { categoryId: number | null } & Omit<CategoryItem, 'id'>>> {
  const data: Record<number, [string, string, string, string, string, string]> = await fetch(
    `/data/categories_${lang}.js`
  ).then((res) => res.json());
  return Object.entries(data ?? {}).reduce<
    Record<number, { categoryId: number | null } & Omit<CategoryItem, 'id'>>
  >((agg, [catId, next]) => {
    for (const x of next) {
      agg[parseInt(x[0])] = {
        categoryId: isNaN(parseInt(catId)) ? null : parseInt(catId),
        name: x[1],
        icon: `https://xivapi.com${x[2]}`,
        levelItem: parseInt(x[3]),
        rarity: parseInt(x[4]),
        classJobs: x[5],
      };
    }
    return agg;
  }, {});
}

export async function getItem(
  itemId: number,
  lang: 'en' | 'ja' | 'de' | 'fr' | 'chs'
): Promise<Item> {
  const baseUrl = getRepositoryUrl(lang);
  const itemData = await fetch(`${baseUrl}/Item/${itemId}`).then(async (res) => res.json());
  return {
    id: itemData.ID,
    name: itemData[`Name_${lang}`],
    description: itemData[`Description_${lang}`],
    icon: `https://xivapi.com${itemData.Icon}`,
    levelItem: itemData.LevelItem,
    levelEquip: itemData.LevelEquip,
    stackSize: itemData.StackSize,
    rarity: itemData.Rarity,
    canBeHq: itemData.CanBeHq === 1,
    itemKind: itemData.ItemKind[`Name_${lang}`],
    itemSearchCategory: {
      id: itemData.ItemSearchCategory.ID,
      name: itemData.ItemSearchCategory[`Name_${lang}`],
    },
    itemUiCategory: {
      id: itemData.ItemUICategory.ID,
      name: itemData.ItemUICategory[`Name_${lang}`],
    },
    classJobCategory: itemData.ClassJobCategory
      ? {
          id: itemData.ClassJobCategory.ID,
          name: itemData.ClassJobCategory[`Name_${lang}`],
        }
      : undefined,
  };
}
