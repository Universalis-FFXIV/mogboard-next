import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useRef, useMemo } from 'react';
import { Item } from '../../../types/game/Item';

interface MarketStackSizeHistogramProps {
  item: Item;
  data: any[];
}

function createHistogramOptions(data: any[], item: Item): Highcharts.Options {
  return {
    chart: {
      height: 200,
    },
    plotOptions: {
      histogram: {
        binWidth: 1,
      },
    },
    credits: {
      text: '',
    },
    title: {
      text: '',
    },
    xAxis: [
      {
        allowDecimals: false,
        type: 'linear',
        title: {
          text: 'Quantity',
        },
      },
    ],
    yAxis: [
      {
        allowDecimals: false,
        title: {
          text: 'Sales',
        },
      },
    ],
    series: [
      {
        id: 'histogram_all',
        name: 'Total',
        data: data.map((x) => x.quantity) as unknown as undefined,
        type: 'histogram',
        zIndex: -2,
      },
      {
        id: 'histogram_all_NQ',
        name: '(NQ) Stack Size Histogram',
        data: data.filter((x) => x.hq).map((x) => x.quantity) as unknown as undefined,
        type: 'histogram',
        zIndex: -1,
      },
      ...((item.canBeHq
        ? [
            {
              id: 'histogram_all_HQ',
              name: '(HQ) Stack Size Histogram',
              data: data.filter((x) => !x.hq).map((x) => x.quantity) as unknown as undefined,
              type: 'histogram',
              zIndex: 0,
            },
          ]
        : []) as Highcharts.SeriesOptionsType[]),
    ],
  };
}

export default function MarketStackSizeHistogram({ data, item }: MarketStackSizeHistogramProps) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const options = useMemo<Highcharts.Options>(() => {
    if (typeof Highcharts === 'object') {
      return createHistogramOptions(data, item);
    }

    return {};
  }, [data, item]);

  return (
    <div className="highchart" style={{ height: 200, width: '100%' }}>
      <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
    </div>
  );
}
