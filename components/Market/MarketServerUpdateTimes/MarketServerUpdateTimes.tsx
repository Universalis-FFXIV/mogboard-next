import { t } from '@lingui/macro';
import { Suspense } from 'react';
import ago from 's-ago';
import SimpleBar from 'simplebar-react';

interface MarketServerUpdateTimesProps {
  worlds: { id: number; name: string }[];
  worldUploadTimes: Record<number, number>;
}

export default function MarketServerUpdateTimes({
  worlds,
  worldUploadTimes,
}: MarketServerUpdateTimesProps) {
  return (
    <SimpleBar style={{ width: '100%' }}>
      <div className="market_update_times">
        {worlds.map((world) => (
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
    </SimpleBar>
  );
}
