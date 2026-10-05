interface CodeHighlightProps {
  code: string;
}

export function CodeHighlight({ code }: CodeHighlightProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/50">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
        </div>
        <span className="text-xs text-slate-500 font-mono ml-2">python</span>
      </div>
      <div className="p-4 bg-slate-900/80 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          <code>
            {code.split('\n').map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none text-slate-600 text-right w-8 mr-4 flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-300">
                  <HighlightedLine line={line} />
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function HighlightedLine({ line }: { line: string }) {
  // Simple syntax highlighting
  const highlighted = line
    // Comments
    .replace(/(#.*)$/gm, '<span class="text-slate-500 italic">$1</span>')
    // Strings (single and double quotes)
    .replace(/('[^']*'|"[^"]*")/g, '<span class="text-emerald-400">$1</span>')
    // Keywords
    .replace(/\b(def|return|if|elif|else|for|in|range|import|from|class|try|except|continue|not|and|or|None|True|False|lambda)\b/g, '<span class="text-purple-400">$1</span>')
    // Built-in functions
    .replace(/\b(print|len|range|int|float|str|list|dict|set|tuple|type|isinstance|max|min|sum|abs|round|sorted|enumerate|zip|map|filter|any|all)\b/g, '<span class="text-cyan-400">$1</span>')
    // Numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$1</span>')
    // Decorators
    .replace(/(@\w+)/g, '<span class="text-amber-300">$1</span>');

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
