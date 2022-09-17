import { t, Trans } from '@lingui/macro';
import Link from 'next/link';
import { getItem, getItemSearchCategory } from '../../../data/game';
import { Item } from '../../../types/game/Item';
import { Language } from '../../../types/universalis/lang';
import GameItemIcon from '../../GameItemIcon/GameItemIcon';
import styles from './HomeLeastRecentlyUpdated.module.scss';
import ago from 's-ago';
import SimpleBar from 'simplebar-react';

function ItemEntryCrossWorld({
  item,
  date,
  world,
  lang,
}: {
  item: Item;
  date: Date;
  world: string;
  lang: Language;
}) {
  const error = `(${t`Cannot be sold`})`;
  return (
    <div className={styles.itemRow}>
      <div className={styles.itemIconWrapper}>
        <Link href="/market/[itemId]" as={`/market/${item.id}`}>
          <a>
            <GameItemIcon id={item.id} width={55} height={55} className={styles.homeTrendingItem} />
          </a>
        </Link>
      </div>
      <div className={styles.itemInfoWrapper}>
        <div className={styles.mainInfo}>
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
        <div className={styles.updateTime}>
          <small>
            <Trans>
              Last updated: {ago(date)} on {world}
            </Trans>
          </small>
        </div>
      </div>
    </div>
  );
}

function ItemEntryWorld({ item, date, lang }: { item: Item; date: Date; lang: Language }) {
  const error = `(${t`Cannot be sold`})`;
  return (
    <div className={styles.itemRow}>
      <div className={styles.itemIconWrapper}>
        <Link href="/market/[itemId]" as={`/market/${item.id}`}>
          <a>
            <GameItemIcon id={item.id} width={55} height={55} className={styles.homeTrendingItem} />
          </a>
        </Link>
      </div>
      <div className={styles.itemInfoWrapper}>
        <div className={styles.mainInfo}>
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
        <div className={styles.updateTime}>
          <small>
            <Trans>Last updated: {ago(date)}</Trans>
          </small>
        </div>
      </div>
    </div>
  );
}

export default function HomeLeastRecentlyUpdated({
  server,
  multiWorld,
  lang,
  leastRecents,
}: {
  server: string;
  multiWorld: boolean;
  lang: Language;
  leastRecents: { id: number; date: Date; world: string }[];
}) {
  if (multiWorld) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h4 className={styles.title}>
            <Trans>Least recently updated on {server}</Trans>
          </h4>
        </div>
        <div className={styles.itemList}>
          <SimpleBar style={{ height: '40vh' }}>
            {leastRecents
              .map((lr) => ({ item: getItem(lr.id, lang), date: lr.date, world: lr.world }))
              .filter((entry) => entry.item != null)
              .map((entry, i) => (
                <ItemEntryCrossWorld
                  key={i}
                  item={entry.item!}
                  date={entry.date}
                  world={entry.world}
                  lang={lang}
                />
              ))}
          </SimpleBar>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h4 className={styles.title}>
            <Trans>Least recently updated on {server}</Trans>
          </h4>
        </div>
        <div className={styles.itemList}>
          <SimpleBar style={{ height: '40vh' }}>
            {leastRecents
              .map((lr) => ({ item: getItem(lr.id, lang), date: lr.date, world: lr.world }))
              .filter((entry) => entry.item != null)
              .map((entry, i) => (
                <ItemEntryWorld key={i} item={entry.item!} date={entry.date} lang={lang} />
              ))}
          </SimpleBar>
        </div>
      </div>
    );
  }
}
