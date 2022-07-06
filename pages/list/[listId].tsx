import { t, Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import Head from 'next/head';
import { useState, useEffect, useRef, useReducer } from 'react';
import { sprintf } from 'sprintf-js';
import ListHeader from '../../components/List/ListHeader/ListHeader';
import ListItem from '../../components/List/ListItem/ListItem';
import ListRenameModal from '../../components/List/ListRenameModal/ListRenameModal';
import { useModalCover } from '../../components/UniversalisLayout/components/ModalCover/ModalCover';
import { usePopup } from '../../components/UniversalisLayout/components/Popup/Popup';
import { getItem } from '../../data/game';
import { acquireConn, releaseConn } from '../../db/connect';
import * as userDb from '../../db/user';
import * as listDb from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
import { getServers } from '../../service/servers';
import { DataCenter } from '../../types/game/DataCenter';
import { Item } from '../../types/game/Item';
import { UserList } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';

interface ListProps {
  dcs: DataCenter[];
  list: UserList;
  reqIsOwner: boolean;
  ownerName: string;
}

type ListsAction = { type: 'removeItem'; itemId: number } | { type: 'renameList'; name: string };

const List: NextPage<ListProps> = ({ dcs, list, reqIsOwner, ownerName }) => {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] ?? 'en';

  const [newName, setNewName] = useState(list.name);
  const [updating, setUpdating] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);

  const submitRef = useRef<HTMLButtonElement>(null);

  const { setPopup } = usePopup();
  const { setModalCover } = useModalCover();

  const openRenameModal = () => {
    setRenameModalOpen(true);
    setModalCover({ isOpen: true });
  };

  const closeRenameModal = () => {
    setRenameModalOpen(false);
    setModalCover({ isOpen: false });
  };

  const [stateList, dispatch] = useReducer((state: UserList, action: ListsAction) => {
    switch (action.type) {
      case 'removeItem':
        if (state.items.includes(action.itemId)) {
          state.items.splice(state.items.indexOf(action.itemId), 1);
        }
        return { ...state };
      case 'renameList':
        if (state.name !== action.name) {
          state.name = action.name;
        }
        return state;
    }
  }, list);

  const updateList = (data: ListsAction) => {
    const payload =
      data.type === 'removeItem'
        ? { item: { action: 'remove', itemId: data.itemId } }
        : { name: data.name };
    fetch(`/api/web/lists/${stateList.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }

        if (data.type === 'renameList') {
          closeRenameModal();
          dispatch(data);
          setPopup({
            type: 'success',
            title: 'Renamed list',
            message: 'You have renamed your list!',
            isOpen: true,
          });
        }

        if (data.type === 'removeItem') {
          dispatch(data);
        }
      })
      .catch((err) =>
        setPopup({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : `${err}`,
          isOpen: true,
        })
      )
      .finally(() => setUpdating(false));
  };

  const [showHomeWorld, setShowHomeWorld] = useState(settings['mogboard_homeworld'] === 'yes');
  const world = settings['mogboard_server'] ?? 'Phoenix';
  const dc = dcs.find((x) => x.worlds.some((y) => y.name === world));
  const server = showHomeWorld ? world : dc?.name ?? 'Chaos';

  const itemIds = list.items.length <= 1 ? `0,${list.items[0]}` : list.items.join();

  const [market, setMarket] = useState<any>(null);
  useEffect(() => {
    if (stateList.items.length === 0 || market) {
      return;
    }

    fetch(`https://universalis.app/api/v2/${server}/${itemIds}?listings=5&entries=5`)
      .then((res) => res.json())
      .then(setMarket)
      .catch(console.error);
  }, [stateList.items, itemIds, market, server]);

  const items = stateList.items.reduce<Record<number, Item>>((agg, next) => {
    const item = getItem(next, lang);
    if (item == null) {
      return agg;
    }

    return { ...agg, ...{ [next]: item } };
  }, {});

  const title = stateList.name + ' - ' + t`List` + ' - Universalis';
  const description = sprintf(t`Custom Universalis list by %s`, ownerName);
  const ListHead = () => (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <title>{title}</title>
    </Head>
  );

  if (list.items.length > 0 && !market) {
    return <ListHead />;
  }

  return (
    <>
      <ListHead />
      <div className="pl">
        <ListHeader
          list={stateList}
          reqIsOwner={reqIsOwner}
          openRenameModal={openRenameModal}
          showHomeWorld={showHomeWorld}
          setShowHomeWorld={setShowHomeWorld}
        />
        {stateList.items.map((itemId) => (
          <ListItem
            key={itemId}
            itemId={itemId}
            item={items[itemId]}
            market={market}
            reqIsOwner={reqIsOwner}
            showHomeWorld={showHomeWorld}
            removeItem={(itemId) => updateList({ type: 'removeItem', itemId })}
            lang={lang}
          />
        ))}
        {stateList.items.length === 0 && (
          <div className="alert-dark">
            <Trans>You have no items in this list.</Trans>
          </div>
        )}
      </div>
      <ListRenameModal
        renameModalOpen={renameModalOpen}
        closeRenameModal={closeRenameModal}
        name={newName}
        setName={setNewName}
        submitRef={submitRef}
        updating={updating}
        setUpdating={setUpdating}
        updateList={({ name }) => updateList({ type: 'renameList', name })}
      />
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let { listId } = ctx.query;
  if (typeof listId !== 'string') {
    return { notFound: true };
  }

  let dcs: DataCenter[] = [];
  try {
    const servers = await getServers();
    dcs = servers.dcs.map((dc) => ({
      name: dc.name,
      worlds: dc.worlds.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  } catch (err) {
    console.error(err);
  }

  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

  let list: UserList | null = null;
  let reqIsOwner = false;
  let ownerName = 'unknown user';
  if (listId != null) {
    try {
      const conn = await acquireConn();
      try {
        list = await listDb.getUserList(listId, conn);
        if (list == null) {
          return { notFound: true };
        }

        if (list.userId != null) {
          const owner = await userDb.getUser(list.userId, conn);
          if (owner != null) {
            reqIsOwner = owner.id === session?.user.id;
            ownerName = owner.username;
          }
        }
      } finally {
        await releaseConn(conn);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return {
    props: { list, reqIsOwner, ownerName, dcs },
  };
}

export default List;
