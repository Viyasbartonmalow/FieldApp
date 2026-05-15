# Current Data Retrieval Status

## ❌ **Activity & Control Measures - Currently STATIC**

### What's Being Displayed (Hardcoded)
The current data comes from **static constants** defined in `PTPWorkflow.tsx`:

```typescript
const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { 
    key: 'adjacent-work', 
    name: 'Adjacent Work Processes', 
    items: ['Coordinated with Adjacent Employers', 'Need Barriers Between', 'Notified Them of our Presence', 'Others above/below'] 
  },
  { 
    key: 'asbestos', 
    name: 'Asbestos or Lead Paint Potential (CAP)', 
    items: ['Area Contains Asbestos or Lead', 'Asbestos Controls in Place', ...] 
  },
  // ... 20+ more hardcoded categories
]
```

These include:
- Adjacent Work Processes
- Asbestos/Lead Paint
- Barricades/Covers
- Crane/Lifting Equipment
- Electrical Safety
- Environmental
- Excavations
- Fire Hazard
- Hand & Power Tools
- ... and many more (23 total categories)

---

## ❌ **Permits & Checklists - Currently STATIC**

### What's Being Displayed (Hardcoded)
The current data comes from **static constants**:

```typescript
const PERMITS: string[] = [
  "Hot Work Permit",
  "Cold Cutting Permit",
  "Excavation Permit",
  // ... etc
]

const CHECKLISTS: string[] = [
  "Safety Briefing Completed",
  "PPE Inspection Done",
  "Tool Inspection Done",
  // ... etc
]
```

---

## ❌ **PPE Categories - Currently STATIC**

### What's Being Displayed (Hardcoded)
```typescript
const PPE_CATEGORIES: PpeCategory[] = [
  { 
    name: 'Hand Protection', 
    items: ['Cut Resistant Gloves', 'Welder Gloves', 'Nitrile Gloves', ...] 
  },
  { 
    name: 'Head Protection', 
    items: ['Hard Hat', 'Ear Plugs / Muffs'] 
  },
  { 
    name: 'Foot Protection', 
    items: ['Sturdy Work Boots', 'Safety Toe Boot', ...] 
  },
  // ... 7 total categories
]
```

---

## 🔄 What's Actually Configured to Load from Table

### The Setup is Ready! ✅

When page loads, this happens:

```typescript
useEffect(() => {
  const loadTemplateBindings = async () => {
    // Try to load from PreTaskPlanTemplate table
    const templateBindings = await ptpTemplateDataStoreService.loadBaseTemplateBindings()
    
    if (!templateBindings) return  // ← Returns null because table is EMPTY
    
    // If data was found, override static with dynamic:
    if (templateBindings.activityCategories.length > 0) {
      setActivityCategories(templateBindings.activityCategories)  // Would show table data
    }
    if (templateBindings.permits.length > 0) {
      setPermitOptions(templateBindings.permits)  // Would show table data
    }
    if (templateBindings.checklists.length > 0) {
      setChecklistOptions(templateBindings.checklists)  // Would show table data
    }
    if (templateBindings.ppeCategories.length > 0) {
      setPpeCategories(templateBindings.ppeCategories)  // Would show table data
    }
  }
  
  loadTemplateBindings()
}, [])  // Runs on component mount
```

---

## Why It's Still Showing Static Data

**The PreTaskPlanTemplate table is EMPTY** ❌

The flow:
1. Component mounts
2. `loadTemplateBindings()` is called
3. Service queries: `DataStore.query(PreTaskPlanTemplate, where base_template==true)`
4. **Result: No records found** → returns `null`
5. **Fallback**: Component keeps the hardcoded static values
6. **UI shows**: Static ACTIVITY_CATEGORIES, PERMITS, CHECKLISTS, PPE_CATEGORIES

---

## How to Switch to Dynamic Data

### Step 1: Add Data to PreTaskPlanTemplate Table

Use AppSync Console or the mutation provided in `PRETASKPLAN_TEMPLATE_SETUP.md`

### Step 2: Ensure `base_template: true`

```json
{
  "template_id": "base-001",
  "template_name": "My Safety Template",
  "base_template": true,  // ← CRITICAL
  "template_option": {
    "hazards_and_measure": [...],
    "required_permit": [...],
    "required_checklist": [...],
    "required_ppe": [...]
  }
}
```

### Step 3: Reload Page

The service will:
1. Query table and find record where `base_template==true`
2. Transform data to match UI structure
3. **Override static values with table data**
4. **Display dynamic content instead**

---

## Current Flow Diagram

```
PTPWorkflow Component Mounts
    ↓
loadTemplateBindings() called
    ↓
ptpTemplateDataStoreService.loadBaseTemplateBindings()
    ↓
DataStore.query(PreTaskPlanTemplate where base_template==true)
    ↓
[NO DATA IN TABLE] ← Problem is HERE
    ↓
Returns null
    ↓
Component keeps static defaults
    ↓
UI displays: ACTIVITY_CATEGORIES, PERMITS, CHECKLISTS, PPE_CATEGORIES
```

---

## What Needs to Happen for Dynamic Data

```
Add Record to PreTaskPlanTemplate
    ↓
Set base_template = true
    ↓
PTPWorkflow Component Mounts
    ↓
loadTemplateBindings() called
    ↓
DataStore.query finds record ✓
    ↓
transformTemplate() processes data ✓
    ↓
Returns: {
  activityCategories: [...from table],
  permits: [...from table],
  checklists: [...from table],
  ppeCategories: [...from table]
}
    ↓
UI displays: DYNAMIC DATA FROM TABLE ✓
```

---

## Summary

| Aspect | Current Status |
|--------|----------------|
| **Activity & Control Measures** | 🔴 STATIC (23 hardcoded categories) |
| **Permits** | 🔴 STATIC (hardcoded list) |
| **Checklists** | 🔴 STATIC (hardcoded list) |
| **PPE Categories** | 🔴 STATIC (7 hardcoded categories) |
| **PreTaskPlanTemplate Table** | ✅ Created in Amplify |
| **DataStore Connection** | ✅ Ready to query |
| **Service Logic** | ✅ Ready to transform |
| **Component Integration** | ✅ Ready to display dynamic |

**→ System is 95% ready. Just needs data in the table!**
