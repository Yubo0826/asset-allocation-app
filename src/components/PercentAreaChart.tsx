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

interface PercentAreaChartProps {
  historyList: HistoryRecord[]
}

interface SeriesData {
  data: number[]
  type: 'line'
  label: string
  area: boolean
  stack: 'total'
  showMark: boolean
}

const transformToSeries = (historyList: HistoryRecord[]): SeriesData[] => {
  const seriesData: Record<string, SeriesData> = {}

  historyList.forEach(record => {
    record.assets.forEach(asset => {
      if (!seriesData[asset.symbol]) {
        seriesData[asset.symbol] = {
          data: [],
          type: 'line',
          label: asset.symbol,
          area: true,
          stack: 'total',
          showMark: false,
        }
      }
      seriesData[asset.symbol].data.push(asset.balanced_rate)
    })
  })

  return Object.values(seriesData)
}


export default function PercentAreaChart({ historyList }: PercentAreaChartProps) {
  return (
    <LineChart
      width={600}
      height={300}
      series={ transformToSeries(historyList) } 
      xAxis={[
        {
          scaleType: 'time',
          data: historyList.map(item => new Date(item.date)),
        },
      ]}
    />
  )
}
