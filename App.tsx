
import React, { useState } from 'react';
import { IntelligenceReport, AnalysisStep } from './types';
import { performPhoneIntelligence } from './services/geminiService';
import AnalysisProgress from './components/AnalysisProgress';
import ReportDashboard from './components/ReportDashboard';

const App: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>(AnalysisStep.IDLE);
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [error, setError] = useState<{title: string, msg: string} | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-6));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Extract only digits from the input
    let digits = val.replace(/\D/g, '');
    
    if (digits.length === 0) {
      setPhoneNumber('+');
      return;
    }

    // Heuristic: If it starts with 1, use the North American format (+1)
    if (digits.startsWith('1')) {
      const clean = digits.substring(1, 11);
      const areaCode = clean.substring(0, 3).padEnd(3, ' ');
      const prefix = clean.substring(3, 6).padEnd(3, ' ');
      const lineNum = clean.substring(6, 10).padEnd(4, ' ');
      
      const formatted = `+1 (${areaCode}) ${prefix}-${lineNum}`;
      setPhoneNumber(formatted);
    } else {
      // For any other country code, just keep the plus and the digits in order
      // Limit to 15 digits (max international length)
      const clean = digits.substring(0, 15);
      setPhoneNumber('+' + clean);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that some actual digits were entered
    const rawDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber || rawDigits.length < 5) {
      setError({ title: "INPUT_ERROR", msg: "Target identification failed. Enter a valid international phone number including country code." });
      return;
    }

    setError(null);
    setLogs([]);
    setAnalysisStep(AnalysisStep.INITIALIZING);

    const targetTimestamp = date && time ? `${date} ${time}` : undefined;

    try {
      addLog("Initializing forensic link...");
      const interrogationPromise = performPhoneIntelligence(phoneNumber, targetTimestamp);

      const t1 = setTimeout(() => { setAnalysisStep(AnalysisStep.NETWORK_QUERY); addLog("Querying global SS7 node..."); }, 800);
      const t2 = setTimeout(() => { setAnalysisStep(AnalysisStep.GEOLOCATION); addLog("Scanning regional HLR registries..."); }, 2500);
      const t3 = setTimeout(() => { setAnalysisStep(AnalysisStep.TEMPORAL_LINK); addLog("Aligning temporal signal artifacts..."); }, 4500);
      const t4 = setTimeout(() => { setAnalysisStep(AnalysisStep.OSINT_SCRAPING); addLog("Scraping digital identity leaks..."); }, 7000);
      const t5 = setTimeout(() => { setAnalysisStep(AnalysisStep.FINALIZING); addLog("Compiling intelligence report..."); }, 9000);

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
    setPhoneNumber('+');
    setDate('');
    setTime('');
    setAnalysisStep(AnalysisStep.IDLE);
    setReport(null);
    setError(null);
    setLogs([]);
  };

  return (
    <div className="min-h-screen pb-24 selection:bg-emerald-500 selection:text-black bg-[#050505]">
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]"></div>
            <span className="mono text-xl font-bold tracking-tighter text-white uppercase">CELL_PULSE</span>
            <span className="hidden sm:inline-block text-[10px] mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 ml-2">V7.0_TEMPORAL</span>
          </div>
        </div>
      </nav>

      <main className="pt-16 px-6">
        {analysisStep === AnalysisStep.IDLE && (
          <div className="max-w-3xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-none">
                Temporal <br/>
                <span className="text-emerald-500">Unmasking</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light">
                Trace historical coordinates and identity artifacts across specific time windows using global metadata synthesis.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto space-y-4">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
              
              <div className="relative glass rounded-2xl p-4 shadow-2xl space-y-4 border-emerald-500/20">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 000-0000 or +44 ..."
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
          <ReportDashboard report={report} onReset={handleReset} />
        )}

        {analysisStep === AnalysisStep.ERROR && error && (
          <div className="max-w-md mx-auto glass p-10 rounded-2xl border-red-500/30 text-center space-y-6">
            <h3 className="text-2xl font-bold mono text-white uppercase">{error.title}</h3>
            <p className="text-gray-400 text-sm">{error.msg}</p>
            <button onClick={handleReset} className="w-full py-3 bg-red-500/10 text-red-500 font-bold mono rounded-xl border border-red-500/20">RESET TERMINAL</button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="flex gap-4 items-center">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[9px] mono text-gray-600 tracking-wider">TERMINAL_SECURED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
