import fs from 'node:fs';
import path from 'node:path';
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  TableOfContents,
  TextRun,
} from 'docx';

const rootDir = process.cwd();
const screenshotsDir = path.join(rootDir, 'docs', 'user-guide', 'screenshots');
const outputDir = path.join(rootDir, 'docs', 'user-guide');
const outputFile = path.join(outputDir, 'PTP_User_Guide_v1.0.docx');

const guideVersion = '1.0';
const generatedDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
});

const imageScale = {
  width: 620,
  height: 360,
};

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text })],
    spacing: { after: 100 },
  });
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function figureCaption(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 180 },
  });
}

function imageParagraph(fileName) {
  const imagePath = path.join(screenshotsDir, fileName);
  if (!fs.existsSync(imagePath)) {
    return body(`Screenshot missing: ${fileName}`);
  }

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        data: fs.readFileSync(imagePath),
        transformation: imageScale,
      }),
    ],
    spacing: { before: 80, after: 40 },
  });
}

const stepDefinitions = [
  {
    title: 'Step 1. Sign In',
    goal: 'Authenticate to the Daily Pre-Task Planner application.',
    actions: [
      'Open the login page.',
      'Enter valid credentials.',
      'Select Sign In to reach the dashboard.',
    ],
    expected: 'Dashboard loads with summary cards and PTP list.',
    screenshot: '01-sign-in-page.png',
  },
  {
    title: 'Step 2. Dashboard and Create New PTP',
    goal: 'Start a new daily PTP process from the dashboard.',
    actions: [
      'Select Create New PTP.',
      'Review available start options and click Get Started.',
    ],
    expected: 'Workflow opens at Activity & Control Measures.',
    screenshot: '02-dashboard-create-new-ptp-modal.png',
  },
  {
    title: 'Step 3. Select Project and Enter PTP Details',
    goal: 'Associate the PTP with a project and define the task name.',
    actions: [
      'Use Select Project / Pick other project site.',
      'Choose the project and enter Job/Task details.',
    ],
    expected: 'Required fields validate and Step 1 becomes save-ready.',
    screenshot: '07-enter-ptp-details-project-selected.png',
  },
  {
    title: 'Step 4. Activity & Control Measures',
    goal: 'Review hazards and define controls for the work scope.',
    actions: [
      'Review each activity card.',
      'Select controls or mark cards as Not Applicable.',
      'Use Save and Next.',
    ],
    expected: 'Activity controls save successfully and workflow advances.',
    screenshot: '03-ptp-workflow-step1-activity-control.png',
  },
  {
    title: 'Step 5. Requirements (Permits, Checklists, PPE)',
    goal: 'Capture mandatory requirements before execution.',
    actions: [
      'Select at least one permit, checklist, or PPE item as applicable.',
      'Attach permit documents when required.',
      'Use Save and Next.',
    ],
    expected: 'Requirements save successfully and workflow advances.',
    screenshot: '09-step2-permits-checklists.png',
  },
  {
    title: 'Step 6. Add Work Steps',
    goal: 'Define how work will be performed safely.',
    actions: [
      'Select Add Work Steps for Each Task.',
      'Complete required Work Steps and Control Measures fields.',
      'Save the work step and proceed.',
    ],
    expected: 'At least one work step appears in the list.',
    screenshot: '13-step3-work-step-added.png',
  },
  {
    title: 'Step 7. Emergency Contacts',
    goal: 'Confirm emergency communications and muster point.',
    actions: [
      'Confirm Emergency Action Plan discussion.',
      'Provide Safety and Superintendent contacts.',
      'Define Emergency Muster Area and save.',
    ],
    expected: 'Emergency contacts save successfully and workflow advances.',
    screenshot: '14-step4-emergency-contacts.png',
  },
  {
    title: 'Step 8. Crew Sign In',
    goal: 'Add all crew members and capture sign-ins.',
    actions: [
      'Add each crew member name.',
      'Open Sign In for each member.',
      'Provide comments/signature where required and confirm sign-in.',
    ],
    expected: 'Crew members show Signed-in status.',
    screenshot: '20-step5-crew-signed-in.png',
  },
  {
    title: 'Step 9. PTP Review and Submit',
    goal: 'Complete foreman review and submit for review workflow.',
    actions: [
      'Review Foreman Review and PTP Review sections.',
      'Provide foreman signature.',
      'Select Submit for Review.',
    ],
    expected: 'PTP returns to dashboard with Submitted status.',
    screenshot: '21-step6-ptp-review.png',
  },
  {
    title: 'Step 10. Status Updates on Dashboard',
    goal: 'Track lifecycle states after submission.',
    actions: [
      'Review summary cards: In Progress, Submitted, Reviewed, Flagged, Closed.',
      'Use filters to locate records by status.',
    ],
    expected: 'Counts and list rows align with selected filters.',
    screenshot: '25-dashboard-status-updates-and-ptp-list.png',
  },
  {
    title: 'Step 11. View PTP',
    goal: 'Open complete read-only PTP details for verification.',
    actions: [
      'Select Preview from the dashboard list.',
      'Validate section order and captured signatures.',
    ],
    expected: 'PTP opens with sections ordered as Hazards, Requirements, Work Steps.',
    screenshot: '23-view-ptp-preview-page.png',
  },
  {
    title: 'Step 12. Export PDF',
    goal: 'Generate and download the printable PTP package.',
    actions: [
      'From a closed/submitted list row, select Download.',
      'In Export PTP modal, select Download PDF.',
    ],
    expected: 'PDF file is generated for distribution/audit storage.',
    screenshot: '27-export-pdf-popup.png',
  },
  {
    title: 'Step 13. Close PTP and Verify Closed Status',
    goal: 'Confirm closed records and closure controls.',
    actions: [
      'Use status filter Closed on dashboard.',
      'Confirm record appears with Closed badge and export action.',
      'If exiting an in-progress workflow, confirm close dialog behavior.',
    ],
    expected: 'Record lifecycle is complete and available under Closed filter.',
    screenshot: '26-closed-status-and-export-pdf-download.png',
  },
];

const validationExamples = [
  ['Project is required', '05-activity-step-validation-required-fields.png'],
  ['All activities must be reviewed', '08-activity-validation-popup.png'],
  ['Select at least one permit/checklist/PPE', '10-step2-validation-select-permit-checklist-ppe.png'],
  ['Safety/Superintendent required', '15-step4-validation-missing-contacts.png'],
  ['Crew signature required', '19-step5-signature-required-validation.png'],
  ['Foreman signature required', '22-step6-validation-signature-required.png'],
  ['Flag for Changes comment required', '24-flag-for-changes-validation-comment-required.png'],
];

const docChildren = [];

// Cover page

docChildren.push(
  new Paragraph({ text: 'Barton Malow Field App', alignment: AlignmentType.CENTER, spacing: { before: 400 } }),
  new Paragraph({
    text: 'Daily Pre-Task Planner (PTP) User Guide',
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  }),
  new Paragraph({ text: `Version ${guideVersion}`, alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
  new Paragraph({ text: `Published: ${generatedDate}`, alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
  body('Audience: Foremen, Superintendents, Safety Leads, and Field Operations Stakeholders.'),
  body('Scope: End-to-end standard PTP flow from sign-in through submission, review actions, export, and closed-state verification.'),
  new Paragraph({ children: [new PageBreak()] })
);

// TOC

docChildren.push(
  heading('Table of Contents', HeadingLevel.HEADING_1),
  new TableOfContents('Select any heading below to navigate', {
    hyperlink: true,
    headingStyleRange: '1-3',
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// Workflow section

docChildren.push(
  heading('PTP Workflow Overview', HeadingLevel.HEADING_1),
  body('This guide documents a complete operational PTP lifecycle using captured production-like screens. Where role-dependent approval transitions were not directly exposed in this session, assumptions are explicitly called out.'),
  bullet('Business rule: Required fields block progression until completed.'),
  bullet('Business rule: Signatures are mandatory at crew and foreman review checkpoints.'),
  bullet('Business rule: Dashboard cards and table rows reflect active filters.'),
  bullet('Business rule: Export PDF is available from eligible records (typically closed/review-ready states).')
);

for (let i = 0; i < stepDefinitions.length; i++) {
  const step = stepDefinitions[i];
  docChildren.push(
    heading(step.title, HeadingLevel.HEADING_2),
    body(`Goal: ${step.goal}`),
    body('Procedure:'),
    ...step.actions.map((a) => bullet(a)),
    body(`Expected Result: ${step.expected}`),
    imageParagraph(step.screenshot),
    figureCaption(`Figure ${i + 1}: ${step.title}`)
  );
}

// Special scenarios

docChildren.push(
  heading('Save Draft, Flagging, and Close Behaviors', HeadingLevel.HEADING_1),
  body('Observed behavior for draft/close in this environment: closing an in-progress workflow shows a confirmation dialog and warns that unsaved changes will be lost.'),
  imageParagraph('28-close-ptp-confirmation-dialog.png'),
  figureCaption('Figure 14: Close PTP confirmation dialog'),
  body('Flagging behavior: if no review comment is provided, the system blocks the action with a validation message.'),
  imageParagraph('24-flag-for-changes-validation-comment-required.png'),
  figureCaption('Figure 15: Flag for Changes validation')
);

// Validation catalog

docChildren.push(heading('Common Validation Messages', HeadingLevel.HEADING_1));
for (let i = 0; i < validationExamples.length; i++) {
  const [message, screenshot] = validationExamples[i];
  docChildren.push(
    heading(`Validation ${i + 1}: ${message}`, HeadingLevel.HEADING_3),
    imageParagraph(screenshot),
    figureCaption(`Validation Example ${i + 1}`)
  );
}

// Review + approval notes

docChildren.push(
  heading('Review and Approval Process', HeadingLevel.HEADING_1),
  body('Review Process: Foreman completes signatures and submits the PTP for review. In review-enabled roles, supervisors can inspect details, provide comments, and either approve or flag for correction.'),
  body('Approval Process (Assumption): After review approval, the record transitions to a close-eligible state and becomes available for final export and historical retrieval.'),
  imageParagraph('23-view-ptp-preview-page.png'),
  figureCaption('Figure 16: Review screen used during verification')
);

// FAQ

docChildren.push(
  heading('FAQ', HeadingLevel.HEADING_1),
  heading('Why can I not proceed to the next step?', HeadingLevel.HEADING_3),
  body('Required fields, checklist selections, or signatures are incomplete. Resolve the highlighted validation and retry Save and Next.'),
  heading('Why is Flag for Changes failing?', HeadingLevel.HEADING_3),
  body('A review comment is required before a PTP can be flagged.'),
  heading('How do I verify a PTP is closed?', HeadingLevel.HEADING_3),
  body('Use the Status filter = Closed on the dashboard and confirm the record appears with closed status and PDF download action.')
);

// Troubleshooting

docChildren.push(
  heading('Troubleshooting', HeadingLevel.HEADING_1),
  bullet('No records shown: clear project/status filters and refresh the dashboard.'),
  bullet('Signature issues: redraw signature and ensure the signing canvas is visible before submit.'),
  bullet('Export issues: reopen Export PTP modal and retry Download PDF from an eligible record status.'),
  bullet('Unexpected validation: verify all mandatory fields across the current step are populated.')
);

// Appendix

docChildren.push(
  heading('Appendix A - Captured Screens', HeadingLevel.HEADING_1),
  ...stepDefinitions.map((s, idx) => body(`${idx + 1}. ${s.title} -> ${s.screenshot}`)),
  body('Additional validation and scenario screens are included in docs/user-guide/screenshots.')
);

const doc = new Document({
  sections: [
    {
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: `PTP User Guide v${guideVersion} | ${generatedDate}`, size: 18 })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun('Barton Malow - Field App  |  Page '),
                PageNumber.CURRENT,
                new TextRun(' of '),
                PageNumber.TOTAL_PAGES,
              ],
            }),
          ],
        }),
      },
      children: docChildren,
    },
  ],
});

fs.mkdirSync(outputDir, { recursive: true });
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputFile, buffer);

console.log(`User guide generated: ${outputFile}`);
