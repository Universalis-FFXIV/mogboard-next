import Image from 'next/image';
import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import useClickOutside from '../../../../hooks/useClickOutside';
import { Item } from '../../../../types/game/Item';

interface SearchResultsProps {
  isOpen: boolean;
  closeResults: () => void;
  results: Item[];
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
  const searchHeight = 695;

  return (
    <div ref={resultsRef} className={`search-results-container ${isOpen ? 'open' : ''}`}>
      <div className="search-results">
        <div className="item-search-header">
          <div>
            Found {results.length} / {totalResults} for <strong>{searchTerm}</strong>
          </div>
          <div></div>
        </div>
        <SimpleBar
          className="item-search-list"
          id="item-search-list"
          style={{ height: searchHeight }}
        >
          {results.map((item) => (
            <Link key={item.id} href={`/market/${item.id}`}>
              <a className={`rarity-${item.rarity}`}>
                <span className="item-icon">
                  <Image src={item.icon} alt="" width={40} height={40} />
                </span>
                <span className="item-level">{item.levelItem}</span>
                {item.name}
                <span className="item-category">{item.itemSearchCategory.name}</span>
              </a>
            </Link>
          ))}
        </SimpleBar>
      </div>
    </div>
  );
}
