import { t } from '@lingui/macro';
import { Suspense } from 'react';
import ago from 's-ago';
import { DataCenter } from '../../../types/game/DataCenter';

interface MarketRegionUpdateTimesProps {
  dcs: DataCenter[];
  worldUploadTimes: Record<number, number>;
}

export default function MarketRegionUpdateTimes({
  dcs,
  worldUploadTimes,
}: MarketRegionUpdateTimesProps) {
  return (
    <div className="region_update_times">
      {dcs.map((dc) => (
        <div key={dc.name}>
          {dc.worlds.map((world) => (
            <div key={world.id}>
              <h4>{world.name}</h4>
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
  );
}
