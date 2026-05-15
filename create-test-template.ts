/**
 * Script to create a sample PreTaskPlanTemplate record in Amplify DataStore
 * This test record can be used to verify data retrieval from the table
 */

import { DataStore } from 'aws-amplify/datastore'
import { PreTaskPlanTemplate } from './frontend/src/models'
import { Amplify } from 'aws-amplify'
import amplifyconfig from './frontend/src/amplifyconfiguration.json'

// Configure Amplify
Amplify.configure(amplifyconfig)

const createTestTemplate = async () => {
  try {
    console.log('Starting DataStore...')
    await DataStore.start()
    console.log('DataStore started successfully')

    // Create a sample base template
    const testTemplate = await DataStore.save(
      new PreTaskPlanTemplate({
        template_id: 'base-template-001',
        template_name: 'Base Safety Template',
        template_status: 'active',
        base_template: true,
        active_indicator: true,
        created_by_user_id: 'admin',
        template_option: {
          hazards_and_measure: [
            {
              hazard_name: 'Fall Hazards',
              hazard_Measure: [
                'Use fall protection equipment',
                'Inspect equipment before use',
                'Maintain clear work area',
              ],
              required_clearance_distance: '10 feet',
            },
            {
              hazard_name: 'Electrical Safety',
              hazard_Measure: [
                'Check equipment for damage',
                'Use GFCI protection',
                'Keep electrical cords clear',
              ],
              required_clearance_distance: '6 feet',
            },
          ],
          required_permit: [
            'Hot Work Permit',
            'Confined Space Entry Permit',
            'Excavation Permit',
          ],
          required_checklist: [
            'Safety Briefing Completed',
            'PPE Inspection Done',
            'Tool Inspection Done',
            'Area Inspection Done',
          ],
          required_ppe: [
            {
              category: 'Head Protection',
              required_PPE: ['Hard Hat', 'Safety Glasses'],
            },
            {
              category: 'Hand Protection',
              required_PPE: ['Work Gloves', 'Chemical Resistant Gloves'],
            },
            {
              category: 'Foot Protection',
              required_PPE: ['Steel Toe Boots', 'Slip-Resistant Sole'],
            },
          ],
        },
      })
    )

    console.log('✅ Test template created successfully!')
    console.log('Template ID:', testTemplate.template_id)
    console.log('Template Name:', testTemplate.template_name)
    console.log('Base Template:', testTemplate.base_template)

    // Query the template back to verify
    console.log('\nQuerying template back...')
    const queried = await DataStore.query(PreTaskPlanTemplate, testTemplate.template_id)
    if (queried) {
      console.log('✅ Template retrieved successfully!')
      console.log('Hazards found:', queried.template_option?.hazards_and_measure?.length || 0)
      console.log('Permits:', queried.template_option?.required_permit)
      console.log('Checklists:', queried.template_option?.required_checklist)
    } else {
      console.log('❌ Template not found in DataStore')
    }

    // Stop DataStore
    await DataStore.stop()
    console.log('DataStore stopped')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
createTestTemplate()
