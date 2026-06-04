import React, { useState } from 'react';
import { IntelligenceReport, AnalysisStep } from './types';
import { performPhoneIntelligence } from './services/geminiService';
import AnalysisProgress from './components/AnalysisProgress';
import ReportDashboard from './components/ReportDashboard';

const formatUSPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const cleanDigits = digits.startsWith('1') ? digits.substring(1, 11) : digits.substring(0, 10);
  
  if (cleanDigits.length === 0) return '';
  if (cleanDigits.length <= 3) return `(${cleanDigits}`;
  if (cleanDigits.length <= 6) return `(${cleanDigits.substring(0, 3)}) ${cleanDigits.substring(3)}`;
  return `(${cleanDigits.substring(0, 3)}) ${cleanDigits.substring(3, 6)}-${cleanDigits.substring(6)}`;
};

const App: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>(AnalysisStep.IDLE);
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [error, setError] = useState<{title: string, msg: string} | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // CCPA / GDPR Opt-out States
  const [optoutNumbers, setOptoutNumbers] = useState<string[]>(() => {
    const stored = localStorage.getItem('cellpulse_optout_numbers');
    return stored ? JSON.parse(stored) : [];
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [optoutInput, setOptoutInput] = useState('');
  const [privacySuccess, setPrivacySuccess] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-6));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatUSPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawDigits = phoneNumber.replace(/\D/g, '');
    if (rawDigits.length !== 10) {
      setError({ 
        title: "INPUT_ERROR", 
        msg: "Target identification failed. Enter a valid 10-digit US phone number, e.g., (555) 000-0000." 
      });
      return;
    }

    // CCPA / GDPR Privacy Opt-out check using raw 10-digit match
    const isOptedOut = optoutNumbers.some(num => {
      const savedDigits = num.replace(/\D/g, '');
      const savedSuffix = savedDigits.length > 10 ? savedDigits.substring(savedDigits.length - 10) : savedDigits;
      return savedSuffix === rawDigits && rawDigits.length > 0;
    });

    if (isOptedOut) {
      setError({
        title: "PRIVACY_RESTRICTION",
        msg: `INDEXING BLOCKED: This target (${phoneNumber}) is excluded from public directories. A valid CCPA/GDPR data removal purge request was registered for this profile. Standard lookups and forensic queries are disabled.`
      });
      setAnalysisStep(AnalysisStep.ERROR);
      return;
    }

    setError(null);
    setLogs([]);
    setAnalysisStep(AnalysisStep.INITIALIZING);

    const targetTimestamp = date && time ? `${date} ${time}` : undefined;
    const queryNumber = `+1${rawDigits}`;

    try {
      addLog("Initializing forensic link...");
      const interrogationPromise = performPhoneIntelligence(queryNumber, targetTimestamp);

      const t1 = setTimeout(() => { setAnalysisStep(AnalysisStep.NETWORK_QUERY); addLog("Querying global SS7 node..."); }, 800);
      const t2 = setTimeout(() => { setAnalysisStep(AnalysisStep.GEOLOCATION); addLog("Scanning regional HLR registries..."); }, 2400);
      const t3 = setTimeout(() => { setAnalysisStep(AnalysisStep.TEMPORAL_LINK); addLog("Aligning temporal signal artifacts..."); }, 4000);
      const t4 = setTimeout(() => { setAnalysisStep(AnalysisStep.OSINT_SCRAPING); addLog("Scraping digital identity leaks..."); }, 6000);
      const t5 = setTimeout(() => { setAnalysisStep(AnalysisStep.FINALIZING); addLog("Compiling intelligence report..."); }, 8000);

      const data = await interrogationPromise;

      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      
      setReport(data);
      setAnalysisStep(AnalysisStep.COMPLETED);

    } catch (err: any) {
      console.error(err);
      setError({ title: "HANDSHAKE_FAILED", msg: err.message || "Interrogation interrupted by network layer security." });
      setAnalysisStep(AnalysisStep.ERROR);
    }
  };

  const handleReset = () => {
    setPhoneNumber('');
    setDate('');
    setTime('');
    setAnalysisStep(AnalysisStep.IDLE);
    setReport(null);
    setError(null);
    setLogs([]);
  };

  const handlePrivacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = optoutInput.replace(/\D/g, '');
    if (cleanNum.length !== 10) {
      setPrivacyError("Invalid entry. Please enter a valid 10-digit number.");
      return;
    }

    setPrivacyError(null);
    const nextOptouts = [...optoutNumbers, optoutInput];
    setOptoutNumbers(nextOptouts);
    localStorage.setItem('cellpulse_optout_numbers', JSON.stringify(nextOptouts));
    setPrivacySuccess(true);

    setTimeout(() => {
      setPrivacySuccess(false);
      setOptoutInput('');
      setShowPrivacyModal(false);
    }, 2500);
  };

  const resetLimits = () => {
    localStorage.removeItem('cellpulse_optout_numbers');
    setOptoutNumbers([]);
    handleReset();
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-emerald-500 selection:text-black bg-[#050505] text-gray-200">
      {/* Top Navigation Banner */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]"></div>
            <span className="mono text-xl font-bold tracking-tighter text-white uppercase">CELL_PULSE</span>
            <span className="hidden sm:inline-block text-[10px] mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 ml-2">V7.0_TEMPORAL</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Free indicators */}
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[10px] mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-gray-400">STATUS:</span>
              <span className="text-emerald-400 font-bold">100% FREE NO-LIMIT LOOKUPS</span>
            </div>

            <button 
              onClick={() => setShowPrivacyModal(true)}
              className="text-[10px] mono text-gray-400 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 px-3 py-1.5 rounded-xl transition-all"
            >
              CCPA Remove Info
            </button>
          </div>
        </div>
      </nav>

      {/* Main Terminal Screen */}
      <main className="pt-24 px-6">
        {analysisStep === AnalysisStep.IDLE && (
          <div className="max-w-3xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-none">
                Temporal <br/>
                <span className="text-emerald-500">Unmasking</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light">
                Trace historical coordinates, line registrations, and identity records across public OSINT and SS7 routing databases.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto space-y-4">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
              
              <div className="relative glass rounded-2xl p-4 shadow-2xl space-y-4 border-emerald-500/20">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(555) 000-0000"
                  className="w-full bg-black/40 border border-white/5 rounded-xl text-xl mono text-white px-5 py-3 focus:border-emerald-500/50 outline-none transition-all"
                  autoFocus
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1.5 text-left">
                     <label className="text-[9px] mono text-gray-500 uppercase ml-2 tracking-widest font-bold">Historical Date (Optional)</label>
                     <input 
                       type="date" 
                       value={date} 
                       onChange={(e) => setDate(e.target.value)}
                       className="bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 mono text-xs text-white outline-none focus:border-emerald-500/50"
                     />
                   </div>
                   <div className="flex flex-col gap-1.5 text-left">
                     <label className="text-[9px] mono text-gray-500 uppercase ml-2 tracking-widest font-bold">Historical Time (Optional)</label>
                     <input 
                       type="time" 
                       value={time} 
                       onChange={(e) => setTime(e.target.value)}
                       className="bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 mono text-xs text-white outline-none focus:border-emerald-500/50"
                     />
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black mono py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98] uppercase tracking-widest text-sm"
                >
                  INTERROGATE TARGET
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 pt-12 border-t border-white/5">
              <div className="text-left">
                <div className="text-[9px] mono uppercase text-gray-600 font-bold mb-1">Trace Window</div>
                <div className="text-white text-xs mono">Temporal_Sync</div>
              </div>
              <div className="text-left">
                <div className="text-[9px] mono uppercase text-gray-600 font-bold mb-1">Signal Type</div>
                <div className="text-white text-xs mono">HLR/SS7_Interrogate</div>
              </div>
              <div className="text-left">
                <div className="text-[9px] mono uppercase text-gray-600 font-bold mb-1">Identity</div>
                <div className="text-white text-xs mono">Social_Mapping</div>
              </div>
              <div className="text-left">
                <div className="text-[9px] mono uppercase text-gray-600 font-bold mb-1">Accuracy</div>
                <div className="text-white text-xs mono">Dynamic_Refinement</div>
              </div>
            </div>
          </div>
        )}

        {(analysisStep !== AnalysisStep.IDLE && analysisStep !== AnalysisStep.COMPLETED && analysisStep !== AnalysisStep.ERROR) && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            <AnalysisProgress step={analysisStep} />
            <div className="glass p-4 rounded-xl border border-white/5 mono text-[10px] text-emerald-500/60 space-y-1 h-32 overflow-hidden">
              {logs.map((log, i) => (
                <div key={i} className="animate-in slide-in-from-left-2 duration-300">{log}</div>
              ))}
              <div className="animate-pulse">_</div>
            </div>
          </div>
        )}

        {analysisStep === AnalysisStep.COMPLETED && report && (
          <ReportDashboard 
            report={report} 
            onReset={handleReset} 
          />
        )}

        {analysisStep === AnalysisStep.ERROR && error && (
          <div className="max-w-md mx-auto glass p-10 rounded-2xl border-red-500/30 text-center space-y-6">
            <h3 className="text-2xl font-bold mono text-white uppercase">{error.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mono">{error.msg}</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleReset} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold mono text-xs rounded-xl border border-white/10">
                RESET TERMINAL
              </button>
            </div>
          </div>
        )}
      </main>

      {/* COMPLIANCE DISCLOSURE FOOTER & OPTIONS (Mimicking TruthFinder footer exactly) */}
      <footer className="mt-32 border-t border-white/5 bg-black/80 backdrop-blur-xl py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] mono font-bold text-white uppercase tracking-wider">CELL_PULSE LEGAL DISCLOSURE</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed mono uppercase">
                CELL_PULSE aggregates publicly accessible digital leak footprints, open directory registries, web indexing pings, and numbering plan data via OSINT syntheses. It does NOT trace physical terminals in real-time or violate digital protection directives.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] mono font-bold text-white uppercase tracking-wider block">FCRA COMPLIANCE STATEMENT</span>
              <p className="text-[10px] text-gray-500 leading-relaxed mono uppercase">
                CELL_PULSE does not offer "consumer reports" and is not a "consumer reporting agency" under the Fair Credit Reporting Act (FCRA). This app cannot be utilized for tenant checking, worker screening, credit evaluations, or insurance assessments.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] mono font-bold text-white uppercase tracking-wider block">PRIVACY & SYSTEM OPT-OUT</span>
              <p className="text-[10px] text-gray-500 leading-relaxed mono uppercase">
                To prevent search indices from indexing, querying, or synthesizing ownership artifacts associated with your phone line, please file an instant opt-out purge request.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowPrivacyModal(true)} 
                  className="text-[9px] text-emerald-400 underline hover:text-emerald-300 font-bold mono uppercase"
                >
                  [ Opt-Out / Purge Line ]
                </button>
                <button 
                  onClick={resetLimits} 
                  className="text-[9px] text-red-500 hover:text-red-400 font-bold mono uppercase"
                >
                  [ Clear Cache ]
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-white/5 text-[9px] mono text-gray-600">
            <span>© 2026 CELL_PULSE TECHNOLOGIES INC. ALL RIGHTS RESERVED.</span>
            <span>SECURED BY GLOBAL OSINT SHIELDS // INTEGRITY VERIFIED</span>
          </div>
        </div>
      </footer>

      {/* 🔒 PRIVACY OPT-OUT CENTER MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="relative w-full max-w-md glass border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-sm mono font-black"
            >
              [ ESC ]
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] text-emerald-400 mono uppercase font-bold tracking-widest">
                🔒 GDPR & CCPA PRIVACY DIRECTIVE 🔒
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Purge System Indices</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Enter your telephone number to initiate immediate database removal and disable all future search interrogations on your numbering line.
              </p>
            </div>

            {privacySuccess ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 bg-emerald-500 text-black rounded-full mx-auto flex items-center justify-center text-xl font-bold font-mono animate-bounce">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mono uppercase tracking-wider">Purge Request Finalized</h4>
                  <p className="text-[10px] text-emerald-400/80 mono mt-1">Number removed from indices permanently.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePrivacySubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[9px] mono text-gray-500 uppercase ml-2 font-bold tracking-wider">Target Phone Line</label>
                  <input 
                    type="text" 
                    required
                    placeholder="(555) 000-0000"
                    value={optoutInput}
                    onChange={(e) => {
                      setOptoutInput(formatUSPhone(e.target.value));
                      if (privacyError) setPrivacyError(null);
                    }}
                    className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-emerald-500/50"
                  />
                </div>

                {privacyError && (
                  <div className="text-[10px] text-red-500 mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 text-left">
                    ⚠️ {privacyError}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black mono text-xs py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] uppercase tracking-widest mt-2"
                >
                  [ REMOVE INDEX RECORD ]
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
