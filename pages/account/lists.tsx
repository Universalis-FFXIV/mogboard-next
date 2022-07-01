import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import GameIcon from '../../components/GameIcon/GameIcon';
import { usePopup } from '../../components/UniversalisLayout/components/Popup/Popup';
import { getItemSearchCategory } from '../../data/game';
import { acquireConn, releaseConn } from '../../db/connect';
import { getUserLists } from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
import { Item } from '../../types/game/Item';
import { UserList } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';

interface ListsProps {
  hasSession: boolean;
  lists: UserList[];
  items: Record<number, Item>;
}

const Lists: NextPage<ListsProps> = ({ hasSession, lists, items }) => {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

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
        location.reload();
      })
      .catch(popupErr);
  };

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
          {lists.map((list) => (
            <div key={list.id} className="lists">
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
                        <GameIcon id={item.iconId} ext="png" size="1x" width={36} height={36} />
                        {item.levelItem > 1 && <em className="ilv">{item.levelItem}</em>}
                        <Link href={`/market/${itemId}`}>
                          <a className={`rarity-${item.rarity}`}>{item.name}</a>
                        </Link>
                        <small>
                          {item.itemKind} -{' '}
                          {getItemSearchCategory(item.itemSearchCategory, lang)?.name}
                        </small>
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
          ))}
          {lists.length === 0 && (
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
  const session = await getServerSession(ctx, authOptions);
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
