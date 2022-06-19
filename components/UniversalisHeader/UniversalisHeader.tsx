import Image from 'next/image';
import Link from 'next/link';

const UniversalisHeader = () => {
  return (
    <>
      <div>
        <div className="header-home">
          <Link href="/">
            <a className="btn-home">
              <Image
                src="/i/universalis/universalis.png"
                alt="Universalis"
                loading="eager"
                width={41.75}
                height={64}
              />
            </a>
          </Link>
        </div>
        <div className="header-nav">
          <img
            src="/i/svg/loading3.svg"
            className="search-loading"
            alt="Loading"
            width={25}
            height={25}
          />
          <input type="text" className="search" placeholder="Search" />
          <button className="btn-market-board">
            <i className="xiv-Market"></i>
            <span>Market</span>
          </button>
        </div>
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
