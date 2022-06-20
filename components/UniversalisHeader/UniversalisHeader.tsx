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
        <Link href="/account/login/discord">
          <a className="btn-login">Login via Discord</a>
        </Link>
        <div>
          <button className="btn-settings">
            <span className="xiv-app_drawer_setting" />
          </button>
        </div>
      </div>
    </>
  );
};

export default UniversalisHeader;
