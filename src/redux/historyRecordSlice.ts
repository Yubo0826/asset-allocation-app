import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Asset {
  symbol: string, // 股票代號
  price: number,
  companyName: string,
  share: number,  // (可輸入) 股數
  expected_rate: number, // (可輸入) 期望比例
  balanced_share: number, // 平衡後股數
  balanced_rate: number,  // 平衡後實際比例
  value: number // 平衡後的價值 (balanced_share * price)
}

interface HistoryRecord {
  date: string
  assets: Asset[]  // 資產清單
  totalValue: number // 當前總資產值
  balance: number // 當前餘額
}

interface HistoryRecordState {
  records: HistoryRecord[]
}

// {"date":"2024-10-27T07:35:17.869Z","assets":[{"symbol":"VT","companyName":"Vanguard Total World Stock Index Fund","price":118.62,"share":2300,"expected_rate":25,"balanced_rate":25.015372708757255,"balanced_share":1820,"value":215888.4},{"symbol":"SPY","companyName":"SPDR S&P 500 ETF Trust","price":577.99,"share":530,"expected_rate":35,"balanced_rate":34.959764452142245,"balanced_share":522,"value":301710.78},{"symbol":"BND","companyName":"Vanguard Total Bond Market Index Fund","price":73.19,"share":3050,"expected_rate":25,"balanced_rate":25.01793347504606,"balanced_share":2950,"value":215910.5},{"symbol":"VWO","companyName":"Vanguard Emerging Markets Stock Index Fund","price":47.13,"share":1300,"expected_rate":15,"balanced_rate":15.006929364054432,"balanced_share":2748,"value":129513.24}],"totalValue":863022.92,"balance":474.6399999986643},{"date":"2024-10-28T07:35:28.117Z","assets":[{"symbol":"VT","companyName":"Vanguard Total World Stock Index Fund","price":118.62,"share":2300,"expected_rate":35,"balanced_rate":35.01865098836839,"balanced_share":2548,"value":302243.76},{"symbol":"SPY","companyName":"SPDR S&P 500 ETF Trust","price":577.99,"share":530,"expected_rate":20,"balanced_rate":19.956237194973287,"balanced_share":298,"value":172241.02},{"symbol":"BND","companyName":"Vanguard Total Bond Market Index Fund","price":73.19,"share":3050,"expected_rate":10,"balanced_rate":10.006353076370031,"balanced_share":1180,"value":86364.2},{"symbol":"VWO","companyName":"Vanguard Emerging Markets Stock Index Fund","price":47.13,"share":1300,"expected_rate":35,"balanced_rate":35.0187587402883,"balanced_share":6413,"value":302244.69}],"totalValue":863093.6699999999,"balance":596.3599999971971},{"date":"2024-10-29T07:35:55.950Z","assets":[{"symbol":"VT","companyName":"Vanguard Total World Stock Index Fund","price":118.62,"share":2300,"expected_rate":30,"balanced_rate":30.008871788581075,"balanced_share":2184,"value":259066.08000000002},{"symbol":"SPY","companyName":"SPDR S&P 500 ETF Trust","price":577.99,"share":530,"expected_rate":25,"balanced_rate":24.97285932336482,"balanced_share":373,"value":215590.27},{"symbol":"BND","companyName":"Vanguard Total Bond Market Index Fund","price":73.19,"share":3050,"expected_rate":25,"balanced_rate":25.009953106591315,"balanced_share":2950,"value":215910.5},{"symbol":"VWO","companyName":"Vanguard Emerging Markets Stock Index Fund","price":47.13,"share":1300,"expected_rate":20,"balanced_rate":20.008315781462795,"balanced_share":3665,"value":172731.45}],"totalValue":863298.3,"balance":272.4899999984002}
const initialState: HistoryRecordState = {
  records: []
}

const historyRecordSlice = createSlice({
  name: 'historyRecord',
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<HistoryRecordState>) => {
      return action.payload
    },
    addRecord: (state, action: PayloadAction<HistoryRecord>) => {
      state.records.push(action.payload)
    },
    clearRecords: (state) => {
      state.records = []
    },
    deleteRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter((record: HistoryRecord) =>  record.date !== action.payload)
    }
  },
})

export const { setRecords, addRecord, clearRecords, deleteRecord } = historyRecordSlice.actions
export default historyRecordSlice.reducer
