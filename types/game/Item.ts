export interface Item {
  id: number;
  name: string;
  icon: string;
  levelItem: number;
  rarity: number;
  itemKind: string;
  itemSearchCategory: {
    id: number;
    name: string;
  };
  classJobCategory?: {
    id: number;
    name: string;
  };
}
