import { Trans } from '@lingui/macro';
import Image from 'next/image';
import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import { SearchItem } from '../../../../service/search';
import useClickOutside from '../../../../hooks/useClickOutside';
import styles from './SearchResults.module.scss';

interface SearchResultsProps {
  isOpen: boolean;
  closeResults: () => void;
  results: SearchItem[];
  totalResults: number;
  searchTerm: string;
}

export default function SearchResults({
  isOpen,
  results,
  totalResults,
  searchTerm,
  closeResults,
}: SearchResultsProps) {
  const resultsRef = useClickOutside<HTMLDivElement>(null, closeResults);

  return (
    <div ref={resultsRef} className={`search-results-container ${isOpen ? 'open' : ''}`}>
      <div className="search-results">
        <div className="item-search-header">
          <div>
            <Trans>
              Found {results.length} / {totalResults} for <strong>{searchTerm}</strong>
            </Trans>
          </div>
          <div></div>
        </div>
        <SimpleBar className={`item-search-list ${styles.container}`} id="item-search-list">
          {results.map((item) => (
            <Link key={item.id} href="/market/[itemId]" as={`/market/${item.id}`}>
              <a
                className={`rarity-${item.rarity}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey) {
                    closeResults();
                  }
                }}
              >
                <span className="item-icon">
                  <Image src={item.icon} alt="" width={40} height={40} />
                </span>
                <span className="item-level">{item.levelItem}</span>
                {item.name}
                <span className={`item-category ${styles.extraInfo}`}>
                  {item.itemSearchCategory.name}
                </span>
              </a>
            </Link>
          ))}
        </SimpleBar>
      </div>
    </div>
  );
}
