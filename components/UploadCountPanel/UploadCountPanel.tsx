import { Trans } from '@lingui/macro';

interface UploadCountPanelProps {
  today: number;
  week: number;
}

export default function UploadCountPanel({ today, week }: UploadCountPanelProps) {
  return (
    <div>
      <div>
        <div className="flex updates_box">
          <div>
            <h5>
              <Trans>Uploads today</Trans>
            </h5>
            <br />
            <div className="flex avg_prices">
              <div className="flex_50">{today.toLocaleString()}</div>
            </div>
          </div>
          <div>
            <h5>
              <Trans>Uploads this week</Trans>
            </h5>
            <br />
            <div className="flex avg_prices">
              <div className="flex_50">{week.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
