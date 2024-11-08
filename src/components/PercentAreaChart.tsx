import { LineChart } from '@mui/x-charts/LineChart'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { HistoryRecord } from '../types'

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


export default function PercentAreaChart() {
  const history = useSelector((state: RootState) => state.historyRecord.records)

  return (
    <LineChart
      sx={{width: '50%', marginTop: '5vh'}}
      height={400}
      series={ transformToSeries(history) } 
      xAxis={[
        {
          scaleType: 'time',
          data: history.map(item => new Date(item.date)),
        },
      ]}
    />
  )
}
