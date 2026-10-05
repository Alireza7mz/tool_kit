import { findings } from '../data/findings';

export function ScoreCard() {
  const critical = findings.filter(f => f.severity === 'critical').length;
  const warnings = findings.filter(f => f.severity === 'warning').length;
  const info = findings.filter(f => f.severity === 'info').length;
  const positive = findings.filter(f => f.severity === 'positive').length;

  const total = findings.length;
  const score = Math.round(
    ((positive * 10 + info * 5 + warnings * 2) / (total * 10)) * 100
  );

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Score */}
      <div className="md:col-span-1 lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="text-slate-400 text-sm mt-1">/ 100</div>
          <div className="mt-3 text-sm font-medium text-emerald-400">
            Good Quality
          </div>
          <div className="mt-2 w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-900/5 border border-red-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-400"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-300">{critical}</div>
            <div className="text-xs text-red-400/70">Critical</div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Performance bottleneck that will cause issues at scale
        </p>
      </div>

      {/* Warnings */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-900/5 border border-amber-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <i className="fas fa-exclamation-circle text-amber-400"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-300">{warnings}</div>
            <div className="text-xs text-amber-400/70">Warnings</div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Edge cases and subtle correctness concerns
        </p>
      </div>

      {/* Positive */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-900/5 border border-emerald-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <i className="fas fa-check-circle text-emerald-400"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-300">{positive}</div>
            <div className="text-xs text-emerald-400/70">Strengths</div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Excellent practices worth highlighting
        </p>
      </div>
    </div>
  );
}
