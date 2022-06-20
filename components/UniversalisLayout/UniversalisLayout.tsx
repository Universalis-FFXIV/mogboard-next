import Link from 'next/link';
import { PropsWithChildren } from 'react';
import CategoriesNavbar from '../CategoriesNavbar/CategoriesNavbar';
import UniversalisFooter from '../UniversalisFooter/UniversalisFooter';
import UniversalisHeader from '../UniversalisHeader/UniversalisHeader';

export default function UniversalisLayout({ children }: PropsWithChildren) {
  return (
    <div className="site-container">
      <aside>
        <Link href="/">
          <a className="nav-home">
            <img
              src="/i/brand/universalis/universalis_bodge.png"
              alt="Universalis"
              width={170}
              height={30}
            />
          </a>
        </Link>
        <CategoriesNavbar />
      </aside>
      <div className="site left-nav-on">
        <header>
          <UniversalisHeader />
        </header>
        <nav className="site-menu"></nav>
        <div className="market-category-view">
          <div className="item-category-list2" id="item-category-list2"></div>
        </div>

        <main>{children}</main>

        <footer>
          <UniversalisFooter />
        </footer>
      </div>
    </div>
  );
}
