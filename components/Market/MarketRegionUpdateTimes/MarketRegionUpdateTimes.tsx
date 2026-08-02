import { t } from '@lingui/macro';
import { Suspense } from 'react';
import ago from 's-ago';
import SimpleBar from 'simplebar-react';
import { Server } from '../../../service/servers';
import { DataCenter } from '../../../types/game/DataCenter';
import LinkButton from '../../LinkButton/LinkButton';

interface MarketRegionUpdateTimesProps {
  dcs: DataCenter[];
  worldUploadTimes: Record<number, number>;
  setSelectedServer: (server: Server) => void;
}

export default function MarketRegionUpdateTimes({
  dcs,
  worldUploadTimes,
  setSelectedServer,
}: MarketRegionUpdateTimesProps) {
  return (
    <SimpleBar style={{ width: '100%' }}>
      <div className="region_update_times">
        {dcs.map((dc) => (
          <div key={dc.name}>
            {dc.worlds.map((world) => (
              <div key={world.id}>
                <h4>
                  <LinkButton onClick={() => setSelectedServer({ type: 'world', world })}>
                    {world.name}
                  </LinkButton>
                </h4>
                <div>
                  <Suspense>
                    {worldUploadTimes[world.id]
                      ? ago(new Date(worldUploadTimes[world.id]))
                      : t`No data`}
                  </Suspense>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </SimpleBar>
  );
}
