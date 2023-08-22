import classJobCategoriesJa from './ja/cjc.json';
import classJobCategoriesEn from './en/cjc.json';
import classJobCategoriesDe from './de/cjc.json';
import classJobCategoriesFr from './fr/cjc.json';
import classJobCategoriesZhHans from './chs/cjc.json';
import classJobCategoriesKo from './ko/cjc.json';
import { ClassJobCategory } from '../../types/game/ClassJobCategory';

import itemUiCategoriesJa from './ja/iuc.json';
import itemUiCategoriesEn from './en/iuc.json';
import itemUiCategoriesDe from './de/iuc.json';
import itemUiCategoriesFr from './fr/iuc.json';
import itemUiCategoriesZhHans from './chs/iuc.json';
import itemUiCategoriesKo from './ko/iuc.json';
import { ItemUICategory } from '../../types/game/ItemUICategory';

import itemSearchCategoriesJa from './ja/isc.json';
import itemSearchCategoriesEn from './en/isc.json';
import itemSearchCategoriesDe from './de/isc.json';
import itemSearchCategoriesFr from './fr/isc.json';
import itemSearchCategoriesZhHans from './chs/isc.json';
import itemSearchCategoriesKo from './ko/isc.json';
import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';

import itemKindsJa from './ja/itemKinds.json';
import itemKindsEn from './en/itemKinds.json';
import itemKindsDe from './de/itemKinds.json';
import itemKindsFr from './fr/itemKinds.json';
import itemKindsZhHans from './chs/itemKinds.json';
import itemKindsKo from './ko/itemKinds.json';
import { ItemKind } from '../../types/game/ItemKind';

import itemsJa from './ja/items.json';
import itemsEn from './en/items.json';
import itemsDe from './de/items.json';
import itemsFr from './fr/items.json';
import itemsZhHans from './chs/items.json';
import itemsKo from './ko/items.json';
import { Item } from '../../types/game/Item';

import materiaJa from './ja/materia.json';
import materiaEn from './en/materia.json';
import materiaDe from './de/materia.json';
import materiaFr from './fr/materia.json';
import materiaZhHans from './chs/materia.json';
import materiaKo from './ko/materia.json';
import { Materia } from '../../types/game/Materia';

type DataIndex<T> = Record<number, T>;

type Language = 'ja' | 'en' | 'de' | 'fr' | 'chs' | 'ko';

const classJobCategories: Record<Language, DataIndex<ClassJobCategory>> = {
  ja: classJobCategoriesJa as DataIndex<ClassJobCategory>,
  en: classJobCategoriesEn as DataIndex<ClassJobCategory>,
  de: classJobCategoriesDe as DataIndex<ClassJobCategory>,
  fr: classJobCategoriesFr as DataIndex<ClassJobCategory>,
  chs: classJobCategoriesZhHans as DataIndex<ClassJobCategory>,
  ko: classJobCategoriesKo as DataIndex<ClassJobCategory>,
};

const itemUiCategories: Record<Language, DataIndex<ItemUICategory>> = {
  ja: itemUiCategoriesJa as DataIndex<ItemUICategory>,
  en: itemUiCategoriesEn as DataIndex<ItemUICategory>,
  de: itemUiCategoriesDe as DataIndex<ItemUICategory>,
  fr: itemUiCategoriesFr as DataIndex<ItemUICategory>,
  chs: itemUiCategoriesZhHans as DataIndex<ItemUICategory>,
  ko: itemUiCategoriesKo as DataIndex<ItemUICategory>,
};

const itemSearchCategories: Record<Language, DataIndex<ItemSearchCategory>> = {
  ja: itemSearchCategoriesJa as DataIndex<ItemSearchCategory>,
  en: itemSearchCategoriesEn as DataIndex<ItemSearchCategory>,
  de: itemSearchCategoriesDe as DataIndex<ItemSearchCategory>,
  fr: itemSearchCategoriesFr as DataIndex<ItemSearchCategory>,
  chs: itemSearchCategoriesZhHans as DataIndex<ItemSearchCategory>,
  ko: itemSearchCategoriesKo as DataIndex<ItemSearchCategory>,
};

const itemKinds: Record<Language, DataIndex<ItemKind>> = {
  ja: itemKindsJa as DataIndex<ItemKind>,
  en: itemKindsEn as DataIndex<ItemKind>,
  de: itemKindsDe as DataIndex<ItemKind>,
  fr: itemKindsFr as DataIndex<ItemKind>,
  chs: itemKindsZhHans as DataIndex<ItemKind>,
  ko: itemKindsKo as DataIndex<ItemKind>,
};

const items: Record<Language, DataIndex<Item>> = {
  ja: itemsJa as DataIndex<Item>,
  en: itemsEn as DataIndex<Item>,
  de: itemsDe as DataIndex<Item>,
  fr: itemsFr as DataIndex<Item>,
  chs: itemsZhHans as DataIndex<Item>,
  ko: itemsKo as DataIndex<Item>,
};

const materia: Record<Language, DataIndex<Materia>> = {
  ja: materiaJa as DataIndex<Materia>,
  en: materiaEn as DataIndex<Materia>,
  de: materiaDe as DataIndex<Materia>,
  fr: materiaFr as DataIndex<Materia>,
  chs: materiaZhHans as DataIndex<Materia>,
  ko: materiaKo as DataIndex<Materia>,
};

export function getItemSearchCategories(lang: Language): ItemSearchCategory[] {
  return Object.values(itemSearchCategories[lang] ?? {});
}

export function getItems(lang: Language): Item[] {
  return Object.values(items[lang] ?? {});
}

export function getClassJobCategory(id: number, lang: Language): ClassJobCategory | undefined {
  return (classJobCategories[lang] ?? classJobCategories['en'])[id];
}

export function getItemUICategory(id: number, lang: Language): ItemUICategory | undefined {
  return (itemUiCategories[lang] ?? itemUiCategories['en'])[id];
}

export function getItemSearchCategory(id: number, lang: Language): ItemSearchCategory | undefined {
  return (itemSearchCategories[lang] ?? itemSearchCategories['en'])[id];
}

export function getItemKind(id: number, lang: Language): ItemKind | undefined {
  return (itemKinds[lang] ?? itemKinds['en'])[id];
}

export function getItem(id: number, lang: Language): Item | undefined {
  return (items[lang] ?? items['en'])[id];
}

export function getMateria(id: number, lang: Language): Materia | undefined {
  return (materia[lang] ?? materia['en'])[id];
}
