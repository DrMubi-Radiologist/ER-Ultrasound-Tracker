/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CaseRecord } from "../types";

/**
 * Converts CaseRecord array into a standard CSV string and triggers download.
 */
export function downloadShiftCSV(cases: CaseRecord[]) {
  if (cases.length === 0) {
    return;
  }

  // Define headers compatible with audit systems including TAT, clinician, findings
  const headers = [
    "ID",
    "Timestamp",
    "Patient MRN",
    "Age",
    "Gender",
    "Source of Request",
    "Clinician Role",
    "Clinician Validation Format",
    "Triage Color",
    "Origin Location",
    "Exam Performed",
    "Outcome",
    "Major Findings",
    "Slip Generation Time",
    "Arrival Time",
    "Report Time",
    "Turnaround Time (Minutes)",
    "Bottlenecks"
  ];

  const escapeField = (val: string | number) => {
    const str = String(val === null || val === undefined ? "" : val);
    const escaped = str.replace(/"/g, '""');
    if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n") || escaped.includes("\r")) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const calcRecordTAT = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    if (endMinutes < startMinutes) endMinutes += 24 * 60;
    return endMinutes - startMinutes;
  };

  const rows = cases.map((record) => {
    const formattedTime = new Date(record.timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    const tatMins = calcRecordTAT(record.slipTime, record.reportTime);

    return [
      record.id,
      formattedTime,
      record.mrn,
      record.age === "" ? "" : record.age,
      record.gender,
      record.sourceOfRequest,
      record.clinicianRole || "None",
      record.clinicianVerification || "None",
      record.triageColor,
      record.originLocation,
      record.examPerformed,
      record.outcome,
      record.majorFindings || "",
      record.slipTime,
      record.arrivalTime,
      record.reportTime,
      tatMins,
      record.bottlenecks.join("; ")
    ].map(escapeField).join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows].join("\r\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  
  // Format filename with active date/timestamp for organized auditing
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `LRH_ER_Ultrasound_Audit_${dateStr}_${timeStr}.csv`);
  document.body.appendChild(link); // Required for FF
  
  link.click();
  document.body.removeChild(link);
}
