import { t } from '@lingui/macro';
import SimpleBar from 'simplebar-react';
import { Region, Server, getServerRegionNameMap } from '../../../service/servers';
import { DataCenter } from '../../../types/game/DataCenter';
import useDataCenters from '../../../hooks/useDataCenters';
import ContentLoader from 'react-content-loader';

interface MarketServerSelectorProps {
  region: Region;
  homeDc?: DataCenter;
  dcs: DataCenter[];
  homeWorldName?: string;
  selectedServer: Server;
  setSelectedServer: (server: Server) => void;
}

const regionNameMapping = getServerRegionNameMap({
  europe: t`Europe`,
  japan: t`Japan`,
  america: t`America`,
  oceania: t`Oceania`,
  china: t`中国`,
  korea: t`한국`,
  traditionalChinese: t`繁中服`,
});

const getShownWorlds = (
  selectedServer: Server,
  regions: readonly Region[],
  dcs: readonly DataCenter[],
  homeDc: DataCenter | undefined
) => {
  // Filter worlds to only show those from the currently-selected data center, prioritizing the user's home server if provided.
  // For regions in all other cases, show all worlds within the region. This is really scuffed but it shows the correct worlds
  // in each server selector in all the scenarios I tested. We should maybe save if we got to a selected world from a selected
  // DC or region so we can persist that scope when selecting a world after that?
  const selectedRegionRollup =
    selectedServer.type === 'region'
      ? selectedServer.region
      : selectedServer.type === 'dc'
      ? selectedServer.dc.region
      : dcs.find((dc) => dc.worlds.some((w) => w.id === selectedServer.world.id))?.region;
  if (!homeDc && (!selectedRegionRollup || !regions.includes(selectedRegionRollup))) {
    return [];
  }

  if (
    homeDc &&
    ((selectedServer.type === 'region' && selectedServer.region !== homeDc.region) ||
      (selectedServer.type === 'dc' && selectedServer.dc.region !== homeDc.region))
  ) {
    return homeDc.worlds;
  }

  if (selectedServer.type === 'region') {
    // Filter DCs and worlds to only show those from the currently selected region
    const filteredDcs = selectedServer.region
      ? dcs.filter((dc) => dc.region === selectedServer.region)
      : [];

    // Flatten all worlds from all data centers and sort them alphabetically
    return filteredDcs.flatMap((dc) => dc.worlds).sort((a, b) => a.name.localeCompare(b.name));
  }

  const currentDc =
    selectedServer.type === 'dc'
      ? selectedServer.dc
      : selectedServer.type === 'world'
      ? dcs.find((dc) => dc.worlds.some((w) => w.id === selectedServer.world.id))
      : undefined;
  return currentDc?.worlds ?? homeDc?.worlds ?? dcs[0].worlds;
};

export default function MarketServerSelector({
  region,
  homeDc,
  dcs,
  homeWorldName,
  selectedServer,
  setSelectedServer,
}: MarketServerSelectorProps) {
  const filteredWorlds = getShownWorlds(selectedServer, [region], dcs, homeDc);
  return (
    <SimpleBar style={{ width: '100%' }}>
      <div className="item_nav_servers">
        <button
          type="button"
          className={`btn-summary ${
            selectedServer.type === 'region' && region === selectedServer.region ? 'open' : ''
          }`}
          onClick={() => setSelectedServer({ type: 'region', region })}
        >
          <i className="xiv-CrossWorld cw-summary"></i> {regionNameMapping.get(region)}
        </button>
        {dcs.map((dc, i) => (
          <button
            key={i}
            type="button"
            className={`btn-summary ${
              selectedServer.type === 'dc' && dc.name === selectedServer.dc.name ? 'open' : ''
            }`}
            onClick={() => setSelectedServer({ type: 'dc', dc })}
          >
            <i className="xiv-CrossWorld cw-summary"></i> {dc.name}
          </button>
        ))}
        {filteredWorlds.map((world, i) => {
          const homeWorld = world.name === homeWorldName;
          const icon = homeWorld ? 'xiv-ItemShard cw-home' : '';
          const className = homeWorld ? 'home-world' : '';
          return (
            <button
              key={i}
              type="button"
              className={`${className} ${
                selectedServer.type === 'world' && world.name === selectedServer.world.name
                  ? 'open'
                  : ''
              }`}
              onClick={() => setSelectedServer({ type: 'world', world })}
            >
              {homeWorld && <i className={icon}></i>}
              {world.name}
            </button>
          );
        })}
      </div>
    </SimpleBar>
  );
}

MarketServerSelector.Skeleton = function SkeletonServerSelector({
  selectedServer,
  setSelectedServer,
  region,
}: DynamicMarketServerSelectorProps) {
  const worldPlaceholders = Array.from(Array(5).keys());
  return (
    <div className="item_nav_servers">
      <button
        type="button"
        className={`btn-summary ${
          selectedServer.type === 'region' && region === selectedServer.region ? 'open' : ''
        }`}
        onClick={() => setSelectedServer({ type: 'region', region })}
      >
        <i className="xiv-CrossWorld cw-summary"></i> {regionNameMapping.get(region)}
      </button>
      {worldPlaceholders.map((i) => {
        const width = (1 / (i + 1)) * 10 + 50;
        return (
          <button key={i} type="button" className="btn-summary">
            <ContentLoader
              uniqueKey={`market-server-selector-skeleton-${region}-${i}`}
              width={width}
              height="10"
              backgroundColor="#afb1b6"
              foregroundColor="#ecebeb"
            >
              <rect rx="5" ry="5" width={width} height="10" />
            </ContentLoader>
          </button>
        );
      })}
    </div>
  );
};

export interface DynamicMarketServerSelectorProps extends Omit<MarketServerSelectorProps, 'dcs'> {}

MarketServerSelector.Dynamic = function DynamicMarketServerSelector(
  props: DynamicMarketServerSelectorProps
) {
  const swrResult = useDataCenters(props.region);
  const { data: dcs, error } = swrResult;
  if (error) {
    console.error(error);
  }

  if (!dcs) {
    return <MarketServerSelector.Skeleton {...props} />;
  }

  return <MarketServerSelector {...props} dcs={dcs} />;
};

export interface MultiRegionMarketServerSelectorProps {
  regions: readonly Region[];
  selectedServer: Server;
  setSelectedServer: (server: Server) => void;
  homeWorldName?: string;
}

MarketServerSelector.MultiRegion = function MultiRegionMarketServerSelector({
  regions,
  selectedServer,
  setSelectedServer,
  homeWorldName,
}: MultiRegionMarketServerSelectorProps) {
  // Fetch data centers for all regions - we need to call hooks at the top level
  // Since regions array is limited to max 3 items (Japan, North-America, Europe, Oceania minus current),
  // we'll conditionally call hooks based on array length
  const query0 = useDataCenters(regions[0]);
  const query1 = useDataCenters(regions[1] ?? regions[0]);
  const query2 = useDataCenters(regions[2] ?? regions[0]);

  // Check if all necessary queries are loaded
  const allLoaded =
    query0.data !== undefined &&
    (regions.length < 2 || query1.data !== undefined) &&
    (regions.length < 3 || query2.data !== undefined);

  if (!allLoaded) {
    // Show skeleton for the first region while loading
    return (
      <MarketServerSelector.Skeleton
        region={regions[0]}
        selectedServer={selectedServer}
        setSelectedServer={setSelectedServer}
      />
    );
  }

  // Combine all data centers from all regions
  const allDcs = [
    ...(query0.data ?? []),
    ...(regions.length >= 2 ? query1.data ?? [] : []),
    ...(regions.length >= 3 ? query2.data ?? [] : []),
  ];

  // Determine which region is currently selected
  const currentSelectedRegion =
    selectedServer.type === 'region'
      ? selectedServer.region
      : selectedServer.type === 'dc'
      ? selectedServer.dc.region
      : selectedServer.type === 'world'
      ? allDcs.find((dc) => dc.worlds.some((w) => w.id === selectedServer.world.id))?.region
      : undefined;

  // Filter DCs and worlds to only show those from the currently selected region
  const filteredDcs = currentSelectedRegion
    ? allDcs.filter((dc) => dc.region === currentSelectedRegion)
    : [];
  const filteredWorlds = getShownWorlds(selectedServer, regions, filteredDcs, undefined);

  return (
    <SimpleBar style={{ width: '100%' }}>
      <div className="item_nav_servers">
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            className={`btn-summary ${
              selectedServer.type === 'region' && region === selectedServer.region ? 'open' : ''
            }`}
            onClick={() => setSelectedServer({ type: 'region', region })}
          >
            <i className="xiv-CrossWorld cw-summary"></i> {regionNameMapping.get(region)}
          </button>
        ))}
        {filteredDcs.map((dc, i) => (
          <button
            key={i}
            type="button"
            className={`btn-summary ${
              selectedServer.type === 'dc' && dc.name === selectedServer.dc.name ? 'open' : ''
            }`}
            onClick={() => setSelectedServer({ type: 'dc', dc })}
          >
            <i className="xiv-CrossWorld cw-summary"></i> {dc.name}
          </button>
        ))}
        {filteredWorlds.map((world, i) => {
          const homeWorld = world.name === homeWorldName;
          const icon = homeWorld ? 'xiv-ItemShard cw-home' : '';
          const className = homeWorld ? 'home-world' : '';
          return (
            <button
              key={i}
              type="button"
              className={`${className} ${
                selectedServer.type === 'world' && world.name === selectedServer.world.name
                  ? 'open'
                  : ''
              }`}
              onClick={() => setSelectedServer({ type: 'world', world })}
            >
              {homeWorld && <i className={icon}></i>}
              {world.name}
            </button>
          );
        })}
      </div>
    </SimpleBar>
  );
};
