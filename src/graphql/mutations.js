/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDailyReport = /* GraphQL */ `
  mutation CreateDailyReport(
    $input: CreateDailyReportInput!
    $condition: ModelDailyReportConditionInput
  ) {
    createDailyReport(input: $input, condition: $condition) {
      reportId
      userId
      reportDate
      employeeName
      trade
      taskDetails
      hoursWorked
      status
      remarks
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateDailyReport = /* GraphQL */ `
  mutation UpdateDailyReport(
    $input: UpdateDailyReportInput!
    $condition: ModelDailyReportConditionInput
  ) {
    updateDailyReport(input: $input, condition: $condition) {
      reportId
      userId
      reportDate
      employeeName
      trade
      taskDetails
      hoursWorked
      status
      remarks
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteDailyReport = /* GraphQL */ `
  mutation DeleteDailyReport(
    $input: DeleteDailyReportInput!
    $condition: ModelDailyReportConditionInput
  ) {
    deleteDailyReport(input: $input, condition: $condition) {
      reportId
      userId
      reportDate
      employeeName
      trade
      taskDetails
      hoursWorked
      status
      remarks
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createSubcontractor = /* GraphQL */ `
  mutation CreateSubcontractor(
    $input: CreateSubcontractorInput!
    $condition: ModelSubcontractorConditionInput
  ) {
    createSubcontractor(input: $input, condition: $condition) {
      id
      reportId
      company
      projectName
      workers
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateSubcontractor = /* GraphQL */ `
  mutation UpdateSubcontractor(
    $input: UpdateSubcontractorInput!
    $condition: ModelSubcontractorConditionInput
  ) {
    updateSubcontractor(input: $input, condition: $condition) {
      id
      reportId
      company
      projectName
      workers
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteSubcontractor = /* GraphQL */ `
  mutation DeleteSubcontractor(
    $input: DeleteSubcontractorInput!
    $condition: ModelSubcontractorConditionInput
  ) {
    deleteSubcontractor(input: $input, condition: $condition) {
      id
      reportId
      company
      projectName
      workers
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createReportTask = /* GraphQL */ `
  mutation CreateReportTask(
    $input: CreateReportTaskInput!
    $condition: ModelReportTaskConditionInput
  ) {
    createReportTask(input: $input, condition: $condition) {
      id
      reportId
      company
      workersOnSite
      task
      status
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateReportTask = /* GraphQL */ `
  mutation UpdateReportTask(
    $input: UpdateReportTaskInput!
    $condition: ModelReportTaskConditionInput
  ) {
    updateReportTask(input: $input, condition: $condition) {
      id
      reportId
      company
      workersOnSite
      task
      status
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteReportTask = /* GraphQL */ `
  mutation DeleteReportTask(
    $input: DeleteReportTaskInput!
    $condition: ModelReportTaskConditionInput
  ) {
    deleteReportTask(input: $input, condition: $condition) {
      id
      reportId
      company
      workersOnSite
      task
      status
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createReportIncident = /* GraphQL */ `
  mutation CreateReportIncident(
    $input: CreateReportIncidentInput!
    $condition: ModelReportIncidentConditionInput
  ) {
    createReportIncident(input: $input, condition: $condition) {
      id
      reportId
      level
      title
      time
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateReportIncident = /* GraphQL */ `
  mutation UpdateReportIncident(
    $input: UpdateReportIncidentInput!
    $condition: ModelReportIncidentConditionInput
  ) {
    updateReportIncident(input: $input, condition: $condition) {
      id
      reportId
      level
      title
      time
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteReportIncident = /* GraphQL */ `
  mutation DeleteReportIncident(
    $input: DeleteReportIncidentInput!
    $condition: ModelReportIncidentConditionInput
  ) {
    deleteReportIncident(input: $input, condition: $condition) {
      id
      reportId
      level
      title
      time
      details
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createReportEquipment = /* GraphQL */ `
  mutation CreateReportEquipment(
    $input: CreateReportEquipmentInput!
    $condition: ModelReportEquipmentConditionInput
  ) {
    createReportEquipment(input: $input, condition: $condition) {
      id
      reportId
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateReportEquipment = /* GraphQL */ `
  mutation UpdateReportEquipment(
    $input: UpdateReportEquipmentInput!
    $condition: ModelReportEquipmentConditionInput
  ) {
    updateReportEquipment(input: $input, condition: $condition) {
      id
      reportId
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteReportEquipment = /* GraphQL */ `
  mutation DeleteReportEquipment(
    $input: DeleteReportEquipmentInput!
    $condition: ModelReportEquipmentConditionInput
  ) {
    deleteReportEquipment(input: $input, condition: $condition) {
      id
      reportId
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createReportSchedule = /* GraphQL */ `
  mutation CreateReportSchedule(
    $input: CreateReportScheduleInput!
    $condition: ModelReportScheduleConditionInput
  ) {
    createReportSchedule(input: $input, condition: $condition) {
      id
      reportId
      level
      impact
      description
      impactDays
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateReportSchedule = /* GraphQL */ `
  mutation UpdateReportSchedule(
    $input: UpdateReportScheduleInput!
    $condition: ModelReportScheduleConditionInput
  ) {
    updateReportSchedule(input: $input, condition: $condition) {
      id
      reportId
      level
      impact
      description
      impactDays
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteReportSchedule = /* GraphQL */ `
  mutation DeleteReportSchedule(
    $input: DeleteReportScheduleInput!
    $condition: ModelReportScheduleConditionInput
  ) {
    deleteReportSchedule(input: $input, condition: $condition) {
      id
      reportId
      level
      impact
      description
      impactDays
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createReportDelivery = /* GraphQL */ `
  mutation CreateReportDelivery(
    $input: CreateReportDeliveryInput!
    $condition: ModelReportDeliveryConditionInput
  ) {
    createReportDelivery(input: $input, condition: $condition) {
      id
      reportId
      supplier
      material
      time
      received
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateReportDelivery = /* GraphQL */ `
  mutation UpdateReportDelivery(
    $input: UpdateReportDeliveryInput!
    $condition: ModelReportDeliveryConditionInput
  ) {
    updateReportDelivery(input: $input, condition: $condition) {
      id
      reportId
      supplier
      material
      time
      received
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteReportDelivery = /* GraphQL */ `
  mutation DeleteReportDelivery(
    $input: DeleteReportDeliveryInput!
    $condition: ModelReportDeliveryConditionInput
  ) {
    deleteReportDelivery(input: $input, condition: $condition) {
      id
      reportId
      supplier
      material
      time
      received
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createReportObservation = /* GraphQL */ `
  mutation CreateReportObservation(
    $input: CreateReportObservationInput!
    $condition: ModelReportObservationConditionInput
  ) {
    createReportObservation(input: $input, condition: $condition) {
      id
      reportId
      category
      author
      details
      attachmentKeys
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateReportObservation = /* GraphQL */ `
  mutation UpdateReportObservation(
    $input: UpdateReportObservationInput!
    $condition: ModelReportObservationConditionInput
  ) {
    updateReportObservation(input: $input, condition: $condition) {
      id
      reportId
      category
      author
      details
      attachmentKeys
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteReportObservation = /* GraphQL */ `
  mutation DeleteReportObservation(
    $input: DeleteReportObservationInput!
    $condition: ModelReportObservationConditionInput
  ) {
    deleteReportObservation(input: $input, condition: $condition) {
      id
      reportId
      category
      author
      details
      attachmentKeys
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createPreTaskPlanMaster = /* GraphQL */ `
  mutation CreatePreTaskPlanMaster(
    $input: CreatePreTaskPlanMasterInput!
    $condition: ModelPreTaskPlanMasterConditionInput
  ) {
    createPreTaskPlanMaster(input: $input, condition: $condition) {
      master_id
      master_title
      master_category_name
      master_name
      master_description
      icon_name
      display_sequence_number
      active_indicator
      created_by_user_id
      modified_by_user_id
      items {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updatePreTaskPlanMaster = /* GraphQL */ `
  mutation UpdatePreTaskPlanMaster(
    $input: UpdatePreTaskPlanMasterInput!
    $condition: ModelPreTaskPlanMasterConditionInput
  ) {
    updatePreTaskPlanMaster(input: $input, condition: $condition) {
      master_id
      master_title
      master_category_name
      master_name
      master_description
      icon_name
      display_sequence_number
      active_indicator
      created_by_user_id
      modified_by_user_id
      items {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deletePreTaskPlanMaster = /* GraphQL */ `
  mutation DeletePreTaskPlanMaster(
    $input: DeletePreTaskPlanMasterInput!
    $condition: ModelPreTaskPlanMasterConditionInput
  ) {
    deletePreTaskPlanMaster(input: $input, condition: $condition) {
      master_id
      master_title
      master_category_name
      master_name
      master_description
      icon_name
      display_sequence_number
      active_indicator
      created_by_user_id
      modified_by_user_id
      items {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createPreTaskPlanMasterItem = /* GraphQL */ `
  mutation CreatePreTaskPlanMasterItem(
    $input: CreatePreTaskPlanMasterItemInput!
    $condition: ModelPreTaskPlanMasterItemConditionInput
  ) {
    createPreTaskPlanMasterItem(input: $input, condition: $condition) {
      master_id
      master_item_id
      master_item_name
      master_item_type
      master_item_role_premission
      icon_name
      master_item_code
      display_sequence_number
      active_indicator
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updatePreTaskPlanMasterItem = /* GraphQL */ `
  mutation UpdatePreTaskPlanMasterItem(
    $input: UpdatePreTaskPlanMasterItemInput!
    $condition: ModelPreTaskPlanMasterItemConditionInput
  ) {
    updatePreTaskPlanMasterItem(input: $input, condition: $condition) {
      master_id
      master_item_id
      master_item_name
      master_item_type
      master_item_role_premission
      icon_name
      master_item_code
      display_sequence_number
      active_indicator
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deletePreTaskPlanMasterItem = /* GraphQL */ `
  mutation DeletePreTaskPlanMasterItem(
    $input: DeletePreTaskPlanMasterItemInput!
    $condition: ModelPreTaskPlanMasterItemConditionInput
  ) {
    deletePreTaskPlanMasterItem(input: $input, condition: $condition) {
      master_id
      master_item_id
      master_item_name
      master_item_type
      master_item_role_premission
      icon_name
      master_item_code
      display_sequence_number
      active_indicator
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createPreTaskPlanTemplate = /* GraphQL */ `
  mutation CreatePreTaskPlanTemplate(
    $input: CreatePreTaskPlanTemplateInput!
    $condition: ModelPreTaskPlanTemplateConditionInput
  ) {
    createPreTaskPlanTemplate(input: $input, condition: $condition) {
      template_id
      template_name
      template_option {
        required_permit
        required_checklist
        __typename
      }
      template_status
      base_template
      active_indicator
      created_by_user_id
      modified_by_user_id
      items {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updatePreTaskPlanTemplate = /* GraphQL */ `
  mutation UpdatePreTaskPlanTemplate(
    $input: UpdatePreTaskPlanTemplateInput!
    $condition: ModelPreTaskPlanTemplateConditionInput
  ) {
    updatePreTaskPlanTemplate(input: $input, condition: $condition) {
      template_id
      template_name
      template_option {
        required_permit
        required_checklist
        __typename
      }
      template_status
      base_template
      active_indicator
      created_by_user_id
      modified_by_user_id
      items {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deletePreTaskPlanTemplate = /* GraphQL */ `
  mutation DeletePreTaskPlanTemplate(
    $input: DeletePreTaskPlanTemplateInput!
    $condition: ModelPreTaskPlanTemplateConditionInput
  ) {
    deletePreTaskPlanTemplate(input: $input, condition: $condition) {
      template_id
      template_name
      template_option {
        required_permit
        required_checklist
        __typename
      }
      template_status
      base_template
      active_indicator
      created_by_user_id
      modified_by_user_id
      items {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createProject = /* GraphQL */ `
  mutation CreateProject(
    $input: CreateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    createProject(input: $input, condition: $condition) {
      project_number
      project_name
      project_code
      job_number
      state
      remarks
      project_emergency_information {
        emergency_action_plan_discussion_indicator
        safety_professional_name
        superintendent_name
        muster_location
        note
        __typename
      }
      user_email_id
      ptpControls {
        nextToken
        startedAt
        __typename
      }
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateProject = /* GraphQL */ `
  mutation UpdateProject(
    $input: UpdateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    updateProject(input: $input, condition: $condition) {
      project_number
      project_name
      project_code
      job_number
      state
      remarks
      project_emergency_information {
        emergency_action_plan_discussion_indicator
        safety_professional_name
        superintendent_name
        muster_location
        note
        __typename
      }
      user_email_id
      ptpControls {
        nextToken
        startedAt
        __typename
      }
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteProject = /* GraphQL */ `
  mutation DeleteProject(
    $input: DeleteProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    deleteProject(input: $input, condition: $condition) {
      project_number
      project_name
      project_code
      job_number
      state
      remarks
      project_emergency_information {
        emergency_action_plan_discussion_indicator
        safety_professional_name
        superintendent_name
        muster_location
        note
        __typename
      }
      user_email_id
      ptpControls {
        nextToken
        startedAt
        __typename
      }
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createPreTaskPlanControl = /* GraphQL */ `
  mutation CreatePreTaskPlanControl(
    $input: CreatePreTaskPlanControlInput!
    $condition: ModelPreTaskPlanControlConditionInput
  ) {
    createPreTaskPlanControl(input: $input, condition: $condition) {
      control_id
      control_template_id
      control_name
      project_number
      control_option {
        required_permit
        required_checklist
        __typename
      }
      flagged
      emergency_information {
        emergency_action_plan_discussion_indicator
        safety_professional_name
        superintendent_name
        muster_location
        note
        __typename
      }
      shift_start_review {
        reviewer_name
        review_signature
        signed_datetime
        company_name
        note
        __typename
      }
      shift_start_signature {
        foreman_name
        foreman_signature
        signed_datetime
        company_name
        note
        __typename
      }
      shift_end_review {
        tools_stored_property_indicator
        permit_closed_indicator
        incident_injury_indicator
        incident_reported_indicator
        incident_description
        __typename
      }
      shift_end_signature {
        foreman_name
        foreman_signature
        signed_datetime
        company_name
        note
        __typename
      }
      pretask_plan_status
      copied_from_date
      expiry_time
      created_by_user_id
      modified_by_user_id
      tasks {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updatePreTaskPlanControl = /* GraphQL */ `
  mutation UpdatePreTaskPlanControl(
    $input: UpdatePreTaskPlanControlInput!
    $condition: ModelPreTaskPlanControlConditionInput
  ) {
    updatePreTaskPlanControl(input: $input, condition: $condition) {
      control_id
      control_template_id
      control_name
      project_number
      control_option {
        required_permit
        required_checklist
        __typename
      }
      flagged
      emergency_information {
        emergency_action_plan_discussion_indicator
        safety_professional_name
        superintendent_name
        muster_location
        note
        __typename
      }
      shift_start_review {
        reviewer_name
        review_signature
        signed_datetime
        company_name
        note
        __typename
      }
      shift_start_signature {
        foreman_name
        foreman_signature
        signed_datetime
        company_name
        note
        __typename
      }
      shift_end_review {
        tools_stored_property_indicator
        permit_closed_indicator
        incident_injury_indicator
        incident_reported_indicator
        incident_description
        __typename
      }
      shift_end_signature {
        foreman_name
        foreman_signature
        signed_datetime
        company_name
        note
        __typename
      }
      pretask_plan_status
      copied_from_date
      expiry_time
      created_by_user_id
      modified_by_user_id
      tasks {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deletePreTaskPlanControl = /* GraphQL */ `
  mutation DeletePreTaskPlanControl(
    $input: DeletePreTaskPlanControlInput!
    $condition: ModelPreTaskPlanControlConditionInput
  ) {
    deletePreTaskPlanControl(input: $input, condition: $condition) {
      control_id
      control_template_id
      control_name
      project_number
      control_option {
        required_permit
        required_checklist
        __typename
      }
      flagged
      emergency_information {
        emergency_action_plan_discussion_indicator
        safety_professional_name
        superintendent_name
        muster_location
        note
        __typename
      }
      shift_start_review {
        reviewer_name
        review_signature
        signed_datetime
        company_name
        note
        __typename
      }
      shift_start_signature {
        foreman_name
        foreman_signature
        signed_datetime
        company_name
        note
        __typename
      }
      shift_end_review {
        tools_stored_property_indicator
        permit_closed_indicator
        incident_injury_indicator
        incident_reported_indicator
        incident_description
        __typename
      }
      shift_end_signature {
        foreman_name
        foreman_signature
        signed_datetime
        company_name
        note
        __typename
      }
      pretask_plan_status
      copied_from_date
      expiry_time
      created_by_user_id
      modified_by_user_id
      tasks {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createPreTaskPlanTaskDetail = /* GraphQL */ `
  mutation CreatePreTaskPlanTaskDetail(
    $input: CreatePreTaskPlanTaskDetailInput!
    $condition: ModelPreTaskPlanTaskDetailConditionInput
  ) {
    createPreTaskPlanTaskDetail(input: $input, condition: $condition) {
      control_id
      task_id
      task_type
      project_number
      task_information {
        task_type
        __typename
      }
      crew_login_information {
        task_type
        __typename
      }
      requirment_category
      requirement_selected_value
      s3_key
      file_name
      file_size
      file_synchronization_status
      expiry_time
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updatePreTaskPlanTaskDetail = /* GraphQL */ `
  mutation UpdatePreTaskPlanTaskDetail(
    $input: UpdatePreTaskPlanTaskDetailInput!
    $condition: ModelPreTaskPlanTaskDetailConditionInput
  ) {
    updatePreTaskPlanTaskDetail(input: $input, condition: $condition) {
      control_id
      task_id
      task_type
      project_number
      task_information {
        task_type
        __typename
      }
      crew_login_information {
        task_type
        __typename
      }
      requirment_category
      requirement_selected_value
      s3_key
      file_name
      file_size
      file_synchronization_status
      expiry_time
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deletePreTaskPlanTaskDetail = /* GraphQL */ `
  mutation DeletePreTaskPlanTaskDetail(
    $input: DeletePreTaskPlanTaskDetailInput!
    $condition: ModelPreTaskPlanTaskDetailConditionInput
  ) {
    deletePreTaskPlanTaskDetail(input: $input, condition: $condition) {
      control_id
      task_id
      task_type
      project_number
      task_information {
        task_type
        __typename
      }
      crew_login_information {
        task_type
        __typename
      }
      requirment_category
      requirement_selected_value
      s3_key
      file_name
      file_size
      file_synchronization_status
      expiry_time
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createPreTaskPlanUserProfile = /* GraphQL */ `
  mutation CreatePreTaskPlanUserProfile(
    $input: CreatePreTaskPlanUserProfileInput!
    $condition: ModelPreTaskPlanUserProfileConditionInput
  ) {
    createPreTaskPlanUserProfile(input: $input, condition: $condition) {
      user_id
      user_email_address
      first_name
      last_name
      preference_project
      primary_project
      user_group
      work_phone_number
      email_notification_enabled
      sms_notification_enabled
      language_preference
      company_name
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updatePreTaskPlanUserProfile = /* GraphQL */ `
  mutation UpdatePreTaskPlanUserProfile(
    $input: UpdatePreTaskPlanUserProfileInput!
    $condition: ModelPreTaskPlanUserProfileConditionInput
  ) {
    updatePreTaskPlanUserProfile(input: $input, condition: $condition) {
      user_id
      user_email_address
      first_name
      last_name
      preference_project
      primary_project
      user_group
      work_phone_number
      email_notification_enabled
      sms_notification_enabled
      language_preference
      company_name
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deletePreTaskPlanUserProfile = /* GraphQL */ `
  mutation DeletePreTaskPlanUserProfile(
    $input: DeletePreTaskPlanUserProfileInput!
    $condition: ModelPreTaskPlanUserProfileConditionInput
  ) {
    deletePreTaskPlanUserProfile(input: $input, condition: $condition) {
      user_id
      user_email_address
      first_name
      last_name
      preference_project
      primary_project
      user_group
      work_phone_number
      email_notification_enabled
      sms_notification_enabled
      language_preference
      company_name
      created_by_user_id
      modified_by_user_id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
