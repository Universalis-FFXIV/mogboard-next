import { CategoryItem } from '../../types/game/CategoryItem';

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
