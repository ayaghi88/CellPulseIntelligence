import React from 'react';
import { IntelligenceReport } from '../types';

interface ReportDashboardProps {
  report: IntelligenceReport;
  onReset: () => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ report, onReset }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-emerald-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-500';
      case 'Critical': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getLineTypeColor = (type: string) => {
    switch (type) {
      case 'Mobile': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Landline': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'VoIP': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Virtual': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Prepaid': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Target HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass p-8 rounded-3xl border-l-8 border-l-emerald-500 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none select-none">
          <span className="text-[120px] font-black mono -mr-10 -mt-10 leading-none">FORENSIC</span>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2 mb-2">
             <span className="text-[10px] text-emerald-500 mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-widest">Target_Acquired</span>
             <span className="text-[10px] text-gray-500 mono uppercase">{report.location.timezone} / {report.location.country}</span>
             <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full mono uppercase font-medium">
               🔓 UNRESTRICTED_ACCESS
             </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mono tracking-tighter text-white">
            {report.phoneNumber}
          </h1>
          <p className="text-[10px] mono text-gray-500 mt-2 uppercase max-w-md">Primary MSISDN identifier. All results are synthesized via AI OSINT forensic protocols.</p>
        </div>
        <div className="flex flex-wrap gap-3 z-10">
          <button 
            onClick={onReset}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            [ NEW_INVESTIGATION ]
          </button>
        </div>
      </div>

      {/* Forensic Accuracy Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <h4 className="text-[11px] font-bold mono text-yellow-500 uppercase tracking-widest">Forensic Accuracy Note</h4>
          <p className="text-[10px] text-yellow-500/70 mono leading-relaxed mt-1">
            This terminal uses AI-driven OSINT (Open Source Intelligence) synthesis. Information is derived from public registries, data breaches, and network numbering plans. It is probabilistic in nature and should be used for investigative leads, not absolute verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Network Profile */}
          <div className="glass p-8 rounded-3xl border border-white/5 group">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 mb-8 mono font-black border-b border-emerald-500/10 pb-3">Network Profile</h3>
            <div className="space-y-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 mono uppercase font-bold mb-1 tracking-wider">Service Provider</span>
                <span className="text-2xl text-white font-black mono tracking-tight group-hover:text-emerald-400 transition-colors">{report.carrier}</span>
                <span className="text-[9px] text-gray-400 mono mt-1 leading-relaxed">The telecommunications entity currently owning the numbering block for this device.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 mono uppercase font-bold mb-2 tracking-wider">Classification</span>
                <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-bold border ${getLineTypeColor(report.lineType)}`}>
                  {report.lineType.toUpperCase()}
                </span>
                <span className="text-[9px] text-gray-400 mono mt-2 leading-relaxed">
                  <strong className="text-gray-300">Mobile:</strong> Physical hardware.<br/>
                  <strong className="text-gray-300">Landline:</strong> Physical hardware tied to copper or fiber.<br/>
                  <strong className="text-gray-300">VoIP/Virtual:</strong> Software-based anonymity.
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 mono uppercase font-bold mb-1 tracking-wider">Origin</span>
                <span className="text-sm text-gray-300 mono">
                  {report.location.city}, {report.location.region}<br/>
                  <span className="text-white font-bold">{report.location.country}</span>
                </span>
                <span className="text-[9px] text-gray-400 mono mt-1 leading-relaxed">Original registration point derived from National Numbering Plans.</span>
              </div>
            </div>
          </div>

          {/* Temporal Trace Card */}
          {report.historicalTrace && (
            <div className="glass p-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 group">
              <div className="flex justify-between items-center mb-6 border-b border-blue-500/10 pb-3">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mono font-black">Historical Signal</h3>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 animate-pulse">LOCK</span>
              </div>
              <div className="space-y-5">
                <p className="text-[9px] mono text-blue-300/80 leading-relaxed mb-4">Forensic reconstruction of likely position based on network pings and metadata logs.</p>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 mono uppercase mb-1">Target Window</span>
                  <span className="text-sm text-white font-bold mono">{report.historicalTrace.timestamp}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 mono uppercase mb-1">Signal Confidence</span>
                  <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${report.historicalTrace.confidence}%` }}></div>
                  </div>
                  <span className="text-[9px] text-gray-400 mono mt-1">Density of temporal artifacts found in public leaks.</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 mono uppercase mb-1">Trace Context</span>
                  <p className="text-[11px] text-gray-300 leading-relaxed italic border-l border-blue-500/30 pl-3">
                    "{report.historicalTrace.context}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reputation Index */}
          <div className="glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 mb-8 mono font-black border-b border-emerald-500/10 pb-3">Reputation Index</h3>
            <p className="text-[9px] text-gray-400 mono mb-6 leading-relaxed">Risk score cross-referenced against global spam and fraud registries.</p>
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="35" fill="transparent" stroke="#111827" strokeWidth="8" />
                  <circle 
                    cx="40" cy="40" r="35" fill="transparent" 
                    stroke={report.reputation.score < 30 ? "#10b981" : report.reputation.score < 70 ? "#facc15" : "#ef4444"} 
                    strokeWidth="8" 
                    strokeDasharray={220}
                    strokeDashoffset={220 - (220 * report.reputation.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black mono text-white">{report.reputation.score}</span>
                </div>
              </div>
              <div>
                <p className={`text-xl font-black tracking-tighter ${getRiskColor(report.reputation.riskLevel)}`}>
                  {report.reputation.riskLevel.toUpperCase()}
                </p>
                <p className="text-[9px] text-gray-500 mono uppercase font-bold tracking-widest">Threat Level</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.reputation.flags.map((flag, idx) => (
                <span key={idx} className="bg-red-500/5 text-red-500 text-[9px] px-2 py-1 rounded border border-red-500/10 uppercase mono font-bold">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Visual Map Card */}
          <div className="glass p-0 overflow-hidden rounded-3xl border border-white/5 h-[400px] relative shadow-2xl group">
             {/* Map Visual Simulation */}
             <div className="absolute inset-0 bg-[#0a0a0a]">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 border border-emerald-500/10 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_#10b981]"></div>
                       {report.historicalTrace && (
                         <div className="absolute -top-12 -left-12 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_20px_#60a5fa] animate-bounce">
                           <div className="absolute top-4 left-4 text-[9px] text-blue-300 mono whitespace-nowrap bg-black/80 px-2 py-1 border border-blue-500/30 rounded shadow-xl">HISTORICAL_SIGNAL_HIT</div>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
             </div>

            <div className="absolute top-6 left-6 z-10 bg-black/80 backdrop-blur-2xl p-4 border border-emerald-500/30 rounded-2xl text-[11px] mono text-emerald-400 space-y-2 shadow-2xl transition-all duration-300">
              <div className="flex justify-between gap-6 border-b border-emerald-500/10 pb-1 mb-1">
                <span className="opacity-60">GEO_COORDS</span>
                <span className="font-bold">{report.location.coordinates.lat.toFixed(4)}, {report.location.coordinates.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="opacity-60">TARGET_LOC</span>
                <span className="font-bold">{report.location.city.toUpperCase()}</span>
              </div>
              <div className="text-[8px] opacity-40 uppercase pt-1">Derived via SS7 Triangulation Logic</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ownership */}
            <div className="glass p-8 rounded-3xl border border-white/5">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 mb-8 mono font-black border-b border-emerald-500/10 pb-3">Identity Recon</h3>
              <div className="space-y-6">
                <p className="text-[9px] text-gray-400 mono mb-4 leading-relaxed">Mapping of digital artifacts associated with the terminal's registered identity.</p>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                  <div className="text-xl text-white font-black mono tracking-tight">
                    {report.ownership.name || "UNIDENTIFIED OWNER"}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-[9px] uppercase text-gray-500 mono font-bold border-l-2 border-emerald-500/30 pl-2 tracking-widest">Digital Footprint</div>
                  {report.ownership.associatedEmails.length > 0 ? report.ownership.associatedEmails.map((email, i) => (
                    <div key={i} className="text-[11px] text-gray-400 font-mono bg-black/40 px-3 py-1.5 rounded border border-white/5 truncate">
                      {email}
                    </div>
                  )) : (
                    <div className="text-[10px] text-gray-600 mono italic px-3 py-1.5">No emails identified in state leaks.</div>
                  )}
                </div>
              </div>
            </div>

            {/* IP Intelligence */}
            <div className="glass p-8 rounded-3xl border border-white/5">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 mb-8 mono font-black border-b border-emerald-500/10 pb-3">Digital Gateway</h3>
              <div className="space-y-4">
                <p className="text-[9px] text-gray-400 mono mb-4 leading-relaxed">Network ingress point identified via public login artifacts.</p>
                {report.ipInfo ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 mono uppercase mb-1">Inferred IP</span>
                      <span className="text-xl text-emerald-400 font-black mono">
                        {report.ipInfo.ipAddress}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 mono uppercase mb-1">Infrastructure</span>
                      <span className="text-xs text-gray-300 mono">{report.ipInfo.isp}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-gray-600 mono italic py-4 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl h-24">
                    <span>SIGNAL_ABSENT</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Synthesis */}
          <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 mb-8 mono font-black border-b border-emerald-500/10 pb-3">Forensic Synthesis</h3>
            <p className="text-[9px] text-gray-400 mono mb-4 leading-relaxed">Automated intelligence summary correlating disparate signal artifacts.</p>
            <div className="relative">
              <p className="text-sm text-gray-300 leading-relaxed font-light italic pl-4 border-l-2 border-emerald-500/20 py-2">
                {report.summary}
              </p>
            </div>
          </div>

          {/* Data Integrity & Sources */}
          {report.sources && report.sources.length > 0 && (
            <div className="glass p-8 rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.02]">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 mb-6 mono font-black border-b border-emerald-500/10 pb-3 flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.92v6.574a1 1 0 01-.268.683l-7.931 8.35a1 1 0 01-1.458 0l-7.931-8.35a1 1 0 01-.268-.683V5.82a1 1 0 01.666-.92zM10 3.167L4 5.738v5.196l6 6.313 6-6.313V5.738l-6-2.571z" clipRule="evenodd" /></svg>
                Verified Grounding Sources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5 hover:border-emerald-500/40 transition-all group"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-white font-bold mono truncate group-hover:text-emerald-400 transition-colors">{source.title}</span>
                      <span className="text-[8px] text-gray-500 mono truncate">{source.url}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
