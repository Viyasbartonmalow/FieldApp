const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'

export interface PreTaskControl {
  id?: string
  project_number?: string | number
  control_name?: string
  control_option?: string
  company_name?: string
  shift_start_signature?: string
  createdAt?: string
}

export interface PreTaskControlResponse {
  success: boolean
  data: PreTaskControl[]
  count: number
  projectName?: string
  reportDate?: string
  error?: string
  message?: string
}

const pretaskControlService = {
  /**
   * Fetch PreTaskPlanControl records for a given project and date
   */
  async fetchPreTaskControls(projectName: string, reportDate: string): Promise<PreTaskControl[]> {
    try {
      const params = new URLSearchParams({
        projectName,
        reportDate,
      })

      const response = await fetch(`${API_BASE_URL}/pretask-controls/legacy-pretask-controls?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PreTaskControlResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to fetch PreTaskPlanControl data')
      }

      return data.data || []
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[PreTaskControl Service] Error fetching data:', message)
      throw error
    }
  },
}

export default pretaskControlService
