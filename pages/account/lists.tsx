import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import Head from 'next/head';
import Link from 'next/link';
import { useReducer } from 'react';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import GameIcon from '../../components/GameIcon/GameIcon';
import { usePopup } from '../../components/UniversalisLayout/components/Popup/Popup';
import { getItem, getItemKind, getItemSearchCategory } from '../../data/game';
import { acquireConn, releaseConn } from '../../db/connect';
import { getUserLists } from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
import { Item } from '../../types/game/Item';
import { UserList } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';

interface ListsProps {
  hasSession: boolean;
  lists: UserList[];
}

type ListsAction = { type: 'deleteList'; listId: string };

interface ListOverviewProps {
  list: UserList;
  items: Record<number, Item>;
  dispatch: (action: ListsAction) => void;
}

function ListOverview({ list, items, dispatch }: ListOverviewProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] || 'en';

  const { setPopup } = usePopup();

  const handleErr = async (res: Response) => {
    if (!res.ok) {
      const body = res.headers.get('Content-Type')?.includes('application/json')
        ? (await res.json()).message
        : await res.text();
      throw new Error(body);
    }
  };

  const popupErr = (err: any) => {
    setPopup({
      type: 'error',
      title: 'Error',
      message: err instanceof Error ? err.message : `${err}`,
      isOpen: true,
    });
  };

  const deleteList = (id: string) => {
    fetch(`/api/web/lists/${id}`, {
      method: 'DELETE',
    })
      .then(async (res) => {
        await handleErr(res);
        dispatch({ type: 'deleteList', listId: id });
      })
      .catch(popupErr);
  };

  return (
    <div className="lists">
      <h3>
        <Trans>Items:</Trans> {list.items.length} -{' '}
        <Link href="/list/[listId]" as={`/list/${list.id}`}>
          <a>{list.name}</a>
        </Link>
      </h3>
      <ul>
        {(list.items as number[])
          .filter((itemId) => items[itemId] != null)
          .map((itemId) => {
            const item = items[itemId];
            return (
              <li key={itemId}>
                <GameIcon
                  id={item.iconId}
                  ext="png"
                  size="1x"
                  width={36}
                  height={36}
                  className="list-item"
                />
                <span>
                  {item.levelItem > 1 && <em className="ilv">{item.levelItem}</em>}
                  <Link href="/market/[itemId]" as={`/market/${item.id}`}>
                    <a className={`rarity-${item.rarity}`}>{item.name}</a>
                  </Link>
                  <small>
                    {getItemKind(item.itemKind, lang)?.name} -{' '}
                    {getItemSearchCategory(item.itemSearchCategory, lang)?.name}
                  </small>
                </span>
              </li>
            );
          })}
      </ul>
      {!list.custom && (
        <div className="delete-list-block">
          <a className="text-red fr" onClick={() => deleteList(list.id)}>
            <Trans>Delete List</Trans>
          </a>
        </div>
      )}
    </div>
  );
}

const Lists: NextPage<ListsProps> = ({ hasSession, lists }) => {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] || 'en';

  const [listsState, dispatch] = useReducer((state: UserList[], action: ListsAction) => {
    const listIdx = state.findIndex((list) => list.id === action.listId);
    if (listIdx === -1) {
      return state;
    }

    const next = state.slice(0);
    next.splice(listIdx, 1);
    return next;
  }, lists);

  const items = lists
    .map((list) => list.items)
    .flat()
    .reduce<Record<number, Item>>((agg, next) => {
      if (agg[next]) {
        return agg;
      }

      const item = getItem(next, lang);
      if (item == null) {
        return agg;
      }

      return { ...agg, ...{ [next]: item } };
    }, {});

  const title = 'Lists - Universalis';
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';
  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="description" content={description} />
        <title>{title}</title>
      </Head>
      <AccountLayout section="lists" hasSession={hasSession}>
        <h5>
          <Trans>Lists</Trans>
        </h5>
        <div className="account-panel">
          {listsState
            .sort((a, b) => b.updated - a.updated)
            .map((list) => (
              <ListOverview key={list.id} list={list} items={items} dispatch={dispatch} />
            ))}
          {listsState.length === 0 && (
            <div>
              <Trans>You have no lists, visit some items and create some!</Trans>
            </div>
          )}
        </div>
      </AccountLayout>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
  const hasSession = !!session;

  let lists: UserList[] = [];
  if (session && session.user.id) {
    const conn = await acquireConn();
    try {
      lists = await getUserLists(session.user.id, conn);
    } catch (err) {
      console.error(err);
    } finally {
      await releaseConn(conn);
    }
  }

  return {
    props: {
      hasSession,
      lists,
    },
  };
}

export default Lists;
