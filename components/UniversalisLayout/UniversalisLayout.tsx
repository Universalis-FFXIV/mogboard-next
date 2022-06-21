import Link from 'next/link';
import { PropsWithChildren, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { CategoryItem } from '../../types/game/CategoryItem';
import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';
import CategoriesNavbar from '../CategoriesNavbar/CategoriesNavbar';
import CategoryView from '../CategoryView/CategoryView';
import ModalCover from '../ModalCover/ModalCover';
import Popup from '../Popup/Popup';
import SearchCategories from '../SearchCategories/SearchCategories';
import SearchCategoryResults from '../SearchCategoryResults/SearchCategoryResults';
import SearchResults from '../SearchResults/SearchResults';
import SettingsModal from '../SettingsModal/SettingsModal';
import UniversalisFooter from '../UniversalisFooter/UniversalisFooter';
import UniversalisHeader from '../UniversalisHeader/UniversalisHeader';

export default function UniversalisLayout({ children }: PropsWithChildren) {
  const [navCategoryItemsOpen, setNavCategoryItemsOpen] = useState(false);
  const [navCategoryItems, setNavCategoryItems] = useState<CategoryItem[]>([]);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [searchCategoriesOpen, setSearchCategoriesOpen] = useState(false);
  const [searchCategoryResultsOpen, setSearchCategoryResultsOpen] = useState(false);
  const [searchCategoryItems, setSearchCategoryItems] = useState<CategoryItem[]>([]);
  const [searchCategory, setSearchCategory] = useState<ItemSearchCategory | undefined>(undefined);

  const [popupType, setPopupType] = useState<'success' | 'error' | 'warning' | 'info' | undefined>(
    undefined
  );
  const [popupTitle, setPopupTitle] = useState<string | undefined>(undefined);
  const [popupMessage, setPopupMessage] = useState<string | undefined>(undefined);
  const [popupForceOpen, setPopupForceOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

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
              setNavCategoryItems(cat);
              setNavCategoryItemsOpen(true);
            }}
          />
        </SimpleBar>
      </aside>
      <div className="site left-nav-on">
        <header>
          <UniversalisHeader
            onSettingsClicked={() => setSettingsModalOpen(true)}
            onMarketClicked={() => setSearchCategoriesOpen(true)}
          />
        </header>
        <nav className="site-menu"></nav>
        <CategoryView
          isOpen={navCategoryItemsOpen}
          closeView={() => setNavCategoryItemsOpen(false)}
          items={navCategoryItems}
        />

        <main>{children}</main>

        <footer>
          <UniversalisFooter />
        </footer>

        <SearchResults />
        <SearchCategories
          isOpen={searchCategoriesOpen}
          closeBox={() => setSearchCategoriesOpen(false)}
          onCategoryOpen={(cat, catItems) => {
            setSearchCategoriesOpen(false);
            setSearchCategory(cat);
            setSearchCategoryItems(catItems);
            setSearchCategoryResultsOpen(true);
          }}
        />
        <SearchCategoryResults
          isOpen={searchCategoryResultsOpen}
          closeResults={() => setSearchCategoryResultsOpen(false)}
          items={searchCategoryItems}
          category={searchCategory}
        />
      </div>

      <SettingsModal
        isOpen={settingsModalOpen}
        closeModal={() => setSettingsModalOpen(false)}
        onSave={() => {
          setPopupType('success');
          setPopupTitle('Settings Saved');
          setPopupMessage('Refreshing site, please wait...');
          setPopupForceOpen(true);
          setPopupOpen(true);
        }}
      />
      <ModalCover isOpen={settingsModalOpen} />
      <Popup
        isOpen={popupOpen}
        type={popupType}
        title={popupTitle}
        message={popupMessage}
        forceOpen={popupForceOpen}
      />
    </div>
  );
}
