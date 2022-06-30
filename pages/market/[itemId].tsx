import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
import GameItemIcon from '../../components/GameItemIcon/GameItemIcon';
import { getRepositoryUrl } from '../../data/game/repository';
import { getSearchIcon } from '../../data/game/xiv-font';
import { acquireConn, releaseConn } from '../../db/connect';
import {
  createUserList,
  getUserListCustom,
  getUserLists,
  RecentlyViewedList,
  updateUserListItems,
  USER_LIST_MAX_ITEMS,
} from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
import { DataCenter } from '../../types/game/DataCenter';
import { Item } from '../../types/game/Item';
import { UserList, UserListCustomType } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import { DoctrineArray } from '../../db/DoctrineArray';
import MarketNav, { ListsDispatchAction } from '../../components/Market/MarketNav/MarketNav';
import MarketDataCenter from '../../components/Market/MarketDataCenter/MarketDataCenter';
import MarketWorld from '../../components/Market/MarketWorld/MarketWorld';

interface MarketProps {
  hasSession: boolean;
  lists: UserList[];
  itemId: number;
  dcs: DataCenter[];
}

const Market: NextPage<MarketProps> = ({ hasSession, lists, itemId, dcs }) => {
  const [settings] = useSettings();

  const router = useRouter();
  const queryServer =
    typeof router.query.server === 'string' && router.query.server.length > 0
      ? router.query.server
      : null;

  const lang = settings['mogboard_language'] ?? 'en';
  const showHomeWorld = settings['mogboard_homeworld'] === 'yes';
  const homeWorld = settings['mogboard_server'] ?? 'Phoenix';
  const dc = dcs.find((x) => x.worlds.some((y) => y.name === (queryServer ?? homeWorld)));
  const [selectedWorld, setSelectedWorld] = useState<string | null>(
    queryServer ?? (showHomeWorld ? homeWorld : null)
  );

  const [stateLists, dispatch] = useReducer((state: UserList[], action: ListsDispatchAction) => {
    switch (action.type) {
      case 'createList':
        if (!state.find((list) => list.id === action.list.id)) {
          state.push(action.list);
        }
        return state;
      case 'addItem':
        const targetAdd = state.find((list) => list.id === action.listId);
        if (targetAdd != null && !targetAdd.items.includes(action.itemId)) {
          targetAdd.items.push(action.itemId);
        }
        return state;
      case 'removeItem':
        const targetRemove = state.find((list) => list.id === action.listId);
        if (targetRemove != null && targetRemove.items.includes(action.itemId)) {
          targetRemove.items.splice(targetRemove.items.indexOf(action.itemId), 1);
        }
        return state;
    }
  }, lists);

  const [item, setItem] = useState<Item | null>(null);
  useEffect(() => {
    const baseUrl = getRepositoryUrl(lang);
    fetch(`${baseUrl}/Item/${itemId}`)
      .then(async (res) => {
        const itemData = await res.json();
        setItem({
          id: itemData.ID,
          name: itemData[`Name_${lang}`],
          description: itemData[`Description_${lang}`],
          icon: `https://xivapi.com${itemData.Icon}`,
          levelItem: itemData.LevelItem,
          levelEquip: itemData.LevelEquip,
          stackSize: itemData.StackSize,
          rarity: itemData.Rarity,
          canBeHq: itemData.CanBeHq === 1,
          itemKind: itemData.ItemKind[`Name_${lang}`],
          itemSearchCategory: {
            id: itemData.ItemSearchCategory.ID,
            name: itemData.ItemSearchCategory[`Name_${lang}`],
          },
          itemUiCategory: {
            id: itemData.ItemUICategory.ID,
            name: itemData.ItemUICategory[`Name_${lang}`],
          },
          classJobCategory: itemData.ClassJobCategory
            ? {
                id: itemData.ClassJobCategory.ID,
                name: itemData.ClassJobCategory[`Name_${lang}`],
              }
            : undefined,
        });
      })
      .catch(console.error);
  }, [lang, itemId]);

  const title = `${item?.name ?? ''} - Universalis`;
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';

  const MarketHead = () => (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <title>{title}</title>
    </Head>
  );

  if (!dc || !item) {
    return <MarketHead />;
  }

  return (
    <>
      <MarketHead />
      <div className="product">
        <div>
          <div className="item_top">
            <div className="item_header">
              <MarketNav
                hasSession={hasSession}
                lists={stateLists}
                dispatch={dispatch}
                itemId={item.id}
              />
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
                        <span className="text-green">{item.levelEquip}</span>{' '}
                        {item.classJobCategory.name}
                      </>
                    )}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: item.description ?? '' }}></div>
                </div>
              </div>
            </div>
            <div className="item_nav_mobile_toggle">
              <button type="button">
                <Trans>Menu</Trans>
              </button>
            </div>
            <div className="item_nav">
              <div className="item_nav_servers">
                <button
                  type="button"
                  className={`btn-summary ${selectedWorld == null ? 'open' : ''}`}
                  onClick={() => setSelectedWorld(null)}
                >
                  <i className="xiv-CrossWorld cw-summary"></i> <Trans>Cross-World</Trans>
                </button>
                {dc.worlds.map((world, i) => {
                  const homeWorld = world.name === settings['mogboard_server'];
                  const icon = homeWorld ? 'xiv-ItemShard cw-home' : '';
                  const className = homeWorld ? 'home-world' : '';
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${className} ${world.name === selectedWorld ? 'open' : ''}`}
                      onClick={() => setSelectedWorld(world.name)}
                    >
                      {homeWorld && <i className={icon}></i>}
                      {world.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="tab">
            <div className={`tab-page tab-summary ${selectedWorld == null ? 'open' : ''}`}>
              <MarketDataCenter item={item} dc={dc} />
            </div>
            {selectedWorld && (
              <div className="tab-page tab-cw open">
                <MarketWorld item={item} worldName={selectedWorld} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { itemId } = ctx.query;
  if (typeof itemId !== 'string') {
    return { notFound: true };
  }

  let itemIdNumber = parseInt(itemId);
  if (isNaN(itemIdNumber)) {
    return { notFound: true };
  }

  const session = await getServerSession(ctx, authOptions);
  const hasSession = !!session;

  let dcs: DataCenter[] = [];
  try {
    const dataCenters: { name: string; worlds: number[] }[] = await fetch(
      'https://universalis.app/api/v3/game/data-centers'
    ).then((res) => res.json());
    const worlds = await fetch('https://universalis.app/api/v3/game/worlds')
      .then((res) => res.json())
      .then((json) =>
        (json as { id: number; name: string }[]).reduce<
          Record<number, { id: number; name: string }>
        >((agg, next) => {
          agg[next.id] = {
            id: next.id,
            name: next.name,
          };
          return agg;
        }, {})
      );
    dcs = (dataCenters ?? []).map((dc) => ({
      name: dc.name,
      worlds: dc.worlds
        .map((worldId) => worlds[worldId])
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  } catch (err) {
    console.error(err);
  }

  let lists: UserList[] = [];
  if (session && session.user.id) {
    const conn = await acquireConn();
    try {
      // Add this item to the user's recently-viewed list, creating it if it doesn't exist.
      const recents = await getUserListCustom(
        session.user.id,
        UserListCustomType.RecentlyViewed,
        conn
      );

      if (recents) {
        const items = new DoctrineArray();
        items.push(...recents.items.filter((item) => item !== itemIdNumber));
        items.unshift(itemIdNumber);
        while (items.length > USER_LIST_MAX_ITEMS) {
          items.pop();
        }

        await updateUserListItems(session.user.id, recents.id, items, conn);
      } else {
        const items = new DoctrineArray();
        items.push(itemIdNumber);
        await createUserList(RecentlyViewedList(uuidv4(), session.user.id, items), conn);
      }

      lists = await getUserLists(session.user.id, conn);
    } catch (err) {
      console.error(err);
    } finally {
      await releaseConn(conn);
    }
  }

  return {
    props: { hasSession, lists, itemId: itemIdNumber, dcs },
  };
}

export default Market;
