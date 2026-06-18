/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CaseRecord {
  id: string;
  timestamp: string; // ISO string
  mrn: string;
  age: number | "";
  gender: 'Male' | 'Female' | 'Prefer Not to Say';
  sourceOfRequest: 'Triage-initiated' | 'Clinician-initiated' | 'None';
  clinicianRole?: 'MO' | 'TMO' | 'Consultant' | 'None';
  clinicianVerification?: 'Name mentioned' | 'Stamped' | 'None';
  triageColor: 'Red' | 'Yellow' | 'Green' | 'None';
  originLocation: string;
  examPerformed: string;
  outcome: 'Normal' | 'Abnormal-Acute' | 'Abnormal-Chronic';
  majorFindings?: string;
  bottlenecks: string[]; // Options chosen
  slipTime: string;      // HH:MM e.g. "14:30"
  arrivalTime: string;   // HH:MM
  reportTime: string;    // HH:MM
}

export const ORIGIN_LOCATIONS = [
  "Medical ER-12",
  "Surgical ER-39",
  "Obs ER",
  "Gyn ER",
  "Peds ER",
  "NICU",
  "Trauma",
  "In-door ward"
];

export const EXAMS_PERFORMED = [
  "Abdomen",
  "FAST/eFAST",
  "KUB",
  "Pelvic",
  "Obstetric",
  "Biliary",
  "DVT",
  "Appendix",
  "Other"
];

export const BOTTLENECK_OPTIONS = [
  "Stretcher congestion",
  "Machine lag/low-res",
  "No linear probe",
  "Incomplete slip"
];
