import { Trans } from '@lingui/macro';
import {
  getClassJobCategory,
  getItemKind,
  getItemSearchCategory,
  getItemUICategory,
} from '../../../data/game';
import { getSearchIcon } from '../../../theme/xiv-font';
import useSettings from '../../../hooks/useSettings';
import { Item } from '../../../types/game/Item';
import { UserList } from '../../../types/universalis/user';
import GameItemIcon from '../../GameItemIcon/GameItemIcon';
import MarketNav, { ListsDispatchAction } from '../MarketNav/MarketNav';
import CopyTextButton from '../../CopyTextButton/CopyTextButton';

interface MarketItemHeaderProps {
  hasSession: boolean;
  item: Item;
  stateLists: UserList[];
  dispatch: (action: ListsDispatchAction) => void;
}

export default function MarketItemHeader({
  hasSession,
  item,
  stateLists,
  dispatch,
}: MarketItemHeaderProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';
  const classJobCategory = getClassJobCategory(item.classJobCategory, lang);
  const itemSearchCategory = getItemSearchCategory(item.itemSearchCategory, lang);
  const itemUiCategory = getItemUICategory(item.itemUiCategory, lang);
  const itemKind = getItemKind(item.itemKind, lang);
  return (
    <div className="item_header">
      <MarketNav hasSession={hasSession} lists={stateLists} dispatch={dispatch} itemId={item.id} />
      <div>
        <GameItemIcon id={item.id} width={100} height={100} className="item-icon" priority={true} />
      </div>
      <div>
        <div className="item_info">
          <h1 className={`rarity-${item.rarity}`}>
            <span>{item.levelItem}</span>
            &nbsp;{item.name}
            <CopyTextButton text={item.name} />
          </h1>
        </div>
        <div className="item_info2">
          <div>
            {itemSearchCategory != null && itemSearchCategory.id > 0 && (
              <>
                <i className={`xiv-${getSearchIcon(itemSearchCategory.id)}`}></i> {itemKind?.name}
                &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                {itemUiCategory?.name}
                &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
              </>
            )}
            <Trans>Stack:</Trans> {item.stackSize.toLocaleString()}
            {classJobCategory != null && classJobCategory.id > 0 && (
              <>
                &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                <span className="text-green">{item.levelEquip}</span> {classJobCategory.name}
              </>
            )}
          </div>
          <div dangerouslySetInnerHTML={{ __html: item.description ?? '' }}></div>
        </div>
      </div>
    </div>
  );
}
