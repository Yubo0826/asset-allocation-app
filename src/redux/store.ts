import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import historyRecordReducer from './historyRecordSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    historyRecord: historyRecordReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
