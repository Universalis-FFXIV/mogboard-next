import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { NextPage, NextPageContext } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { sprintf } from 'sprintf-js';
import useSWR from 'swr';
import GameItemIcon from '../../components/GameItemIcon/GameItemIcon';
import ItemHeader from '../../components/ItemHeader/ItemHeader';
import ListingsTable from '../../components/ListingsTable/ListingsTable';
import SalesTable from '../../components/SalesTable/SalesTable';
import Tooltip from '../../components/Tooltip/Tooltip';
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
  list: UserList | null;
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

  const lang = settings['mogboard_language'] ?? 'en';
  const showHomeWorld = settings['mogboard_homeworld'] === 'yes';
  const world = settings['mogboard_server'] ?? 'Phoenix';
  const dc = dcs.find((x) => x.worlds.some((y) => y.name === world));
  const server = showHomeWorld ? world : dc?.name ?? 'Chaos';

  const listItems = list?.items as number[];
  const itemIds = list?.items.join() ?? '0';

  const market = useSWR(
    `https://universalis.app/api/v2/${server}/${itemIds}?listings=5&entries=5`,
    async (path) => {
      const data = await fetch(path).then((res) => res.json());
      return data;
    }
  );

  const [items, setItems] = useState<Record<number, Item>>({});
  useEffect(() => {
    (async () => {
      if (listItems == null) {
        return;
      }

      const baseUrl = getRepositoryUrl(lang);
      for (const itemId of listItems) {
        let data: any = null;
        do {
          const res = await fetch(`${baseUrl}/Item/${itemId}`);
          if (res.status === 429) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
          } else {
            data = await res.json();
          }
        } while (data == null);

        setItems((last) => ({
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
        }));
      }
    })();
  }, [lang, listItems]);

  const userId = session.data?.user.id;
  const ownerId = owner?.id;

  if (market.error) {
    console.error(market.error);
  }

  if (list == null || !market.data) {
    return <div />;
  }

  const title = list.name + ' - ' + t`List`;
  const description = sprintf(t`Custom Universalis list by %s`, owner?.username ?? '');

  const nOfMItems = sprintf(t`%d / %d items`, list.items.length, 100);

  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="description" content={description} />
        <title>{title}</title>
      </Head>

      <div className="pl">
        <small>
          <Trans>LIST</Trans>
        </small>
        <h1>
          {list.name}
          <span>
            <a className="link_rename_list">
              <Trans>Rename</Trans>
            </a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            {nOfMItems}
            &nbsp;&nbsp;|&nbsp;&nbsp;
            {settings['mogboard_homeworld'] === 'yes' ? (
              <a>
                <Trans>Show Cross-World</Trans>
              </a>
            ) : (
              <a>
                <Trans>Show Home Server Only</Trans>
              </a>
            )}
          </span>
        </h1>
        {listItems.map((itemId) => (
          <div key={itemId} className="pl_i">
            <div>
              <GameItemIcon id={itemId} height={100} width={100} />
            </div>
            <div>
              <h2>
                <ItemHeader item={items[itemId]} />
                {session && userId && userId === ownerId && (
                  <Tooltip label={t`Remove item from list`}>
                    <a className="pl_remove">
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
        {list.items.length === 0 && (
          <div className="alert-dark">
            <Trans>You have no items in this list.</Trans>
          </div>
        )}
      </div>
      <div className="modal list_rename_modal">
        <button type="button" className="modal_close_button">
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
                defaultValue={list.name}
              />
            </div>
            <br />
            <br />
            <div className="modal_form_end">
              <button type="submit" className="btn-green btn_rename_list">
                <Trans>Rename List</Trans>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(ctx: NextPageContext) {
  let { listId } = ctx.query;
  if (typeof listId !== 'string') {
    listId = undefined;
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
  try {
    const conn = await acquireConn();
    try {
      list = await listDb.getUserList(listId, conn);
      if (list?.userId != null) {
        owner = await userDb.getUser(list.userId, conn);
      }
    } finally {
      await releaseConn(conn);
    }
  } catch (err) {
    console.error(err);
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
