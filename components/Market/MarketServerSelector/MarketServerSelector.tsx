import { Trans } from '@lingui/macro';
import useSettings from '../../../hooks/useSettings';
import { DataCenter } from '../../../types/game/DataCenter';

interface MarketServerSelectorProps {
  dc: DataCenter;
  selectedWorld: string | null;
  setSelectedWorld: (world: string | null) => void;
}

export default function MarketServerSelector({
  dc,
  selectedWorld,
  setSelectedWorld,
}: MarketServerSelectorProps) {
  const [settings] = useSettings();

  return (
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
  );
}
