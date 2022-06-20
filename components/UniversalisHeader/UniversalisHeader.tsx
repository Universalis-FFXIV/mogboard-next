import Link from 'next/link';
import SearchBar from '../SearchBar/SearchBar';

const UniversalisHeader = () => {
  return (
    <>
      <div>
        <div className="header-home">
          <Link href="/">
            <a className="btn-home">
              <img
                src="/i/universalis/universalis.png"
                alt="Universalis"
                width={41.75}
                height={64}
              />
            </a>
          </Link>
        </div>
        <SearchBar />
      </div>
      <div>
        <div>
          <span>Login stuff</span>
        </div>
      </div>
    </>
  );
};

export default UniversalisHeader;
