import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { Cookies } from 'react-cookie';
import HomeAction from '../components/Home/HomeAction/HomeAction';
import HomeLoggedOut from '../components/Home/HomeLoggedOut/HomeLoggedOut';
import HomeNavbar from '../components/Home/HomeNavbar/HomeNavBar';
import HomeNews from '../components/Home/HomeNews/HomeNews';
import LoggedOut from '../components/LoggedOut/LoggedOut';
import RecentUpdatesPanel from '../components/RecentUpdatesPanel/RecentUpdatesPanel';
import TaxRatesPanel from '../components/TaxRatesPanel/TaxRatesPanel';
import UploadCountPanel from '../components/UploadCountPanel/UploadCountPanel';
import WorldUploadCountsPanel from '../components/WorldUploadCountsPanel/WorldUploadCountsPanel';
import { City } from '../types/game/City';
import { UserList } from '../types/universalis/user';
import { acquireConn, releaseConn } from '../db/connect';
import * as listsDb from '../db/user-list';
import { DataCenter } from '../types/game/DataCenter';
import HomeUserList from '../components/Home/HomeUserList/HomeUserList';
import { useState } from 'react';
import { Trans } from '@lingui/macro';
import { authOptions } from './api/auth/[...nextauth]';
import { getItem } from '../data/game';
import useSettings from '../hooks/useSettings';
import { getServers } from '../service/servers';
import { TaxRates } from '../types/universalis/TaxRates';
import { unstable_getServerSession } from 'next-auth';
import HomeLeastRecentlyUpdated from '../components/Home/HomeLeastRecentlyUpdated/HomeLeastRecentlyUpdated';

interface HomeProps {
  dcs: DataCenter[];
  world: string;
  server: string;
  taxes: Record<City, number>;
  recent: number[];
  leastRecents: { id: number; date: number; world: string }[];
  dailyUploads: number[];
  worldUploads: { world: string; count: number }[];
  hasSession: boolean;
  lists: UserList[];
}

function sum(arr: number[], start: number, end: number) {
  return arr.slice(start, end).reduce((a, b) => a + b, 0);
}

const Home: NextPage<HomeProps> = ({
  dcs,
  world,
  server,
  taxes,
  recent,
  leastRecents,
  dailyUploads,
  worldUploads,
  hasSession,
  lists,
}: HomeProps) => {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] || 'en';

  const [selectedList, setSelectedList] = useState<UserList | undefined>();

  const title = 'Universalis';
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

      <div className="home">
        <HomeNavbar
          hasSession={hasSession}
          lists={lists.sort((a, b) => b.updated - a.updated)}
          onListSelected={(id) => {
            const list = lists.find((list) => list.id === id);
            if (!selectedList || list?.id !== selectedList?.id) {
              setSelectedList(list);
            } else if (list.id === selectedList.id) {
              setSelectedList(undefined);
            }
          }}
        />
        <div>
          <HomeNews />
          {selectedList && <HomeUserList dcs={dcs} list={selectedList} />}
          <LoggedOut hasSession={hasSession}>
            <HomeLoggedOut />
          </LoggedOut>
          <HomeLeastRecentlyUpdated
            server={server}
            multiWorld={settings['mogboard_homeworld'] !== 'yes'}
            lang={lang}
            leastRecents={leastRecents.map((entry) => ({ ...entry, date: new Date(entry.date) }))}
          />
        </div>
        <div>
          <HomeAction />
          <h4>
            <Trans>Recent Updates</Trans>
          </h4>
          <RecentUpdatesPanel items={recent.map((itemId) => getItem(itemId, lang)!)} />
          <TaxRatesPanel data={taxes} world={world} />
          <WorldUploadCountsPanel data={worldUploads} world={world} />
          <UploadCountPanel today={sum(dailyUploads, 0, 1)} week={sum(dailyUploads, 0, 7)} />
          <p className="mog-honorable" style={{ textAlign: 'center', marginTop: 5 }}>
            <Trans>Thank you!</Trans>
          </p>
        </div>
      </div>
    </>
  );
};

function convertTaxRates(taxRates: TaxRates): Record<City, number> {
  return {
    [City.LimsaLominsa]: taxRates['Limsa Lominsa'] ?? 0,
    [City.Gridania]: taxRates['Gridania'] ?? 0,
    [City.Uldah]: taxRates["Ul'dah"] ?? 0,
    [City.Ishgard]: taxRates['Ishgard'] ?? 0,
    [City.Kugane]: taxRates['Kugane'] ?? 0,
    [City.Crystarium]: taxRates['Crystarium'] ?? 0,
    [City.OldSharlayan]: taxRates['Old Sharlayan'] ?? 0,
  };
}

function zeroTaxRates(): Record<City, number> {
  return {
    [City.LimsaLominsa]: 0,
    [City.Gridania]: 0,
    [City.Uldah]: 0,
    [City.Ishgard]: 0,
    [City.Kugane]: 0,
    [City.Crystarium]: 0,
    [City.OldSharlayan]: 0,
  };
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const cookies = new Cookies(ctx.req?.headers.cookie);
  const world = cookies.get<string | undefined>('mogboard_server') || 'Phoenix';

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

  const showHomeWorld = cookies.get<string | undefined>('mogboard_homeworld') === 'yes';
  const server = showHomeWorld
    ? world
    : dcs.find((dc) => dc.worlds.some((w) => w.name.toLowerCase() === world.toLowerCase()))?.name ||
      world;

  let taxes: Record<City, number>;
  try {
    const taxRates: TaxRates = await fetch(
      `https://universalis.app/api/tax-rates?world=${world}`
    ).then((res) => res.json());
    taxes = convertTaxRates(taxRates);
  } catch (err) {
    console.error(err);
    taxes = zeroTaxRates();
  }

  let recent: number[] = [];
  try {
    const recentlyUpdated = await fetch(
      'https://universalis.app/api/extra/stats/recently-updated'
    ).then((res) => res.json());
    recent = recentlyUpdated.items.slice(0, 6);
  } catch (err) {
    console.error(err);
  }

  let leastRecents: number[] = [];
  try {
    const leastRecentlyUpdated = await fetch(
      `https://universalis.app/api/extra/stats/least-recently-updated?${
        server.toLowerCase() === world.toLowerCase() ? 'world' : 'dcName'
      }=${server}`
    ).then((res) => res.json());
    leastRecents = leastRecentlyUpdated.items
      .slice(0, 20)
      .map((entry: { [x: string]: string | number }) => ({
        id: entry.itemID,
        date: entry.lastUploadTime,
        world: entry.worldName,
      }));
  } catch (err) {
    console.error(err);
  }

  const dailyUploads: number[] = [];
  try {
    const uploadHistory = await fetch(
      'https://universalis.app/api/extra/stats/upload-history'
    ).then((res) => res.json());
    dailyUploads.push(...uploadHistory.uploadCountByDay);
  } catch (err) {
    console.error(err);
  }

  const worldUploads: { world: string; count: number }[] = [];
  try {
    const worldUploadCounts: Record<string, { count: number; proportion: number }> = await fetch(
      'https://universalis.app/api/extra/stats/world-upload-counts'
    ).then((res) => res.json());
    worldUploads.push(
      ...Object.keys(worldUploadCounts).map((k) => ({
        world: k,
        count: worldUploadCounts[k].count,
      }))
    );
  } catch (err) {
    console.error(err);
  }

  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
  const hasSession = !!session;

  let lists: UserList[] = [];
  if (session?.user?.id) {
    const conn = await acquireConn();
    try {
      lists = await listsDb.getUserLists(session.user.id, conn);
    } catch (err) {
      console.error(err);
    } finally {
      await releaseConn(conn);
    }
  }

  return {
    props: {
      dcs,
      world,
      server,
      taxes,
      recent,
      leastRecents,
      dailyUploads,
      worldUploads,
      hasSession,
      lists,
    },
  };
}

export default Home;
