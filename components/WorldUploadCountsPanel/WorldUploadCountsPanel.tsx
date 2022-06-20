import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useRef } from 'react';

interface WorldUploadCount {
  world: string;
  count: number;
}

interface WorldUploadCountsPanelProps {
  data: WorldUploadCount[];
  world?: string;
}

function selectWorld(series: Highcharts.SeriesPieOptions, world?: string) {
  series.data = (series.data as Highcharts.PointOptionsObject[])
    ?.sort((a, b) => (a.y ?? 0) - (b.y ?? 0))
    .map((el) => {
      if (el.name === world) {
        el.selected = true;
        el.sliced = true;
      }

      return el;
    });
}

function pieColors(series: Highcharts.SeriesPieOptions) {
  const pieColorsReturn = [];
  const baseColor = '#7c6939';
  const gradience = 1.3;
  const shift = 1.2;
  const tweak = 17;

  const data = series.data ?? [];
  for (var i = 0; i < data.length; i++) {
    pieColorsReturn.push(
      new Highcharts.Color(baseColor)
        .brighten(Math.pow(gradience, (i - shift * data.length) / (data.length / tweak)))
        .get()
    );
  }

  return pieColorsReturn;
}

function createOptions(data: WorldUploadCount[], world?: string): Highcharts.Options {
  const series: Highcharts.SeriesPieOptions = {
    name: 'Proportion',
    data: data.map((d) => ({
      name: d.world,
      y: d.count,
    })),
    type: 'pie',
  };
  selectWorld(series, world);

  return {
    chart: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 0,
      height: 300,
      plotShadow: false,
      shadow: false,
      type: 'pie',
    },
    plotOptions: {
      pie: {
        colors: pieColors(series),
        dataLabels: {
          enabled: false,
        },
      },
    },
    series: [series],
    title: {
      text: '',
    },
    credits: {
      text: '',
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br>Count: <b>{point.y}</b>',
    },
  };
}

export default function WorldUploadCountsPanel({ data, world }: WorldUploadCountsPanelProps) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  let options: Highcharts.Options = {};
  if (typeof Highcharts === 'object') {
    options = createOptions(data, world);
  }

  return (
    <div className="flex updates_box" style={{ marginBottom: 20 }}>
      <div>
        <h5>Upload Counts by World</h5>
        <br />
        <div className="flex avg_prices">
          <div className="highchart-noborder" style={{ width: '100%' }}>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
