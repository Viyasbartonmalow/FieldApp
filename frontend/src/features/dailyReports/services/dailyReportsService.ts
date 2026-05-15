import { DailyReportData } from '@/features/dailyReports/types'

const dailyReportData: DailyReportData = {
  projectName: 'Riverview Medical Center - Phase 2',
  subtitle: 'From Pre-Task Plans - Apr 1, 2026. Editable Until Finalization.',
  metrics: [
    { label: 'TOTAL WORKERS', value: '18' },
    { label: 'TOTAL HOURS', value: '144' },
    { label: 'WEATHER', value: '54°F' },
    { label: 'INCIDENTS', value: '2' },
  ],
  subcontractors: [],
  tasks: [
    {
      id: 'task-1',
      company: 'Atlas Electrical',
      workersOnSite: 6,
      task: 'MEP Rough - In - Rooms 301-312',
      status: 'Not Started',
      comments: '',
    },
    {
      id: 'task-2',
      company: 'ProPipe Mechanical',
      workersOnSite: 6,
      task: 'MEP Rough - In - Rooms 301-312',
      status: 'In Progress',
      comments: '',
    },
  ],
  incidents: [
    {
      id: 'inc-1',
      level: 'Low',
      title: 'Near Miss',
      time: '07:42 AM',
      details: 'Unsecured Scaffold Plank On Level 2 - Removed And Re - Secured Immediately.',
    },
    {
      id: 'inc-2',
      level: 'Low',
      title: 'First Aid',
      time: '09:12 AM',
      details: 'Unsecured Scaffold Plank On Level 2 - Removed And Re - Secured Immediately.',
    },
    {
      id: 'inc-3',
      level: 'High',
      title: 'Accident',
      time: '11:16 AM',
      details: 'Unsecured Scaffold Plank On Level 2 - Removed And Re - Secured Immediately.',
    },
    {
      id: 'inc-4',
      level: 'Medium',
      title: 'Accident',
      time: '11:16 AM',
      details: 'Unsecured Scaffold Plank On Level 2 - Removed And Re - Secured Immediately.',
    },
  ],
  equipment: [
    { id: 'eq-1', name: 'Tower Crane TC-4' },
    { id: 'eq-2', name: 'Concrete Pump P-2' },
    { id: 'eq-3', name: 'Scissor Lift #7' },
    { id: 'eq-4', name: 'Skid Steer #3' },
  ],
  observations: [
    {
      id: 'obs-1',
      category: 'Safety',
      author: 'J. Kowalski',
      details: 'All Workers Wearing Proper PPE On Level 3. Toolbox Talk Conducted At 06:45 AM.',
    },
    {
      id: 'obs-2',
      category: 'Quality',
      author: 'J. Kowalski',
      details: 'Concrete Slump Test Performed - Results Within Spec. No Issues Noted.',
    },
  ],
  schedule: [
    {
      id: 'sch-1',
      level: 'Medium',
      impact: '1 Day',
      description: 'Concrete Pour Delayed Due To Equipment Availability',
      impactDays: '1 Day',
    },
    {
      id: 'sch-2',
      level: 'Positive',
      impact: '+0.5 Days',
      description: 'Steel Erection Ahead Of Schedule - Grid F-H Complete',
      impactDays: '+0.5 Days',
    },
  ],
  deliveries: [
    {
      id: 'del-1',
      supplier: 'Acme Concrete Supply',
      material: 'Ready - Mix Concrete - 40 Yds',
      time: '07:00 AM',
      received: true,
    },
    {
      id: 'del-2',
      supplier: 'Steel Fab Co.',
      material: 'W8x31 Beams - Pieces',
      time: '08:20 AM',
      received: true,
    },
    {
      id: 'del-3',
      supplier: 'National Lumber',
      material: '2x10 Framing Lumber',
      time: '02:00 AM',
      received: false,
    },
  ],
}

export const dailyReportsService = {
  getReport(): DailyReportData {
    return dailyReportData
  },
}
