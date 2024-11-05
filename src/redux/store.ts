import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import historyRecordReducer from './historyRecordSlice'
import assetsReducer from './currentAssetsSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    historyRecord: historyRecordReducer,
    assets: assetsReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
