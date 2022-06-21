import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';

export function filterItemSearchCategories(data: ItemSearchCategory[], category: number) {
  return data.filter((isc) => isc.category === category).sort((a, b) => a.order - b.order);
}
