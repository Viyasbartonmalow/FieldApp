/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDailyReport = /* GraphQL */ `
  query GetDailyReport($reportId: ID!) {
    getDailyReport(reportId: $reportId) {
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
export const listDailyReports = /* GraphQL */ `
  query ListDailyReports(
    $reportId: ID
    $filter: ModelDailyReportFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listDailyReports(
      reportId: $reportId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncDailyReports = /* GraphQL */ `
  query SyncDailyReports(
    $filter: ModelDailyReportFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncDailyReports(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getSubcontractor = /* GraphQL */ `
  query GetSubcontractor($id: ID!) {
    getSubcontractor(id: $id) {
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
export const listSubcontractors = /* GraphQL */ `
  query ListSubcontractors(
    $id: ID
    $filter: ModelSubcontractorFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSubcontractors(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncSubcontractors = /* GraphQL */ `
  query SyncSubcontractors(
    $filter: ModelSubcontractorFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncSubcontractors(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getReportTask = /* GraphQL */ `
  query GetReportTask($id: ID!) {
    getReportTask(id: $id) {
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
export const listReportTasks = /* GraphQL */ `
  query ListReportTasks(
    $id: ID
    $filter: ModelReportTaskFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReportTasks(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncReportTasks = /* GraphQL */ `
  query SyncReportTasks(
    $filter: ModelReportTaskFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReportTasks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getReportIncident = /* GraphQL */ `
  query GetReportIncident($id: ID!) {
    getReportIncident(id: $id) {
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
export const listReportIncidents = /* GraphQL */ `
  query ListReportIncidents(
    $id: ID
    $filter: ModelReportIncidentFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReportIncidents(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncReportIncidents = /* GraphQL */ `
  query SyncReportIncidents(
    $filter: ModelReportIncidentFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReportIncidents(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getReportEquipment = /* GraphQL */ `
  query GetReportEquipment($id: ID!) {
    getReportEquipment(id: $id) {
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
export const listReportEquipments = /* GraphQL */ `
  query ListReportEquipments(
    $id: ID
    $filter: ModelReportEquipmentFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReportEquipments(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncReportEquipments = /* GraphQL */ `
  query SyncReportEquipments(
    $filter: ModelReportEquipmentFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReportEquipments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getReportSchedule = /* GraphQL */ `
  query GetReportSchedule($id: ID!) {
    getReportSchedule(id: $id) {
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
export const listReportSchedules = /* GraphQL */ `
  query ListReportSchedules(
    $id: ID
    $filter: ModelReportScheduleFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReportSchedules(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncReportSchedules = /* GraphQL */ `
  query SyncReportSchedules(
    $filter: ModelReportScheduleFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReportSchedules(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getReportDelivery = /* GraphQL */ `
  query GetReportDelivery($id: ID!) {
    getReportDelivery(id: $id) {
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
export const listReportDeliveries = /* GraphQL */ `
  query ListReportDeliveries(
    $id: ID
    $filter: ModelReportDeliveryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReportDeliveries(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncReportDeliveries = /* GraphQL */ `
  query SyncReportDeliveries(
    $filter: ModelReportDeliveryFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReportDeliveries(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getReportObservation = /* GraphQL */ `
  query GetReportObservation($id: ID!) {
    getReportObservation(id: $id) {
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
export const listReportObservations = /* GraphQL */ `
  query ListReportObservations(
    $id: ID
    $filter: ModelReportObservationFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReportObservations(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncReportObservations = /* GraphQL */ `
  query SyncReportObservations(
    $filter: ModelReportObservationFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncReportObservations(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getPreTaskPlanMaster = /* GraphQL */ `
  query GetPreTaskPlanMaster($master_id: ID!) {
    getPreTaskPlanMaster(master_id: $master_id) {
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
export const listPreTaskPlanMasters = /* GraphQL */ `
  query ListPreTaskPlanMasters(
    $master_id: ID
    $filter: ModelPreTaskPlanMasterFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPreTaskPlanMasters(
      master_id: $master_id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncPreTaskPlanMasters = /* GraphQL */ `
  query SyncPreTaskPlanMasters(
    $filter: ModelPreTaskPlanMasterFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPreTaskPlanMasters(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getPreTaskPlanMasterItem = /* GraphQL */ `
  query GetPreTaskPlanMasterItem($master_id: ID!, $master_item_id: ID!) {
    getPreTaskPlanMasterItem(
      master_id: $master_id
      master_item_id: $master_item_id
    ) {
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
export const listPreTaskPlanMasterItems = /* GraphQL */ `
  query ListPreTaskPlanMasterItems(
    $master_id: ID
    $master_item_id: ModelIDKeyConditionInput
    $filter: ModelPreTaskPlanMasterItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPreTaskPlanMasterItems(
      master_id: $master_id
      master_item_id: $master_item_id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncPreTaskPlanMasterItems = /* GraphQL */ `
  query SyncPreTaskPlanMasterItems(
    $filter: ModelPreTaskPlanMasterItemFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPreTaskPlanMasterItems(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getPreTaskPlanTemplate = /* GraphQL */ `
  query GetPreTaskPlanTemplate($template_id: ID!) {
    getPreTaskPlanTemplate(template_id: $template_id) {
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
export const listPreTaskPlanTemplates = /* GraphQL */ `
  query ListPreTaskPlanTemplates(
    $template_id: ID
    $filter: ModelPreTaskPlanTemplateFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPreTaskPlanTemplates(
      template_id: $template_id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        template_id
        template_name
        template_status
        base_template
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncPreTaskPlanTemplates = /* GraphQL */ `
  query SyncPreTaskPlanTemplates(
    $filter: ModelPreTaskPlanTemplateFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPreTaskPlanTemplates(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        template_id
        template_name
        template_status
        base_template
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getProject = /* GraphQL */ `
  query GetProject($project_number: ID!) {
    getProject(project_number: $project_number) {
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
export const listProjects = /* GraphQL */ `
  query ListProjects(
    $project_number: ID
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listProjects(
      project_number: $project_number
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        project_number
        project_name
        project_code
        job_number
        state
        remarks
        user_email_id
        created_by_user_id
        modified_by_user_id
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncProjects = /* GraphQL */ `
  query SyncProjects(
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncProjects(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        project_number
        project_name
        project_code
        job_number
        state
        remarks
        user_email_id
        created_by_user_id
        modified_by_user_id
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getPreTaskPlanControl = /* GraphQL */ `
  query GetPreTaskPlanControl($control_id: ID!, $control_template_id: ID!) {
    getPreTaskPlanControl(
      control_id: $control_id
      control_template_id: $control_template_id
    ) {
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
export const listPreTaskPlanControls = /* GraphQL */ `
  query ListPreTaskPlanControls(
    $control_id: ID
    $control_template_id: ModelIDKeyConditionInput
    $filter: ModelPreTaskPlanControlFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPreTaskPlanControls(
      control_id: $control_id
      control_template_id: $control_template_id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        control_id
        control_template_id
        control_name
        project_number
        flagged
        pretask_plan_status
        copied_from_date
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncPreTaskPlanControls = /* GraphQL */ `
  query SyncPreTaskPlanControls(
    $filter: ModelPreTaskPlanControlFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPreTaskPlanControls(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        control_id
        control_template_id
        control_name
        project_number
        flagged
        pretask_plan_status
        copied_from_date
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getPreTaskPlanTaskDetail = /* GraphQL */ `
  query GetPreTaskPlanTaskDetail($control_id: ID!, $task_id: ID!) {
    getPreTaskPlanTaskDetail(control_id: $control_id, task_id: $task_id) {
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
export const listPreTaskPlanTaskDetails = /* GraphQL */ `
  query ListPreTaskPlanTaskDetails(
    $control_id: ID
    $task_id: ModelIDKeyConditionInput
    $filter: ModelPreTaskPlanTaskDetailFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPreTaskPlanTaskDetails(
      control_id: $control_id
      task_id: $task_id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        control_id
        task_id
        task_type
        project_number
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncPreTaskPlanTaskDetails = /* GraphQL */ `
  query SyncPreTaskPlanTaskDetails(
    $filter: ModelPreTaskPlanTaskDetailFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPreTaskPlanTaskDetails(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        control_id
        task_id
        task_type
        project_number
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getPreTaskPlanUserProfile = /* GraphQL */ `
  query GetPreTaskPlanUserProfile(
    $user_id: String!
    $user_email_address: String!
  ) {
    getPreTaskPlanUserProfile(
      user_id: $user_id
      user_email_address: $user_email_address
    ) {
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
export const listPreTaskPlanUserProfiles = /* GraphQL */ `
  query ListPreTaskPlanUserProfiles(
    $user_id: String
    $user_email_address: ModelStringKeyConditionInput
    $filter: ModelPreTaskPlanUserProfileFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPreTaskPlanUserProfiles(
      user_id: $user_id
      user_email_address: $user_email_address
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncPreTaskPlanUserProfiles = /* GraphQL */ `
  query SyncPreTaskPlanUserProfiles(
    $filter: ModelPreTaskPlanUserProfileFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPreTaskPlanUserProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listDailyReportsByUserId = /* GraphQL */ `
  query ListDailyReportsByUserId(
    $userId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelDailyReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDailyReportsByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listDailyReportsByReportDate = /* GraphQL */ `
  query ListDailyReportsByReportDate(
    $reportDate: AWSDate!
    $sortDirection: ModelSortDirection
    $filter: ModelDailyReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDailyReportsByReportDate(
      reportDate: $reportDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listSubcontractorsByReportId = /* GraphQL */ `
  query ListSubcontractorsByReportId(
    $reportId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelSubcontractorFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSubcontractorsByReportId(
      reportId: $reportId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listReportTasksByReportId = /* GraphQL */ `
  query ListReportTasksByReportId(
    $reportId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelReportTaskFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReportTasksByReportId(
      reportId: $reportId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listReportIncidentsByReportId = /* GraphQL */ `
  query ListReportIncidentsByReportId(
    $reportId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelReportIncidentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReportIncidentsByReportId(
      reportId: $reportId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listReportEquipmentsByReportId = /* GraphQL */ `
  query ListReportEquipmentsByReportId(
    $reportId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelReportEquipmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReportEquipmentsByReportId(
      reportId: $reportId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listReportSchedulesByReportId = /* GraphQL */ `
  query ListReportSchedulesByReportId(
    $reportId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelReportScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReportSchedulesByReportId(
      reportId: $reportId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listReportDeliveriesByReportId = /* GraphQL */ `
  query ListReportDeliveriesByReportId(
    $reportId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelReportDeliveryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReportDeliveriesByReportId(
      reportId: $reportId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const listReportObservationsByReportId = /* GraphQL */ `
  query ListReportObservationsByReportId(
    $reportId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelReportObservationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReportObservationsByReportId(
      reportId: $reportId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpMastersByCategoryName = /* GraphQL */ `
  query PtpMastersByCategoryName(
    $master_category_name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanMasterFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpMastersByCategoryName(
      master_category_name: $master_category_name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpMastersByMasterName = /* GraphQL */ `
  query PtpMastersByMasterName(
    $master_name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanMasterFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpMastersByMasterName(
      master_name: $master_name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpTemplateByTemplateName = /* GraphQL */ `
  query PtpTemplateByTemplateName(
    $template_name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanTemplateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpTemplateByTemplateName(
      template_name: $template_name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        template_id
        template_name
        template_status
        base_template
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpTemplateByStatus = /* GraphQL */ `
  query PtpTemplateByStatus(
    $template_status: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanTemplateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpTemplateByStatus(
      template_status: $template_status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        template_id
        template_name
        template_status
        base_template
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const projectsByProjectName = /* GraphQL */ `
  query ProjectsByProjectName(
    $project_name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    projectsByProjectName(
      project_name: $project_name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        project_number
        project_name
        project_code
        job_number
        state
        remarks
        user_email_id
        created_by_user_id
        modified_by_user_id
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpByTemplate = /* GraphQL */ `
  query PtpByTemplate(
    $control_template_id: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanControlFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpByTemplate(
      control_template_id: $control_template_id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        control_id
        control_template_id
        control_name
        project_number
        flagged
        pretask_plan_status
        copied_from_date
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpByProjectSite = /* GraphQL */ `
  query PtpByProjectSite(
    $project_number: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanControlFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpByProjectSite(
      project_number: $project_number
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        control_id
        control_template_id
        control_name
        project_number
        flagged
        pretask_plan_status
        copied_from_date
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpByStatus = /* GraphQL */ `
  query PtpByStatus(
    $pretask_plan_status: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanControlFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpByStatus(
      pretask_plan_status: $pretask_plan_status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        control_id
        control_template_id
        control_name
        project_number
        flagged
        pretask_plan_status
        copied_from_date
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpByEntityType = /* GraphQL */ `
  query PtpByEntityType(
    $task_type: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanTaskDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpByEntityType(
      task_type: $task_type
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        control_id
        task_id
        task_type
        project_number
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpTasksByProjectNumber = /* GraphQL */ `
  query PtpTasksByProjectNumber(
    $project_number: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanTaskDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpTasksByProjectNumber(
      project_number: $project_number
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        control_id
        task_id
        task_type
        project_number
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const ptpTasksByRequirementCategory = /* GraphQL */ `
  query PtpTasksByRequirementCategory(
    $requirment_category: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPreTaskPlanTaskDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ptpTasksByRequirementCategory(
      requirment_category: $requirment_category
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        control_id
        task_id
        task_type
        project_number
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
      nextToken
      startedAt
      __typename
    }
  }
`;
