import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PTPV2 } from '@/types'

interface PTPState {
  items: PTPV2[]
  currentPTP: PTPV2 | null
  isLoading: boolean
  error: string | null
  filters: {
    status?: string
    dateFrom?: string
    dateTo?: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: PTPState = {
  items: [],
  currentPTP: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

const ptpSlice = createSlice({
  name: 'ptp',
  initialState,
  reducers: {
    // Fetch PTPs
    fetchPTPsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchPTPsSuccess: (
      state,
      action: PayloadAction<{
        items: PTPV2[]
        pagination: { page: number; limit: number; total: number }
      }>
    ) => {
      state.items = action.payload.items
      state.pagination = action.payload.pagination
      state.isLoading = false
    },
    fetchPTPsFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Fetch single PTP
    fetchPTPStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchPTPSuccess: (state, action: PayloadAction<PTPV2>) => {
      state.currentPTP = action.payload
      state.isLoading = false
    },
    fetchPTPFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Create PTP
    createPTPStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createPTPSuccess: (state, action: PayloadAction<PTPV2>) => {
      state.items.unshift(action.payload)
      state.isLoading = false
    },
    createPTPFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Update PTP
    updatePTPSuccess: (state, action: PayloadAction<PTPV2>) => {
      const index = state.items.findIndex((ptp) => ptp.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
      if (state.currentPTP?.id === action.payload.id) {
        state.currentPTP = action.payload
      }
    },

    // Delete PTP
    deletePTPSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((ptp) => ptp.id !== action.payload)
    },

    // Set filters
    setFilters: (
      state,
      action: PayloadAction<{ status?: string; dateFrom?: string; dateTo?: string }>
    ) => {
      state.filters = action.payload
      state.pagination.page = 1
    },

    // Set pagination page
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },

    // Clear current PTP
    clearCurrentPTP: (state) => {
      state.currentPTP = null
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchPTPsStart,
  fetchPTPsSuccess,
  fetchPTPsFailed,
  fetchPTPStart,
  fetchPTPSuccess,
  fetchPTPFailed,
  createPTPStart,
  createPTPSuccess,
  createPTPFailed,
  updatePTPSuccess,
  deletePTPSuccess,
  setFilters,
  setPage,
  clearCurrentPTP,
  clearError,
} = ptpSlice.actions

export default ptpSlice.reducer
