import { Trans } from '@lingui/macro';
import { getSearchIcon } from '../../../data/game/xiv-font';
import { Item } from '../../../types/game/Item';
import { UserList } from '../../../types/universalis/user';
import GameItemIcon from '../../GameItemIcon/GameItemIcon';
import MarketNav, { ListsDispatchAction } from '../MarketNav/MarketNav';

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
  return (
    <div className="item_header">
      <MarketNav hasSession={hasSession} lists={stateLists} dispatch={dispatch} itemId={item.id} />
      <div>
        <GameItemIcon id={item.id} width={100} height={100} />
      </div>
      <div>
        <div className="item_info">
          <h1 className={`rarity-${item.rarity}`}>
            <span>{item.levelItem}</span>
            &nbsp;{item.name}
          </h1>
        </div>
        <div className="item_info2">
          <div>
            {item.itemSearchCategory.id && (
              <>
                <i className={`xiv-${getSearchIcon(item.itemSearchCategory.id)}`}></i>{' '}
                {item.itemKind}
                &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                {item.itemUiCategory.name}
                &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
              </>
            )}
            <Trans>Stack:</Trans> {item.stackSize?.toLocaleString()}
            {item.classJobCategory && (
              <>
                &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                <span className="text-green">{item.levelEquip}</span> {item.classJobCategory.name}
              </>
            )}
          </div>
          <div dangerouslySetInnerHTML={{ __html: item.description ?? '' }}></div>
        </div>
      </div>
    </div>
  );
}
