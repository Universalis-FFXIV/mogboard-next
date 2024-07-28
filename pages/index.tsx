import type { NextPage } from 'next';
import Head from 'next/head';
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
import HomeUserList from '../components/Home/HomeUserList/HomeUserList';
import { useState } from 'react';
import { Trans } from '@lingui/macro';
import { getFallbackItem, getItem } from '../data/game';
import useSettings from '../hooks/useSettings';
import { getServers } from '../service/servers';
import { TaxRates } from '../types/universalis/TaxRates';
import HomeLeastRecentlyUpdated from '../components/Home/HomeLeastRecentlyUpdated/HomeLeastRecentlyUpdated';
import { FETCH_OPTIONS, getBaseUrl } from '../service/universalis';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useSession } from 'next-auth/react';
import useDataCenters from '../hooks/useDataCenters';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import HomeGuides from '../components/Home/HomeGuides/HomeGuides';

function sum(arr: number[], start: number, end: number) {
  return arr.slice(start, end).reduce((a, b) => a + b, 0);
}

function convertTaxRates(taxRates: TaxRates): Record<City, number> {
  return {
    [City.LimsaLominsa]: taxRates['Limsa Lominsa'] ?? 0,
    [City.Gridania]: taxRates['Gridania'] ?? 0,
    [City.Uldah]: taxRates["Ul'dah"] ?? 0,
    [City.Ishgard]: taxRates['Ishgard'] ?? 0,
    [City.Kugane]: taxRates['Kugane'] ?? 0,
    [City.Crystarium]: taxRates['Crystarium'] ?? 0,
    [City.OldSharlayan]: taxRates['Old Sharlayan'] ?? 0,
    [City.Tuliyollal]: taxRates['Tuliyollal'] ?? 0,
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
    [City.Tuliyollal]: 0,
  };
}

const Home: NextPage = () => {
  const { status: sessionStatus } = useSession();

  const [settings] = useSettings();
  const lang = settings['mogboard_language'] || 'en';

  const [selectedList, setSelectedList] = useState<UserList | undefined>();

  const world = settings['mogboard_server'] || 'Phoenix';

  const { data: dcs } = useDataCenters();

  const showHomeWorld = settings['mogboard_homeworld'] === 'yes';
  const server = showHomeWorld
    ? world
    : (dcs ?? []).find((dc) => dc.worlds.some((w) => w?.name.toLowerCase() === world.toLowerCase()))
        ?.name || world;

  const { data: taxes } = useSWR<Record<City, number>>(
    `${getBaseUrl()}/tax-rates?world=${world}`,
    (url) =>
      fetch(url, FETCH_OPTIONS)
        .then((res) => res.json())
        .then((res) => convertTaxRates(res))
  );

  const { data: dailyUploads } = useSWR<number[]>(
    `${getBaseUrl()}/extra/stats/upload-history`,
    (url) =>
      fetch(url, FETCH_OPTIONS)
        .then((res) => res.json())
        .then((res) => res.uploadCountByDay)
  );

  const { data: recent } = useSWR<number[]>(`${getBaseUrl()}/extra/stats/recently-updated`, (url) =>
    fetch(url, FETCH_OPTIONS)
      .then((res) => res.json())
      .then((res) => res.items.slice(0, 6))
  );

  const { data: worldUploads } = useSWR<{ world: string; count: number }[]>(
    `${getBaseUrl()}/extra/stats/world-upload-counts`,
    (url) =>
      fetch(url, FETCH_OPTIONS)
        .then((res) => res.json())
        .then((res) =>
          Object.keys(res).map((k) => ({
            world: k,
            count: res[k].count,
          }))
        )
  );

  const { data: leastRecents } = useSWR<{ id: number; date: number; world: string }[]>(
    `${getBaseUrl()}/extra/stats/least-recently-updated?${
      server.toLowerCase() === world.toLowerCase() ? 'world' : 'dcName'
    }=${server}`,
    (url) =>
      fetch(url, FETCH_OPTIONS)
        .then((res) => res.json())
        .then((res) =>
          res.items.slice(0, 20).map((entry: { [x: string]: string | number }) => ({
            id: entry.itemID,
            date: entry.lastUploadTime,
            world: entry.worldName,
          }))
        )
  );

  const { data: lists } = useSWR<UserList[]>('/api/web/lists', (url) =>
    fetch(url, FETCH_OPTIONS)
      .then((res) => res.json())
      .then((res) => {
        if ('message' in res) {
          console.warn(res.message);
          return [];
        }

        return res;
      })
  );

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
          hasSession={sessionStatus === 'authenticated'}
          lists={(lists ?? []).sort((a, b) => b.updated - a.updated)}
          onListSelected={(id) => {
            const list = (lists ?? []).find((list) => list.id === id);
            if (!selectedList || list?.id !== selectedList?.id) {
              setSelectedList(list);
            } else if (list.id === selectedList.id) {
              setSelectedList(undefined);
            }
          }}
        />
        <div>
          <HomeNews />
          <HomeGuides />
          {selectedList && <HomeUserList dcs={dcs ?? []} list={selectedList} />}
          <LoggedOut hasSession={sessionStatus === 'authenticated'}>
            <HomeLoggedOut />
          </LoggedOut>
          <HomeLeastRecentlyUpdated
            server={server}
            multiWorld={settings['mogboard_homeworld'] !== 'yes'}
            lang={lang}
            leastRecents={(leastRecents ?? []).map((entry) => ({
              ...entry,
              date: new Date(entry.date),
            }))}
          />
        </div>
        <div>
          <HomeAction />
          <h4>
            <Trans>Recent Updates</Trans>
          </h4>
          <RecentUpdatesPanel
            items={(recent ?? []).map((itemId) => getItem(itemId, lang) ?? getFallbackItem(itemId))}
          />
          <TaxRatesPanel data={taxes ?? zeroTaxRates()} world={world} />
          <WorldUploadCountsPanel data={worldUploads ?? []} world={world} />
          <UploadCountPanel
            today={sum(dailyUploads ?? [], 0, 1)}
            week={sum(dailyUploads ?? [], 0, 7)}
          />
          <p className="mog-honorable" style={{ textAlign: 'center', marginTop: 5 }}>
            <Trans>Thank you!</Trans>
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
