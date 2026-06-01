export type DailyReportTab =
  | 'subcontractors'
  | 'tasks'
  | 'incidents'
  | 'equipment'
  | 'schedule'
  | 'delivers'
  | 'observations'
  | 'preview'

export interface DailyReportMetric {
  label: string
  value: string
}

export interface SubcontractorItem {
  id: string
  company: string
  projectName?: string
  workers: number
}

export interface TaskItem {
  id: string
  company: string
  workersOnSite: number
  task: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  comments: string
}

export interface IncidentItem {
  id: string
  level: 'Low' | 'Medium' | 'High'
  title: string
  time: string
  details: string
}

export interface EquipmentItem {
  id: string
  name: string
}

export interface ObservationItem {
  id: string
  category: string
  author: string
  details: string
  attachmentKeys?: string[]
  attachments?: string[]
}

export interface ScheduleItem {
  id: string
  level: 'Medium' | 'Positive'
  impact: string
  description: string
  impactDays: string
}

export interface DeliveryItem {
  id: string
  supplier: string
  material: string
  time: string
  received: boolean
}

export interface DailyReportData {
  projectName: string
  subtitle: string
  metrics: DailyReportMetric[]
  subcontractors: SubcontractorItem[]
  tasks: TaskItem[]
  incidents: IncidentItem[]
  equipment: EquipmentItem[]
  observations: ObservationItem[]
  schedule: ScheduleItem[]
  deliveries: DeliveryItem[]
}
