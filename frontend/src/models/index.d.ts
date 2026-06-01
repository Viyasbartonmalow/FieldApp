import { ModelInit, MutableModel, __modelMeta__, CustomIdentifier, OptionallyManagedIdentifier, CompositeIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";

export enum SynchronizationStatus {
  PENDING = "PENDING",
  SYNCED = "SYNCED",
  DELETED = "DELETED"
}

export enum LanguagePreference {
  ENGLISH = "ENGLISH",
  SPANISH = "SPANISH"
}

type EagerHazardandmeasurescontrolinformation = {
  readonly hazard_name?: string | null;
  readonly hazard_Measure?: (string | null)[] | null;
  readonly required_clearance_distance?: string | null;
}

type LazyHazardandmeasurescontrolinformation = {
  readonly hazard_name?: string | null;
  readonly hazard_Measure?: (string | null)[] | null;
  readonly required_clearance_distance?: string | null;
}

export declare type Hazardandmeasurescontrolinformation = LazyLoading extends LazyLoadingDisabled ? EagerHazardandmeasurescontrolinformation : LazyHazardandmeasurescontrolinformation

export declare const Hazardandmeasurescontrolinformation: (new (init: ModelInit<Hazardandmeasurescontrolinformation>) => Hazardandmeasurescontrolinformation)

type EagerRequiredppeselection = {
  readonly category?: string | null;
  readonly required_PPE?: (string | null)[] | null;
}

type LazyRequiredppeselection = {
  readonly category?: string | null;
  readonly required_PPE?: (string | null)[] | null;
}

export declare type Requiredppeselection = LazyLoading extends LazyLoadingDisabled ? EagerRequiredppeselection : LazyRequiredppeselection

export declare const Requiredppeselection: (new (init: ModelInit<Requiredppeselection>) => Requiredppeselection)

type EagerPretaskplantemplateoption = {
  readonly required_permit?: (string | null)[] | null;
  readonly required_checklist?: (string | null)[] | null;
  readonly required_ppe?: (Requiredppeselection | null)[] | null;
  readonly hazards_and_measure?: (Hazardandmeasurescontrolinformation | null)[] | null;
}

type LazyPretaskplantemplateoption = {
  readonly required_permit?: (string | null)[] | null;
  readonly required_checklist?: (string | null)[] | null;
  readonly required_ppe?: (Requiredppeselection | null)[] | null;
  readonly hazards_and_measure?: (Hazardandmeasurescontrolinformation | null)[] | null;
}

export declare type Pretaskplantemplateoption = LazyLoading extends LazyLoadingDisabled ? EagerPretaskplantemplateoption : LazyPretaskplantemplateoption

export declare const Pretaskplantemplateoption: (new (init: ModelInit<Pretaskplantemplateoption>) => Pretaskplantemplateoption)

type EagerShiftsignatureinformation = {
  readonly foreman_name?: string | null;
  readonly foreman_signature?: string | null;
  readonly signed_datetime?: string | null;
  readonly company_name?: string | null;
  readonly note?: string | null;
}

type LazyShiftsignatureinformation = {
  readonly foreman_name?: string | null;
  readonly foreman_signature?: string | null;
  readonly signed_datetime?: string | null;
  readonly company_name?: string | null;
  readonly note?: string | null;
}

export declare type Shiftsignatureinformation = LazyLoading extends LazyLoadingDisabled ? EagerShiftsignatureinformation : LazyShiftsignatureinformation

export declare const Shiftsignatureinformation: (new (init: ModelInit<Shiftsignatureinformation>) => Shiftsignatureinformation)

type EagerEmergencyinfomation = {
  readonly emergency_action_plan_discussion_indicator?: boolean | null;
  readonly safety_professional_name?: string | null;
  readonly superintendent_name?: string | null;
  readonly muster_location?: string | null;
  readonly note?: string | null;
}

type LazyEmergencyinfomation = {
  readonly emergency_action_plan_discussion_indicator?: boolean | null;
  readonly safety_professional_name?: string | null;
  readonly superintendent_name?: string | null;
  readonly muster_location?: string | null;
  readonly note?: string | null;
}

export declare type Emergencyinfomation = LazyLoading extends LazyLoadingDisabled ? EagerEmergencyinfomation : LazyEmergencyinfomation

export declare const Emergencyinfomation: (new (init: ModelInit<Emergencyinfomation>) => Emergencyinfomation)

type EagerShiftendreviewinformation = {
  readonly tools_stored_property_indicator?: boolean | null;
  readonly permit_closed_indicator?: boolean | null;
  readonly incident_injury_indicator?: boolean | null;
  readonly incident_reported_indicator?: boolean | null;
  readonly incident_description?: string | null;
}

type LazyShiftendreviewinformation = {
  readonly tools_stored_property_indicator?: boolean | null;
  readonly permit_closed_indicator?: boolean | null;
  readonly incident_injury_indicator?: boolean | null;
  readonly incident_reported_indicator?: boolean | null;
  readonly incident_description?: string | null;
}

export declare type Shiftendreviewinformation = LazyLoading extends LazyLoadingDisabled ? EagerShiftendreviewinformation : LazyShiftendreviewinformation

export declare const Shiftendreviewinformation: (new (init: ModelInit<Shiftendreviewinformation>) => Shiftendreviewinformation)

type EagerReviewersignatureinformation = {
  readonly reviewer_name?: string | null;
  readonly review_signature?: string | null;
  readonly signed_datetime?: string | null;
  readonly company_name?: string | null;
  readonly note?: string | null;
}

type LazyReviewersignatureinformation = {
  readonly reviewer_name?: string | null;
  readonly review_signature?: string | null;
  readonly signed_datetime?: string | null;
  readonly company_name?: string | null;
  readonly note?: string | null;
}

export declare type Reviewersignatureinformation = LazyLoading extends LazyLoadingDisabled ? EagerReviewersignatureinformation : LazyReviewersignatureinformation

export declare const Reviewersignatureinformation: (new (init: ModelInit<Reviewersignatureinformation>) => Reviewersignatureinformation)

type EagerTaskinformation = {
  readonly task?: string | null;
  readonly tools_and_equipment?: string | null;
  readonly other_tool?: string | null;
  readonly tool?: (string | null)[] | null;
  readonly equipment?: (string | null)[] | null;
  readonly task_hazarad?: string | null;
  readonly hazard_control?: string | null;
  readonly competent_person?: string | null;
}

type LazyTaskinformation = {
  readonly task?: string | null;
  readonly tools_and_equipment?: string | null;
  readonly other_tool?: string | null;
  readonly tool?: (string | null)[] | null;
  readonly equipment?: (string | null)[] | null;
  readonly task_hazarad?: string | null;
  readonly hazard_control?: string | null;
  readonly competent_person?: string | null;
}

export declare type Taskinformation = LazyLoading extends LazyLoadingDisabled ? EagerTaskinformation : LazyTaskinformation

export declare const Taskinformation: (new (init: ModelInit<Taskinformation>) => Taskinformation)

type EagerCrewsignatureinformation = {
  readonly crew_name?: string | null;
  readonly crew_signature?: string | null;
  readonly signed_datetime?: string | null;
  readonly signin_comment?: string | null;
  readonly acknowledged_by?: string | null;
  readonly acknowledged_datetime?: string | null;
}

type LazyCrewsignatureinformation = {
  readonly crew_name?: string | null;
  readonly crew_signature?: string | null;
  readonly signed_datetime?: string | null;
  readonly signin_comment?: string | null;
  readonly acknowledged_by?: string | null;
  readonly acknowledged_datetime?: string | null;
}

export declare type Crewsignatureinformation = LazyLoading extends LazyLoadingDisabled ? EagerCrewsignatureinformation : LazyCrewsignatureinformation

export declare const Crewsignatureinformation: (new (init: ModelInit<Crewsignatureinformation>) => Crewsignatureinformation)

type EagerCrewlogininformation = {
  readonly task_type?: string | null;
  readonly crew_login_information?: Crewsignatureinformation | null;
}

type LazyCrewlogininformation = {
  readonly task_type?: string | null;
  readonly crew_login_information?: Crewsignatureinformation | null;
}

export declare type Crewlogininformation = LazyLoading extends LazyLoadingDisabled ? EagerCrewlogininformation : LazyCrewlogininformation

export declare const Crewlogininformation: (new (init: ModelInit<Crewlogininformation>) => Crewlogininformation)

type EagerPretaskplantaskinformation = {
  readonly task_type?: string | null;
  readonly task_data?: (Taskinformation | null)[] | null;
}

type LazyPretaskplantaskinformation = {
  readonly task_type?: string | null;
  readonly task_data?: (Taskinformation | null)[] | null;
}

export declare type Pretaskplantaskinformation = LazyLoading extends LazyLoadingDisabled ? EagerPretaskplantaskinformation : LazyPretaskplantaskinformation

export declare const Pretaskplantaskinformation: (new (init: ModelInit<Pretaskplantaskinformation>) => Pretaskplantaskinformation)

type EagerDailyReport = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<DailyReport, 'reportId'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly reportId: string;
  readonly userId: string;
  readonly reportDate: string;
  readonly employeeName?: string | null;
  readonly trade?: string | null;
  readonly taskDetails?: string | null;
  readonly hoursWorked?: number | null;
  readonly status?: string | null;
  readonly remarks?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDailyReport = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<DailyReport, 'reportId'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly reportId: string;
  readonly userId: string;
  readonly reportDate: string;
  readonly employeeName?: string | null;
  readonly trade?: string | null;
  readonly taskDetails?: string | null;
  readonly hoursWorked?: number | null;
  readonly status?: string | null;
  readonly remarks?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DailyReport = LazyLoading extends LazyLoadingDisabled ? EagerDailyReport : LazyDailyReport

export declare const DailyReport: (new (init: ModelInit<DailyReport>) => DailyReport) & {
  copyOf(source: DailyReport, mutator: (draft: MutableModel<DailyReport>) => MutableModel<DailyReport> | void): DailyReport;
}

type EagerSubcontractor = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Subcontractor, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly company: string;
  readonly projectName?: string | null;
  readonly workers: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazySubcontractor = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Subcontractor, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly company: string;
  readonly projectName?: string | null;
  readonly workers: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Subcontractor = LazyLoading extends LazyLoadingDisabled ? EagerSubcontractor : LazySubcontractor

export declare const Subcontractor: (new (init: ModelInit<Subcontractor>) => Subcontractor) & {
  copyOf(source: Subcontractor, mutator: (draft: MutableModel<Subcontractor>) => MutableModel<Subcontractor> | void): Subcontractor;
}

type EagerReportTask = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportTask, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly company?: string | null;
  readonly workersOnSite?: number | null;
  readonly task?: string | null;
  readonly status?: string | null;
  readonly comments?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReportTask = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportTask, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly company?: string | null;
  readonly workersOnSite?: number | null;
  readonly task?: string | null;
  readonly status?: string | null;
  readonly comments?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReportTask = LazyLoading extends LazyLoadingDisabled ? EagerReportTask : LazyReportTask

export declare const ReportTask: (new (init: ModelInit<ReportTask>) => ReportTask) & {
  copyOf(source: ReportTask, mutator: (draft: MutableModel<ReportTask>) => MutableModel<ReportTask> | void): ReportTask;
}

type EagerReportIncident = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportIncident, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly level?: string | null;
  readonly title?: string | null;
  readonly time?: string | null;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReportIncident = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportIncident, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly level?: string | null;
  readonly title?: string | null;
  readonly time?: string | null;
  readonly details?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReportIncident = LazyLoading extends LazyLoadingDisabled ? EagerReportIncident : LazyReportIncident

export declare const ReportIncident: (new (init: ModelInit<ReportIncident>) => ReportIncident) & {
  copyOf(source: ReportIncident, mutator: (draft: MutableModel<ReportIncident>) => MutableModel<ReportIncident> | void): ReportIncident;
}

type EagerReportEquipment = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportEquipment, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly name: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReportEquipment = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportEquipment, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly name: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReportEquipment = LazyLoading extends LazyLoadingDisabled ? EagerReportEquipment : LazyReportEquipment

export declare const ReportEquipment: (new (init: ModelInit<ReportEquipment>) => ReportEquipment) & {
  copyOf(source: ReportEquipment, mutator: (draft: MutableModel<ReportEquipment>) => MutableModel<ReportEquipment> | void): ReportEquipment;
}

type EagerReportSchedule = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportSchedule, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly level?: string | null;
  readonly impact?: string | null;
  readonly description?: string | null;
  readonly impactDays?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReportSchedule = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportSchedule, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly level?: string | null;
  readonly impact?: string | null;
  readonly description?: string | null;
  readonly impactDays?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReportSchedule = LazyLoading extends LazyLoadingDisabled ? EagerReportSchedule : LazyReportSchedule

export declare const ReportSchedule: (new (init: ModelInit<ReportSchedule>) => ReportSchedule) & {
  copyOf(source: ReportSchedule, mutator: (draft: MutableModel<ReportSchedule>) => MutableModel<ReportSchedule> | void): ReportSchedule;
}

type EagerReportDelivery = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportDelivery, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly supplier?: string | null;
  readonly material?: string | null;
  readonly time?: string | null;
  readonly received?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReportDelivery = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportDelivery, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly supplier?: string | null;
  readonly material?: string | null;
  readonly time?: string | null;
  readonly received?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReportDelivery = LazyLoading extends LazyLoadingDisabled ? EagerReportDelivery : LazyReportDelivery

export declare const ReportDelivery: (new (init: ModelInit<ReportDelivery>) => ReportDelivery) & {
  copyOf(source: ReportDelivery, mutator: (draft: MutableModel<ReportDelivery>) => MutableModel<ReportDelivery> | void): ReportDelivery;
}

type EagerReportObservation = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportObservation, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly category?: string | null;
  readonly author?: string | null;
  readonly details?: string | null;
  readonly attachmentKeys?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReportObservation = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<ReportObservation, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly reportId: string;
  readonly category?: string | null;
  readonly author?: string | null;
  readonly details?: string | null;
  readonly attachmentKeys?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ReportObservation = LazyLoading extends LazyLoadingDisabled ? EagerReportObservation : LazyReportObservation

export declare const ReportObservation: (new (init: ModelInit<ReportObservation>) => ReportObservation) & {
  copyOf(source: ReportObservation, mutator: (draft: MutableModel<ReportObservation>) => MutableModel<ReportObservation> | void): ReportObservation;
}

type EagerPreTaskPlanMaster = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<PreTaskPlanMaster, 'master_id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly master_id: string;
  readonly master_title: string;
  readonly master_category_name: string;
  readonly master_name: string;
  readonly master_description: string;
  readonly icon_name?: string | null;
  readonly display_sequence_number: number;
  readonly active_indicator: boolean;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly items?: (PreTaskPlanMasterItem | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPreTaskPlanMaster = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<PreTaskPlanMaster, 'master_id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly master_id: string;
  readonly master_title: string;
  readonly master_category_name: string;
  readonly master_name: string;
  readonly master_description: string;
  readonly icon_name?: string | null;
  readonly display_sequence_number: number;
  readonly active_indicator: boolean;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly items: AsyncCollection<PreTaskPlanMasterItem>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PreTaskPlanMaster = LazyLoading extends LazyLoadingDisabled ? EagerPreTaskPlanMaster : LazyPreTaskPlanMaster

export declare const PreTaskPlanMaster: (new (init: ModelInit<PreTaskPlanMaster>) => PreTaskPlanMaster) & {
  copyOf(source: PreTaskPlanMaster, mutator: (draft: MutableModel<PreTaskPlanMaster>) => MutableModel<PreTaskPlanMaster> | void): PreTaskPlanMaster;
}

type EagerPreTaskPlanMasterItem = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanMasterItem, ['master_id', 'master_item_id']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly master_id: string;
  readonly master_item_id: string;
  readonly master_item_name: string;
  readonly master_item_type: string;
  readonly master_item_role_premission?: (string | null)[] | null;
  readonly icon_name?: string | null;
  readonly master_item_code?: string | null;
  readonly display_sequence_number: number;
  readonly active_indicator: boolean;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPreTaskPlanMasterItem = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanMasterItem, ['master_id', 'master_item_id']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly master_id: string;
  readonly master_item_id: string;
  readonly master_item_name: string;
  readonly master_item_type: string;
  readonly master_item_role_premission?: (string | null)[] | null;
  readonly icon_name?: string | null;
  readonly master_item_code?: string | null;
  readonly display_sequence_number: number;
  readonly active_indicator: boolean;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PreTaskPlanMasterItem = LazyLoading extends LazyLoadingDisabled ? EagerPreTaskPlanMasterItem : LazyPreTaskPlanMasterItem

export declare const PreTaskPlanMasterItem: (new (init: ModelInit<PreTaskPlanMasterItem>) => PreTaskPlanMasterItem) & {
  copyOf(source: PreTaskPlanMasterItem, mutator: (draft: MutableModel<PreTaskPlanMasterItem>) => MutableModel<PreTaskPlanMasterItem> | void): PreTaskPlanMasterItem;
}

type EagerPreTaskPlanTemplate = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<PreTaskPlanTemplate, 'template_id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly template_id: string;
  readonly template_name: string;
  readonly template_option?: Pretaskplantemplateoption | null;
  readonly template_status: string;
  readonly base_template?: boolean | null;
  readonly active_indicator: boolean;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly items?: (PreTaskPlanControl | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPreTaskPlanTemplate = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<PreTaskPlanTemplate, 'template_id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly template_id: string;
  readonly template_name: string;
  readonly template_option?: Pretaskplantemplateoption | null;
  readonly template_status: string;
  readonly base_template?: boolean | null;
  readonly active_indicator: boolean;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly items: AsyncCollection<PreTaskPlanControl>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PreTaskPlanTemplate = LazyLoading extends LazyLoadingDisabled ? EagerPreTaskPlanTemplate : LazyPreTaskPlanTemplate

export declare const PreTaskPlanTemplate: (new (init: ModelInit<PreTaskPlanTemplate>) => PreTaskPlanTemplate) & {
  copyOf(source: PreTaskPlanTemplate, mutator: (draft: MutableModel<PreTaskPlanTemplate>) => MutableModel<PreTaskPlanTemplate> | void): PreTaskPlanTemplate;
}

type EagerProject = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Project, 'project_number'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly project_number: string;
  readonly project_name: string;
  readonly project_code?: string | null;
  readonly job_number?: number | null;
  readonly state?: string | null;
  readonly remarks?: string | null;
  readonly project_emergency_information?: Emergencyinfomation | null;
  readonly user_email_id?: (string | null)[] | null;
  readonly ptpControls?: (PreTaskPlanControl | null)[] | null;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProject = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<Project, 'project_number'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly project_number: string;
  readonly project_name: string;
  readonly project_code?: string | null;
  readonly job_number?: number | null;
  readonly state?: string | null;
  readonly remarks?: string | null;
  readonly project_emergency_information?: Emergencyinfomation | null;
  readonly user_email_id?: (string | null)[] | null;
  readonly ptpControls: AsyncCollection<PreTaskPlanControl>;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Project = LazyLoading extends LazyLoadingDisabled ? EagerProject : LazyProject

export declare const Project: (new (init: ModelInit<Project>) => Project) & {
  copyOf(source: Project, mutator: (draft: MutableModel<Project>) => MutableModel<Project> | void): Project;
}

type EagerPreTaskPlanControl = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanControl, ['control_id', 'control_template_id']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly control_id: string;
  readonly control_template_id: string;
  readonly control_name: string;
  readonly project_number: string;
  readonly control_option?: Pretaskplantemplateoption | null;
  readonly flagged?: boolean | null;
  readonly emergency_information?: Emergencyinfomation | null;
  readonly shift_start_review?: Reviewersignatureinformation | null;
  readonly shift_start_signature?: Shiftsignatureinformation | null;
  readonly shift_end_review?: Shiftendreviewinformation | null;
  readonly shift_end_signature?: Shiftsignatureinformation | null;
  readonly pretask_plan_status: string;
  readonly copied_from_date?: string | null;
  readonly expiry_time?: number | null;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly tasks?: (PreTaskPlanTaskDetail | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPreTaskPlanControl = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanControl, ['control_id', 'control_template_id']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly control_id: string;
  readonly control_template_id: string;
  readonly control_name: string;
  readonly project_number: string;
  readonly control_option?: Pretaskplantemplateoption | null;
  readonly flagged?: boolean | null;
  readonly emergency_information?: Emergencyinfomation | null;
  readonly shift_start_review?: Reviewersignatureinformation | null;
  readonly shift_start_signature?: Shiftsignatureinformation | null;
  readonly shift_end_review?: Shiftendreviewinformation | null;
  readonly shift_end_signature?: Shiftsignatureinformation | null;
  readonly pretask_plan_status: string;
  readonly copied_from_date?: string | null;
  readonly expiry_time?: number | null;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly tasks: AsyncCollection<PreTaskPlanTaskDetail>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PreTaskPlanControl = LazyLoading extends LazyLoadingDisabled ? EagerPreTaskPlanControl : LazyPreTaskPlanControl

export declare const PreTaskPlanControl: (new (init: ModelInit<PreTaskPlanControl>) => PreTaskPlanControl) & {
  copyOf(source: PreTaskPlanControl, mutator: (draft: MutableModel<PreTaskPlanControl>) => MutableModel<PreTaskPlanControl> | void): PreTaskPlanControl;
}

type EagerPreTaskPlanTaskDetail = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanTaskDetail, ['control_id', 'task_id']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly control_id: string;
  readonly task_id: string;
  readonly task_type: string;
  readonly project_number?: string | null;
  readonly task_information?: Pretaskplantaskinformation | null;
  readonly crew_login_information?: Crewlogininformation | null;
  readonly requirment_category?: string | null;
  readonly requirement_selected_value?: string | null;
  readonly s3_key?: string | null;
  readonly file_name?: string | null;
  readonly file_size?: string | null;
  readonly file_synchronization_status?: SynchronizationStatus | keyof typeof SynchronizationStatus | null;
  readonly expiry_time?: number | null;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPreTaskPlanTaskDetail = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanTaskDetail, ['control_id', 'task_id']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly control_id: string;
  readonly task_id: string;
  readonly task_type: string;
  readonly project_number?: string | null;
  readonly task_information?: Pretaskplantaskinformation | null;
  readonly crew_login_information?: Crewlogininformation | null;
  readonly requirment_category?: string | null;
  readonly requirement_selected_value?: string | null;
  readonly s3_key?: string | null;
  readonly file_name?: string | null;
  readonly file_size?: string | null;
  readonly file_synchronization_status?: SynchronizationStatus | keyof typeof SynchronizationStatus | null;
  readonly expiry_time?: number | null;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PreTaskPlanTaskDetail = LazyLoading extends LazyLoadingDisabled ? EagerPreTaskPlanTaskDetail : LazyPreTaskPlanTaskDetail

export declare const PreTaskPlanTaskDetail: (new (init: ModelInit<PreTaskPlanTaskDetail>) => PreTaskPlanTaskDetail) & {
  copyOf(source: PreTaskPlanTaskDetail, mutator: (draft: MutableModel<PreTaskPlanTaskDetail>) => MutableModel<PreTaskPlanTaskDetail> | void): PreTaskPlanTaskDetail;
}

type EagerPreTaskPlanUserProfile = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanUserProfile, ['user_id', 'user_email_address']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly user_id: string;
  readonly user_email_address: string;
  readonly first_name?: string | null;
  readonly last_name?: string | null;
  readonly preference_project?: (string | null)[] | null;
  readonly primary_project?: string | null;
  readonly user_group: string;
  readonly work_phone_number?: string | null;
  readonly email_notification_enabled?: boolean | null;
  readonly sms_notification_enabled?: boolean | null;
  readonly language_preference?: LanguagePreference | keyof typeof LanguagePreference | null;
  readonly company_name?: string | null;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPreTaskPlanUserProfile = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<PreTaskPlanUserProfile, ['user_id', 'user_email_address']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly user_id: string;
  readonly user_email_address: string;
  readonly first_name?: string | null;
  readonly last_name?: string | null;
  readonly preference_project?: (string | null)[] | null;
  readonly primary_project?: string | null;
  readonly user_group: string;
  readonly work_phone_number?: string | null;
  readonly email_notification_enabled?: boolean | null;
  readonly sms_notification_enabled?: boolean | null;
  readonly language_preference?: LanguagePreference | keyof typeof LanguagePreference | null;
  readonly company_name?: string | null;
  readonly created_by_user_id?: string | null;
  readonly modified_by_user_id?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PreTaskPlanUserProfile = LazyLoading extends LazyLoadingDisabled ? EagerPreTaskPlanUserProfile : LazyPreTaskPlanUserProfile

export declare const PreTaskPlanUserProfile: (new (init: ModelInit<PreTaskPlanUserProfile>) => PreTaskPlanUserProfile) & {
  copyOf(source: PreTaskPlanUserProfile, mutator: (draft: MutableModel<PreTaskPlanUserProfile>) => MutableModel<PreTaskPlanUserProfile> | void): PreTaskPlanUserProfile;
}