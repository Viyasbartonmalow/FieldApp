import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ModuleType = 'ptp' | 'daily-reports' | null

interface ModuleState {
  activeModule: ModuleType
}

const initialState: ModuleState = {
  activeModule: null,
}

const moduleSlice = createSlice({
  name: 'module',
  initialState,
  reducers: {
    setActiveModule: (state, action: PayloadAction<ModuleType>) => {
      state.activeModule = action.payload
    },
    clearModule: (state) => {
      state.activeModule = null
    },
  },
})

export const { setActiveModule, clearModule } = moduleSlice.actions
export default moduleSlice.reducer
