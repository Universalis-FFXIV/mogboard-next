import Link from 'next/link';
import { PropsWithChildren, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { CategoryItem } from '../../types/game/CategoryItem';
import CategoriesNavbar from '../CategoriesNavbar/CategoriesNavbar';
import CategoryView from '../CategoryView/CategoryView';
import UniversalisFooter from '../UniversalisFooter/UniversalisFooter';
import UniversalisHeader from '../UniversalisHeader/UniversalisHeader';

export default function UniversalisLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  return (
    <div className="site-container">
      <aside>
        <SimpleBar>
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
          <CategoriesNavbar
            onCategoryOpen={(cat) => {
              setCategoryItems(cat);
              setOpen(true);
            }}
          />
        </SimpleBar>
      </aside>
      <div className="site left-nav-on">
        <header>
          <UniversalisHeader />
        </header>
        <nav className="site-menu"></nav>
        <CategoryView isOpen={open} closeView={() => setOpen(false)} items={categoryItems} />

        <main>{children}</main>

        <footer>
          <UniversalisFooter />
        </footer>
      </div>
    </div>
  );
}
