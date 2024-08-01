import { t, Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import { SearchItem, searchItemsV1, searchItemsV2 } from '../../../../service/search';
import useClickOutside from '../../../../hooks/useClickOutside';
import useSettings from '../../../../hooks/useSettings';

interface SearchBarProps {
  onResults: (results: SearchItem[], totalResults: number, searchTerm: string) => void;
  onMarketClicked: () => void;
}

export default function SearchBar({ onResults, onMarketClicked }: SearchBarProps) {
  const [typing, setTyping] = useState(false);
  const [complete, setComplete] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [settings] = useSettings();

  const lang = settings['mogboard_language'] || 'en';

  const inputRef = useClickOutside<HTMLInputElement>(null, () => {
    setTyping(false);
    setComplete(false);
  });

  const abort = useRef<AbortController | null>(null);
  const search = async (q: string) => {
    abort.current?.abort();
    abort.current = new AbortController();

    if (q.length === 0) {
      setTyping(false);
      setComplete(false);
    }

    // Defensively avoids sending excessively long search requests
    q = q.slice(0, 40).normalize();

    if (q.trim().length === 0) {
      setSearching(false);
      return;
    }

    setTyping(true);
    setSearching(true);
    setComplete(false);

    try {
      if (lang === 'ko') {
        const res1 = await searchItemsV1(q, lang, 'wildcard', abort.current);
        const res2 = await searchItemsV1(q, lang, 'fuzzy', abort.current);

        const res = res1;
        let shownResults = res1.resultsReturned + res2.resultsReturned;
        let totalResults = res1.resultsTotal + res2.resultsTotal;
        res2.results.forEach((result) => {
          if (!res.results.find((item) => item.id === result.id)) {
            res.results.push(result);
          } else {
            shownResults--;
            totalResults--;
          }
        });
        res.results.sort((a, b) => b.levelItem - a.levelItem);
        res.resultsReturned = shownResults;
        res.resultsTotal = totalResults;

        onResults(res.results, res.resultsTotal, q);
      } else if (lang === 'chs') {
        const res = await searchItemsV1(q, lang, undefined, abort.current);
        onResults(res.results, res.resultsTotal, q);
      } else {
        const res = await searchItemsV2(q, lang, abort.current);
        onResults(res.results, res.resultsTotal, q);
      }
    } catch (err) {
      if (!(err instanceof DOMException)) {
        // fetch throws a DOMException when it receives an abort signal
        console.error(err);
      }
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
          const val = e.target.value;
          setQuery(val);
          search(val);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'NumpadEnter') {
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
