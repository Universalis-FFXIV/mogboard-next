import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { sprintf } from 'sprintf-js';
import { getItem, getItems, getItemSearchCategories } from '../../../data/game';
import useSettings from '../../../hooks/useSettings';
import { DataCenter } from '../../../types/game/DataCenter';
import { ItemSearchCategory } from '../../../types/game/ItemSearchCategory';
import { UserList } from '../../../types/universalis/user';
import { XIVAPIItemSearchCategoryIndex } from '../../../types/xivapi/XIVAPIItemSearchCategoryIndex';
import GameItemIcon from '../../GameItemIcon/GameItemIcon';

interface HomeUserListProps {
  dcs: DataCenter[];
  list: UserList;
}

interface CheapestListingProps {
  listing?: any;
  hq: boolean;
}

function CheapestListing({ listing, hq }: CheapestListingProps) {
  const quality = hq ? 'HQ' : 'NQ';
  const header = sprintf(t`Cheapest %s`, quality);
  const none = sprintf(t`No %s for sale.`, quality);
  return (
    <div className="cheapest">
      <h2 style={{ margin: 0 }}>{header}</h2>
      {listing && (
        <div className="cheapest_price">
          <i className="xiv-Gil"></i>
          <em>{listing.quantity.toLocaleString()} x </em>
          <span className="cheapest_value">{listing.pricePerUnit.toLocaleString()} </span>
          <span className="cheapest_price_info">
            <Trans>Server:</Trans> <strong>{listing.worldName}</strong> - <Trans>Total:</Trans>{' '}
            <strong>{listing.total.toLocaleString()}</strong>
          </span>
        </div>
      )}
      {!listing && none}
    </div>
  );
}

export default function HomeUserList({ dcs, list }: HomeUserListProps) {
  const [settings] = useSettings();
  const dc = dcs.find((x) => x.worlds.some((y) => y.name === settings['mogboard_server']));
  const lang = settings['mogboard_language'] ?? 'en';

  const itemIdsStr = list.items.length === 1 ? `0,${list.items[0]}` : list.items.join();

  const [marketNq, setMarketNq] = useState<any>(null);
  useEffect(() => {
    fetch(
      `https://universalis.app/api/v2/${
        dc?.name ?? 'Chaos'
      }/${itemIdsStr}?listings=1&entries=0&hq=0`
    )
      .then((res) => res.json())
      .then(setMarketNq);
  }, [dc?.name, itemIdsStr]);

  const [marketHq, setMarketHq] = useState<any>(null);
  useEffect(() => {
    fetch(
      `https://universalis.app/api/v2/${
        dc?.name ?? 'Chaos'
      }/${itemIdsStr}?listings=1&entries=0&hq=1`
    )
      .then((res) => res.json())
      .then(setMarketHq);
  }, [dc?.name, itemIdsStr]);

  const itemSearchCategories = getItemSearchCategories(lang);

  const marketNqData = marketNq?.items ?? {};
  const marketHqData = marketHq?.items ?? {};
  const categoryIndexData = itemSearchCategories.reduce<
    Record<number, Omit<ItemSearchCategory, 'id'>>
  >((agg, next) => {
    agg[next.id] = {
      name: next.name,
      category: next.category,
      order: next.order,
    };
    return agg;
  }, {});

  const relativeTime = new RelativeTime();
  const listDescription = sprintf(t`%d items in this list`, list.items.length);

  return (
    <div className="home-tab open">
      <div className="home-box2 home-itemlist">
        <h3>
          <Link href="/list/[listId]" as={`/list/${list.id}`}>
            <a>{list.name}</a>
          </Link>
        </h3>
        <p>
          <Trans>Click on the list title to view market information for this list.</Trans>
        </p>
        <br />
        <h6>{listDescription}</h6>
        <ul>
          {list.items
            .filter(
              (item: number) =>
                (marketNqData[item] != null || marketHqData[item] != null) &&
                getItem(item, lang) != null
            )
            .map((item: number) => {
              const itemMarketUpdated = marketNqData[item]?.lastUploadTime ?? 0;
              const itemCheapestNq = marketNqData[item]?.listings.find(() => true);
              const itemCheapestHq = marketHqData[item]?.listings.find(() => true);
              const itemInfo = getItem(item, lang)!;
              const itemCat = itemInfo.itemSearchCategory
                ? categoryIndexData[itemInfo.itemSearchCategory]
                : null;
              return (
                <li key={item} style={{ display: 'flex' }}>
                  <div style={{ flex: '0 0 50%' }}>
                    <GameItemIcon id={item} width={32} height={32} />
                    {itemInfo.levelItem > 1 && <em className="ilv">{itemInfo.levelItem}</em>}
                    <Link href="/market/[itemId]" as={`/market/${item}`}>
                      <a className={`rarity-${itemInfo.rarity}`}>{itemInfo.name}</a>
                    </Link>
                    <small>
                      {itemInfo.itemSearchCategory ? itemCat?.name : `(${t`Not Sellable`})`}
                    </small>
                  </div>
                  <div style={{ flex: '0 0 50%' }}>
                    <CheapestListing listing={itemCheapestHq} hq={true} />
                    <CheapestListing listing={itemCheapestNq} hq={false} />
                    <div>
                      <small>
                        <Trans>Last updated:</Trans>{' '}
                        <Suspense>
                          {itemMarketUpdated > 0
                            ? relativeTime.from(new Date(itemMarketUpdated))
                            : t`No data`}
                        </Suspense>
                      </small>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
