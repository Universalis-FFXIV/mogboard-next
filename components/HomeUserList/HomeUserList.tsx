import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import Link from 'next/link';
import { sprintf } from 'sprintf-js';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSettings from '../../hooks/useSettings';
import { CategoryItem } from '../../types/game/CategoryItem';
import { DataCenter } from '../../types/game/DataCenter';
import { ItemSearchCategory } from '../../types/game/ItemSearchCategory';
import { UserList } from '../../types/universalis/user';
import { XIVAPIItemSearchCategoryIndex } from '../../types/xivapi/XIVAPIItemSearchCategoryIndex';
import GameItemIcon from '../GameItemIcon/GameItemIcon';

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
  const lang: string = settings['mogboard_language'] ?? 'en';

  const itemIdsStr = list.items.reduce<string>((agg, next) => `${agg},${next}`, '');
  const marketNq = useSWR(
    `https://universalis.app/api/v2/${dc?.name ?? 'Chaos'}/${itemIdsStr}?listings=1&entries=0&hq=0`,
    async (path) => {
      const res = await fetch(path).then((res) => res.json());
      return res;
    }
  );
  const marketHq = useSWR(
    `https://universalis.app/api/v2/${dc?.name ?? 'Chaos'}/${itemIdsStr}?listings=1&entries=0&hq=1`,
    async (path) => {
      const res = await fetch(path).then((res) => res.json());
      return res;
    }
  );

  const categoriesIndex = useSWRImmutable<ItemSearchCategory[]>(
    `https://xivapi.com/ItemSearchCategory?columns=ID,Name,Category,Order&language=${lang}`,
    async (path) => {
      const isc: XIVAPIItemSearchCategoryIndex = await fetch(path).then((res) => res.json());
      return isc.Results.map((r) => ({
        id: r.ID,
        name: r.Name,
        category: r.Category,
        order: r.Order,
      }));
    }
  );

  const categories = useSWRImmutable(`/data/categories_${lang}.js`, async (path) => {
    const categories: Record<number, [string, string, string, string, string, string][]> =
      await fetch(path).then((res) => res.json());
    return categories;
  });

  if (marketNq.error) {
    console.error(marketNq.error);
    return <div />;
  }

  if (marketHq.error) {
    console.error(marketHq.error);
    return <div />;
  }

  if (categories.error) {
    console.error(categories.error);
    return <div />;
  }

  if (categoriesIndex.error) {
    console.error(categories.error);
    return <div />;
  }

  const marketNqData = marketNq.data?.items ?? {};
  const marketHqData = marketHq.data?.items ?? {};
  const categoryData = Object.entries(categories.data ?? {}).reduce<
    Record<number, { categoryId: number | null } & Omit<CategoryItem, 'id'>>
  >((agg, [catId, next]) => {
    for (const x of next) {
      agg[parseInt(x[0])] = {
        categoryId: isNaN(parseInt(catId)) ? null : parseInt(catId),
        name: x[1],
        icon: `https://xivapi.com${x[2]}`,
        levelItem: parseInt(x[3]),
        rarity: parseInt(x[4]),
        classJobs: x[5],
      };
    }
    return agg;
  }, {});
  const categoryIndexData = (categoriesIndex.data ?? []).reduce<
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
          <Link href={`/list/${list.id}`}>
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
                categoryData[item] != null
            )
            .map((item: number) => {
              const itemMarketUpdated = marketNqData[item]?.lastUploadTime ?? 0;
              const itemCheapestNq = marketNqData[item]?.listings.find(() => true);
              const itemCheapestHq = marketHqData[item]?.listings.find(() => true);
              const itemInfo = categoryData[item];
              const itemCat = itemInfo.categoryId ? categoryIndexData[itemInfo.categoryId] : null;
              return (
                <li key={item} style={{ display: 'flex' }}>
                  <div style={{ flex: '0 0 50%' }}>
                    <GameItemIcon id={item} width={32} height={32} />
                    {itemInfo.levelItem > 1 && <em className="ilv">{itemInfo.levelItem}</em>}
                    <a href={`/market/${item}`} className={`rarity-${itemInfo.rarity}`}>
                      {itemInfo.name}
                    </a>
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
