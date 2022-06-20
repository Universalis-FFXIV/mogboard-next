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
            <h5>Uploads today</h5>
            <br />
            <div className="flex avg_prices">
              <div className="flex_50">{today.toLocaleString()}</div>
            </div>
          </div>
          <div>
            <h5>Uploads this week</h5>
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
