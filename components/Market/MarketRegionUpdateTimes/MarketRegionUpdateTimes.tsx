import { t } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { Fragment, Suspense } from 'react';
import useSettings from '../../../hooks/useSettings';
import { DataCenter } from '../../../types/game/DataCenter';

interface MarketRegionUpdateTimesProps {
  dcs: DataCenter[];
  dcWorldUploadTimes: Record<string, Record<number, number>>;
}

export default function MarketRegionUpdateTimes({
  dcs,
  dcWorldUploadTimes,
}: MarketRegionUpdateTimesProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] || 'en';

  const relativeTime = new RelativeTime({ locale: lang });
  return (
    <div className="region_update_times">
      {dcs.map((dc) => (
        <div key={dc.name}>
          {dc.worlds.map((world) => (
            <div key={world.id}>
              <h4>{world.name}</h4>
              <div>
                <Suspense>
                  {dcWorldUploadTimes[dc.name][world.id]
                    ? relativeTime.from(new Date(dcWorldUploadTimes[dc.name][world.id]))
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
