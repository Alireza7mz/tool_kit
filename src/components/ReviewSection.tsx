import { type Finding } from '../data/findings';
import { CodeHighlight } from './CodeHighlight';

interface ReviewSectionProps {
  finding: Finding;
  isExpanded: boolean;
  onToggle: () => void;
}

const severityConfig = {
  critical: {
    icon: 'fas fa-exclamation-triangle',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-300',
    label: 'Critical',
  },
  warning: {
    icon: 'fas fa-exclamation-circle',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300',
    label: 'Warning',
  },
  info: {
    icon: 'fas fa-info-circle',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300',
    label: 'Info',
  },
  positive: {
    icon: 'fas fa-check-circle',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300',
    label: 'Strength',
  },
};

export function ReviewSection({ finding, isExpanded, onToggle }: ReviewSectionProps) {
  const config = severityConfig[finding.severity];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isExpanded
          ? `${config.bg} ${config.border} shadow-lg`
          : 'bg-slate-800/40 border-slate-700/30 hover:border-slate-600/50'
      }`}
    >
      {/* Header - clickable */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-4"
      >
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <i className={`${config.icon} ${config.color} text-sm`}></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
              {config.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400">
              {finding.category}
            </span>
            {finding.line && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-500 font-mono">
                {finding.line}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
            {finding.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {finding.description}
          </p>
        </div>

        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 ${
          isExpanded ? 'rotate-180' : ''
        }`}>
          <i className="fas fa-chevron-down text-slate-500 text-sm"></i>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-0">
          <div className="ml-14 space-y-4">
            {/* Description */}
            <div className="text-sm text-slate-300 leading-relaxed">
              {finding.description}
            </div>

            {/* Details */}
            {finding.details && (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Analysis
                </h4>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {finding.details}
                </pre>
              </div>
            )}

            {/* Code */}
            {finding.code && (
              <CodeHighlight code={finding.code} />
            )}

            {/* Suggestion */}
            {finding.suggestion && (
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i>
                  Recommendation
                </h4>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {finding.suggestion}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
