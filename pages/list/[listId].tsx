import { t, Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import { useState, useEffect, useRef, useMemo } from 'react';
import { sprintf } from 'sprintf-js';
import useSWR from 'swr';
import ListHeader from '../../components/List/ListHeader/ListHeader';
import ListItem from '../../components/List/ListItem/ListItem';
import ListRenameModal from '../../components/List/ListRenameModal/ListRenameModal';
import { useModalCover } from '../../components/UniversalisLayout/components/ModalCover/ModalCover';
import { usePopup } from '../../components/UniversalisLayout/components/Popup/Popup';
import { getRepositoryUrl } from '../../data/game/repository';
import { acquireConn, releaseConn } from '../../db/connect';
import * as userDb from '../../db/user';
import * as listDb from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
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

const List: NextPage<ListProps> = ({ dcs, list, reqIsOwner, ownerName }) => {
  const [settings] = useSettings();

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
    setRenameModalOpen(true);
    setModalCover({ isOpen: true });
  };

  const updateList = (
    data: Partial<Pick<UserList, 'name' | 'items'>>,
    options?: { reload?: boolean }
  ) => {
    fetch(`/api/web/lists/${list.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }

        if (renameModalOpen) {
          closeRenameModal();
          setPopup({
            type: 'success',
            title: 'Renamed list',
            message: 'You have renamed your list!',
            isOpen: true,
            forceOpen: true,
          });
        }

        if (options?.reload == null || options.reload) {
          location.reload();
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

  const lang = settings['mogboard_language'] ?? 'en';
  const [showHomeWorld, setShowHomeWorld] = useState(settings['mogboard_homeworld'] === 'yes');
  const world = settings['mogboard_server'] ?? 'Phoenix';
  const dc = dcs.find((x) => x.worlds.some((y) => y.name === world));
  const server = showHomeWorld ? world : dc?.name ?? 'Chaos';

  const listItemIds = useMemo<number[]>(() => list.items, [list.items]);
  const itemIds = `0,${list.items.join()}`;

  const market = useSWR(
    `https://universalis.app/api/v2/${server}/${itemIds}?listings=5&entries=5`,
    async (path) => {
      if (listItemIds.length === 0) {
        return null;
      }

      const data = await fetch(path).then((res) => res.json());
      return data;
    }
  );

  const [items, setItems] = useState<Record<number, Item>>({});
  useEffect(() => {
    (async () => {
      if (Object.keys(items).length > 0) {
        return;
      }

      const baseUrl = getRepositoryUrl(lang);
      for (const itemId of listItemIds) {
        if (items[itemId]) {
          continue;
        }

        let data: any = null;
        do {
          const res = await fetch(`${baseUrl}/Item/${itemId}`);
          if (res.status === 429) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
          } else {
            data = await res.json();
          }
        } while (data == null);

        setItems((last) => {
          return {
            ...last,
            ...{
              [itemId]: {
                id: data.ID,
                name: data[`Name_${lang}`],
                icon: `https://xivapi.com${data.Icon}`,
                levelItem: data.LevelItem,
                rarity: data.Rarity,
                itemKind: data.ItemKind[`Name_${lang}`],
                itemSearchCategory: {
                  id: data.ItemSearchCategory.ID,
                  name: data.ItemSearchCategory[`Name_${lang}`],
                },
                itemUiCategory: {
                  id: data.ItemUICategory.ID,
                  name: data.ItemUICategory[`Name_${lang}`],
                },
                classJobCategory: data.ClassJobCategory
                  ? {
                      id: data.ClassJobCategory.ID,
                      name: data.ClassJobCategory[`Name_${lang}`],
                    }
                  : undefined,
              },
            },
          };
        });
      }
    })();
  }, [lang, items, listItemIds]);

  if (market.error) {
    console.error(market.error);
  }

  const title = list.name + ' - ' + t`List` + ' - Universalis';
  const description = sprintf(t`Custom Universalis list by %s`, ownerName);
  const ListHead = () => (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <title>{title}</title>
    </Head>
  );

  if (listItemIds.length > 0 && !market.data) {
    return <ListHead />;
  }

  return (
    <>
      <ListHead />
      <div className="pl">
        <ListHeader
          list={list}
          reqIsOwner={reqIsOwner}
          openRenameModal={openRenameModal}
          showHomeWorld={showHomeWorld}
          setShowHomeWorld={setShowHomeWorld}
        />
        {listItemIds.map((itemId) => (
          <ListItem
            key={itemId}
            item={items[itemId]}
            listItemIds={listItemIds}
            market={market}
            reqIsOwner={reqIsOwner}
            showHomeWorld={showHomeWorld}
            updateList={updateList}
          />
        ))}
        {listItemIds.length === 0 && (
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
        updateList={updateList}
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
      worlds: dc.worlds.map((worldId) => worlds[worldId]),
    }));
  } catch (err) {
    console.error(err);
  }

  const session = await getServerSession(ctx, authOptions);

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
