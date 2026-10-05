import { useState } from 'react';
import { ReviewHeader } from './components/ReviewHeader';
import { ScoreCard } from './components/ScoreCard';
import { ReviewSection } from './components/ReviewSection';
import { findings } from './data/findings';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  const categories = ['all', ...new Set(findings.map(f => f.category))];

  const filteredFindings = activeTab === 'all'
    ? findings
    : findings.filter(f => f.category === activeTab);

  const toggleFinding = (id: string) => {
    setExpandedFinding(expandedFinding === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <ReviewHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Score Overview */}
        <ScoreCard />

        {/* Category Tabs */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <i className="fas fa-search text-indigo-400 text-sm"></i>
            </span>
            Detailed Findings
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === cat
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? '📋 All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-4">
          {filteredFindings.map((finding) => (
            <ReviewSection
              key={finding.id}
              finding={finding}
              isExpanded={expandedFinding === finding.id}
              onToggle={() => toggleFinding(finding.id)}
            />
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
          <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            Overall Verdict
          </h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            This is a <strong className="text-white">well-engineered, production-quality</strong> implementation of DFA for financial time series. 
            The algorithm is correctly implemented following Peng et al. (1994), the code is thoroughly documented, 
            and the causal (no look-ahead) design is appropriate for trading applications.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            The <strong className="text-amber-300">primary concerns</strong> are performance-related (the rolling computation is CPU-bound and slow for large datasets) 
            and a few edge cases in the scale selection logic that could cause silent failures on short windows. 
            The validation function, while useful, tests DFA on raw noise rather than integrated series.
          </p>
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-emerald-300">Recommended next steps:</strong> Add multiprocessing for the rolling computation, 
            make regime thresholds configurable, add proper logging, and consider caching intermediate results 
            for interactive/real-time use cases.
          </p>
        </div>
      </main>
    </div>
  );
}
