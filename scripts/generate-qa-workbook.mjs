import XLSX from 'xlsx'
import path from 'path'

const workbook = XLSX.utils.book_new()

const testHeaders = [
  'Test Case ID',
  'Module',
  'Test Type (Unit / Integration / Edge)',
  'Scenario',
  'Preconditions',
  'Test Steps',
  'Test Data',
  'Expected Result',
  'Actual Result (if applicable)',
  'Status',
]

const tests = [
  ['UT-DASH-001', 'Dashboard Project Filter', 'Unit', 'Filter PTP by selected project', 'PTP list loaded', '1) Select project 2) Observe rows', 'selectedProject=2019 PDPM Overhead', 'Only selected project PTP rows are visible', 'Pending execution', 'Designed'],
  ['UT-DASH-002', 'Dashboard Project Filter', 'Unit', 'Project filter trim and case normalization', 'PTP has mixed-cased project_number', '1) Select project 2) Evaluate row inclusion', 'selectedProject="2019 pdpm overhead" / row=" 2019 PDPM Overhead "', 'Row is included', 'Pending execution', 'Designed'],
  ['UT-DASH-003', 'Dashboard Project Selection', 'Unit', 'Clear selectedProject when no project remains selected', 'Project modal open', '1) Remove all selected projects 2) Save', 'nextSelections=[]', 'selectedProject reset to empty', 'Pending execution', 'Designed'],
  ['UT-DASH-004', 'Dashboard Status Filter', 'Unit', 'Normalize status filter with spaces', 'Rows with in-progress status exist', '1) Filter by "In Progress"', 'filterStatus=In Progress', 'in-progress rows returned', 'Pending execution', 'Designed'],
  ['UT-DASH-005', 'Dashboard Date Filter', 'Unit', 'Date filter compares calendar day', 'Rows have date-times', '1) Select date filter', '2026-06-01', 'Rows on selected day only', 'Pending execution', 'Designed'],
  ['UT-DASH-006', 'Dashboard Flag Filter', 'Unit', 'Flagged-only filter', 'Mixed flagged rows exist', '1) Enable Flagged filter', 'filterFlagged=true', 'Only flagged rows shown', 'Pending execution', 'Designed'],
  ['UT-DASH-007', 'Dashboard Pagination', 'Unit', 'Reset page on filter changes', 'currentPage > 1', '1) Change filter', 'currentPage=3', 'currentPage becomes 1', 'Pending execution', 'Designed'],
  ['UT-DASH-008', 'Dashboard Stats', 'Unit', 'Stat cards use filtered rows', 'Project filter active', '1) Compare cards vs visible filtered records', 'filteredPTPs length=5', 'Cards match filtered data counts', 'Pending execution', 'Designed'],
  ['UT-DASH-009', 'Dashboard Modal', 'Unit', 'View mode hides PDF download', 'View mode modal open', '1) Open View PTP modal', 'ptpModalMode=view', 'Download PDF button hidden', 'Pending execution', 'Designed'],
  ['UT-DASH-010', 'Dashboard Modal', 'Unit', 'Section ordering in view/export popup', 'exportRecord available', '1) Open modal and inspect sections', 'N/A', 'Hazards > Requirements > Work Steps > remaining', 'Pending execution', 'Designed'],

  ['UT-SVC-001', 'ptpWorkflow.service', 'Unit', 'Status mapping draft->in-progress', 'Workflow row available', '1) Map row', 'row.status=draft', 'Mapped status is in-progress', 'Pending execution', 'Designed'],
  ['UT-SVC-002', 'ptpWorkflow.service', 'Unit', 'Status mapping changes_requested->flagged', 'Workflow row available', '1) Map row', 'row.status=changes_requested', 'Mapped status is flagged', 'Pending execution', 'Designed'],
  ['UT-SVC-003', 'ptpWorkflow.service', 'Unit', 'Include project_number in mapped record', 'Control row has project_number', '1) mapControlToRecord', 'project_number=2019 PDPM Overhead', 'Mapped record contains project_number', 'Pending execution', 'Designed'],
  ['UT-SVC-004', 'projectDataStore.service', 'Unit', 'Deduplicate and sort project names', 'DataStore has duplicate names', '1) call listProjectNames', 'A, A, B', 'Return A, B sorted', 'Pending execution', 'Designed'],
  ['UT-SVC-005', 'projectDataStore.service', 'Unit', 'Fallback to AppSync when DataStore empty', 'DataStore returns no rows', '1) call listProjectNames', '[] local + AppSync rows', 'Returns AppSync names', 'Pending execution', 'Designed'],
  ['UT-SVC-006', 'projectAppsync.service', 'Unit', 'AppSync project list request timeout', 'Mock delayed AppSync endpoint', '1) call listProjectNames', 'delay > 15000ms', 'Request aborts and fallback path continues', 'Pending execution', 'Designed'],
  ['UT-SVC-007', 'projectAppsync.service', 'Unit', 'Legacy project list request timeout', 'Mock delayed legacy endpoint', '1) call listProjectNames', 'delay > 15000ms', 'Request aborts and service remains responsive', 'Pending execution', 'Designed'],
  ['UT-SVC-008', 'projectAppsync.service', 'Unit', 'Merge AppSync and legacy names', 'Both sources available', '1) call listProjectNames', 'AppSync:A,B legacy:B,C', 'Returns A,B,C sorted', 'Pending execution', 'Designed'],

  ['UT-DR-001', 'DailyReportsList Pagination', 'Unit', 'totalPages boundary for zero rows', 'No reports after filters', '1) Apply restrictive filter', 'filteredReports=[]', 'totalPages remains >= 1', 'Pending execution', 'Designed'],
  ['UT-DR-002', 'DailyReportsList Pagination', 'Unit', 'Clamp currentPage when total pages shrink', 'currentPage high then dataset shrinks', '1) Apply filter 2) Verify page', 'currentPage=4 totalPages=1', 'currentPage clamps to 1', 'Pending execution', 'Designed'],
  ['UT-DR-003', 'useDailyReports', 'Unit', 'loadReports sorts by updatedAt desc', 'Store returns unsorted records', '1) call loadReports', 'timestamps mixed', 'reports sorted newest first', 'Pending execution', 'Designed'],
  ['UT-DR-004', 'useDailyReports', 'Unit', 'clearStatus resets status flags', 'error/success populated', '1) call clearStatus', 'N/A', 'error and success cleared', 'Pending execution', 'Designed'],

  ['INT-001', 'Dashboard + ptpWorkflow', 'Integration', 'Dashboard renders PTP data from service', 'DataStore ready', '1) Open dashboard 2) wait for load', 'listWorkflows mocked with rows', 'Rows and cards render correctly', 'Pending execution', 'Designed'],
  ['INT-002', 'Dashboard + ProjectSelectionModal', 'Integration', 'Project selection drives list and stats', 'Projects configured in modal', '1) Select project 2) Save', '2019 PDPM Overhead', 'Filtered table and stats update accordingly', 'Pending execution', 'Designed'],
  ['INT-003', 'Dashboard + Export Modal + PDF', 'Integration', 'Export flow generates PDF from modal content', 'PTP row exists', '1) Open export modal 2) Download PDF', 'Valid record payload', 'PDF downloaded with expected sections', 'Pending execution', 'Designed'],
  ['INT-004', 'projectDataStore + AppSync', 'Integration', 'Fallback from local DataStore to AppSync', 'Local store empty', '1) Open project modal', 'Empty DataStore', 'Projects still load via AppSync', 'Pending execution', 'Designed'],
  ['INT-005', 'projectAppsync + legacy API', 'Integration', 'Legacy API contributes additional project names', 'Legacy endpoint available', '1) call listProjectNames', 'legacy extra names', 'Combined names shown in UI', 'Pending execution', 'Designed'],
  ['INT-006', 'DailyReportsList + useDailyReports', 'Integration', 'Delete report updates list immediately', 'At least one report exists', '1) Click delete 2) Confirm', 'reportId valid', 'Record removed and list refreshes', 'Pending execution', 'Designed'],
  ['INT-007', 'DailyReports create flow', 'Integration', 'Create report routes to report details', 'User context available', '1) Create report via modal', 'project/date/status', 'saveReport success and navigate to /daily-reports/{id}', 'Pending execution', 'Designed'],
  ['INT-008', 'Router + Dashboard toast', 'Integration', 'PTP success toast shown once from location state', 'navigate with ptpSuccess state', '1) Open dashboard 2) Refresh', 'location.state.ptpSuccess=true', 'Toast shown once then state cleared', 'Pending execution', 'Designed'],

  ['EDGE-001', 'Dashboard Filter', 'Edge', 'selectedProject contains extra spaces', 'Rows loaded', '1) Select spaced project text', '" 2019 PDPM Overhead "', 'Rows still match', 'Pending execution', 'Designed'],
  ['EDGE-002', 'Dashboard Filter', 'Edge', 'selectedProject case differs', 'Rows loaded', '1) Select uppercase variant', '"2019 PDPM OVERHEAD"', 'Rows still match', 'Pending execution', 'Designed'],
  ['EDGE-003', 'Dashboard Filter', 'Edge', 'project_number null/undefined in row', 'Mixed dataset', '1) Apply project filter', 'project_number=null', 'Row excluded safely without crash', 'Pending execution', 'Designed'],
  ['EDGE-004', 'projectAppsync.service', 'Edge', 'Legacy endpoint timeout', 'Legacy endpoint delayed', '1) call listProjectNames', 'delay > 15s', 'No indefinite hang; graceful fallback', 'Pending execution', 'Designed'],
  ['EDGE-005', 'projectAppsync.service', 'Edge', 'AppSync endpoint timeout', 'AppSync delayed', '1) call listProjectNames', 'delay > 15s', 'No indefinite hang; fallback to legacy', 'Pending execution', 'Designed'],
  ['EDGE-006', 'DailyReports Pagination', 'Edge', 'Page out-of-range after filter/deletion', 'on page > 1', '1) Reduce result set', 'currentPage=3 -> totalPages=1', 'Page auto-corrects to valid page', 'Pending execution', 'Designed'],
  ['EDGE-007', 'Dashboard Export', 'Edge', 'Missing tasks_json', 'exportRecord tasks missing', '1) Open export modal', 'tasks_json=null', 'No crash; empty state message shown', 'Pending execution', 'Designed'],
  ['EDGE-008', 'Dashboard Export', 'Edge', 'Malformed activity_controls_json', 'payload keys invalid', '1) Open export modal', 'items keys without separator', 'No runtime failure, section renders safely', 'Pending execution', 'Designed'],
  ['EDGE-009', 'Concurrency', 'Edge', 'Rapid delete confirmations', 'Delete dialog open', '1) Double-click confirm quickly', 'same reportId', 'Single delete action due to in-flight protection', 'Pending execution', 'Designed'],
  ['EDGE-010', 'Accessibility', 'Edge', 'Keyboard-only access to project dropdown', 'Dashboard open', '1) Tab and Enter through controls', 'Keyboard input', 'Control fully operable without mouse', 'Pending execution', 'Designed'],
  ['EDGE-011', 'Security', 'Edge', 'Unexpected API payload shape', 'API returns malformed JSON', '1) call project services', 'missing fields', 'Handled gracefully without unhandled exception', 'Pending execution', 'Designed'],
  ['EDGE-012', 'Performance', 'Edge', 'Large PTP dataset filtering', '1000+ rows loaded', '1) apply filters repeatedly', 'ptps=1000', 'Acceptable response and no lock-up', 'Pending execution', 'Designed'],
]

const bugHeaders = [
  'Bug ID',
  'Module',
  'Severity',
  'Priority',
  'Description',
  'Reproduction Steps',
  'Expected Result',
  'Actual Result',
  'Root Cause',
  'Recommended Fix',
  'Status',
]

const bugs = [
  ['BUG-001', 'Dashboard Project Filter', 'High', 'P1', 'Project selection showed no records despite existing data', 'Open Dashboard -> select 2019 PDPM Overhead', 'Related PTP documents should display', 'No records displayed', 'Strict comparison and inconsistent project string formatting', 'Normalize selected and record project values using trim/lowercase', 'Fixed'],
  ['BUG-002', 'Dashboard Project Selection', 'Medium', 'P2', 'Clearing modal selections kept stale selected project active', 'Select project -> reopen modal -> clear all -> save', 'Filter should reset to all projects', 'Stale project filter remained', 'No clear branch when selection array became empty', 'Set selectedProject to empty when nextSelections.length===0', 'Fixed'],
  ['BUG-003', 'projectAppsync.service', 'High', 'P1', 'Project list requests could hang indefinitely under network issues', 'Simulate delayed AppSync/legacy endpoints and fetch project names', 'Request should timeout and recover gracefully', 'UI waits indefinitely in degraded network', 'Unbounded fetch calls without timeout control', 'Use fetchWithTimeout for both AppSync and legacy project list requests', 'Fixed'],
  ['BUG-004', 'DailyReportsList Pagination', 'Medium', 'P2', 'Out-of-range current page after filtering caused false empty results', 'Navigate to higher page, apply restrictive filter', 'Current page should clamp and show available rows', 'No rows visible until manual page change', 'Missing page clamp when totalPages shrinks', 'Clamp currentPage to totalPages and keep totalPages min 1', 'Fixed'],
  ['BUG-005', 'projectDataStore.service', 'Low', 'P3', 'Unused debugging API increased maintenance overhead', 'Review service exports', 'Only required APIs should remain', 'Unused interface/method present', 'Temporary code left after debugging cycle', 'Remove unused interface/method to reduce complexity', 'Fixed'],
]

const fixedHeaders = ['Module', 'File Name', 'Issue', 'Original Code', 'Fixed Code', 'Explanation']

const fixedCode = [
  [
    'Dashboard Project Filter',
    'frontend/src/pages/Dashboard/index.tsx',
    'Project matching failed for case/whitespace variants',
    'if (selectedProject && p.project_number !== selectedProject) return false',
    "if (selectedProject) { const selected = selectedProject.trim().toLowerCase(); const recordProject = (p.project_number ?? '').trim().toLowerCase(); if (recordProject !== selected) return false }",
    'Normalization removed false negatives while preserving existing business logic.',
  ],
  [
    'Dashboard Project Selection',
    'frontend/src/pages/Dashboard/index.tsx',
    'No reset path when all selections removed',
    'if (!nextSelections.includes(selectedProject) && nextSelections.length > 0) { setSelectedProject(nextSelections[0]) }',
    "if (!nextSelections.includes(selectedProject) && nextSelections.length > 0) { setSelectedProject(nextSelections[0]); return } if (nextSelections.length === 0) { setSelectedProject('') }",
    'Ensures filter state always matches modal selection state.',
  ],
  [
    'Project API Service',
    'frontend/src/services/projectAppsync.service.ts',
    'Unbounded project-list fetch requests',
    'const response = await fetch(endpoint, options)',
    'const response = await fetchWithTimeout(endpoint, options, PROJECT_LIST_FETCH_TIMEOUT_MS)',
    'Adds deterministic network timeout and improves resiliency in degraded environments.',
  ],
  [
    'Daily Reports Pagination',
    'frontend/src/features/dailyReports/components/DailyReportsList.tsx',
    'currentPage became invalid after result set shrank',
    'const totalPages = Math.ceil(filteredReports.length / itemsPerPage)',
    'const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage)); useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])',
    'Prevents false-empty states and keeps pagination valid.',
  ],
]

const improvementHeaders = [
  'Category (Performance / Security / Maintainability / Scalability / Accessibility)',
  'Current Issue',
  'Recommendation',
  'Expected Benefit',
  'Priority',
]

const improvements = [
  ['Performance', 'Build warns about very large chunks', 'Implement route-level lazy loading and manualChunks split strategy', 'Faster initial load and lower memory pressure', 'High'],
  ['Performance', 'Repeated filter computations in render path', 'Memoize derived aggregates once per dependency change', 'Lower CPU usage and smoother interactions', 'Medium'],
  ['Performance', 'High fixed workflow fetch limit', 'Introduce paged query strategy with load-more pattern', 'Better scalability for large tenants', 'High'],
  ['Security', 'Client uses AppSync API key in browser', 'Move to Cognito/IAM-based auth where feasible and rotate keys frequently', 'Reduced key exposure risk', 'High'],
  ['Security', 'Verbose logs may leak operational details', 'Guard diagnostics by environment and sanitize logs', 'Lower information disclosure risk', 'Medium'],
  ['Maintainability', 'Large dashboard component handles many responsibilities', 'Extract filtering/pagination/export logic into hooks/helpers', 'Improved readability and testability', 'Medium'],
  ['Maintainability', 'Use of any for payload structures', 'Create strict TS interfaces and parsing helpers', 'Stronger type safety and fewer runtime parsing bugs', 'High'],
  ['Maintainability', 'Fallback network logic duplicated across services', 'Centralize HTTP timeout/retry/error normalization utility', 'Consistent behavior and reduced duplication', 'High'],
  ['Scalability', 'Project dropdown may become heavy with large project lists', 'Add debounced search and optional virtualization in modal list', 'Smoother UX with large datasets', 'Medium'],
  ['Scalability', 'Potential repeated backend calls for static-ish project names', 'Add short-lived in-memory cache with revalidation', 'Reduced backend load and quicker modal open', 'Medium'],
  ['Accessibility', 'Dynamic updates may not be announced by screen readers', 'Add ARIA live regions for toasts/loading/errors', 'Improved SR feedback for async flows', 'High'],
  ['Accessibility', 'Icon-only controls may lack descriptive context in all cases', 'Audit and enforce descriptive aria-label/title coverage', 'Improved keyboard/SR usability', 'High'],
  ['Performance', 'PDF generation expensive for large records', 'Add guarded export progress UX and split rendering work where possible', 'Reduced UI freeze during export', 'Medium'],
  ['Security', 'Legacy API defaults to HTTP localhost fallback', 'Enforce HTTPS in non-local environments at startup validation', 'Improved transport security posture', 'High'],
]

const toSheet = (headers, rows) => XLSX.utils.aoa_to_sheet([headers, ...rows])

XLSX.utils.book_append_sheet(workbook, toSheet(testHeaders, tests), 'TEST CASES')
XLSX.utils.book_append_sheet(workbook, toSheet(bugHeaders, bugs), 'BUGS FOUND')
XLSX.utils.book_append_sheet(workbook, toSheet(fixedHeaders, fixedCode), 'FIXED CODE')
XLSX.utils.book_append_sheet(workbook, toSheet(improvementHeaders, improvements), 'IMPROVEMENTS')

const outputPath = path.resolve('d:/Barton Malow/Field App/QA_Analysis_and_Test_Workbook.xlsx')
XLSX.writeFile(workbook, outputPath)

console.log(`Workbook generated: ${outputPath}`)
console.log(`Rows -> TEST CASES: ${tests.length}, BUGS FOUND: ${bugs.length}, FIXED CODE: ${fixedCode.length}, IMPROVEMENTS: ${improvements.length}`)
