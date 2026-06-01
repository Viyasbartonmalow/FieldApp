// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const SynchronizationStatus = {
  "PENDING": "PENDING",
  "SYNCED": "SYNCED",
  "DELETED": "DELETED"
};

const LanguagePreference = {
  "ENGLISH": "ENGLISH",
  "SPANISH": "SPANISH"
};

const { DailyReport, Subcontractor, ReportTask, ReportIncident, ReportEquipment, ReportSchedule, ReportDelivery, ReportObservation, PreTaskPlanMaster, PreTaskPlanMasterItem, PreTaskPlanTemplate, Project, PreTaskPlanControl, PreTaskPlanTaskDetail, PreTaskPlanUserProfile, Hazardandmeasurescontrolinformation, Requiredppeselection, Pretaskplantemplateoption, Shiftsignatureinformation, Emergencyinfomation, Shiftendreviewinformation, Reviewersignatureinformation, Taskinformation, Crewsignatureinformation, Crewlogininformation, Pretaskplantaskinformation } = initSchema(schema);

export {
  DailyReport,
  Subcontractor,
  ReportTask,
  ReportIncident,
  ReportEquipment,
  ReportSchedule,
  ReportDelivery,
  ReportObservation,
  PreTaskPlanMaster,
  PreTaskPlanMasterItem,
  PreTaskPlanTemplate,
  Project,
  PreTaskPlanControl,
  PreTaskPlanTaskDetail,
  PreTaskPlanUserProfile,
  SynchronizationStatus,
  LanguagePreference,
  Hazardandmeasurescontrolinformation,
  Requiredppeselection,
  Pretaskplantemplateoption,
  Shiftsignatureinformation,
  Emergencyinfomation,
  Shiftendreviewinformation,
  Reviewersignatureinformation,
  Taskinformation,
  Crewsignatureinformation,
  Crewlogininformation,
  Pretaskplantaskinformation
};