import { t } from '@lingui/macro';
import SimpleBar from 'simplebar-react';
import { getServerRegionNameMap } from '../../../service/servers';
import { DataCenter } from '../../../types/game/DataCenter';
import { World } from '../../../types/game/World';

type Server =
  | { type: 'region'; region: string }
  | { type: 'dc'; dc: DataCenter }
  | { type: 'world'; world: World };

interface MarketServerSelectorProps {
  region: string;
  homeDc: DataCenter;
  dcs: DataCenter[];
  homeWorldName?: string;
  selectedServer: Server;
  setSelectedServer: (server: Server) => void;
}

export default function MarketServerSelector({
  region,
  homeDc,
  dcs,
  homeWorldName,
  selectedServer,
  setSelectedServer,
}: MarketServerSelectorProps) {
  const regionNameMapping = getServerRegionNameMap({
    europe: t`Europe`,
    japan: t`Japan`,
    america: t`America`,
    oceania: t`Oceania`,
    china: t`中国`,
    korea: t`한국`,
  });

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
        {homeDc.worlds.map((world, i) => {
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
