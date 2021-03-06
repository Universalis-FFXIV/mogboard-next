import { Trans } from '@lingui/macro';
import { Item } from '../../../types/game/Item';
import GameItemIcon from '../../GameItemIcon/GameItemIcon';
import ListItemHeader from '../ListItemHeader/ListItemHeader';
import Tooltip from '../../Tooltip/Tooltip';
import ListItemMarket from '../ListItemMarket/ListItemMarket';
import { Language } from '../../../types/universalis/lang';

interface ListItemProps {
  itemId: number;
  item: Item;
  market: any;
  reqIsOwner: boolean;
  showHomeWorld: boolean;
  removeItem: (itemId: number) => void;
  lang: Language;
}

export default function ListItem({
  itemId,
  item,
  market,
  reqIsOwner,
  showHomeWorld,
  removeItem,
  lang,
}: ListItemProps) {
  return (
    <div className="pl_i">
      <div>
        <GameItemIcon id={item.id} height={100} width={100} />
      </div>
      <div>
        <h2>
          <ListItemHeader item={item} lang={lang} />
          {reqIsOwner && (
            <Tooltip
              label={
                <div style={{ textAlign: 'center', width: 140 }}>
                  <Trans>Remove item from list</Trans>
                </div>
              }
            >
              <a className="pl_remove" onClick={() => removeItem(itemId)}>
                <i className="xiv-NavigationClose"></i>
              </a>
            </Tooltip>
          )}
        </h2>
        <ListItemMarket
          item={item}
          market={market.items[itemId]}
          showHomeWorld={showHomeWorld}
          lang={lang}
        />
      </div>
    </div>
  );
}
