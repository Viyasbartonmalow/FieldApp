/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDailyReport = /* GraphQL */ `
  subscription OnCreateDailyReport(
    $filter: ModelSubscriptionDailyReportFilterInput
  ) {
    onCreateDailyReport(filter: $filter) {
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
export const onUpdateDailyReport = /* GraphQL */ `
  subscription OnUpdateDailyReport(
    $filter: ModelSubscriptionDailyReportFilterInput
  ) {
    onUpdateDailyReport(filter: $filter) {
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
export const onDeleteDailyReport = /* GraphQL */ `
  subscription OnDeleteDailyReport(
    $filter: ModelSubscriptionDailyReportFilterInput
  ) {
    onDeleteDailyReport(filter: $filter) {
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
export const onCreateSubcontractor = /* GraphQL */ `
  subscription OnCreateSubcontractor(
    $filter: ModelSubscriptionSubcontractorFilterInput
  ) {
    onCreateSubcontractor(filter: $filter) {
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
export const onUpdateSubcontractor = /* GraphQL */ `
  subscription OnUpdateSubcontractor(
    $filter: ModelSubscriptionSubcontractorFilterInput
  ) {
    onUpdateSubcontractor(filter: $filter) {
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
export const onDeleteSubcontractor = /* GraphQL */ `
  subscription OnDeleteSubcontractor(
    $filter: ModelSubscriptionSubcontractorFilterInput
  ) {
    onDeleteSubcontractor(filter: $filter) {
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
export const onCreateReportTask = /* GraphQL */ `
  subscription OnCreateReportTask(
    $filter: ModelSubscriptionReportTaskFilterInput
  ) {
    onCreateReportTask(filter: $filter) {
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
export const onUpdateReportTask = /* GraphQL */ `
  subscription OnUpdateReportTask(
    $filter: ModelSubscriptionReportTaskFilterInput
  ) {
    onUpdateReportTask(filter: $filter) {
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
export const onDeleteReportTask = /* GraphQL */ `
  subscription OnDeleteReportTask(
    $filter: ModelSubscriptionReportTaskFilterInput
  ) {
    onDeleteReportTask(filter: $filter) {
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
export const onCreateReportIncident = /* GraphQL */ `
  subscription OnCreateReportIncident(
    $filter: ModelSubscriptionReportIncidentFilterInput
  ) {
    onCreateReportIncident(filter: $filter) {
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
export const onUpdateReportIncident = /* GraphQL */ `
  subscription OnUpdateReportIncident(
    $filter: ModelSubscriptionReportIncidentFilterInput
  ) {
    onUpdateReportIncident(filter: $filter) {
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
export const onDeleteReportIncident = /* GraphQL */ `
  subscription OnDeleteReportIncident(
    $filter: ModelSubscriptionReportIncidentFilterInput
  ) {
    onDeleteReportIncident(filter: $filter) {
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
export const onCreateReportEquipment = /* GraphQL */ `
  subscription OnCreateReportEquipment(
    $filter: ModelSubscriptionReportEquipmentFilterInput
  ) {
    onCreateReportEquipment(filter: $filter) {
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
export const onUpdateReportEquipment = /* GraphQL */ `
  subscription OnUpdateReportEquipment(
    $filter: ModelSubscriptionReportEquipmentFilterInput
  ) {
    onUpdateReportEquipment(filter: $filter) {
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
export const onDeleteReportEquipment = /* GraphQL */ `
  subscription OnDeleteReportEquipment(
    $filter: ModelSubscriptionReportEquipmentFilterInput
  ) {
    onDeleteReportEquipment(filter: $filter) {
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
export const onCreateReportSchedule = /* GraphQL */ `
  subscription OnCreateReportSchedule(
    $filter: ModelSubscriptionReportScheduleFilterInput
  ) {
    onCreateReportSchedule(filter: $filter) {
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
export const onUpdateReportSchedule = /* GraphQL */ `
  subscription OnUpdateReportSchedule(
    $filter: ModelSubscriptionReportScheduleFilterInput
  ) {
    onUpdateReportSchedule(filter: $filter) {
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
export const onDeleteReportSchedule = /* GraphQL */ `
  subscription OnDeleteReportSchedule(
    $filter: ModelSubscriptionReportScheduleFilterInput
  ) {
    onDeleteReportSchedule(filter: $filter) {
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
export const onCreateReportDelivery = /* GraphQL */ `
  subscription OnCreateReportDelivery(
    $filter: ModelSubscriptionReportDeliveryFilterInput
  ) {
    onCreateReportDelivery(filter: $filter) {
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
export const onUpdateReportDelivery = /* GraphQL */ `
  subscription OnUpdateReportDelivery(
    $filter: ModelSubscriptionReportDeliveryFilterInput
  ) {
    onUpdateReportDelivery(filter: $filter) {
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
export const onDeleteReportDelivery = /* GraphQL */ `
  subscription OnDeleteReportDelivery(
    $filter: ModelSubscriptionReportDeliveryFilterInput
  ) {
    onDeleteReportDelivery(filter: $filter) {
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
export const onCreateReportObservation = /* GraphQL */ `
  subscription OnCreateReportObservation(
    $filter: ModelSubscriptionReportObservationFilterInput
  ) {
    onCreateReportObservation(filter: $filter) {
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
export const onUpdateReportObservation = /* GraphQL */ `
  subscription OnUpdateReportObservation(
    $filter: ModelSubscriptionReportObservationFilterInput
  ) {
    onUpdateReportObservation(filter: $filter) {
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
export const onDeleteReportObservation = /* GraphQL */ `
  subscription OnDeleteReportObservation(
    $filter: ModelSubscriptionReportObservationFilterInput
  ) {
    onDeleteReportObservation(filter: $filter) {
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
export const onCreatePreTaskPlanMaster = /* GraphQL */ `
  subscription OnCreatePreTaskPlanMaster(
    $filter: ModelSubscriptionPreTaskPlanMasterFilterInput
  ) {
    onCreatePreTaskPlanMaster(filter: $filter) {
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
export const onUpdatePreTaskPlanMaster = /* GraphQL */ `
  subscription OnUpdatePreTaskPlanMaster(
    $filter: ModelSubscriptionPreTaskPlanMasterFilterInput
  ) {
    onUpdatePreTaskPlanMaster(filter: $filter) {
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
export const onDeletePreTaskPlanMaster = /* GraphQL */ `
  subscription OnDeletePreTaskPlanMaster(
    $filter: ModelSubscriptionPreTaskPlanMasterFilterInput
  ) {
    onDeletePreTaskPlanMaster(filter: $filter) {
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
export const onCreatePreTaskPlanMasterItem = /* GraphQL */ `
  subscription OnCreatePreTaskPlanMasterItem(
    $filter: ModelSubscriptionPreTaskPlanMasterItemFilterInput
  ) {
    onCreatePreTaskPlanMasterItem(filter: $filter) {
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
export const onUpdatePreTaskPlanMasterItem = /* GraphQL */ `
  subscription OnUpdatePreTaskPlanMasterItem(
    $filter: ModelSubscriptionPreTaskPlanMasterItemFilterInput
  ) {
    onUpdatePreTaskPlanMasterItem(filter: $filter) {
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
export const onDeletePreTaskPlanMasterItem = /* GraphQL */ `
  subscription OnDeletePreTaskPlanMasterItem(
    $filter: ModelSubscriptionPreTaskPlanMasterItemFilterInput
  ) {
    onDeletePreTaskPlanMasterItem(filter: $filter) {
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
export const onCreatePreTaskPlanTemplate = /* GraphQL */ `
  subscription OnCreatePreTaskPlanTemplate(
    $filter: ModelSubscriptionPreTaskPlanTemplateFilterInput
  ) {
    onCreatePreTaskPlanTemplate(filter: $filter) {
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
export const onUpdatePreTaskPlanTemplate = /* GraphQL */ `
  subscription OnUpdatePreTaskPlanTemplate(
    $filter: ModelSubscriptionPreTaskPlanTemplateFilterInput
  ) {
    onUpdatePreTaskPlanTemplate(filter: $filter) {
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
export const onDeletePreTaskPlanTemplate = /* GraphQL */ `
  subscription OnDeletePreTaskPlanTemplate(
    $filter: ModelSubscriptionPreTaskPlanTemplateFilterInput
  ) {
    onDeletePreTaskPlanTemplate(filter: $filter) {
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
export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject($filter: ModelSubscriptionProjectFilterInput) {
    onCreateProject(filter: $filter) {
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
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject($filter: ModelSubscriptionProjectFilterInput) {
    onUpdateProject(filter: $filter) {
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
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject($filter: ModelSubscriptionProjectFilterInput) {
    onDeleteProject(filter: $filter) {
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
export const onCreatePreTaskPlanControl = /* GraphQL */ `
  subscription OnCreatePreTaskPlanControl(
    $filter: ModelSubscriptionPreTaskPlanControlFilterInput
  ) {
    onCreatePreTaskPlanControl(filter: $filter) {
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
export const onUpdatePreTaskPlanControl = /* GraphQL */ `
  subscription OnUpdatePreTaskPlanControl(
    $filter: ModelSubscriptionPreTaskPlanControlFilterInput
  ) {
    onUpdatePreTaskPlanControl(filter: $filter) {
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
export const onDeletePreTaskPlanControl = /* GraphQL */ `
  subscription OnDeletePreTaskPlanControl(
    $filter: ModelSubscriptionPreTaskPlanControlFilterInput
  ) {
    onDeletePreTaskPlanControl(filter: $filter) {
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
export const onCreatePreTaskPlanTaskDetail = /* GraphQL */ `
  subscription OnCreatePreTaskPlanTaskDetail(
    $filter: ModelSubscriptionPreTaskPlanTaskDetailFilterInput
  ) {
    onCreatePreTaskPlanTaskDetail(filter: $filter) {
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
export const onUpdatePreTaskPlanTaskDetail = /* GraphQL */ `
  subscription OnUpdatePreTaskPlanTaskDetail(
    $filter: ModelSubscriptionPreTaskPlanTaskDetailFilterInput
  ) {
    onUpdatePreTaskPlanTaskDetail(filter: $filter) {
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
export const onDeletePreTaskPlanTaskDetail = /* GraphQL */ `
  subscription OnDeletePreTaskPlanTaskDetail(
    $filter: ModelSubscriptionPreTaskPlanTaskDetailFilterInput
  ) {
    onDeletePreTaskPlanTaskDetail(filter: $filter) {
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
export const onCreatePreTaskPlanUserProfile = /* GraphQL */ `
  subscription OnCreatePreTaskPlanUserProfile(
    $filter: ModelSubscriptionPreTaskPlanUserProfileFilterInput
  ) {
    onCreatePreTaskPlanUserProfile(filter: $filter) {
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
export const onUpdatePreTaskPlanUserProfile = /* GraphQL */ `
  subscription OnUpdatePreTaskPlanUserProfile(
    $filter: ModelSubscriptionPreTaskPlanUserProfileFilterInput
  ) {
    onUpdatePreTaskPlanUserProfile(filter: $filter) {
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
export const onDeletePreTaskPlanUserProfile = /* GraphQL */ `
  subscription OnDeletePreTaskPlanUserProfile(
    $filter: ModelSubscriptionPreTaskPlanUserProfileFilterInput
  ) {
    onDeletePreTaskPlanUserProfile(filter: $filter) {
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
