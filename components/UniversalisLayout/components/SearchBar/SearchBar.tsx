import { t, Trans } from '@lingui/macro';
import { useEffect, useState } from 'react';
import useClickOutside from '../../../../hooks/useClickOutside';
import useSettings from '../../../../hooks/useSettings';
import { Item } from '../../../../types/game/Item';

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

interface SearchBarProps {
  onResults: (results: Item[], totalResults: number, searchTerm: string) => void;
  onMarketClicked: () => void;
}

async function searchXIVAPI(
  query: string,
  lang: string,
  algorithm: string = 'wildcard'
): Promise<XIVAPISearchResults> {
  const results: XIVAPISearchResults = await fetch(
    `https://xivapi.com/search?string=${query}&indexes=item&language=${lang}&filters=ItemSearchCategory.ID>=1&columns=ID,Icon,Name,LevelItem,Rarity,ItemSearchCategory.Name,ItemSearchCategory.ID,ItemKind.Name&limit=100&sort_field=LevelItem&sort_order=desc&string_algo=${algorithm}`
  ).then((res) => res.json());
  return results;
}

export default function SearchBar({ onResults, onMarketClicked }: SearchBarProps) {
  const [typing, setTyping] = useState(false);
  const [complete, setComplete] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [settings] = useSettings();

  const inputRef = useClickOutside<HTMLInputElement>(null, () => {
    setTyping(false);
    setComplete(false);
  });

  const search = async (q: string) => {
    try {
      const res1 = await searchXIVAPI(q, settings['mogboard_language'] ?? 'en');
      const res2 = await searchXIVAPI(q, settings['mogboard_language'] ?? 'en', 'fuzzy');

      const res = res1;
      let shownResults = res1.Pagination.Results + res2.Pagination.Results;
      let totalResults = res1.Pagination.ResultsTotal + res2.Pagination.ResultsTotal;
      res2.Results.forEach((result) => {
        if (!res.Results.find((item) => item.ID === result.ID)) {
          res.Results.push(result);
        } else {
          shownResults--;
          totalResults--;
        }
      });
      res.Results.sort((a, b) => b.LevelItem - a.LevelItem);
      res.Pagination.Results = shownResults;
      res.Pagination.ResultsTotal = totalResults;

      onResults(
        res.Results.map((r) => ({
          id: r.ID,
          name: r.Name,
          icon: `https://xivapi.com${r.Icon}`,
          levelItem: r.LevelItem,
          rarity: r.Rarity,
          itemKind: r.ItemKind.Name,
          itemSearchCategory: {
            id: r.ItemSearchCategory.ID,
            name: r.ItemSearchCategory.Name,
          },
        })),
        res.Pagination.ResultsTotal,
        q
      );
    } catch (err) {
      console.error(err);
    }

    setSearching(false);
    setComplete(true);
  };

  return (
    <div className="header-nav">
      <img
        src="/i/svg/loading3.svg"
        className={`search-loading ${searching ? 'on' : ''}`}
        alt="Loading"
        width={25}
        height={25}
      />
      <input
        ref={inputRef}
        type="text"
        className={`search ${typing ? 'typing' : ''} ${complete ? 'complete' : ''}`}
        placeholder={t`Search`}
        value={query}
        onChange={(e) => {
          const val = e.target.value.trim();
          setQuery(val);
          setTyping(val.length > 0);
          setSearching(val.length > 0);
          setComplete(false);
          search(val);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'NumpadEnter') {
            setTyping(query.length > 0);
            setSearching(query.length > 0);
            setComplete(false);
            search(query);
          }
        }}
      />
      <button className="btn-market-board" style={{ display: 'flex' }} onClick={onMarketClicked}>
        <i className="xiv-Market"></i>
        <span>
          <Trans>Market</Trans>
        </span>
      </button>
    </div>
  );
}
