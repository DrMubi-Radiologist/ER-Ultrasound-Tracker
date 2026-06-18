/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CaseRecord, ORIGIN_LOCATIONS, EXAMS_PERFORMED, BOTTLENECK_OPTIONS } from "../types";
import { PlusCircle, Activity, AlertCircle, RefreshCw, Clock, FileText } from "lucide-react";

interface CaseFormProps {
  onSave: (record: Omit<CaseRecord, "id" | "timestamp">) => void;
}

// Preset timing helper
const getCurrentHHMM = (offsetMinutes = 0): string => {
  const d = new Date();
  if (offsetMinutes !== 0) {
    d.setMinutes(d.getMinutes() + offsetMinutes);
  }
  const hrs = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hrs}:${mins}`;
};

// Calculate turnaround time minutes helper
const calculateTATMinutes = (start: string, end: string): number => {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  // Handle rollover at midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  return endMinutes - startMinutes;
};

export function CaseForm({ onSave }: CaseFormProps) {
  // Local form states
  const [mrn, setMrn] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<'Male' | 'Female' | 'Prefer Not to Say'>('Male');
  const [sourceOfRequest, setSourceOfRequest] = useState<'Triage-initiated' | 'Clinician-initiated' | 'None'>('Clinician-initiated');
  
  // Clinician detail states
  const [clinicianRole, setClinicianRole] = useState<'MO' | 'TMO' | 'Consultant' | 'None'>('None');
  const [clinicianVerification, setClinicianVerification] = useState<'Name mentioned' | 'Stamped' | 'None'>('None');

  const [triageColor, setTriageColor] = useState<'Red' | 'Yellow' | 'Green' | 'None'>('None');
  const [originLocation, setOriginLocation] = useState(ORIGIN_LOCATIONS[0]);
  const [examPerformed, setExamPerformed] = useState(EXAMS_PERFORMED[0]);
  const [outcome, setOutcome] = useState<'Normal' | 'Abnormal-Acute' | 'Abnormal-Chronic'>('Normal');
  const [majorFindings, setMajorFindings] = useState("");
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);

  // Time stamp states (Manually adjusted, preset with current timings)
  const [slipTime, setSlipTime] = useState(() => getCurrentHHMM(-25));
  const [arrivalTime, setArrivalTime] = useState(() => getCurrentHHMM(-10));
  const [reportTime, setReportTime] = useState(() => getCurrentHHMM(0));
  
  // Validation and UI feedback states
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  // Toggle bottlenecks helper
  const toggleBottleneck = (option: string) => {
    if (bottlenecks.includes(option)) {
      setBottlenecks(bottlenecks.filter(b => b !== option));
    } else {
      setBottlenecks([...bottlenecks, option]);
    }
  };

  // Quick reset for form
  const resetForm = () => {
    setMrn("");
    setAge("");
    setGender('Male');
    setSourceOfRequest('Clinician-initiated');
    setClinicianRole('None');
    setClinicianVerification('None');
    setTriageColor('None');
    setOriginLocation(ORIGIN_LOCATIONS[0]);
    setExamPerformed(EXAMS_PERFORMED[0]);
    setOutcome('Normal');
    setMajorFindings("");
    setBottlenecks([]);
    setSlipTime(getCurrentHHMM(-25));
    setArrivalTime(getCurrentHHMM(-10));
    setReportTime(getCurrentHHMM(0));
    setShowValidationErrors(false);
  };

  // Submit action
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mrn.trim()) {
      setShowValidationErrors(true);
      return;
    }

    onSave({
      mrn: mrn.trim().toUpperCase(),
      age: age,
      gender,
      sourceOfRequest,
      clinicianRole: sourceOfRequest === 'Clinician-initiated' ? clinicianRole : undefined,
      clinicianVerification: sourceOfRequest === 'Clinician-initiated' ? clinicianVerification : undefined,
      triageColor,
      originLocation,
      examPerformed,
      outcome,
      majorFindings: majorFindings.trim(),
      bottlenecks,
      slipTime,
      arrivalTime,
      reportTime
    });

    // Success flash feedback & clear
    setSuccessFlash(true);
    resetForm();
    
    setTimeout(() => {
      setSuccessFlash(false);
    }, 2500);
  };

  // Compute live Turnaround Time (TAT) in minutes
  const liveTATMinutes = calculateTATMinutes(slipTime, reportTime);

  return (
    <div id="case-entry-card" className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-2xl relative overflow-hidden transition-all">
      {/* Decorative top pulse state */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80 animate-pulse" />
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-400 w-5 h-5 animate-pulse" />
          <h2 id="entry-form-title" className="text-lg font-display font-semibold text-slate-100 uppercase tracking-wider">
            Fast Data Entry
          </h2>
        </div>
        <button
          id="btn-quick-reset"
          type="button"
          onClick={resetForm}
          className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-all flex items-center gap-1 cursor-pointer"
          title="Clear current inputs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Form
        </button>
      </div>

      {successFlash && (
        <div id="success-banner" className="mb-4 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 p-3 rounded-lg flex items-center justify-center gap-2 animate-bounce">
          <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="font-semibold text-sm">CASE SAVED SUCCESSFULLY TO LOCAL SHIFT LOG</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* MRN & Age Flex Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label id="lbl-mrn" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Patient MRN <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-mrn"
              type="text"
              required
              placeholder="e.g. ER-992-84"
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
              className={`w-full bg-slate-950 text-emerald-300 placeholder-slate-600 font-mono text-base border ${
                showValidationErrors && !mrn.trim() ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-800 focus:border-emerald-500"
              } rounded-lg px-4 py-3 outline-none transition-all uppercase`}
            />
            {showValidationErrors && !mrn.trim() && (
              <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Patient MRN is required for ER records.
              </p>
            )}
          </div>

          <div>
            <label id="lbl-age" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Age <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              id="input-age"
              type="number"
              min="0"
              max="150"
              placeholder="e.g. 45"
              value={age}
              onChange={(e) => {
                const val = e.target.value;
                setAge(val === "" ? "" : parseInt(val, 10));
              }}
              className="w-full bg-slate-950 text-emerald-300 placeholder-slate-600 font-mono text-base border border-slate-800 focus:border-emerald-500 rounded-lg px-4 py-3 outline-none transition-all"
            />
          </div>
        </div>

        {/* Gender Segmented Row (Large, tap-friendly buttons) */}
        <div>
          <label id="lbl-gender" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Gender
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Male", "Female", "Prefer Not to Say"] as const).map((g) => (
              <button
                key={g}
                id={`btn-gender-${g.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setGender(g)}
                className={`py-3 px-2 rounded-lg text-sm font-medium border transition-all text-center select-none active:scale-95 cursor-pointer ${
                  gender === g
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 font-semibold ring-1 ring-emerald-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Source of Request Segmented buttons including "None" */}
        <div>
          <label id="lbl-request-source" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Source of Request
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Triage-initiated", "Clinician-initiated", "None"] as const).map((source) => (
              <button
                key={source}
                id={`btn-source-${source.toLowerCase().split("-")[0]}`}
                type="button"
                onClick={() => setSourceOfRequest(source)}
                className={`py-3 px-2 rounded-lg text-xs sm:text-sm font-medium border transition-all text-center select-none active:scale-95 cursor-pointer ${
                  sourceOfRequest === source
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500 font-semibold ring-1 ring-cyan-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        {/* Clinician Initiated - Sub Details Block */}
        {sourceOfRequest === "Clinician-initiated" && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-4 animate-fade-in">
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Clinician Role
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(["MO", "TMO", "Consultant", "None"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setClinicianRole(role)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                      clinicianRole === role
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/70"
                        : "bg-slate-900 border-slate-800/60 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Request Validation Format On Slip
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["Name mentioned", "Stamped", "None"] as const).map((verif) => (
                  <button
                    key={verif}
                    type="button"
                    onClick={() => setClinicianVerification(verif)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                      clinicianVerification === verif
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/70"
                        : "bg-slate-900 border-slate-800/60 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {verif}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Turnaround Time Timestamps (TAT) with Current Timings Dynamic Pre-setting */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-805 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              Turnaround Time (TAT) Trackers
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/35 font-bold">
              Computed TAT: {liveTATMinutes}m
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Slip Generation Time Slot */}
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Slip Gen</span>
                <button
                  type="button"
                  onClick={() => setSlipTime(getCurrentHHMM())}
                  className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase transition"
                >
                  Now
                </button>
              </div>
              <input
                type="time"
                value={slipTime}
                onChange={(e) => setSlipTime(e.target.value)}
                className="w-full bg-slate-950 text-teal-300 font-mono text-sm border border-slate-800 rounded p-1.5 outline-none focus:border-cyan-500"
              />
            </div>

            {/* Arrival to room Time Slot */}
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">2. Arrival</span>
                <button
                  type="button"
                  onClick={() => setArrivalTime(getCurrentHHMM())}
                  className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase transition"
                >
                  Now
                </button>
              </div>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-slate-950 text-teal-300 font-mono text-sm border border-slate-800 rounded p-1.5 outline-none focus:border-cyan-500"
              />
            </div>

            {/* Scan and Report given Time Slot */}
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">3. Report</span>
                <button
                  type="button"
                  onClick={() => setReportTime(getCurrentHHMM())}
                  className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase transition"
                >
                  Now
                </button>
              </div>
              <input
                type="time"
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className="w-full bg-slate-950 text-teal-300 font-mono text-sm border border-slate-800 rounded p-1.5 outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Triage Color Buttons (Red, Yellow, Green, None with exact colors requested) */}
        <div>
          <label id="lbl-triage-color" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Triage Severity Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { color: "Red", classes: "bg-rose-500 text-white hover:bg-rose-600 active:ring-rose-300", border: "border-rose-500", label: "RED (P1)" },
              { color: "Yellow", classes: "bg-amber-500 text-slate-950 hover:bg-amber-600 active:ring-amber-300", border: "border-amber-400", label: "YEL (P2)" },
              { color: "Green", classes: "bg-emerald-500 text-slate-950 hover:bg-emerald-600 active:ring-emerald-300", border: "border-emerald-500", label: "GRN (P3)" },
              { color: "None", classes: "bg-slate-800 text-slate-300 hover:bg-slate-700 active:ring-slate-500", border: "border-slate-600", label: "NONE" }
            ].map((t) => {
              const isSelected = triageColor === t.color;
              return (
                <button
                  key={t.color}
                  id={`btn-triage-${t.color.toLowerCase()}`}
                  type="button"
                  onClick={() => setTriageColor(t.color as any)}
                  className={`py-3 px-1 rounded-lg text-xs font-bold border transition-all text-center select-none active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? `${t.classes} ring-4 ring-offset-2 ring-offset-slate-900 border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                      : "bg-slate-950 text-slate-400 border-slate-800/80 hover:text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  {/* Subtle color pip inside button when not selected */}
                  {!isSelected && (
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      t.color === "Red" ? "bg-rose-500" :
                      t.color === "Yellow" ? "bg-amber-500" :
                      t.color === "Green" ? "bg-emerald-500" : "bg-slate-700"
                    }`} />
                  )}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Origin Location & Exam Performed Row (Standard Dropdowns styled beautifully) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label id="lbl-origin-location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Origin Location
            </label>
            <select
              id="select-origin-location"
              value={originLocation}
              onChange={(e) => setOriginLocation(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-3 py-3 outline-none transition-all text-sm font-medium cursor-pointer"
            >
              {ORIGIN_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} className="bg-slate-950 text-slate-200">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label id="lbl-exam-performed" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Exam Performed
            </label>
            <select
              id="select-exam-performed"
              value={examPerformed}
              onChange={(e) => setExamPerformed(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-3 py-3 outline-none transition-all text-sm font-medium cursor-pointer"
            >
              {EXAMS_PERFORMED.map((ex) => (
                <option key={ex} value={ex} className="bg-slate-950 text-slate-200">
                  {ex}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Outcome Buttons */}
        <div className="space-y-3">
          <div>
            <label id="lbl-outcome" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Exam Outcome
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "outcome-normal",
                  value: "Normal",
                  label: "Normal",
                  activeStyle: "bg-emerald-500/20 text-emerald-400 border-emerald-500/80 ring-1 ring-emerald-500/20"
                },
                {
                  id: "outcome-abnormal-acute",
                  value: "Abnormal-Acute",
                  label: "Acute Abnormal",
                  activeStyle: "bg-rose-500/20 text-rose-400 border-rose-500/80 ring-1 ring-rose-500/20"
                },
                {
                  id: "outcome-abnormal-chronic",
                  value: "Abnormal-Chronic",
                  label: "Chronic Abnormal",
                  activeStyle: "bg-amber-500/20 text-amber-400 border-amber-500/80 ring-1 ring-amber-500/20"
                }
              ].map((out) => {
                const isSelected = outcome === out.value;
                return (
                  <button
                    key={out.value}
                    id={out.id}
                    type="button"
                    onClick={() => setOutcome(out.value as any)}
                    className={`py-3 px-1.5 rounded-lg text-xs md:text-sm font-semibold border transition-all text-center select-none active:scale-95 cursor-pointer ${
                      isSelected
                        ? out.activeStyle
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {out.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Major Findings free-text slot */}
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Major Clinical Findings / Diagnoses
            </label>
            <input
              type="text"
              placeholder="e.g. Free fluid in Morison pouch, Gallstones with shadow"
              value={majorFindings}
              onChange={(e) => setMajorFindings(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 text-sm border border-slate-805 focus:border-emerald-500 rounded-lg px-3 py-2.5 outline-none transition-all"
            />
          </div>
        </div>

        {/* Bottlenecks Checkboxes (Tap-friendly list of indicators) */}
        <div>
          <label id="lbl-bottlenecks" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Department Bottlenecks <span className="text-slate-500">(Check all that apply)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BOTTLENECK_OPTIONS.map((option, idx) => {
              const isChecked = bottlenecks.includes(option);
              return (
                <button
                  key={option}
                  id={`btn-bottleneck-${idx}`}
                  type="button"
                  onClick={() => toggleBottleneck(option)}
                  className={`py-2.5 px-3 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition-all select-none active:scale-[99%] cursor-pointer ${
                    isChecked
                      ? "bg-rose-950/40 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/20"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span>{option}</span>
                  <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                    isChecked ? "bg-rose-500 border-rose-400 text-slate-950" : "border-slate-700 bg-slate-900"
                  }`}>
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button (at the bottom) */}
        <button
          id="btn-save-case"
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:from-emerald-700 active:to-teal-600 text-slate-950 font-display font-bold text-base py-4 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          SAVE AUDIT CASE RECORD
        </button>
      </form>
    </div>
  );
}
