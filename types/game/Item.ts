export interface Item {
  id: number;
  name: string;
  description?: string;
  icon: string;
  levelItem: number;
  levelEquip?: number;
  rarity: number;
  itemKind: string;
  stackSize?: number;
  itemSearchCategory: {
    id: number;
    name: string;
  };
  itemUiCategory: {
    id: number;
    name: string;
  };
  classJobCategory?: {
    id: number;
    name: string;
  };
}
