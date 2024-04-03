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
});

export default function MarketServerSelector({
  region,
  homeDc,
  dcs,
  homeWorldName,
  selectedServer,
  setSelectedServer,
}: MarketServerSelectorProps) {
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
        {(homeDc ?? dcs[0]).worlds.map((world, i) => {
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
  const { data: dcs } = useDataCenters(props.region);
  if (!dcs) {
    return <MarketServerSelector.Skeleton {...props} />;
  }

  return <MarketServerSelector {...props} dcs={dcs} />;
};
