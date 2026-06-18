/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CaseRecord, BOTTLENECK_OPTIONS } from "../types";
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, Clock } from "lucide-react";

interface ShiftStatsProps {
  cases: CaseRecord[];
}

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

export function ShiftStats({ cases }: ShiftStatsProps) {
  const totalCount = cases.length;

  // Calculators
  const normalCount = cases.filter(c => c.outcome === "Normal").length;
  const acuteCount = cases.filter(c => c.outcome === "Abnormal-Acute").length;
  const chronicCount = cases.filter(c => c.outcome === "Abnormal-Chronic").length;

  // Triage count
  const redTriage = cases.filter(c => c.triageColor === "Red").length;
  const yellowTriage = cases.filter(c => c.triageColor === "Yellow").length;
  const greenTriage = cases.filter(c => c.triageColor === "Green").length;

  // Bottlenecks frequency map
  const bottleneckCountsMap = BOTTLENECK_OPTIONS.reduce((acc, currentOpt) => {
    acc[currentOpt] = cases.filter(c => c.bottlenecks.includes(currentOpt)).length;
    return acc;
  }, {} as Record<string, number>);

  // Compute stats ratios
  const acuteRate = totalCount > 0 ? Math.round((acuteCount / totalCount) * 100) : 0;
  const normalRate = totalCount > 0 ? Math.round((normalCount / totalCount) * 100) : 0;

  // Average Turnaround Time
  const tatTimes = cases.map(c => calcRecordTAT(c.slipTime, c.reportTime));
  const avgTAT = tatTimes.length > 0 ? Math.round(tatTimes.reduce((a, b) => a + b, 0) / tatTimes.length) : 0;

  return (
    <div className="space-y-6">
      {/* Shift Metrics Bento Grid - Expanded to include TAT analytics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Cases Counter */}
        <div id="stat-card-total" className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Shift Total
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <div id="text-cases-counter" className="text-3xl md:text-4xl font-mono font-bold text-emerald-400 tracking-tight">
              {totalCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scans Logged</p>
          </div>
        </div>

        {/* Average TAT */}
        <div id="stat-card-avg-tat" className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Avg Turnaround
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <div id="text-avg-tat" className="text-3xl md:text-4xl font-mono font-bold text-amber-300 tracking-tight">
              {avgTAT}<span className="text-xs font-sans text-amber-500 ml-0.5">mins</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Slip to Report</p>
          </div>
        </div>

        {/* Acute Abnormality Rate */}
        <div id="stat-card-acute" className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Acute Rate
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-4">
            <div id="text-acute-rate" className={`text-3xl md:text-4xl font-mono font-bold tracking-tight ${acuteRate > 40 ? 'text-rose-400' : 'text-amber-400'}`}>
              {acuteRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{acuteCount} Acute Cases</p>
          </div>
        </div>

        {/* Critical Triage Count */}
        <div id="stat-card-critical" className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Red Triage (P1)
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-4">
            <div id="text-red-triage" className="text-3xl md:text-4xl font-mono font-bold text-rose-500 tracking-tight">
              {redTriage}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">High Urgency</p>
          </div>
        </div>

        {/* Normal Cases Percentage */}
        <div id="stat-card-normal" className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Normal Ratio
            </span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-4">
            <div id="text-normal-rate" className="text-3xl md:text-4xl font-mono font-bold text-sky-400 tracking-tight">
              {normalRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{normalCount} Scans</p>
          </div>
        </div>
      </div>

      {/* Visual Telemetry Chart & Bottleneck Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Outcomes & Triage Analytics */}
        <div id="analytics-outcomes-card" className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-medium text-slate-200 text-xs uppercase tracking-wider">
              Exam Outcome Breakdown
            </h3>
          </div>

          {totalCount === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
              <p>NO CASE DATA SUBMITTED YET</p>
              <p className="mt-1">Add case records above to populate visual metrics.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Normal progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Normal Scan ({normalCount})</span>
                  <span>{normalRate}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${normalRate}%` }}
                  />
                </div>
              </div>

              {/* Acute progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Abnormal - Acute ({acuteCount})</span>
                  <span>{acuteRate}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${acuteRate}%` }}
                  />
                </div>
              </div>

              {/* Chronic progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Abnormal - Chronic ({chronicCount})</span>
                  <span>{totalCount > 0 ? Math.round((chronicCount / totalCount) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? Math.round((chronicCount / totalCount) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Quick triage counter list pills */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 mt-2">
                <div className="bg-slate-950/60 p-2 rounded-lg text-center border border-slate-800/60">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Red / P1</span>
                  <span className="text-sm font-mono font-bold text-rose-500">{redTriage}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg text-center border border-slate-800/60">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Yellow / P2</span>
                  <span className="text-sm font-mono font-bold text-amber-500">{yellowTriage}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg text-center border border-slate-800/60">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Green / P3</span>
                  <span className="text-sm font-mono font-bold text-emerald-500">{greenTriage}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottlenecks Hotspot Tracker */}
        <div id="analytics-bottlenecks-card" className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="font-display font-medium text-slate-200 text-xs uppercase tracking-wider">
              Shift Bottleneck Analysis
            </h3>
          </div>

          {totalCount === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
              <p>NO BOTTLENECK VECTORS LOGGED</p>
              <p className="mt-1">Tracking throughput bottlenecks ensures equipment optimization.</p>
            </div>
          ) : (
            <div className="space-y-3.5 py-1">
              {BOTTLENECK_OPTIONS.map((opt) => {
                const count = bottleneckCountsMap[opt] || 0;
                const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                
                return (
                  <div key={opt} className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">{opt}</span>
                        <span className="text-rose-400 font-mono">{count}x ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-rose-500/80 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-slate-500 italic mt-3 pt-2 border-t border-slate-800/60 leading-relaxed">
                * Note: Value shows number of times ultrasound workflow was disrupted by specified technical delay.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
