import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

interface Stock {
  symbol: string, // 股票代號
  price: number,
  companyName: string
}

interface Asset extends Stock {
  share: number,  // (可輸入) 股數
  expected_rate: number, // (可輸入) 期望比例
  balanced_share: number, // 平衡後股數
  balanced_rate: number,  // 平衡後實際比例
  value: number
}

interface HistoryRecord {
  date: string,  // 紀錄的日期
  assets: Asset[],  // 資產清單
  totalValue: number, // 當前總資產值
  balance: number // 當前餘額
}

// // 模擬歷史資料
const historyList: HistoryRecord[] = [
  {
    date: '2024-10-21T08:22:20.587Z',
    totalValue: 2490,
    balance: 10,
    assets: [
      {
        symbol: 'AAU',
        companyName: 'Almaden Minerals Ltd.',
        price: 50,
        share: 20,
        expected_rate: 60,
        balanced_rate: 60,
        balanced_share: 30,
        value: 1500
      },
      {
        symbol: 'TLL',
        companyName: 'Adsdsn zen Ltd.',
        price: 30,
        share: 50,
        expected_rate: 40,
        balanced_rate: 40,
        balanced_share: 33,
        value: 990
      }
    ]
  },
  {
    date: '2024-11-21T08:22:20.587Z',
    totalValue: 2490,
    balance: 10,
    assets: [
      {
        symbol: 'AAU',
        companyName: 'Almaden Minerals Ltd.',
        price: 50,
        share: 20,
        expected_rate: 60,
        balanced_rate: 60,
        balanced_share: 30,
        value: 1500
      },
      {
        symbol: 'TLL',
        companyName: 'Adsdsn zen Ltd.',
        price: 30,
        share: 50,
        expected_rate: 40,
        balanced_rate: 40,
        balanced_share: 33,
        value: 990
      }
    ]
  }
];

const time = [
  new Date(2015, 1, 0),
  new Date(2015, 2, 0),
  new Date(2015, 3, 0),
  new Date(2015, 4, 0),
  new Date(2015, 5, 0),
  new Date(2015, 6, 0),
  new Date(2015, 7, 0),
];
const a = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const b = [0, 0, 0, 3908, 4800, 3800, 4300];
const c = [2400, 2210, 2290, 2000, 2181, 2500, 2100];

interface CollapsibleTableProps {
  historyList: HistoryRecord[]
}

const getPercents = (array: number[]) =>
  array.map((v, index) => (100 * v) / (a[index] + b[index] + c[index]))

export default function PercentAreaChart({ historyList }: CollapsibleTableProps) {
  return (
    <LineChart
      width={500}
      height={300}
      series={[
        {
          data: getPercents(a),
          type: 'line',
          label: 'a',
          area: true,
          stack: 'total',
          showMark: false,
        },
        {
          data: getPercents(b),
          type: 'line',
          label: 'b',
          area: true,
          stack: 'total',
          showMark: false,
        },
        {
          data: getPercents(c),
          type: 'line',
          label: 'c',
          area: true,
          stack: 'total',
          showMark: false,
        },
      ]}
      xAxis={[
        {
          scaleType: 'time',
          data: time,
          min: time[0].getTime(),
          max: time[time.length - 1].getTime(),
        },
      ]}
    />
  )
}