import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { SearchItem } from '../../service/search';
import useSettings from '../../hooks/useSettings';
import { Item } from '../../types/game/Item';
import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';
import CategoryView from './components/CategoryView/CategoryView';
import ModalCover, { useModalCover } from './components/ModalCover/ModalCover';
import Popup, { usePopup } from './components/Popup/Popup';
import SearchBar from './components/SearchBar/SearchBar';
import SearchCategories from './components/SearchCategories/SearchCategories';
import SearchCategoryResults from './components/SearchCategoryResults/SearchCategoryResults';
import SearchResults from './components/SearchResults/SearchResults';
import SettingsModal from './components/SettingsModal/SettingsModal';
import UniversalisFooter from './components/UniversalisFooter/UniversalisFooter';
import UniversalisHeader from './components/UniversalisHeader/UniversalisHeader';
import UniversalisLeftNav from './components/UniversalisLeftNav/UniversalisLeftNav';

export default function UniversalisLayout({ children }: PropsWithChildren) {
  const [settings] = useSettings();

  const [navCategoryItemsOpen, setNavCategoryItemsOpen] = useState(false);
  const [navCategoryItems, setNavCategoryItems] = useState<Item[]>([]);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [searchCategoriesOpen, setSearchCategoriesOpen] = useState(false);
  const [searchCategoryResultsOpen, setSearchCategoryResultsOpen] = useState(false);
  const [searchCategoryItems, setSearchCategoryItems] = useState<Item[]>([]);
  const [searchCategory, setSearchCategory] = useState<ItemSearchCategory | undefined>(undefined);

  const { popup, setPopup } = usePopup();
  const { modalCover, setModalCover } = useModalCover();

  const openSettingsModal = useMemo(
    () => () => {
      setModalCover({ isOpen: true });
      setSettingsModalOpen(true);
    },
    [setModalCover]
  );

  const closeSettingsModal = () => {
    setModalCover({ isOpen: false });
    setSettingsModalOpen(false);
  };

  useEffect(() => {
    if (!settings['mogboard_server']) {
      openSettingsModal();
    }
  }, [settings, openSettingsModal]);

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
        <UniversalisHeader onSettingsClicked={() => openSettingsModal()}>
          <>
            <SearchBar
              onMarketClicked={() => setSearchCategoriesOpen(true)}
              onResults={(results, totalResults, query) => {
                setSearchResults(results);
                setSearchTotal(totalResults);
                setSearchTerm(query);
                setSearchResultsOpen(true);
              }}
            />
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
          </>
        </UniversalisHeader>
        <nav className="site-menu"></nav>
        <CategoryView
          isOpen={navCategoryItemsOpen}
          closeView={() => setNavCategoryItemsOpen(false)}
          items={navCategoryItems}
        />

        <main>{children}</main>

        <UniversalisFooter />
      </div>

      {settingsModalOpen && (
        <SettingsModal
          isOpen={settingsModalOpen}
          closeModal={() => closeSettingsModal()}
          onSave={() => {
            setPopup({
              type: 'success',
              title: 'Settings Saved',
              message: 'Refreshing site, please wait...',
              forceOpen: true,
              isOpen: true,
            });
            location.reload();
          }}
        />
      )}
      <ModalCover {...modalCover} />
      <Popup {...popup} onClose={() => setPopup({ isOpen: false })} />
    </div>
  );
}
