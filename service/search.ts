import { z } from 'zod';

function BoilmasterSheetRow<T extends z.ZodTypeAny>(fieldsShape: T) {
  return z.object({
    fields: fieldsShape,
    row_id: z.number().int().min(0),
    sheet: z.string(),
  });
}

const BoilmasterIcon = z.object({
  id: z.number().int(),
  path: z.string(),
  path_hr1: z.string(),
});

type BoilmasterIcon = z.TypeOf<typeof BoilmasterIcon>;

const BoilmasterItemSearchResult = z.object({
  Icon: BoilmasterIcon,
  ItemSearchCategory: BoilmasterSheetRow(
    z.object({
      Name: z.string(),
    })
  ),
  LevelItem: BoilmasterSheetRow(z.object({})),
  Rarity: z.number().int(),
  Name: z.string(),
});

const BoilmasterItemSearchResults = z.object({
  next: z.string().optional(),
  results: z.array(
    BoilmasterSheetRow(BoilmasterItemSearchResult).merge(
      z.object({
        score: z.number(),
      })
    )
  ),
  schema: z.string(),
});

export type BoilmasterItemSearchResults = z.TypeOf<typeof BoilmasterItemSearchResults>;

interface XIVAPISearchResults {
  Pagination: {
    Results: number;
    ResultsTotal: number;
  };
  Results: {
    ID: number;
    Icon: string;
    ItemKind: {
      Name: string;
    };
    ItemSearchCategory: {
      ID: number;
      Name: string;
    };
    LevelItem: number;
    Name: string;
    Rarity: number;
  }[];
}

export interface ItemSearchResults {
  resultsReturned: number;
  resultsTotal: number;
  results: SearchItem[];
}

export interface SearchItem {
  id: number;
  icon: string;
  itemKind: string;
  itemSearchCategory: {
    id: number;
    name: string;
  };
  levelItem: number;
  name: string;
  rarity: number;
}

function getRepositoryUrl(lang: string) {
  if (lang === 'chs') {
    return 'https://cafemaker.wakingsands.com';
  } else if (lang === 'ko') {
    return 'https://lalafell-api.universalis.app/api';
  } else {
    throw new Error(`Out of range: ${lang}`);
  }
}

export async function searchItemsV1(
  query: string,
  lang: string,
  algorithm?: string,
  abort?: AbortController
): Promise<ItemSearchResults> {
  const baseUrl = getRepositoryUrl(lang);

  let searchUrl = `${baseUrl}/search?string=${query}&indexes=item&language=${lang}&filters=ItemSearchCategory.ID>=1&columns=ID,Icon,Name,LevelItem,Rarity,ItemSearchCategory.Name,ItemSearchCategory.ID,ItemKind.Name&limit=100&sort_field=LevelItem&sort_order=desc`;
  if (algorithm != null) {
    searchUrl += `&string_algo=${algorithm}`;
  }

  const data: XIVAPISearchResults = await fetch(searchUrl, {
    signal: abort?.signal,
  }).then((res) => res.json());

  return {
    resultsReturned: data.Pagination.Results,
    resultsTotal: data.Pagination.ResultsTotal,
    results: data.Results.map((item) => ({
      id: item.ID,
      icon: `https://xivapi.com${item.Icon}`,
      itemKind: item.ItemKind.Name,
      itemSearchCategory: {
        id: item.ItemSearchCategory.ID,
        name: item.ItemSearchCategory.Name,
      },
      levelItem: item.LevelItem,
      name: item.Name,
      rarity: item.Rarity,
    })),
  };
}

function iconUrlV2(icon: BoilmasterIcon): string {
  return `https://beta.xivapi.com/api/1/asset/${icon.path}?format=png`;
}

export async function searchItemsV2(
  query: string,
  lang: string,
  abort?: AbortController
): Promise<ItemSearchResults> {
  const searchUrl = 'https://beta.xivapi.com/api/1/search';
  const params = new URLSearchParams({
    sheets: 'Item',
    query: `+Name~"${query}" +ItemSearchCategory>=1`,
    language: lang,
    limit: '30',
    // LevelItem.todo is a nonexistent field, but using that causes an empty fields
    // property to be returned, which is useful for reducing the response size.
    // TODO: use @raw once it exists
    fields: 'Name,ItemSearchCategory.Name,Icon,LevelItem.todo,Rarity',
  });

  const data = await fetch(`${searchUrl}?${params.toString()}`, {
    signal: abort?.signal,
  })
    .then((res) => res.json())
    .then((res) => BoilmasterItemSearchResults.parse(res))
    .catch((err) => {
      if (err instanceof z.ZodError) {
        console.error('Failed to parse search results:', err.message);
      }

      throw err;
    });

  return {
    resultsReturned: data.results.length,
    resultsTotal: data.results.length,
    results: data.results
      .filter((result) => result.fields.ItemSearchCategory.row_id >= 1)
      .map((result) => ({
        id: result.row_id,
        icon: iconUrlV2(result.fields.Icon),
        itemKind: result.fields.ItemSearchCategory.fields.Name,
        itemSearchCategory: {
          id: result.fields.ItemSearchCategory.row_id,
          name: result.fields.ItemSearchCategory.fields.Name,
        },
        levelItem: result.fields.LevelItem.row_id,
        name: result.fields.Name,
        rarity: result.fields.Rarity,
      }))
      .sort((a, b) => b.levelItem - a.levelItem),
  };
}
