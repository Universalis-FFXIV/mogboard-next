import Link from 'next/link';
import GameItemIcon from '../GameItemIcon/GameItemIcon';

interface RecentUpdatesPanelProps {
  items: {
    id: number;
    levelItem: number;
    rarity: number;
    name: string;
    category?: string;
  }[];
}

export default function RecentUpdatesPanel({ items }: RecentUpdatesPanelProps) {
  return (
    <div className="home-box home-trending">
      {items.map((item) => (
        <div key={item.id.toString()}>
          <div>
            <Link href={`/market/${item.id}`}>
              <a>
                <GameItemIcon id={item.id} width={55} height={55} />
              </a>
            </Link>
          </div>
          <div>
            <div>
              {item.levelItem > 1 && <em className="ilv">{item.levelItem}</em>}
              <Link href={`/market/${item.id}`}>
                <a className={`rarity-${item.rarity}`}>{item.name}</a>
              </Link>
            </div>
            <small>{item.category ?? '(Cannot be sold)'}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
