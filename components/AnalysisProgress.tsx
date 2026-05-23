
import React from 'react';
import { AnalysisStep } from '../types';

interface AnalysisProgressProps {
  step: AnalysisStep;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ step }) => {
  const steps = [
    { key: AnalysisStep.INITIALIZING, label: 'Initializing Secure Session' },
    { key: AnalysisStep.NETWORK_QUERY, label: 'Network Interrogation' },
    { key: AnalysisStep.GEOLOCATION, label: 'Geo-Spatial Triangulation' },
    { key: AnalysisStep.TEMPORAL_LINK, label: 'Historical Trace Alignment' },
    { key: AnalysisStep.OSINT_SCRAPING, label: 'Digital Footprint Synthesis' },
    { key: AnalysisStep.FINALIZING, label: 'Compiling Report' },
  ];

  const getCurrentIndex = () => steps.findIndex(s => s.key === step);
  const currentIndex = getCurrentIndex();

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-6">
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div key={s.key} className="relative">
            <div className={`flex items-center gap-4 transition-all duration-500 ${idx > currentIndex ? 'opacity-20' : 'opacity-100'}`}>
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center mono text-[10px] font-bold
                ${idx < currentIndex ? 'bg-emerald-500 border-emerald-500 text-black' : 
                  idx === currentIndex ? 'border-emerald-400 text-emerald-400 animate-pulse' : 'border-gray-800 text-gray-700'}`}>
                {idx < currentIndex ? '✓' : idx + 1}
              </div>
              <div className="flex-1">
                <div className={`text-[11px] uppercase tracking-widest mono ${idx === currentIndex ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {s.label}
                </div>
                {idx === currentIndex && (
                  <div className="mt-1 w-full bg-gray-900 h-0.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full animate-progress" style={{ width: '30%' }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnalysisProgress;
