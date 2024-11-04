export interface Stock {
  symbol: string // 股票代號
  price: number
  companyName: string
}

export interface Asset extends Stock {
  share: number  // (可輸入) 股數
  expected_rate: number // (可輸入) 期望比例
  balanced_share: number // 平衡後股數
  balanced_rate: number  // 平衡後實際比例
  value: number // 平衡後的價值 (balanced_share * price)
}

export interface HistoryRecord {
  date: string  // 紀錄的日期
  assets: Asset[]  // 資產清單
  totalValue: number // 當前總資產值
  balance: number // 當前餘額
}
