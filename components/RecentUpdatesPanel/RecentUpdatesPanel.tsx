import { t } from '@lingui/macro';
import Link from 'next/link';
import { getItemSearchCategory } from '../../data/game';
import useSettings from '../../hooks/useSettings';
import { Item } from '../../types/game/Item';
import GameItemIcon from '../GameItemIcon/GameItemIcon';

interface RecentUpdatesPanelProps {
  items: (Item | null)[];
}

export default function RecentUpdatesPanel({ items }: RecentUpdatesPanelProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

  const error = `(${t`Cannot be sold`})`;
  return (
    <div className="home-box home-trending">
      {items.map((item, i) => {
        if (item == null) {
          return <div key={i} />;
        }

        return (
          <div key={i}>
            <div>
              <Link href="/market/[itemId]" as={`/market/${item.id}`}>
                <a>
                  <GameItemIcon
                    id={item.id}
                    width={55}
                    height={55}
                    className="home-trending-item"
                  />
                </a>
              </Link>
            </div>
            <div>
              <div>
                <span>
                  {item.levelItem > 1 && <em className="ilv">{item.levelItem}</em>}
                  <Link href="/market/[itemId]" as={`/market/${item.id}`}>
                    <a className={`rarity-${item.rarity}`}>{item.name}</a>
                  </Link>
                </span>
              </div>
              <small>
                {item.itemSearchCategory > 0
                  ? getItemSearchCategory(item.itemSearchCategory, lang)?.name
                  : error}
              </small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
