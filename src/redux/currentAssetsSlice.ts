import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Asset } from '../types'
import { Calculate } from '@mui/icons-material'

const initialState: Asset[] = []
const AssetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets: (state, action: PayloadAction<Asset[]>) => {
      return action.payload
    },
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.push(action.payload)
    },
    clearAssets: () => {
      return []
    },
    deleteAsset: (state, action: PayloadAction<string>) => {
      return state.filter((asset: Asset) =>  asset.symbol !== action.payload)
    },
    setShares: (state, action: PayloadAction<{ index: number; value: number }>) => {
      const { index, value } = action.payload
      state[index].share = value
    },
    setExpectedRate: (state, action: PayloadAction<{ index: number; value: number }>) => {
      const { index, value } = action.payload
      state[index].expected_rate = value
    },
    balace: (state, action: PayloadAction<number>) => {
      const total = action.payload
      state.forEach(asset => {
        asset.balanced_share = Math.floor(total * asset.expected_rate / (asset.price * 100))
        asset.value = asset.balanced_share * asset.price
      })
    },
    calculateBalancedRate: (state, action: PayloadAction<number>) => {
      const balancedTotalValue = action.payload
      return state.map(asset => {
        asset.balanced_rate = (asset.price * asset.balanced_share / balancedTotalValue) * 100
        return asset
      })
    }
  },
})

export const { setAssets, addAsset, clearAssets, deleteAsset, setShares, setExpectedRate, balace, calculateBalancedRate } = AssetsSlice.actions
export default AssetsSlice.reducer
