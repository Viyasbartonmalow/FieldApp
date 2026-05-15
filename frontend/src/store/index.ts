import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import ptpReducer from './ptpSlice'
import moduleReducer from './moduleSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    ptp: ptpReducer,
    module: moduleReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
