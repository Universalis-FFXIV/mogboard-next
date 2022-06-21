interface SearchBarProps {
  onMarketClicked: () => void;
}

export default function SearchBar({ onMarketClicked }: SearchBarProps) {
  return (
    <div className="header-nav">
      <img
        src="/i/svg/loading3.svg"
        className="search-loading"
        alt="Loading"
        width={25}
        height={25}
      />
      <input type="text" className="search" placeholder="Search" />
      <button className="btn-market-board" onClick={onMarketClicked}>
        <i className="xiv-Market"></i>
        <span>Market</span>
      </button>
    </div>
  );
}
