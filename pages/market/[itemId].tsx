import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import Head from 'next/head';
import { useCallback, useReducer, useState } from 'react';
import { Database } from '../../db';
import { RecentlyViewedList, USER_LIST_MAX_ITEMS } from '../../db/user-list';
import useSettings from '../../hooks/useSettings';
import { DataCenter } from '../../types/game/DataCenter';
import { UserList, UserListCustomType } from '../../types/universalis/user';
import { authOptions } from '../api/auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import { PHPObject } from '../../db/PHPObject';
import { ListsDispatchAction } from '../../components/Market/MarketNav/MarketNav';
import MarketDataCenter from '../../components/Market/MarketDataCenter/MarketDataCenter';
import MarketWorld from '../../components/Market/MarketWorld/MarketWorld';
import MarketServerSelector from '../../components/Market/MarketServerSelector/MarketServerSelector';
import MarketItemHeader from '../../components/Market/MarketItemHeader/MarketItemHeader';
import { getItem } from '../../data/game';
import { Cookies } from 'react-cookie';
import { World } from '../../types/game/World';
import { REGIONS, getServers } from '../../service/servers';
import { ParsedUrlQuery } from 'querystring';
import MarketServerUpdateTimes from '../../components/Market/MarketServerUpdateTimes/MarketServerUpdateTimes';
import MarketRegion from '../../components/Market/MarketRegion/MarketRegion';
import MarketRegionUpdateTimes from '../../components/Market/MarketRegionUpdateTimes/MarketRegionUpdateTimes';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { getBaseUrl } from '../../service/universalis';
import retry, { Options } from 'retry-as-promised';
import Spacing from '../../components/Spacing/Spacing';
import { Item } from '../../types/game/Item';
import { Language } from '../../types/universalis/lang';
import { useRegionMarket } from '../../hooks/market';
import useDataCenters from '../../hooks/useDataCenters';

const isDev = process.env['APP_ENV'] !== 'prod';

type Server =
  | { type: 'region'; region: string }
  | { type: 'dc'; dc: DataCenter }
  | { type: 'world'; world: World };

interface StaticMarketsProps {
  item: Item;
  region: string;
  markets: Record<number | string, any>;
  homeDc: DataCenter;
  dcs: DataCenter[];
  selectedServer: Server;
  lang: Language;
}

/**
 * Market data baked into the initial page load.
 */
const StaticMarkets = ({
  lang,
  item,
  region,
  markets,
  homeDc,
  dcs,
  selectedServer,
}: StaticMarketsProps) => {
  return (
    <div className="tab">
      <div
        className={`tab-page tab-summary ${
          selectedServer.type === 'region' && selectedServer.region === region ? 'open' : ''
        }`}
      >
        <ErrorBoundary>
          <MarketRegionUpdateTimes
            dcs={dcs}
            worldUploadTimes={dcs.reduce((agg, next) => {
              const nextMarket = markets[next.name];
              Object.entries(nextMarket.worldUploadTimes).forEach(([worldId, lastUploadTime]) => {
                agg[worldId] = lastUploadTime as number;
              });
              return agg;
            }, {} as Record<string | number, number>)}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <MarketRegion
            item={item}
            region={region}
            dcs={dcs}
            dcMarkets={markets}
            lang={lang}
            open={selectedServer.type === 'region' && selectedServer.region === region}
          />
        </ErrorBoundary>
      </div>
      {dcs.map((dc, i) => (
        <div
          key={i}
          className={`tab-page tab-summary ${
            selectedServer.type === 'dc' && selectedServer.dc.name === dc.name ? 'open' : ''
          }`}
        >
          <ErrorBoundary>
            <MarketServerUpdateTimes
              worlds={dc.worlds.sort((a, b) => a.name.localeCompare(b.name))}
              worldUploadTimes={markets[dc.name]?.worldUploadTimes ?? dc.worlds.map(() => 0)}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <MarketDataCenter
              item={item}
              dc={dc}
              market={markets[dc.name]}
              lang={lang}
              open={selectedServer.type === 'dc' && selectedServer.dc.name === dc.name}
            />
          </ErrorBoundary>
        </div>
      ))}
      {homeDc.worlds.map((world) => (
        <div
          key={world.id}
          className={`tab-page tab-cw ${
            selectedServer.type === 'world' && selectedServer.world.name === world.name
              ? 'open'
              : ''
          }`}
        >
          <ErrorBoundary>
            <MarketWorld
              item={item}
              world={world}
              market={markets[world.id]}
              lang={lang}
              open={selectedServer.type === 'world' && selectedServer.world.name === world.name}
            />
          </ErrorBoundary>
        </div>
      ))}
    </div>
  );
};

interface DynamicMarketsProps {
  item: Item;
  region: string;
  selectedServer: Server;
  lang: Language;
}

/**
 * Market data on-demand.
 */
const DynamicMarkets = ({ item, selectedServer, region, lang }: DynamicMarketsProps) => {
  const { data: market } = useRegionMarket(region, item.id);
  const { data: dcs } = useDataCenters(region);

  const getWorldUploadTimes = useCallback(
    (dc?: DataCenter) => {
      const allUploadTimes = market?.worldUploadTimes ?? {};
      if (dc) {
        return Object.fromEntries(
          Object.entries(allUploadTimes).filter(([worldId]) =>
            dc?.worlds.find((w) => `${w.id}` === worldId)
          )
        );
      } else {
        return allUploadTimes;
      }
    },
    [market]
  );

  if (!market || !dcs) {
    return (
      <div className="tab-page tab-summary open">
        <MarketWorld.Skeleton />
      </div>
    );
  }

  const worlds = dcs.flatMap((dc) => dc.worlds);
  switch (selectedServer.type) {
    case 'region':
      return (
        <div className="tab">
          <div className="tab-page tab-summary open">
            <ErrorBoundary>
              <MarketServerUpdateTimes
                worlds={worlds.sort((a, b) => a.name.localeCompare(b.name))}
                worldUploadTimes={getWorldUploadTimes()}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <MarketRegion.Dynamic item={item} region={region} dcs={dcs} lang={lang} open />
            </ErrorBoundary>
          </div>
        </div>
      );
    case 'dc':
      const { dc } = selectedServer;
      return (
        <div className="tab">
          <div className="tab-page tab-summary open">
            <ErrorBoundary>
              <MarketServerUpdateTimes
                worlds={dc.worlds.sort((a, b) => a.name.localeCompare(b.name))}
                worldUploadTimes={getWorldUploadTimes(dc)}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <MarketDataCenter.Dynamic item={item} dc={dc} lang={lang} open />
            </ErrorBoundary>
          </div>
        </div>
      );
    case 'world':
      const { world } = selectedServer;
      return (
        <div className="tab-page tab-summary open">
          <ErrorBoundary>
            <MarketWorld.Dynamic item={item} world={world} lang={lang} open />
          </ErrorBoundary>
        </div>
      );
  }
};

interface MarketsProps {
  item: Item;
  region: string;
  markets?: Record<number | string, any>;
  homeDc: DataCenter;
  dcs: DataCenter[];
  selectedServer: Server;
  lang: Language;
}

const Markets = (props: MarketsProps) => {
  if (props.markets !== undefined) {
    const markets = props.markets; // Help TS out a bit
    return <StaticMarkets {...props} markets={markets} />;
  } else {
    return <DynamicMarkets {...props} />;
  }
};

interface MarketProps {
  hasSession: boolean;
  lists: UserList[];
  markets: Record<number | string, any>;
  itemId: number;
  region: string;
  homeDc: DataCenter;
  dcs: DataCenter[];
  queryServer: string | null;
}

const Market: NextPage<MarketProps> = ({
  hasSession,
  lists,
  markets,
  itemId,
  region,
  homeDc,
  dcs,
  queryServer,
}) => {
  const [settings, setSetting] = useSettings();

  const lang = settings['mogboard_language'] || 'en';
  const showHomeWorld = settings['mogboard_homeworld'] === 'yes';
  const homeWorld = settings['mogboard_server'] || 'Phoenix';
  const homeWorldId =
    dcs.flatMap((dc) => dc.worlds).find((world) => world.name === homeWorld)?.id ?? 56;
  const lastSelectedServer = settings['mogboard_last_selected_server'] || null;

  const findServer: (s: string | null) => Server = (s: string | null) => {
    // Match region
    if ((REGIONS as readonly (string | null)[]).includes(s)) {
      return { type: 'region', region };
    }

    // Match world on the user's home DC
    const world = homeDc.worlds.find(
      (world) => world.name === s ?? (showHomeWorld ? homeWorld : null)
    );
    if (world != null) {
      return { type: 'world', world };
    }

    // Match DC on the user's home region
    const dc = dcs.find((dc) => dc.name === s ?? homeDc.name);
    if (dc != null) {
      return { type: 'dc', dc };
    }

    return { type: 'dc', dc: homeDc };
  };

  // Create state for selected server
  const [selectedServer, setSelectedServer] = useState<Server>(() => {
    // Try to find the last selected server
    const last = findServer(lastSelectedServer);
    // Try to find the server from the URL
    const result = last != null ? last : findServer(queryServer);
    // It will have fallen back to the user's home world/DC otherwise
    return result;
  });

  const setLastSelectedServer = useCallback(
    (x: string) => {
      setSetting('mogboard_last_selected_server', x);
    },
    [setSetting]
  );

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Create state machine for list management
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
      case 'updateAllLists':
        return action.lists;
    }
  }, lists);

  const selectServer = useCallback(
    (s: Server) => {
      // Set the new last-selected server for future page loads
      if (s.type === 'region') {
        setLastSelectedServer(s.region);
      } else if (s.type === 'dc') {
        setLastSelectedServer(s.dc.name);
      } else if (s.type === 'world') {
        setLastSelectedServer(s.world.name);
      }

      setDynamicServer(null);
      setSelectedServer(s);
    },
    [setLastSelectedServer]
  );

  // This gets special treatment, and isn't loaded into the page by default.
  // Typically, all data is loaded ahead of time to support scrapers/sheets,
  // but for this part of the UI we're not bound to that decision.
  const [dynamicServer, setDynamicServer] = useState<Server | null>(null);

  const item = getItem(itemId, lang)!;

  const title = `${item.name ?? ''} - Universalis`;
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

  if (!item) {
    return <MarketHead />;
  }

  return (
    <>
      <MarketHead />
      <div className="product">
        <div>
          <div className="item_top">
            <ErrorBoundary>
              <MarketItemHeader
                hasSession={hasSession}
                item={item}
                homeWorldId={homeWorldId}
                stateLists={stateLists}
                lang={lang}
                dispatch={dispatch}
              />
            </ErrorBoundary>
            <div className="item_nav_mobile_toggle">
              <button type="button" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
                <Trans>Menu</Trans>
              </button>
            </div>
            <div className={`item_nav ${mobileNavOpen ? 'open' : ''}`}>
              <MarketServerSelector
                region={region}
                homeDc={homeDc}
                dcs={dcs}
                homeWorldName={settings['mogboard_server']}
                selectedServer={dynamicServer ?? selectedServer}
                setSelectedServer={selectServer}
              />
            </div>
            {region !== 'Oceania' && (
              <>
                <Spacing size={10} />
                <div className={`item_nav ${mobileNavOpen ? 'open' : ''}`}>
                  <ErrorBoundary>
                    <MarketServerSelector.Dynamic
                      region="Oceania"
                      selectedServer={dynamicServer ?? selectedServer}
                      setSelectedServer={setDynamicServer}
                    />
                  </ErrorBoundary>
                </div>
              </>
            )}
          </div>
          <Markets
            item={item}
            region={dynamicServer ? 'Oceania' : region}
            markets={dynamicServer ? undefined : markets}
            homeDc={homeDc}
            dcs={dcs}
            selectedServer={dynamicServer ?? selectedServer}
            lang={lang}
          />
        </div>
      </div>
    </>
  );
};

function getItemId(query: ParsedUrlQuery): number {
  if (typeof query.itemId !== 'string') {
    return NaN;
  }

  return parseInt(query.itemId);
}

async function addToRecentlyViewed(userId: string, itemId: number) {
  // Add this item to the user's recently-viewed list, creating it if it doesn't exist.
  const recents = await Database.getUserListCustom(userId, UserListCustomType.RecentlyViewed);

  if (recents) {
    const items = new PHPObject();
    items.push(...recents.items.filter((item) => item !== itemId));
    items.unshift(itemId);
    while (items.length > USER_LIST_MAX_ITEMS) {
      items.pop();
    }

    await Database.updateUserListItems(userId, recents.id, items);
  } else {
    const items = new PHPObject();
    items.push(itemId);
    await Database.createUserList(RecentlyViewedList(uuidv4(), userId, items));
  }
}

const retryOptions: Options = {
  max: 5,
  backoffBase: 1000,
  report: (message) => isDev && console.warn(message),
  name: '/market/[itemId]#getServerSideProps',
};

function dummyMarket(itemId: number, worldName?: string, dcName?: string) {
  return {
    itemID: itemId,
    lastUploadTime: 0,
    listings: [],
    recentHistory: [],
    worldName,
    dcName,
    currentAveragePrice: 0,
    currentAveragePriceNQ: 0,
    currentAveragePriceHQ: 0,
    regularSaleVelocity: 0,
    nqSaleVelocity: 0,
    hqSaleVelocity: 0,
    averagePrice: 0,
    averagePriceNQ: 0,
    averagePriceHQ: 0,
    minPrice: 0,
    minPriceNQ: 0,
    minPriceHQ: 0,
    maxPrice: 0,
    maxPriceNQ: 0,
    maxPriceHQ: 0,
    stackSizeHistogram: {},
    stackSizeHistogramNQ: {},
    stackSizeHistogramHQ: {},
    worldUploadTimes: {},
  };
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const itemId = getItemId(ctx.query);
  if (isNaN(itemId) || !getItem(itemId, 'en')) {
    return { notFound: true };
  }

  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
  const hasSession = !!session;

  const cookies = new Cookies(ctx.req.headers.cookie);

  let dcs: DataCenter[] = [];
  try {
    const servers = await getServers();
    dcs = servers.dcs.map((dc) => ({
      name: dc.name,
      region: dc.region,
      worlds: dc.worlds.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  } catch (err) {
    console.error(err);
  }

  let lists: UserList[] = [];
  if (session && session.user.id) {
    try {
      await Promise.all([
        addToRecentlyViewed(session.user.id!, itemId),
        (async () => {
          lists = await Database.getUserLists(session.user.id!);
        })(),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const queryServer =
    typeof ctx.query.server === 'string' && ctx.query.server.length > 0 ? ctx.query.server : null;
  const homeWorld = cookies.get<string | undefined>('mogboard_server') || 'Phoenix';
  let dc = dcs.find(
    (x) =>
      x.worlds.some((y) => y.name.toLowerCase() === (queryServer || homeWorld).toLowerCase()) ||
      (queryServer && x.name.toLowerCase() === queryServer.toLowerCase())
  );
  if (!dc) {
    // This can happen if the user has an arbitrary junk value in the server cookie
    dc = dcs.find((x) => x.worlds.some((y) => y.name === 'Phoenix'));

    if (!dc) {
      throw new Error(`Data center not found for server "${queryServer || homeWorld}".`);
    }
  }

  const region = dc.region;
  const regionDcs = dcs.filter((dc) => dc.region === region);

  const markets: Record<number | string, any> = {};
  const marketFetches: Promise<void>[] = [];
  for (const world of dc.worlds) {
    marketFetches.push(
      (async () => {
        const market = await retry(
          () =>
            fetch(`${getBaseUrl()}/v2/${world.id}/${itemId}?entries=20`).then((res) => res.json()),
          retryOptions
        ).catch(console.error);
        markets[world.id] = market || dummyMarket(itemId, world.name);
      })()
    );
  }

  for (const regionDc of regionDcs) {
    marketFetches.push(
      (async () => {
        const market = await retry(
          () =>
            fetch(`${getBaseUrl()}/v2/${regionDc.name}/${itemId}?entries=20`).then((res) =>
              res.json()
            ),
          retryOptions
        ).catch(console.error);
        markets[regionDc.name] = market || dummyMarket(itemId, undefined, regionDc.name);
      })()
    );
  }

  await Promise.all(marketFetches);

  return {
    props: {
      hasSession,
      lists,
      markets,
      itemId: itemId,
      region: dc.region,
      homeDc: dc,
      dcs: regionDcs,
      queryServer,
    },
  };
}

export default Market;
