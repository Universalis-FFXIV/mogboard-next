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
import ListingsTable from '../../components/ListingsTable/ListingsTable';
import LoggedIn from '../../components/LoggedIn/LoggedIn';
import SalesTable from '../../components/SalesTable/SalesTable';
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

function entriesToShow(entries: {}[]) {
  return Math.max(Math.floor(entries.length * 0.1), 10);
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
  const [markets, setMarkets] = useState<Record<number, any>>({});
  useEffect(() => {
    (async () => {
      for (const world of dc.worlds) {
        const market = await fetch(`https://universalis.app/api/v2/${world.id}/${item.id}`).then(
          (res) => res.json()
        );
        setMarkets((last) => ({ ...last, ...{ [world.id]: market } }));
      }
    })();
  }, [dc.worlds, item.id]);

  const worldsSorted = dc.worlds.sort((a, b) => a.name.localeCompare(b.name));
  const relativeTime = new RelativeTime();

  if (Object.keys(markets).length !== dc.worlds.length) {
    return <></>;
  }

  const allListings = Object.values(markets)
    .map((market) =>
      market.listings.map((listing: any) => {
        listing.worldName = market.worldName;
        return listing;
      })
    )
    .flat()
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit);
  const allSales = Object.values(markets)
    .map((market) =>
      market.recentHistory.map((listing: any) => {
        listing.worldName = market.worldName;
        return listing;
      })
    )
    .flat()
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit);

  const hqListings = allListings.filter((listing) => listing.hq);
  const nqListings = allListings.filter((listing) => !listing.hq);
  const hqSales = allSales.filter((sale) => sale.hq);
  const nqSales = allSales.filter((sale) => !sale.hq);

  const hqListingsAveragePpu = Math.ceil(
    hqListings.map((listing) => listing.pricePerUnit).reduce((agg, next) => agg + next, 0) /
      hqListings.length
  );
  const nqListingsAveragePpu = Math.ceil(
    nqListings.map((listing) => listing.pricePerUnit).reduce((agg, next) => agg + next, 0) /
      nqListings.length
  );
  const hqListingsAverageTotal = Math.ceil(
    hqListings.map((listing) => listing.total).reduce((agg, next) => agg + next, 0) /
      hqListings.length
  );
  const nqListingsAverageTotal = Math.ceil(
    nqListings.map((listing) => listing.total).reduce((agg, next) => agg + next, 0) /
      nqListings.length
  );
  const hqSalesAveragePpu = Math.ceil(
    hqSales.map((sale) => sale.pricePerUnit).reduce((agg, next) => agg + next, 0) / hqSales.length
  );
  const nqSalesAveragePpu = Math.ceil(
    nqSales.map((sale) => sale.pricePerUnit).reduce((agg, next) => agg + next, 0) / nqSales.length
  );
  const hqSalesAverageTotal = Math.ceil(
    hqSales.map((sale) => sale.total).reduce((agg, next) => agg + next, 0) / hqSales.length
  );
  const nqSalesAverageTotal = Math.ceil(
    nqSales.map((sale) => sale.total).reduce((agg, next) => agg + next, 0) / nqSales.length
  );

  return (
    <>
      <div className="market_update_times">
        {worldsSorted.map((world) => (
          <div key={world.id}>
            <h4>{world.name}</h4>
            <div>
              {markets[world.id].lastUploadTime
                ? relativeTime.from(new Date(markets[world.id].lastUploadTime))
                : t`No data`}
            </div>
          </div>
        ))}
      </div>
      <div className="cross_world_markets">
        <div className="cheapest">
          <h2>{sprintf(t`Cheapest %s`, 'HQ')}</h2>
          {item.canBeHq && (
            <>
              {hqListings.length > 0 && (
                <div className="cheapest_price">
                  <i className="xiv-Gil"></i> <em>{hqListings[0].quantity.toLocaleString()} x</em>
                  <span className="cheapest_value">
                    &nbsp;
                    {hqListings[0].pricePerUnit.toLocaleString()}
                  </span>
                  &nbsp;
                  <span className="cheapest_price_info">
                    <Trans>Server:</Trans> <strong>{hqListings[0].worldName}</strong> -&nbsp;
                    <Trans>Total:</Trans> <strong>{hqListings[0].total.toLocaleString()}</strong>
                  </span>
                </div>
              )}
              {hqListings.length === 0 && sprintf(t`No %s for sale.`, 'HQ')}
            </>
          )}
          {!item.canBeHq && t`Item has no HQ variant.`}
        </div>
        <div className="cheapest">
          <h2>{sprintf(t`Cheapest %s`, 'NQ')}</h2>

          {nqListings.length > 0 && (
            <div className="cheapest_price">
              <i className="xiv-Gil"></i> <em>{nqListings[0].quantity.toLocaleString()} x</em>
              <span className="cheapest_value">
                &nbsp;
                {nqListings[0].pricePerUnit.toLocaleString()}
              </span>
              &nbsp;
              <span className="cheapest_price_info">
                <Trans>Server:</Trans> <strong>{nqListings[0].worldName}</strong> -&nbsp;
                <Trans>Total:</Trans> <strong>{nqListings[0].total.toLocaleString()}</strong>
              </span>
            </div>
          )}
          {nqListings.length === 0 && sprintf(t`No %s for sale.`, 'NQ')}
        </div>
      </div>
      <br />
      <br />
      <h6>
        <Trans>Cross-World Purchase history (500 sales)</Trans>
      </h6>
      {item.stackSize && item.stackSize > 1 && (
        <div>
          <h6>
            <Trans>STACK SIZE HISTOGRAM</Trans>
          </h6>
        </div>
      )}
      <div className="cross_world_markets">
        <div>
          {item.canBeHq && (
            <>
              <h6>
                <img src="/i/game/hq.png" alt="High Quality" height={15} width={15} />{' '}
                {sprintf(t`%s Prices`, 'HQ')} {t`(Includes 5% GST)`}
              </h6>
              <ListingsTable
                listings={hqListings}
                averageHq={hqListingsAveragePpu}
                averageNq={nqListingsAveragePpu}
                crossWorld={true}
                includeDiff={true}
                start={0}
                end={entriesToShow(hqListings)}
              />
              <br />
            </>
          )}
          <h6>
            {sprintf(t`%s Prices`, 'NQ')} {t`(Includes 5% GST)`}
          </h6>
          <ListingsTable
            listings={nqListings}
            averageHq={hqListingsAveragePpu}
            averageNq={nqListingsAveragePpu}
            crossWorld={true}
            includeDiff={true}
            start={0}
            end={entriesToShow(nqListings)}
          />
        </div>
        <div>
          {item.canBeHq && (
            <>
              <h6>
                <img src="/i/game/hq.png" alt="High Quality" height={15} width={15} />{' '}
                {sprintf(t`%s Purchase History`, 'HQ')}
              </h6>
              <SalesTable
                sales={hqSales}
                averageHq={hqSalesAveragePpu}
                averageNq={nqSalesAveragePpu}
                crossWorld={true}
                includeDiff={true}
                start={0}
                end={entriesToShow(hqSales)}
              />
              <br />
            </>
          )}
          <h6>{sprintf(t`%s Purchase History`, 'NQ')}</h6>
          <SalesTable
            sales={nqSales}
            averageHq={hqSalesAveragePpu}
            averageNq={nqSalesAveragePpu}
            crossWorld={true}
            includeDiff={true}
            start={0}
            end={entriesToShow(nqSales)}
          />
        </div>
      </div>
      <br />
      <br />
      <div className="cross_world_markets">
        <div>
          <h6>
            <Trans>Listings</Trans>
          </h6>
          <div className="flex census_box">
            <div>
              <h5>
                <Trans>Avg. Per Unit</Trans>
              </h5>
              <br />
              <div className="flex avg_prices">
                {item.canBeHq && (
                  <div className="flex_50 price-hq">
                    <img src="/i/game/hq.png" alt="High Quality" height={16} width={16} />{' '}
                    {hqListingsAveragePpu.toLocaleString()}
                  </div>
                )}
                <div className={item.canBeHq ? 'flex_50' : 'flex_100'}>
                  {nqListingsAveragePpu.toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <h5>
                <Trans>Avg. Total</Trans>
              </h5>
              <br />
              <div className="flex avg_prices">
                {item.canBeHq && (
                  <div className="flex_50 price-hq">
                    <img src="/i/game/hq.png" alt="High Quality" height={16} width={16} />{' '}
                    {hqListingsAverageTotal.toLocaleString()}
                  </div>
                )}
                <div className={item.canBeHq ? 'flex_50' : 'flex_100'}>
                  {nqListingsAverageTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h6>
            <Trans>Sales</Trans>
          </h6>
          <div className="flex census_box">
            <div>
              <h5>
                <Trans>Avg. Per Unit</Trans>
              </h5>
              <br />
              <div className="flex avg_prices">
                {item.canBeHq && (
                  <div className="flex_50 price-hq">
                    <img src="/i/game/hq.png" alt="High Quality" height={16} width={16} />{' '}
                    {hqSalesAveragePpu.toLocaleString()}
                  </div>
                )}
                <div className={item.canBeHq ? 'flex_50' : 'flex_100'}>
                  {nqSalesAveragePpu.toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <h5>
                <Trans>Avg. Total</Trans>
              </h5>
              <br />
              <div className="flex avg_prices">
                {item.canBeHq && (
                  <div className="flex_50 price-hq">
                    <img src="/i/game/hq.png" alt="High Quality" height={16} width={16} />{' '}
                    {hqSalesAverageTotal.toLocaleString()}
                  </div>
                )}
                <div className={item.canBeHq ? 'flex_50' : 'flex_100'}>
                  {nqSalesAverageTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MarketWorld({ item, worldName }: MarketWorldProps) {
  const [market, setMarket] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const market = await fetch(`https://universalis.app/api/v2/${worldName}/${item.id}`).then(
        (res) => res.json()
      );
      setMarket(market);
    })();
  }, [worldName, item.id]);

  const relativeTime = new RelativeTime();

  if (market == null) {
    return <></>;
  }

  return (
    <>
      {item.stackSize && item.stackSize > 1 && market.stackSizeHistogram && (
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
              <Trans>Updated:</Trans> {relativeTime.from(new Date(market.lastUploadTime))}{' '}
              {t`(Includes 5% GST)`}
            </small>
          </h4>
          <ListingsTable
            listings={market.listings}
            averageHq={market.currentAveragePriceHQ}
            averageNq={market.currentAveragePriceNQ}
            crossWorld={false}
            includeDiff={true}
            start={0}
            end={entriesToShow(market.listings)}
          />
        </div>
        <div className="cw-table cw-history">
          <h4>
            <Trans>HISTORY</Trans>
          </h4>
          <SalesTable
            sales={market.recentHistory}
            averageHq={market.averagePriceHQ}
            averageNq={market.averagePriceNQ}
            crossWorld={false}
            includeDiff={true}
            start={0}
            end={entriesToShow(market.listings)}
          />
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
