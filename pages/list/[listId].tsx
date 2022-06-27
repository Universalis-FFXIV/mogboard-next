import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useEffect, useRef, useMemo } from 'react';
import { sprintf } from 'sprintf-js';
import useSWR from 'swr';
import GameItemIcon from '../../components/GameItemIcon/GameItemIcon';
import ItemHeader from '../../components/ItemHeader/ItemHeader';
import ListingsTable from '../../components/ListingsTable/ListingsTable';
import SalesTable from '../../components/SalesTable/SalesTable';
import Tooltip from '../../components/Tooltip/Tooltip';
import { useModalCover } from '../../components/UniversalisLayout/components/ModalCover/ModalCover';
import { usePopup } from '../../components/UniversalisLayout/components/Popup/Popup';
import { getRepositoryUrl } from '../../data/game/repository';
import { acquireConn, releaseConn } from '../../db/connect';
import * as userDb from '../../db/user';
import * as listDb from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
import { DataCenter } from '../../types/game/DataCenter';
import { Item } from '../../types/game/Item';
import { User, UserList } from '../../types/universalis/user';

interface UserClean {
  id: string;
  username: string;
}

interface ListProps {
  dcs: DataCenter[];
  list: UserList;
  owner: UserClean | null;
}

interface ListItemMarketProps {
  item?: Item;
  market: any;
  showHomeWorld: boolean;
}

function ListItemMarket({ item, market, showHomeWorld }: ListItemMarketProps) {
  if (item == null) {
    return <div />;
  }

  const marketFailed = t`Market info could not be fetched for: %s at this time.`;
  if (market == null) {
    return <div className="alert-light">{sprintf(marketFailed, item.name)}</div>;
  }

  const relativeTime = new RelativeTime();
  return (
    <div className="flex">
      <div className="flex_50 pl_mt_p">
        <div className="pl-mt">
          <h3>
            <Trans>Top 5 cheapest</Trans>
          </h3>
          <div>
            <ListingsTable
              market={market}
              crossWorld={!showHomeWorld}
              includeDiff={false}
              start={0}
              end={5}
            />
          </div>
        </div>
      </div>
      <div className="flex_50 pl_mt_h">
        <div className="pl-mt">
          <h3>
            <Trans>Last 5 sales</Trans>
          </h3>
          <div>
            <SalesTable
              market={market}
              crossWorld={!showHomeWorld}
              includeDiff={false}
              start={0}
              end={5}
            />
          </div>
          <small>
            <Trans>Last updated:</Trans> {relativeTime.from(new Date(market.lastUploadTime))}
          </small>
        </div>
      </div>
    </div>
  );
}

const List: NextPage<ListProps> = ({ dcs, list, owner }) => {
  const [settings] = useSettings();
  const session = useSession();

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
  const itemIds = list.items.join();

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
                name: data.Name,
                icon: `https://xivapi.com${data.Icon}`,
                levelItem: data.LevelItem,
                rarity: data.Rarity,
                itemKind: data.ItemKind.Name,
                itemSearchCategory: {
                  id: data.ItemSearchCategory.ID,
                  name: data.ItemSearchCategory.Name,
                },
                classJobCategory: data.ClassJobCategory
                  ? {
                      id: data.ClassJobCategory.ID,
                      name: data.ClassJobCategory.Name,
                    }
                  : undefined,
              },
            },
          };
        });
      }
    })();
  }, [lang, items, listItemIds]);

  const userId = session.data?.user.id;
  const ownerId = owner?.id;

  if (market.error) {
    console.error(market.error);
  }

  const title = list.name + ' - ' + t`List` + ' - Universalis';
  const description = sprintf(t`Custom Universalis list by %s`, owner?.username ?? '');
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

  const nOfMItems = sprintf(t`%d / %d items`, list.items.length, 100);

  return (
    <>
      <ListHead />

      <div className="pl">
        <small>
          <Trans>LIST</Trans>
        </small>
        <h1>
          {list.name}
          <span>
            <a className="link_rename_list" onClick={() => openRenameModal()}>
              <Trans>Rename</Trans>
            </a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            {nOfMItems}
            &nbsp;&nbsp;|&nbsp;&nbsp;
            {showHomeWorld ? (
              <a onClick={() => setShowHomeWorld(false)}>
                <Trans>Show Cross-World</Trans>
              </a>
            ) : (
              <a onClick={() => setShowHomeWorld(true)}>
                <Trans>Show Home Server Only</Trans>
              </a>
            )}
          </span>
        </h1>
        {listItemIds.map((itemId) => (
          <div key={itemId} className="pl_i">
            <div>
              <GameItemIcon id={itemId} height={100} width={100} />
            </div>
            <div>
              <h2>
                <ItemHeader item={items[itemId]} />
                {session && userId && userId === ownerId && (
                  <Tooltip
                    label={
                      <div style={{ textAlign: 'center', width: 140 }}>
                        <Trans>Remove item from list</Trans>
                      </div>
                    }
                  >
                    <a
                      className="pl_remove"
                      onClick={() => {
                        const newListItemIds = listItemIds;
                        newListItemIds.splice(newListItemIds.indexOf(itemId), 1);
                        updateList({ items: newListItemIds });
                      }}
                    >
                      <i className="xiv-NavigationClose"></i>
                    </a>
                  </Tooltip>
                )}
              </h2>
              <ListItemMarket
                item={items[itemId]}
                market={market.data.items[itemId]}
                showHomeWorld={showHomeWorld}
              />
            </div>
          </div>
        ))}
        {listItemIds.length === 0 && (
          <div className="alert-dark">
            <Trans>You have no items in this list.</Trans>
          </div>
        )}
      </div>
      <div className={`modal list_rename_modal ${renameModalOpen ? 'open' : ''}`}>
        <button type="button" className="modal_close_button" onClick={() => closeRenameModal()}>
          <i className="xiv-NavigationClose"></i>
        </button>
        <div className="modal_row">
          <div className="modal_form_row_1">
            <h1>
              <Trans>Rename List</Trans>
            </h1>
          </div>
          <form method="post" className="modal_form rename_list_form">
            <div>
              <input
                name="list_name"
                id="list_name"
                type="text"
                placeholder="Name"
                className="full"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <br />
            <br />
            <div className="modal_form_end">
              <button
                ref={submitRef}
                type="submit"
                disabled={updating}
                className={`btn-green btn_rename_list ${updating ? 'loading_interaction' : ''}`}
                style={
                  updating
                    ? {
                        minWidth: submitRef.current?.offsetWidth,
                        minHeight: submitRef.current?.offsetHeight,
                        display: 'inline-block',
                      }
                    : undefined
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (newName != null) {
                    setUpdating(true);
                    updateList({ name: newName });
                  }
                }}
              >
                {updating ? <>&nbsp;</> : <Trans>Rename List</Trans>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let { listId } = ctx.query;
  if (typeof listId !== 'string') {
    return { redirect: '/404' };
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

  let list: UserList | null = null;
  let owner: User | null = null;
  if (listId != null) {
    try {
      const conn = await acquireConn();
      try {
        list = await listDb.getUserList(listId, conn);
        if (list == null) {
          return { redirect: '/404' };
        }

        if (list.userId != null) {
          owner = await userDb.getUser(list.userId, conn);
        }
      } finally {
        await releaseConn(conn);
      }
    } catch (err) {
      console.error(err);
    }
  }

  let ownerClean: UserClean | null = null;
  if (owner != null) {
    ownerClean = {
      id: owner.id,
      username: owner.username,
    };
  }

  return {
    props: { list, owner: ownerClean, dcs },
  };
}

export default List;
