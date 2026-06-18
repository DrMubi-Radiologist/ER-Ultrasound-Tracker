/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CaseRecord } from "./types";
import { downloadShiftCSV } from "./utils/csvHelper";
import { CaseForm } from "./components/CaseForm";
import { ShiftStats } from "./components/ShiftStats";
import { CaseList } from "./components/CaseList";
import { Activity, Shield, Users, Radio, HelpCircle, HeartPulse } from "lucide-react";

const LOCAL_STORAGE_KEY = "lrh_er_audit_throughput_cases_v1";

export default function App() {
  // Primary cases state loaded from localStorage
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDemoNotification, setShowDemoNotification] = useState(false);

  // Load cases from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setCases(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse stored ER audit cases:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cases to LocalStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cases));
    }
  }, [cases, isLoaded]);

  // Save new record
  const handleSaveCase = (newFields: Omit<CaseRecord, "id" | "timestamp">) => {
    const freshRecord: CaseRecord = {
      ...newFields,
      id: "CASE-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      timestamp: new Date().toISOString()
    };
    setCases((prev) => [freshRecord, ...prev]);
  };

  // Delete specific record
  const handleDeleteCase = (id: string) => {
    setCases((prev) => prev.filter(c => c.id !== id));
  };

  // Clear all records
  const handleClearAll = () => {
    setCases([]);
  };

  // Inject beautiful high-quality sample data to preview visuals
  const handleInjectSamples = () => {
    const baseTime = Date.now();
    const samples: CaseRecord[] = [
      {
        id: "CASE-DEMO-AA1",
        timestamp: new Date(baseTime - 1000 * 60 * 35).toISOString(), // 35 minutes ago
        mrn: "ER-482-12",
        age: 28,
        gender: "Male",
        sourceOfRequest: "Triage-initiated",
        triageColor: "Red",
        originLocation: "Trauma",
        examPerformed: "FAST/eFAST",
        outcome: "Abnormal-Acute",
        majorFindings: "Splenic laceration with moderate fluid in Morison pouch.",
        bottlenecks: ["Stretcher congestion"],
        slipTime: "11:20",
        arrivalTime: "11:32",
        reportTime: "11:45"
      },
      {
        id: "CASE-DEMO-AA2",
        timestamp: new Date(baseTime - 1000 * 60 * 110).toISOString(), // ~1.8hr ago
        mrn: "ER-901-55",
        age: 64,
        gender: "Female",
        sourceOfRequest: "Clinician-initiated",
        clinicianRole: "MO",
        clinicianVerification: "Stamped",
        triageColor: "Yellow",
        originLocation: "Medical ER-12",
        examPerformed: "Abdomen",
        outcome: "Abnormal-Acute",
        majorFindings: "Acute cholecystitis, distended gallbladder with 5mm wall thickening.",
        bottlenecks: ["Machine lag/low-res"],
        slipTime: "09:45",
        arrivalTime: "10:11",
        reportTime: "10:25"
      },
      {
        id: "CASE-DEMO-AA3",
        timestamp: new Date(baseTime - 1000 * 60 * 210).toISOString(), // ~3.5hr ago
        mrn: "ER-234-88",
        age: 35,
        gender: "Female",
        sourceOfRequest: "Triage-initiated",
        triageColor: "Green",
        originLocation: "Gyn ER",
        examPerformed: "Obstetric",
        outcome: "Normal",
        majorFindings: "Viable intrauterine pregnancy of approx 12 weeks, normal FHR.",
        bottlenecks: [],
        slipTime: "08:10",
        arrivalTime: "08:25",
        reportTime: "08:35"
      },
      {
        id: "CASE-DEMO-AA4",
        timestamp: new Date(baseTime - 1000 * 60 * 300).toISOString(), // ~5hr ago
        mrn: "ER-112-90",
        age: 52,
        gender: "Male",
        sourceOfRequest: "Clinician-initiated",
        clinicianRole: "Consultant",
        clinicianVerification: "Name mentioned",
        triageColor: "None",
        originLocation: "In-door ward",
        examPerformed: "DVT",
        outcome: "Normal",
        majorFindings: "Completed bilateral lower limb scan; no evidence of deep vein thrombosis.",
        bottlenecks: ["No linear probe"],
        slipTime: "06:15",
        arrivalTime: "06:35",
        reportTime: "07:05"
      },
      {
        id: "CASE-DEMO-AA5",
        timestamp: new Date(baseTime - 1000 * 60 * 420).toISOString(), // ~7hr ago
        mrn: "ER-744-12",
        age: 71,
        gender: "Male",
        sourceOfRequest: "None",
        triageColor: "Yellow",
        originLocation: "Surgical ER-39",
        examPerformed: "Biliary",
        outcome: "Abnormal-Chronic",
        majorFindings: "Cholelithiasis noted without signs of acute gallbladder wall inflammation.",
        bottlenecks: ["Incomplete slip"],
        slipTime: "04:20",
        arrivalTime: "05:05",
        reportTime: "05:25"
      }
    ];

    setCases(samples);
    setShowDemoNotification(true);
    setTimeout(() => {
      setShowDemoNotification(false);
    }, 4000);
  };

  // Route back to Export logic
  const handleExportCSV = () => {
    downloadShiftCSV(cases);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Professional Medical Header Banner */}
      <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-emerald-500/30 p-2.5 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <HeartPulse className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 id="app-main-heading" className="text-sm sm:text-base md:text-lg font-display font-bold text-slate-100 tracking-tight flex items-center gap-2">
                LRH Cycle-2 ER Audit: Throughput Tracker
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">
                  Continuous Clinical Scan Sync • ED-US Dept
                </span>
              </div>
            </div>
          </div>

          {/* Clinician Dashboard Quick Indicators */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right font-mono">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">ER Status</p>
              <p className="text-xs text-slate-200 font-bold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> High Resource Load
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right font-mono">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Scan Shift Active</p>
              <p className="text-xs text-emerald-400 font-bold">24-Hr Cycle V2</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        
        {/* Welcome clinical message */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 bg-slate-950 p-1.5 rounded-md border border-slate-800">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Dim-Light Optimized Clinical Interface
              </p>
              <p className="text-[11px] text-slate-450 leading-normal max-w-2xl">
                This audit system cache integrates diagnostic outcomes with department throughput constraints in real time. 
                Data persists securely on your browser local terminal file cache and is compiled to instant standard CSV reports on demand.
              </p>
            </div>
          </div>
          
          {cases.length === 0 && (
            <button
              onClick={handleInjectSamples}
              className="text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 select-none active:scale-95"
            >
              🚀 Simulate 5 Case Records
            </button>
          )}
        </div>

        {showDemoNotification && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 animate-fade-in text-xs font-medium">
            <span className="bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">SUCCESS</span>
            <span>Five medical case records successfully loaded into the Throughput tracker. You can now test filters, view widgets, and export reports in Excel!</span>
          </div>
        )}

        {/* Dashboard Responsive Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Fast Input Case Entry Form Component (Takes 5 spans on desktop screens) */}
          <div className="lg:col-span-5 space-y-6">
            <CaseForm onSave={handleSaveCase} />
            
            {/* Quick Helper guidelines card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-400">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                Quick-Tap Audit Guideline
              </h4>
              <p className="leading-relaxed">
                Use tap buttons for Gender, Triage Color and Outcome fields. Dropdowns are reserved for Origin and Exam lists to support comprehensive categories. Use the Case ledger below to sort or remove entries directly.
              </p>
            </div>
          </div>

          {/* Metrics, Telemetry & Analytical Case Listing (Takes 7 spans on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real-time Statistics Section */}
            <ShiftStats cases={cases} />
            
            {/* Chronological Table ledger */}
            <CaseList 
              cases={cases}
              onDeleteCase={handleDeleteCase}
              onClearAll={handleClearAll}
              onInjectSamples={handleInjectSamples}
              onExportCSV={handleExportCSV}
            />
            
          </div>

        </div>

      </main>

      {/* Aesthetic Medical Footer */}
      <footer className="mt-12 bg-slate-900/40 border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 font-mono uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© LRH EMERGENCY RADIOLOGY GROUP • CYCLE-2 ASSESSMENT</p>
          <p className="text-[10px] text-slate-600 mt-1">
            Compliant with clinical metadata auditing parameters for clinical audit tracker version 2.4.0
          </p>
        </div>
      </footer>

    </div>
  );
}
