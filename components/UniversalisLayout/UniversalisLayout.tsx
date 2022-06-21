import Link from 'next/link';
import { PropsWithChildren, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { CategoryItem } from '../../types/game/CategoryItem';
import CategoriesNavbar from '../CategoriesNavbar/CategoriesNavbar';
import CategoryView from '../CategoryView/CategoryView';
import ModalCover from '../ModalCover/ModalCover';
import SettingsModal from '../SettingsModal/SettingsModal';
import UniversalisFooter from '../UniversalisFooter/UniversalisFooter';
import UniversalisHeader from '../UniversalisHeader/UniversalisHeader';

export default function UniversalisLayout({ children }: PropsWithChildren) {
  const [categoryItemsOpen, setCategoryItemsOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

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
              setCategoryItemsOpen(true);
            }}
          />
        </SimpleBar>
      </aside>
      <div className="site left-nav-on">
        <header>
          <UniversalisHeader onSettingsClicked={() => setSettingsModalOpen(true)} />
        </header>
        <nav className="site-menu"></nav>
        <CategoryView
          isOpen={categoryItemsOpen}
          closeView={() => setCategoryItemsOpen(false)}
          items={categoryItems}
        />

        <main>{children}</main>

        <footer>
          <UniversalisFooter />
        </footer>

        <SettingsModal isOpen={settingsModalOpen} closeModal={() => setSettingsModalOpen(false)} />
        <ModalCover modalOpen={settingsModalOpen} />
      </div>
    </div>
  );
}
