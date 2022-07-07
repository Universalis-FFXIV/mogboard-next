import { t } from '@lingui/macro';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sprintf } from 'sprintf-js';

interface MarketHistoryGraphProps {
  server: string;
  itemId: number;
  entries?: number;
}

function createSalesOptions(data: any[]): Highcharts.Options {
  return {
    credits: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    legend: {
      enabled: true,
    },
    boost: {
      useGPUTranslations: true,
      allowForce: true,
    },
    rangeSelector: {
      allButtonsEnabled: true,
      buttons: [
        {
          type: 'month',
          count: 1,
          text: '1m',
          title: 'View 1 month',
        },
        {
          type: 'month',
          count: 3,
          text: '3m',
          title: 'View 3 months',
        },
        {
          type: 'month',
          count: 6,
          text: '6m',
          title: 'View 6 months',
        },
        {
          type: 'ytd',
          text: 'YTD',
          title: 'View year to date',
        },
        {
          type: 'year',
          count: 1,
          text: '1y',
          title: 'View 1 year',
        },
        {
          type: 'all',
          text: 'All',
          title: 'View all',
        },
      ],
      selected: 0,
    },
    xAxis: [
      {
        ordinal: false,
        range: 60 * 60 * 24 * 30 * 1000,
      },
      {
        ordinal: false,
        range: 60 * 60 * 24 * 30 * 1000,
      },
    ],
    tooltip: {
      valueDecimals: 0,
    },
    yAxis: [
      {
        visible: false,
      },
      {
        visible: false,
      },
    ],
    series: [
      {
        id: 'HC_History_HQ',
        name: sprintf(t`(%s) PerUnit`, 'HQ'),
        data: data
          .filter((sale) => sale.hq)
          .map((sale) => [sale.timestamp * 1000, sale.pricePerUnit]),
        yAxis: 0,
        showInNavigator: true,
        type: 'line',
        navigatorOptions: {
          color: 'rgba(202,200,68,0.35)',
        },
      },
      {
        id: 'HC_History_NQ',
        name: sprintf(t`(%s) PerUnit`, 'NQ'),
        data: data
          .filter((sale) => !sale.hq)
          .map((sale) => [sale.timestamp * 1000, sale.pricePerUnit]),
        yAxis: 0,
        showInNavigator: true,
        type: 'line',
        navigatorOptions: {
          color: 'rgba(120,120,120,0.35)',
        },
      },
      {
        id: 'HC_History_HQ_volume',
        name: sprintf(t`(%s) PerUnit QUANTITY`, 'HQ'),
        data: data.filter((sale) => sale.hq).map((sale) => [sale.timestamp * 1000, sale.quantity]),
        yAxis: 1,
        linkedTo: 'HC_History_HQ',
        type: 'column',
        showInNavigator: false,
      },
      {
        id: 'HC_History_NQ_volume',
        name: sprintf(t`(%s) PerUnit QUANTITY`, 'NQ'),
        data: data.filter((sale) => !sale.hq).map((sale) => [sale.timestamp * 1000, sale.quantity]),
        yAxis: 1,
        linkedTo: 'HC_History_NQ',
        type: 'column',
        showInNavigator: false,
      },
    ],
  };
}

export default function MarketHistoryGraph({ server, itemId, entries }: MarketHistoryGraphProps) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const [options, setOptions] = useState<Highcharts.Options | null>(null);
  useEffect(() => {
    (async () => {
      const sales = await fetch(
        `https://universalis.app/api/history/${server}/${itemId}?entries=${entries ?? 1800}`
      )
        .then((res) => res.json())
        .then((market) => market.entries.sort((a: any, b: any) => a.timestamp - b.timestamp));
      setOptions(createSalesOptions(sales));
      chartComponentRef.current?.chart?.redraw();
    })();
  }, [itemId, server, entries]);

  return (
    <div className="highchart" style={{ width: '100%', height: 320 }}>
      {options != null && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          constructorType="stockChart"
          ref={chartComponentRef}
        />
      )}
    </div>
  );
}
