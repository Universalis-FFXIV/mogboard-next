import { t } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { Suspense } from 'react';
import useSettings from '../../../hooks/useSettings';

interface MarketServerUpdateTimesProps {
  worlds: { id: number; name: string }[];
  worldUploadTimes: Record<number, number>;
}

export default function MarketServerUpdateTimes({
  worlds,
  worldUploadTimes,
}: MarketServerUpdateTimesProps) {
  const [settings] = useSettings();
  const lang = settings['mogboard_language'] || 'en';

  let relativeTime: RelativeTime;
  try {
    relativeTime = new RelativeTime({ locale: lang });
  } catch (err) {
    console.error(err);
    relativeTime = new RelativeTime({ locale: 'en' });
  }

  return (
    <div className="market_update_times">
      {worlds.map((world) => (
        <div key={world.id}>
          <h4>{world.name}</h4>
          <div>
            <Suspense>
              {worldUploadTimes[world.id]
                ? relativeTime.from(new Date(worldUploadTimes[world.id]))
                : t`No data`}
            </Suspense>
          </div>
        </div>
      ))}
    </div>
  );
}
