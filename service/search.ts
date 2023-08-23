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
    return 'https://xivapi.com';
  }
}

export async function searchItems(
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
