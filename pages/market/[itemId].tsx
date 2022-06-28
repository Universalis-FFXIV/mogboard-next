import { t, Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { sprintf } from 'sprintf-js';
import useSWR from 'swr';
import GameItemIcon from '../../components/GameItemIcon/GameItemIcon';
import LoggedIn from '../../components/LoggedIn/LoggedIn';
import { getRepositoryUrl } from '../../data/game/repository';
import { getSearchIcon } from '../../data/game/xiv-font';
import { acquireConn, releaseConn } from '../../db/connect';
import { getUserLists } from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
import { DataCenter } from '../../types/game/DataCenter';
import { Item } from '../../types/game/Item';
import { UserList } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';

interface MarketListsProps {
  hasSession: boolean;
  lists: UserList[];
  favourite: boolean;
  itemId: number;
}

interface MarketDataCenterProps {
  item: Item;
  dc: DataCenter;
}

interface MarketWorldProps {
  item: Item;
  worldName: string;
}

interface MarketProps {
  hasSession: boolean;
  lists: UserList[];
  itemId: number;
  dcs: DataCenter[];
}

function MarketLists({ hasSession, lists, favourite, itemId }: MarketListsProps) {
  return (
    <div className="box box_lists">
      <div className="box_form">
        <div className="box_flex form">
          <a
            href={`https://www.garlandtools.org/db/#item/${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button" className="btn btn_gt">
              <Trans>Show on GarlandTools</Trans>
            </button>
          </a>
          <a
            href={`https://ffxivteamcraft.com/db/en/item/${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button" className="btn btn_gt">
              <Trans>Show on Teamcraft</Trans>
            </button>
          </a>
          <LoggedIn hasSession={hasSession}>
            <button className="btn_addto_list" style={{ marginRight: 4 }}>
              <Trans>Lists</Trans>
            </button>
            <button className={`btn_addto_fave ${favourite ? 'on' : ''}`}>
              <span>{favourite ? <Trans>Faved</Trans> : <Trans>Favourite</Trans>}</span>
            </button>
          </LoggedIn>
        </div>
      </div>
      <LoggedIn hasSession={hasSession}>
        <div className="modal list_modal">
          <button type="button" className="modal_close_button">
            <i className="xiv-NavigationClose"></i>
          </button>
          <div className="modal_row">
            <div className="modal_form_row_1">
              <h1>
                <Trans>Add to list</Trans>
              </h1>
            </div>
            <form className="modal_form create_list_form">
              <p>
                <Trans>Option 1) Create a new list:</Trans>
              </p>
              {lists.length < 12 ? (
                <div>
                  <input
                    name="list_name"
                    id="list_name"
                    type="text"
                    placeholder="Name"
                    className="full"
                  />
                </div>
              ) : (
                <p>
                  <Trans>
                    You have reached the maximum of 12 lists. You cannot create any more.
                  </Trans>
                </p>
              )}
              <br />
              <p>
                <Trans>Option 2) Use an existing list:</Trans>
              </p>
              <div className="user_lists">
                <div className="user_lists_loading">
                  <Trans>Loading your item lists</Trans>
                </div>
              </div>
              <br />
              <br />
              <div className="modal_form_end">
                <button type="submit" className="btn-green btn_create_list">
                  <Trans>Add to list</Trans>
                </button>
              </div>
            </form>
          </div>
        </div>
      </LoggedIn>
    </div>
  );
}

function NoMarketData({ worldName }: { worldName: string }) {
  return (
    <div className="item-no-data">
      <h2 className="text-highlight">
        <Trans>Sorry, no market data!</Trans>
      </h2>
      <p
        dangerouslySetInnerHTML={{
          __html: sprintf(
            t`Universalis could not find any market data for this item on the server <strong>%s</strong>.`,
            worldName
          ),
        }}
      ></p>
      <p>
        <Trans>There can be a few reasons for this, here are some:</Trans>
      </p>
      <ul>
        <li
          dangerouslySetInnerHTML={{ __html: sprintf(t`%s is a brand new server`, worldName) }}
        ></li>
        <li>
          <Trans>No one has contributed any information about this item yet</Trans>
        </li>
        <li>
          <Trans>Something broke</Trans>
        </li>
      </ul>
      <span
        dangerouslySetInnerHTML={{
          __html: sprintf(
            t`If it is that last one, be sure to jump on <a href="%s">Discord</a> and let us know!`,
            'https://discord.gg/JcMvMxD'
          ),
        }}
      ></span>
    </div>
  );
}

function MarketDataCenter({ item, dc }: MarketDataCenterProps) {
  const { data, error } = useSWR(`https://universalis.app/api/v2/${dc.name}/${item.id}`, (path) =>
    fetch(path).then((res) => res.json())
  );

  if (error) {
    console.error(error);
    return <></>;
  }

  if (!data) {
    return <></>;
  }

  if (!data.lastUploadTime) {
    return <></>;
  }

  return <></>;
}

function MarketWorld({ item, worldName }: MarketWorldProps) {
  const relativeTime = new RelativeTime();

  const { data, error } = useSWR(`https://universalis.app/api/v2/${worldName}/${item.id}`, (path) =>
    fetch(path).then((res) => res.json())
  );

  if (error) {
    console.error(error);
    return <></>;
  }

  if (!data) {
    return <></>;
  }

  if (!data.lastUploadTime) {
    return <NoMarketData worldName={worldName} />;
  }

  return (
    <>
      {item.stackSize && item.stackSize > 1 && data.stackSizeHistogram && (
        <div>
          <h4
            dangerouslySetInnerHTML={{
              __html: t`STACK SIZE HISTOGRAM <small>Last 20 Sales</small>`,
            }}
          ></h4>
        </div>
      )}
      <div className="tab-market-tables">
        <div className="cw-table cw-prices">
          <h4>
            <Trans>PRICES</Trans>{' '}
            <small>
              <Trans>Updated:</Trans> {relativeTime.from(new Date(data.lastUploadTime))}
            </small>
          </h4>
        </div>
        <div className="cw-table cw-history">
          <h4>
            <Trans>HISTORY</Trans>
          </h4>
        </div>
      </div>
    </>
  );
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
              <MarketLists
                hasSession={hasSession}
                lists={lists}
                favourite={false}
                itemId={itemId}
              />
              <div>
                <GameItemIcon id={itemId} width={100} height={100} />
              </div>
              <div>
                <div className="item_info">
                  <h1 className={`rarity-${item.rarity}`}>
                    <span>{item.levelItem}</span>
                    {item.name}
                  </h1>
                </div>
                <div className="item_info2">
                  <div>
                    {item.itemSearchCategory.id && (
                      <>
                        <i className={`xiv-${getSearchIcon(item.itemSearchCategory.id)}`}></i>{' '}
                        {item.itemKind}
                        &nbsp;&nbsp;-&nbsp;&nbsp;
                        {item.itemUiCategory.name}
                        &nbsp;&nbsp;-&nbsp;&nbsp;
                      </>
                    )}
                    <Trans>Stack:</Trans> {item.stackSize?.toLocaleString()}
                    {item.classJobCategory && (
                      <>
                        &nbsp;&nbsp;-&nbsp;&nbsp;
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
