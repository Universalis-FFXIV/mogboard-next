const MogboardHighchartsTheme: any = {
  colors: [
    '#cac844', // hq
    '#787878', // nq

    'rgba(202,200,68,0.15)', // hq qty
    'rgba(120,120,120,0.15)', // nq qty

    '#aaeeee',
    '#ff0066',
    '#eeaaee',
    '#55BF3B',
    '#DF5353',
    '#7798BF',
    '#aaeeee',
  ],
  chart: {
    backgroundColor: {
      linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
      stops: [
        [0, '#272a33'],
        [1, '#1d2027'],
      ],
    },
    style: {
      fontFamily: "'Unica One', sans-serif",
    },
    plotBorderColor: '#212124',
  },
  title: {
    style: {
      color: '#848486',
      textTransform: 'uppercase',
      fontSize: '20px',
    },
  },
  subtitle: {
    style: {
      color: '#848486',
      textTransform: 'uppercase',
    },
  },
  xAxis: {
    gridLineColor: '#212124',
    labels: {
      style: {
        color: '#848486',
      },
    },
    lineColor: '#313131',
    minorGridLineColor: '#313131',
    tickColor: '#555557',
    title: {
      style: {
        color: '#848486',
      },
    },
  },
  yAxis: {
    gridLineColor: 'rgba(255,255,255,0)',
    labels: {
      style: {
        color: '#E0E0E3',
      },
    },
    lineColor: '#707073',
    minorGridLineColor: '#505053',
    tickColor: '#707073',
    tickWidth: 1,
    title: {
      style: {
        color: '#A0A0A3',
      },
    },
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    style: {
      color: '#F0F0F0',
    },
  },
  plotOptions: {
    series: {
      animation: false,
      showInNavigator: true,
      dataLabels: {
        color: '#F0F0F3',
        style: {
          fontSize: '12px',
        },
      },
      marker: {
        lineColor: '#333',
      },
    },
    boxplot: {
      fillColor: '#505053',
    },
    candlestick: {
      lineColor: 'white',
    },
    errorbar: {
      color: 'white',
    },
  },
  legend: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    itemStyle: {
      color: '#E0E0E3',
    },
    itemHoverStyle: {
      color: '#FFF',
    },
    itemHiddenStyle: {
      color: '#606063',
    },
    title: {
      style: {
        color: '#C0C0C0',
      },
    },
  },
  credits: {
    style: {
      color: '#666',
    },
  },
  labels: {
    style: {
      color: '#707073',
    },
  },

  drilldown: {
    activeAxisLabelStyle: {
      color: '#F0F0F3',
    },
    activeDataLabelStyle: {
      color: '#F0F0F3',
    },
  },

  navigation: {
    buttonOptions: {
      symbolStroke: '#DDDDDD',
      theme: {
        fill: '#505053',
      },
    },
  },

  // scroll charts
  rangeSelector: {
    buttonTheme: {
      fill: '#505053',
      stroke: '#000000',
      style: {
        color: '#CCC',
      },
      states: {
        hover: {
          fill: '#707073',
          stroke: '#000000',
          style: {
            color: 'white',
          },
        },
        select: {
          fill: '#000003',
          stroke: '#000000',
          style: {
            color: 'white',
          },
        },
      },
    },
    inputBoxBorderColor: '#505053',
    inputPosition: {
      align: 'right',
      x: 40,
      y: 0,
    },
    inputStyle: {
      backgroundColor: '#333',
      color: 'silver',
    },
    labelStyle: {
      color: 'silver',
    },
  },

  navigator: {
    handles: {
      backgroundColor: 'rgb(142,142,142)',
      borderColor: 'rgba(255,255,255,0)',
    },
    outlineColor: 'rgba(255,255,255,0)',
    maskFill: 'rgba(255,255,255,0.1)',
    series: {
      color: '#686868',
      lineColor: '#686868',
    },
    xAxis: {
      gridLineColor: 'rgba(255,255,255,0)',
    },
  },

  scrollbar: {
    barBackgroundColor: 'rgba(255,255,255,0)',
    barBorderColor: 'rgba(255,255,255,0)',
    buttonArrowColor: '#808080',
    buttonBackgroundColor: '#363639',
    buttonBorderColor: '#606063',
    rifleColor: '#7c7c7c',
    trackBackgroundColor: '#404043',
    trackBorderColor: '#404043',
  },
};

export default MogboardHighchartsTheme;
