export function ReviewHeader() {
  return (
    <header className="relative overflow-hidden border-b border-slate-800/50">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            Code Review
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            Python
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
            Quantitative Finance
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          DFA Calculator
          <span className="block text-lg sm:text-xl font-normal text-slate-400 mt-2">
            Detrended Fluctuation Analysis for Daily OHLC Data
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
          A comprehensive review of a Python implementation of the DFA algorithm
          (Peng et al., 1994) applied to financial time series for regime detection.
          The code computes rolling scaling exponents over multiple time windows
          to classify market regimes as Expansion, Chop, or Compression.
        </p>

        <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <i className="fas fa-file-code text-indigo-400"></i>
            <span>dfa_calculator.py</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-ruler-combined text-indigo-400"></i>
            <span>~340 lines</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-code-branch text-indigo-400"></i>
            <span>7 functions</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-cubes text-indigo-400"></i>
            <span>numpy, pandas</span>
          </div>
        </div>
      </div>
    </header>
  );
}
