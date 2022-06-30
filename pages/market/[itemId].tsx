import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
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
import { ListsDispatchAction } from '../../components/Market/MarketNav/MarketNav';
import MarketDataCenter from '../../components/Market/MarketDataCenter/MarketDataCenter';
import MarketWorld from '../../components/Market/MarketWorld/MarketWorld';
import MarketServerSelector from '../../components/Market/MarketServerSelector/MarketServerSelector';
import MarketItemHeader from '../../components/Market/MarketItemHeader/MarketItemHeader';
import { getItem } from '../../data/game/items';

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
    getItem(itemId, lang).then(setItem).catch(console.error);
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
            <MarketItemHeader
              hasSession={hasSession}
              item={item}
              stateLists={stateLists}
              dispatch={dispatch}
            />
            <div className="item_nav_mobile_toggle">
              <button type="button">
                <Trans>Menu</Trans>
              </button>
            </div>
            <div className="item_nav">
              <MarketServerSelector
                dc={dc}
                selectedWorld={selectedWorld}
                setSelectedWorld={setSelectedWorld}
              />
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
