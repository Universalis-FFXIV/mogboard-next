export interface Item {
  id: number;
  name: string;
  description: string;
  iconId: number;
  levelItem: number;
  levelEquip: number;
  rarity: number;
  itemKind: number;
  stackSize: number;
  canBeHq: boolean;
  itemSearchCategory: number;
  itemUiCategory: number;
  classJobCategory: number;
  isUsedInRecipe: boolean;
}
