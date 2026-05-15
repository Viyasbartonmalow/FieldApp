import amplifyconfig from '@/amplifyconfiguration.json'

const APPSYNC_ENDPOINT = (amplifyconfig as { aws_appsync_graphqlEndpoint?: string }).aws_appsync_graphqlEndpoint
const APPSYNC_API_KEY = (amplifyconfig as { aws_appsync_apiKey?: string }).aws_appsync_apiKey

export interface DynamicActivityCategory {
  key: string
  name: string
  items: string[]
  hasDistanceField?: boolean
}

export interface DynamicPpeCategory {
  name: string
  items: string[]
}

export interface TemplateBindingData {
  activityCategories: DynamicActivityCategory[]
  permits: string[]
  checklists: string[]
  ppeCategories: DynamicPpeCategory[]
}

interface HazardAndMeasure {
  hazard_name?: string | null
  hazard_Measure?: string[] | null
  required_clearance_distance?: string | null
}

interface RequiredPpeSelection {
  category?: string | null
  required_PPE?: string[] | null
}

interface TemplateOption {
  required_permit?: string[] | null
  required_checklist?: string[] | null
  required_ppe?: RequiredPpeSelection[] | null
  hazards_and_measure?: HazardAndMeasure[] | null
}

interface PreTaskPlanTemplateRecord {
  template_id: string
  template_name: string
  template_option?: TemplateOption | null
  base_template?: boolean | null
}

const LIST_BASE_TEMPLATES_QUERY = /* GraphQL */ `
  query ListBaseTemplates {
    listPreTaskPlanTemplates(
      limit: 100
    ) {
      items {
        template_id
        template_name
        base_template
        active_indicator
        template_option {
          required_permit
          required_checklist
          required_ppe {
            category
            required_PPE
          }
          hazards_and_measure {
            hazard_name
            hazard_Measure
            required_clearance_distance
          }
        }
      }
    }
  }
`

const toKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const dedupeStrings = (values: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const normalized = (value ?? '').trim()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }
  return result
}

const fetchBaseTemplate = async (): Promise<PreTaskPlanTemplateRecord | null> => {
  if (!APPSYNC_ENDPOINT || !APPSYNC_API_KEY) {
    throw new Error('[ptpTemplateService] Missing AppSync endpoint or API key in amplifyconfiguration.json')
  }

  const response = await fetch(APPSYNC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query: LIST_BASE_TEMPLATES_QUERY }),
  })

  if (!response.ok) return null

  const json = await response.json() as {
    data?: { listPreTaskPlanTemplates?: { items?: PreTaskPlanTemplateRecord[] } }
    errors?: unknown[]
  }

  if (json.errors?.length) {
    console.error('[ptpTemplateService] GraphQL errors:', json.errors)
    return null
  }

  const items = json.data?.listPreTaskPlanTemplates?.items ?? []
  // prefer explicit base_template==true; fallback to first active record
  const base = items.find((r) => r.base_template === true)
    ?? items.find((r) => r !== null && r !== undefined)
    ?? null

  return base ?? null
}

const transformTemplate = (record: PreTaskPlanTemplateRecord): TemplateBindingData => {
  const option = record.template_option ?? {}
  const hazards = option.hazards_and_measure ?? []
  const permits = dedupeStrings(option.required_permit ?? [])
  const checklists = dedupeStrings(option.required_checklist ?? [])

  const activityCategories: DynamicActivityCategory[] = hazards
    .map((hazard) => {
      const name = (hazard.hazard_name ?? '').trim()
      const items = dedupeStrings(hazard.hazard_Measure ?? [])
      if (!name || items.length === 0) return null
      return {
        key: toKey(name),
        name,
        items,
        hasDistanceField: (hazard.required_clearance_distance ?? '').trim().toLowerCase() === 'true',
      } as DynamicActivityCategory
    })
    .filter((item): item is DynamicActivityCategory => item !== null)

  const ppeGroupMap = new Map<string, Set<string>>()
  for (const ppe of option.required_ppe ?? []) {
    const category = (ppe.category ?? '').trim()
    if (!category) continue
    if (!ppeGroupMap.has(category)) ppeGroupMap.set(category, new Set<string>())
    for (const ppeValue of ppe.required_PPE ?? []) {
      const normalized = (ppeValue ?? '').trim()
      if (normalized) ppeGroupMap.get(category)!.add(normalized)
    }
  }

  const ppeCategories: DynamicPpeCategory[] = Array.from(ppeGroupMap.entries()).map(
    ([name, items]) => ({ name, items: Array.from(items) })
  )

  return { activityCategories, permits, checklists, ppeCategories }
}

const ptpTemplateDataStoreService = {
  async loadBaseTemplateBindings(): Promise<TemplateBindingData | null> {
    try {
      console.log('[ptpTemplateService] Fetching from:', APPSYNC_ENDPOINT)
      const record = await fetchBaseTemplate()
      if (!record) {
        console.warn('[ptpTemplateService] No base template found in table.')
        return null
      }
      console.log('[ptpTemplateService] ✅ Loaded template:', record.template_name, '| base_template:', record.base_template)
      const result = transformTemplate(record)
      console.log('[ptpTemplateService] Transformed:', result.activityCategories.length, 'activities,', result.permits.length, 'permits,', result.checklists.length, 'checklists')
      return result
    } catch (err) {
      console.error('[ptpTemplateService] ❌ Failed to load template:', err)
      return null
    }
  },
}

export default ptpTemplateDataStoreService
