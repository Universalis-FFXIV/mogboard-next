import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sprintf } from 'sprintf-js';
import { getItems } from '../../../data/game/items';
import useSettings from '../../../hooks/useSettings';
import { CategoryItem } from '../../../types/game/CategoryItem';
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

  const itemIdsStr = `0,${list.items.join()}`;

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

  const [categoriesIndex, setCategoriesIndex] = useState<ItemSearchCategory[]>([]);
  useEffect(() => {
    (async () => {
      const isc: XIVAPIItemSearchCategoryIndex = await fetch(
        `https://xivapi.com/ItemSearchCategory?columns=ID,Name,Category,Order&language=${
          lang as string
        }`
      ).then((res) => res.json());
      setCategoriesIndex(
        isc.Results.map((r) => ({
          id: r.ID,
          name: r.Name,
          category: r.Category,
          order: r.Order,
        }))
      );
    })();
  }, [lang]);

  const [items, setItems] = useState<
    Record<number, { categoryId: number | null } & Omit<CategoryItem, 'id'>>
  >({});
  useEffect(() => {
    (async () => {
      const data = await getItems(lang);
      setItems(data);
    })();
  }, [lang]);

  if (marketNq.error) {
    console.error(marketNq.error);
    return <div />;
  }

  if (marketHq.error) {
    console.error(marketHq.error);
    return <div />;
  }

  const marketNqData = marketNq.data?.items ?? {};
  const marketHqData = marketHq.data?.items ?? {};
  const categoryIndexData = (categoriesIndex ?? []).reduce<
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
                (marketNqData[item] != null || marketHqData[item] != null) && items[item] != null
            )
            .map((item: number) => {
              const itemMarketUpdated = marketNqData[item]?.lastUploadTime ?? 0;
              const itemCheapestNq = marketNqData[item]?.listings.find(() => true);
              const itemCheapestHq = marketHqData[item]?.listings.find(() => true);
              const itemInfo = items[item];
              const itemCat = itemInfo.categoryId ? categoryIndexData[itemInfo.categoryId] : null;
              return (
                <li key={item} style={{ display: 'flex' }}>
                  <div style={{ flex: '0 0 50%' }}>
                    <GameItemIcon id={item} width={32} height={32} />
                    {itemInfo.levelItem > 1 && <em className="ilv">{itemInfo.levelItem}</em>}
                    <Link href={`/market/${item}`}>
                      <a className={`rarity-${itemInfo.rarity}`}>{itemInfo.name}</a>
                    </Link>
                    <small>{itemInfo.categoryId ? itemCat?.name : `(${t`Not Sellable`})`}</small>
                  </div>
                  <div style={{ flex: '0 0 50%' }}>
                    <CheapestListing listing={itemCheapestHq} hq={true} />
                    <CheapestListing listing={itemCheapestNq} hq={false} />
                    <div>
                      <small>
                        <Trans>Last updated:</Trans>{' '}
                        {itemMarketUpdated > 0
                          ? relativeTime.from(new Date(itemMarketUpdated))
                          : 'No data'}
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
