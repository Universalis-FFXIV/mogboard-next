import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { Cookies } from 'react-cookie';
import HomeAction from '../components/HomeAction/HomeAction';
import HomeLoggedOut from '../components/HomeLoggedOut/HomeLoggedOut';
import HomeNavbar from '../components/HomeNavbar/HomeNavBar';
import HomeNews from '../components/HomeNews/HomeNews';
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
import HomeUserList from '../components/HomeUserList/HomeUserList';
import { useState } from 'react';
import { Trans } from '@lingui/macro';
import { getRepositoryUrl } from '../data/game/repository';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

interface RecentItem {
  id: number;
  levelItem: number;
  rarity: number;
  name: string;
  category?: string;
}

interface HomeProps {
  dcs: DataCenter[];
  world: string;
  taxes: Record<City, number>;
  recent: RecentItem[];
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
  taxes,
  recent,
  dailyUploads,
  worldUploads,
  hasSession,
  lists,
}: HomeProps) => {
  const title = 'Universalis';
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';

  const [selectedList, setSelectedList] = useState<UserList | undefined>();

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
          lists={lists}
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
        </div>
        <div>
          <HomeAction />
          <h4>
            <Trans>Recent Updates</Trans>
          </h4>
          <RecentUpdatesPanel items={recent} />
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const cookies = new Cookies(ctx.req?.headers.cookie);
  const world = cookies.get<string | undefined>('mogboard_server') ?? 'Phoenix';
  const lang = cookies.get<string | undefined>('mogboard_language') ?? 'en';

  let taxes: Record<City, number>;
  try {
    const taxRates = await fetch(`https://universalis.app/api/tax-rates?world=${world}`).then(
      (res) => res.json()
    );
    taxes = {
      [City.LimsaLominsa]: taxRates['Limsa Lominsa'],
      [City.Gridania]: taxRates['Gridania'],
      [City.Uldah]: taxRates["Ul'dah"],
      [City.Ishgard]: taxRates['Ishgard'],
      [City.Kugane]: taxRates['Kugane'],
      [City.Crystarium]: taxRates['Crystarium'],
      [City.OldSharlayan]: taxRates['Old Sharlayan'],
    };
  } catch (err) {
    console.error(err);
    taxes = {
      [City.LimsaLominsa]: 0,
      [City.Gridania]: 0,
      [City.Uldah]: 0,
      [City.Ishgard]: 0,
      [City.Kugane]: 0,
      [City.Crystarium]: 0,
      [City.OldSharlayan]: 0,
    };
  }

  const recent: RecentItem[] = [];
  try {
    const recentlyUpdated = await fetch(
      'https://universalis.app/api/extra/stats/recently-updated'
    ).then((res) => res.json());
    const shown = recentlyUpdated.items.slice(0, 6);
    for (const s of shown) {
      try {
        const baseUrl = getRepositoryUrl(lang);
        const itemData = await fetch(`${baseUrl}/Item/${s}`).then((res) => res.json());
        recent.push({
          id: s,
          levelItem: itemData.LevelItem,
          rarity: itemData.Rarity,
          name: itemData[`Name_${lang}`],
          category: itemData.ItemSearchCategory[`Name_${lang}`],
        });
      } catch (err) {
        recent.push({
          id: s,
          levelItem: 0,
          rarity: 0,
          name: '',
        });
      }
    }
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
    props: { dcs, world, taxes, recent, dailyUploads, worldUploads, hasSession, lists },
  };
}

export default Home;
