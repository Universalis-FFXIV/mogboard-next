import { PropsWithChildren, useState } from 'react';
import useSettings from '../../hooks/useSettings';
import { CategoryItem } from '../../types/game/CategoryItem';
import { Item } from '../../types/game/Item';
import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';
import CategoryView from '../CategoryView/CategoryView';
import ModalCover from '../ModalCover/ModalCover';
import Popup from '../Popup/Popup';
import SearchCategories from '../SearchCategories/SearchCategories';
import SearchCategoryResults from '../SearchCategoryResults/SearchCategoryResults';
import SearchResults from '../SearchResults/SearchResults';
import SettingsModal from '../SettingsModal/SettingsModal';
import UniversalisFooter from '../UniversalisFooter/UniversalisFooter';
import UniversalisHeader from '../UniversalisHeader/UniversalisHeader';
import UniversalisLeftNav from '../UniversalisLeftNav/UniversalisLeftNav';

export default function UniversalisLayout({ children }: PropsWithChildren) {
  const [settings] = useSettings();

  const [navCategoryItemsOpen, setNavCategoryItemsOpen] = useState(false);
  const [navCategoryItems, setNavCategoryItems] = useState<CategoryItem[]>([]);

  const [settingsModalOpen, setSettingsModalOpen] = useState(settings['mogboard_server'] == null);

  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

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

  const leftNav = settings['mogboard_leftnav'] === 'on';
  return (
    <div className="site-container">
      {leftNav && (
        <UniversalisLeftNav
          onCategoryOpen={(cat) => {
            setNavCategoryItems(cat);
            setNavCategoryItemsOpen(true);
          }}
        />
      )}
      <div className={`site left-nav-${leftNav ? 'on' : 'off'}`}>
        <UniversalisHeader
          onResults={(results, totalResults, query) => {
            setSearchResults(results);
            setSearchTotal(totalResults);
            setSearchTerm(query);
            setSearchResultsOpen(true);
          }}
          onSettingsClicked={() => setSettingsModalOpen(true)}
          onMarketClicked={() => setSearchCategoriesOpen(true)}
        />
        <nav className="site-menu"></nav>
        <CategoryView
          isOpen={navCategoryItemsOpen}
          closeView={() => setNavCategoryItemsOpen(false)}
          items={navCategoryItems}
        />

        <main>{children}</main>

        <UniversalisFooter />

        <SearchResults
          isOpen={searchResultsOpen}
          closeResults={() => setSearchResultsOpen(false)}
          results={searchResults}
          totalResults={searchTotal}
          searchTerm={searchTerm}
        />
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

      {settingsModalOpen && (
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
      )}
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
