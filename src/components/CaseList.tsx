/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CaseRecord, ORIGIN_LOCATIONS, EXAMS_PERFORMED } from "../types";
import { 
  Search, FileSpreadsheet, Trash2, ArrowUpDown, 
  Layers, User, Calendar, MapPin, Database, Sparkles, AlertTriangle, Clock, FileText
} from "lucide-react";

interface CaseListProps {
  cases: CaseRecord[];
  onDeleteCase: (id: string) => void;
  onClearAll: () => void;
  onInjectSamples: () => void;
  onExportCSV: () => void;
}

type SortField = "timestamp" | "mrn" | "age";
type SortOrder = "asc" | "desc";

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

export function CaseList({ 
  cases, 
  onDeleteCase, 
  onClearAll, 
  onInjectSamples, 
  onExportCSV 
}: CaseListProps) {
  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExam, setFilterExam] = useState("ALL");
  const [filterTriage, setFilterTriage] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sorting columns helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter list
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = filterExam === "ALL" || c.examPerformed === filterExam;
    const matchesTriage = filterTriage === "ALL" || c.triageColor === filterTriage;
    return matchesSearch && matchesExam && matchesTriage;
  });

  // Sort list
  const sortedCases = [...filteredCases].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    // Handle optional empty Age
    if (sortField === "age") {
      valA = valA === "" ? -1 : valA;
      valB = valB === "" ? -1 : valB;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div id="case-list-section" className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-2xl relative">
      
      {/* Header and Action Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="cases-ledger-title" className="text-lg font-display font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Logged Shift Records ({filteredCases.length} of {cases.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">Tracked cases cached in browser storage for this session</p>
        </div>

        {/* Quick Auditing / Export triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {cases.length === 0 && (
            <button
              id="btn-inject-samples"
              type="button"
              onClick={onInjectSamples}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800 hover:border-emerald-500 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
              title="Populate several test patients to inspect telemetry"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Demo Data
            </button>
          )}

          <button
            id="btn-export-csv"
            type="button"
            onClick={onExportCSV}
            disabled={cases.length === 0}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 active:scale-95 border uppercase ${
              cases.length > 0
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-600 cursor-pointer shadow-md shadow-emerald-500/10"
                : "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export to CSV
          </button>

          {cases.length > 0 && (
            <div>
              {!showClearConfirm ? (
                <button
                  id="btn-confirm-clear-trigger"
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-950 text-rose-400 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-800 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Shift
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-500/80 p-1 rounded-lg animate-fade-in animate-pulse">
                  <span className="text-[10px] text-rose-300 font-bold px-1.5 font-mono">CONFIRM WIPE?</span>
                  <button
                    id="btn-clear-session"
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                  >
                    YES
                  </button>
                  <button
                    id="btn-cancel-clear"
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                  >
                    NO
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Query Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-3 bg-slate-950/60 rounded-xl border border-slate-850">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            id="search-mrn"
            type="text"
            placeholder="Search MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 outline-none text-slate-200 placeholder-slate-500 font-mono text-sm focus:border-emerald-500"
          />
        </div>

        {/* Exam Type Selective Filter */}
        <div>
          <select
            id="filter-exam-select"
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 outline-none text-slate-300 text-xs font-semibold focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">ALL EXAM TYPES</option>
            {EXAMS_PERFORMED.map(ex => (
              <option key={ex} value={ex}>{ex.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Triage selective filter */}
        <div>
          <select
            id="filter-triage-select"
            value={filterTriage}
            onChange={(e) => setFilterTriage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 outline-none text-slate-300 text-xs font-semibold focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">ALL TRIAGE SEVERITIES</option>
            <option value="Red">RED (P1)</option>
            <option value="Yellow">YELLOW (P2)</option>
            <option value="Green">GREEN (P3)</option>
            <option value="None">NONE / UNASSIGNED</option>
          </select>
        </div>
      </div>

      {/* Table listing with extra TAT, findings, and details columns */}
      <div className="overflow-x-auto w-full max-w-full rounded-lg border border-slate-800">
        <table id="tbl-cases-ledger" className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-850">
              <th className="p-3">Triage</th>
              <th className="p-3 cursor-pointer select-none hover:text-slate-200" onClick={() => handleSort("mrn")}>
                <div className="flex items-center gap-1">
                  Patient MRN
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:text-slate-200" onClick={() => handleSort("age")}>
                <div className="flex items-center gap-1">
                  Age / Gender
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3">Source & Location</th>
              <th className="p-3">Exam Performed & Findings</th>
              <th className="p-3">TAT / Timestamps</th>
              <th className="p-3">Scan Outcome</th>
              <th className="p-3">Bottlenecks</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans text-sm">
            {sortedCases.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                  <Database className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                  NO COMPATIBLE CASE LOGS FOUND FOR THIS CRITERIA
                </td>
              </tr>
            ) : (
              sortedCases.map((rec) => {
                // Triage badge styles
                let triageBadge = "bg-slate-800 text-slate-400 border border-slate-700/60";
                if (rec.triageColor === "Red") triageBadge = "bg-rose-950/65 text-rose-400 border border-rose-800/60";
                else if (rec.triageColor === "Yellow") triageBadge = "bg-amber-950/65 text-amber-400 border border-amber-800/60";
                else if (rec.triageColor === "Green") triageBadge = "bg-emerald-950/65 text-emerald-400 border border-emerald-800/60";

                // Outcome badge styles
                let outcomeBadge = "text-emerald-400 bg-emerald-950/40 border border-emerald-900/60";
                if (rec.outcome === "Abnormal-Acute") outcomeBadge = "text-rose-400 bg-rose-950/40 border border-rose-900/60 font-bold";
                else if (rec.outcome === "Abnormal-Chronic") outcomeBadge = "text-amber-400 bg-amber-950/40 border border-amber-900/60";

                const tatVal = calcRecordTAT(rec.slipTime, rec.reportTime);

                return (
                  <tr 
                    key={rec.id} 
                    id={`row-${rec.id}`}
                    className="hover:bg-slate-850/40 transition-colors font-medium text-slate-300"
                  >
                    {/* Triage column */}
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase ${triageBadge}`}>
                        {rec.triageColor}
                      </span>
                    </td>

                    {/* Patient MRN */}
                    <td className="p-3 font-mono text-emerald-300 tracking-wider font-semibold">
                      {rec.mrn}
                    </td>

                    {/* Age / Gender */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{rec.age === "" ? "—" : rec.age} y/o</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-medium text-slate-400">{rec.gender}</span>
                      </div>
                    </td>

                    {/* Request source and origin location */}
                    <td className="p-3">
                      <div className="text-xs space-y-1">
                        <div className="text-slate-200 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          {rec.originLocation}
                        </div>
                        <div className="text-[10px] text-slate-400">Request: <span className="text-slate-300">{rec.sourceOfRequest}</span></div>
                        
                        {/* Clinician detail badge overlays */}
                        {rec.sourceOfRequest === "Clinician-initiated" && (rec.clinicianRole || rec.clinicianVerification) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.clinicianRole && rec.clinicianRole !== "None" && (
                              <span className="bg-cyan-950/80 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded border border-cyan-800/40 font-mono">
                                Role: {rec.clinicianRole}
                              </span>
                            )}
                            {rec.clinicianVerification && rec.clinicianVerification !== "None" && (
                              <span className="bg-slate-950 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                                {rec.clinicianVerification}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Exam Performed & Free text Clinical Findings */}
                    <td className="p-3">
                      <div className="text-slate-100 font-bold text-xs">{rec.examPerformed}</div>
                      {rec.majorFindings ? (
                        <div className="text-[10px] text-teal-300 bg-teal-950/20 border border-teal-900/40 rounded p-1.5 mt-1.5 max-w-[220px] break-words">
                          <div className="font-bold text-slate-400 uppercase tracking-wider text-[8px] mb-0.5 flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5 text-emerald-400" />
                            Findings Logged
                          </div>
                          <span>{rec.majorFindings}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-550 italic mt-0.5">No findings logged</div>
                      )}
                    </td>

                    {/* TAT Timestamps Column */}
                    <td className="p-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-xs text-amber-300 font-bold font-mono">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{tatVal} mins</span>
                        </div>
                        
                        {/* Manual entry checkpoints logger */}
                        <div className="text-[9px] text-slate-500 font-mono space-y-0.5 border-t border-slate-800/40 pt-1">
                          <div className="flex justify-between gap-2.5">
                            <span>Slip Gen:</span>
                            <span className="text-slate-300 font-bold">{rec.slipTime || "—"}</span>
                          </div>
                          <div className="flex justify-between gap-2.5">
                            <span>Arrival:</span>
                            <span className="text-slate-300 font-bold">{rec.arrivalTime || "—"}</span>
                          </div>
                          <div className="flex justify-between gap-2.5">
                            <span>Reported:</span>
                            <span className="text-slate-300 font-bold">{rec.reportTime || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Outcome Badge */}
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold tracking-wider inline-block uppercase ${outcomeBadge}`}>
                        {rec.outcome === "Abnormal-Acute" ? "Acute Abn" : rec.outcome === "Abnormal-Chronic" ? "Chronic Abn" : "Normal"}
                      </span>
                    </td>

                    {/* Bottlenecks column */}
                    <td className="p-3">
                      {rec.bottlenecks.length === 0 ? (
                        <span className="text-slate-600 text-xs italic">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {rec.bottlenecks.map((bot, bIdx) => (
                            <span 
                              key={bIdx} 
                              className="bg-rose-950/40 text-rose-350 text-[9px] px-1.5 py-0.5 rounded border border-rose-950/60 flex items-center gap-0.5"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                              {bot}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Delete action button */}
                    <td className="p-3 text-center">
                      <button
                        id={`btn-delete-${rec.id}`}
                        type="button"
                        onClick={() => onDeleteCase(rec.id)}
                        className="text-slate-500 hover:text-rose-450 p-1.5 rounded-md hover:bg-rose-950/20 transition-all active:scale-90 cursor-pointer"
                        title="Delete log permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sortedCases.length > 0 && (
        <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500 uppercase px-1 font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Shift Tracker running (Local Storage Active)</span>
          </div>
          <div>
            <span>Generated File: LRH_ER_Ultrasound_Audit.csv</span>
          </div>
        </div>
      )}
    </div>
  );
}
