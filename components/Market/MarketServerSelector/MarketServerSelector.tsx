import { Trans } from '@lingui/macro';
import useSettings from '../../../hooks/useSettings';
import { DataCenter } from '../../../types/game/DataCenter';
import { World } from '../../../types/game/World';

type Server = { type: 'dc'; dc: DataCenter } | { type: 'world'; world: World };

interface MarketServerSelectorProps {
  homeDc: DataCenter;
  dcs: DataCenter[];
  selectedServer: Server;
  setSelectedServer: (server: Server) => void;
}

export default function MarketServerSelector({
  homeDc,
  dcs,
  selectedServer,
  setSelectedServer,
}: MarketServerSelectorProps) {
  const [settings] = useSettings();

  return (
    <div className="item_nav_servers">
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
        const homeWorld = world.name === settings['mogboard_server'];
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
  );
}
