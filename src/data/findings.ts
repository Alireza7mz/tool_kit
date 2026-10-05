export type Severity = 'critical' | 'warning' | 'info' | 'positive';

export interface Finding {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  line?: string;
  description: string;
  details: string;
  code?: string;
  suggestion?: string;
}

export const findings: Finding[] = [
  {
    id: 'perf-rolling',
    title: 'Rolling DFA is O(n\u00B2) \u2014 Will be very slow on large datasets',
    category: 'Performance',
    severity: 'critical',
    line: 'L131-155',
    description: 'The rolling_dfa function iterates over every time step, and for each step runs the full DFA algorithm. With 1500 data points and a 252-day window, this means ~1250 DFA computations, each involving multiple polyfit calls across multiple scales.',
    details: 'For each of the ~1250 time steps:\n\u2022 DFA iterates over ~20 scale points\n\u2022 Each scale point iterates over N/n windows\n\u2022 Each window calls np.polyfit (least-squares fit)\n\nTotal: ~1250 \u00D7 20 \u00D7 (63/4) \u2248 393,750 polyfit calls for the 63D window alone.\n\nThis is a CPU-bound bottleneck. For real-time or interactive use, this will be unacceptably slow.',
    code: 'for t in range(window - 1, n):\n    window_data = returns_arr[t - window + 1 : t + 1]\n    # ... full DFA computation for each step\n    alpha_values[t] = compute_dfa_alpha(valid, n_scales=n_scales)',
    suggestion: 'Use multiprocessing.Pool or joblib for parallel computation. Alternatively, consider an incremental DFA approximation that updates rather than recomputes from scratch. For production, pre-compute and cache results.'
  },
  {
    id: 'bug-scale-overflow',
    title: 'N_SCALES=20 causes duplicate scales on small windows',
    category: 'Correctness',
    severity: 'warning',
    line: 'L42, L89-95',
    description: 'With the 63-day window, n_max = 63//4 = 15 and n_min = max(4, int(63*0.02)) = 4. Generating 20 log-spaced points between 4 and 15, then rounding to int and taking unique values, may yield fewer unique scales than expected.',
    details: 'np.logspace(log10(4), log10(15), 20) produces values like:\n4.0, 4.3, 4.6, 4.9, 5.3, 5.7, 6.1, 6.6, 7.1, 7.7, 8.3, 8.9, 9.7, 10.4, 11.2, 12.1, 13.1, 14.1, 15.0\n\nAfter rounding: 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10, 11, 12, 13, 14, 15\nAfter unique: 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 \u2192 12 unique values.\n\nThis is OK for 63D, but for even shorter series or different parameters, you could get < 4 unique scales. The check handles this, but it means the 63D window will silently produce NaN for early observations without any warning.',
    code: 'scales = np.unique(\n    np.round(\n        np.logspace(np.log10(n_min), np.log10(n_max), n_scales)\n    ).astype(int)\n)',
    suggestion: 'Add a warning log when scales are reduced below n_scales. Consider making N_SCALES adaptive based on window size: n_scales = min(20, n_max - n_min).'
  },
  {
    id: 'bug-validation-series',
    title: 'Validation tests DFA on raw noise, not integrated series',
    category: 'Correctness',
    severity: 'warning',
    line: 'L280-310',
    description: 'The validate_dfa() function passes raw random noise directly to compute_dfa_alpha. However, DFA internally integrates the series (cumsum). The test conflates testing DFA on white noise vs. testing the financial pipeline.',
    details: 'The function does:\n1. series_centered = series - mean(series)\n2. profile = cumsum(series_centered)\n\nIf you pass random noise, the profile is a random walk \u2192 \u03B1 \u2248 0.5 \u2713\nIf you pass a persistent AR(1) series, the profile is... an integrated AR(1), not what you get from log returns of a trending price.\n\nThe test is not wrong per se, but it tests DFA on the wrong input type. For financial data, you should be passing log returns (which the main pipeline does correctly).',
    code: '# Random walk (H = 0.5 expected)\nrw = np.random.randn(n)\nalpha_rw = compute_dfa_alpha(rw)  # Tests DFA on white noise \u2192 profile is RW',
    suggestion: 'Add a comment clarifying that validation tests DFA on raw series (where internal integration creates the profile). Add a test that passes actual log returns from synthetic price data to verify the full pipeline.'
  },
  {
    id: 'design-thresholds',
    title: 'Regime thresholds are hardcoded magic numbers',
    category: 'Design',
    severity: 'info',
    line: 'L163-173',
    description: 'The thresholds 0.45 and 0.60 for regime classification are hardcoded in dfa_regime_label(). These should be configurable constants at the top of the file, consistent with the configuration section pattern already established.',
    details: 'The code already has a well-organized CONFIGURATION section at the top with INPUT_FILE, WINDOWS, N_SCALES, etc. But the regime thresholds are buried in the function body. This makes it hard to:\n\u2022 Experiment with different threshold values\n\u2022 Document why these specific values were chosen\n\u2022 Adjust for different instruments or timeframes',
    code: 'def dfa_regime_label(alpha):\n    if pd.isna(alpha):\n        return \'Unknown\'\n    elif alpha > 0.60:\n        return \'Expansion\'\n    elif alpha > 0.45:\n        return \'Chop\'\n    else:\n        return \'Compression\'',
    suggestion: 'Move thresholds to the CONFIGURATION section:\nEXPANSION_THRESHOLD = 0.60\nCOMPRESSION_THRESHOLD = 0.45\n\nThen reference them in the function. This also makes it easy to add sensitivity analysis later.'
  },
  {
    id: 'design-no-logging',
    title: 'Uses print() instead of proper logging module',
    category: 'Design',
    severity: 'info',
    line: 'Throughout',
    description: 'The entire script uses print() for output. For a production data pipeline, the Python logging module would provide better control over output levels, formatting, and the ability to redirect to files.',
    details: 'Benefits of using logging:\n\u2022 DEBUG/INFO/WARNING/ERROR levels\n\u2022 Can redirect to file without changing code\n\u2022 Can silence verbose output in production\n\u2022 Standard practice for data pipelines\n\u2022 Compatible with monitoring systems',
    suggestion: 'import logging\nlogger = logging.getLogger(__name__)\n\n# Replace print(f"...") with:\nlogger.info("Loading data from: %s", INPUT_FILE)\nlogger.warning("Window %dD: insufficient data", window)\nlogger.error("File not found: %s", INPUT_FILE)'
  },
  {
    id: 'perf-majority-regime',
    title: 'majority_regime uses slow row-by-row apply()',
    category: 'Performance',
    severity: 'warning',
    line: 'L240-248',
    description: 'The majority_regime function is applied via results.apply(majority_regime, axis=1), which iterates row-by-row in Python. For 1500+ rows, this is slow and unnecessary when regime columns already exist.',
    details: 'The function:\n1. Extracts alpha values from 3 columns for each row\n2. Converts each to a regime label\n3. Uses Counter to find the majority\n\nThis is O(n \u00D7 windows) Python-level operations. It could be vectorized using the already-computed regime columns.',
    code: 'def majority_regime(row):\n    regimes = [dfa_regime_label(row[f"DFA_alpha_{w}D"])\n              for w in available_windows\n              if not pd.isna(row.get(f"DFA_alpha_{w}D"))]\n    if not regimes:\n        return \'Unknown\'\n    from collections import Counter\n    return Counter(regimes).most_common(1)[0][0]\n\nresults[\'DFA_consensus_regime\'] = results.apply(majority_regime, axis=1)',
    suggestion: 'Use the already-computed regime columns directly:\n\nregime_cols = [f"DFA_regime_{w}D" for w in available_windows]\nresults[\'DFA_consensus_regime\'] = results[regime_cols].mode(axis=1)[0]'
  },
  {
    id: 'positive-documentation',
    title: 'Excellent documentation and code organization',
    category: 'Quality',
    severity: 'positive',
    description: 'The code has outstanding documentation: module-level docstring with references, detailed function docstrings with Parameters/Returns sections, inline comments explaining the algorithm steps, and a clear configuration section.',
    details: 'Strengths:\n\u2022 Academic references (Peng et al. 1994, Di Matteo et al. 2005)\n\u2022 NumPy-style docstrings with full parameter descriptions\n\u2022 Step-by-step algorithm comments matching the paper\n\u2022 Clear regime interpretation guide at the end\n\u2022 Configuration section separated from logic\n\u2022 Validation function demonstrates good testing practice\n\nThis is rare and valuable in quantitative finance code.',
  },
  {
    id: 'positive-causal-design',
    title: 'Correct causal (no look-ahead) implementation',
    category: 'Quality',
    severity: 'positive',
    description: 'The rolling_dfa function correctly uses only past data [t-window+1, t] for each computation. The z-score function uses shift(1) to prevent the current value from influencing its own normalization. This is critical for trading applications.',
    details: 'Look-ahead bias is the #1 sin in backtesting. This code avoids it in two places:\n1. rolling_dfa: backward-looking window only\n2. rolling_zscore: shift(1) before computing rolling mean/std\n\nThe comment "No look-ahead bias" in the docstring shows awareness of this issue.',
  },
  {
    id: 'positive-sanity-checks',
    title: 'Good sanity checks and edge case handling',
    category: 'Quality',
    severity: 'positive',
    description: 'The code includes multiple defensive checks: minimum data length (N < 32), minimum valid data (80% non-NaN), valid alpha range (0.05-1.50), minimum scale count (4), and zero-denominator protection.',
    details: 'These checks prevent:\n\u2022 Crashing on short/incomplete data\n\u2022 Numerical issues producing nonsensical alpha values\n\u2022 Division by zero in regression\n\u2022 Silent garbage results from insufficient scale points\n\nThe 0.05-1.50 alpha range check is particularly important \u2014 values outside this indicate numerical problems rather than genuine regime signals.',
  },
  {
    id: 'bug-no-type-hints',
    title: 'Missing type hints on core functions',
    category: 'Quality',
    severity: 'info',
    line: 'L55, L131',
    description: 'While docstrings describe parameter types, the functions lack Python type annotations. This reduces IDE support and makes the code harder to maintain.',
    details: 'Type hints would catch bugs like:\n\u2022 Passing a DataFrame where ndarray is expected\n\u2022 Incorrect return type assumptions\n\u2022 IDE autocomplete and static analysis support\n\nThe code already uses numpy and pandas extensively, so type hints would integrate well with the existing tooling.',
    code: '# Current:\ndef compute_dfa_alpha(series, n_scales=N_SCALES):\n\n# Better:\ndef compute_dfa_alpha(series: np.ndarray, n_scales: int = N_SCALES) -> float:',
    suggestion: 'Add type hints to all function signatures. Use numpy.typing.NDArray for array types and Optional[float] for functions that can return NaN.'
  },
  {
    id: 'design-synthetic-data',
    title: "Synthetic data generator doesn't produce true DFA-distinguishable regimes",
    category: 'Correctness',
    severity: 'info',
    line: 'L260-295',
    description: "The synthetic data generator creates two regimes with different drift and volatility, but doesn't explicitly control the Hurst exponent or autocorrelation structure. The resulting DFA alpha values may not cleanly separate into the expected ranges.",
    details: 'The generator uses:\n\u2022 Phase 0: drift=0.00015, vol=0.006 (uptrend, lower vol)\n\u2022 Phase 1: drift=-0.00005, vol=0.009 (downtrend, higher vol)\n\nBut DFA measures long-range dependence (autocorrelation structure), not just drift/volatility. A series with high volatility but independent returns will still give \u03B1 \u2248 0.5.\n\nTo truly test DFA, the synthetic data should use:\n\u2022 Fractional Gaussian noise with controlled H\n\u2022 Or ARFIMA processes with known d parameter',
    suggestion: 'For proper validation, generate synthetic data using fractional Gaussian noise with controlled Hurst exponent, or ARFIMA processes with known d parameter. The Davies-Harte method provides exact fGn simulation.'
  },
  {
    id: 'perf-memory',
    title: 'All intermediate results stored in memory simultaneously',
    category: 'Performance',
    severity: 'info',
    line: 'L183-250',
    description: 'The results DataFrame accumulates all DFA columns, z-scores, regime labels, momentum, consistency scores, etc. For large datasets with multiple windows, this creates a wide DataFrame.',
    details: 'For 1500 rows \u00D7 ~20 DFA-related columns, memory usage is modest (~240KB). But if extended to:\n\u2022 Multiple instruments (100+ symbols)\n\u2022 Higher frequency data (hourly)\n\u2022 More window sizes\n\nMemory could become a concern. The current design loads everything into a single DataFrame.',
    suggestion: 'For production use with multiple instruments, consider:\n\u2022 Processing one instrument at a time\n\u2022 Using parquet format for efficient storage\n\u2022 Chunked processing for very large datasets\n\u2022 Separating feature computation from storage'
  },
  {
    id: 'design-cross-validation',
    title: 'Cross-window consistency is a strong design choice',
    category: 'Design',
    severity: 'positive',
    description: 'The cross-window consistency analysis (DFA_consistency, DFA_consensus_regime) is an excellent addition. It provides a confidence measure for the regime signal and helps identify transitional periods where different timeframes disagree.',
    details: 'This addresses a real problem in regime detection:\n\u2022 Short windows are responsive but noisy\n\u2022 Long windows are stable but lagging\n\u2022 When all windows agree \u2192 high confidence signal\n\u2022 When windows disagree \u2192 transitional/uncertain regime\n\nThe consistency score (1 - std/mean) is a simple but effective metric.',
  },
  {
    id: 'bug-division-consistency',
    title: 'DFA_consistency formula can produce misleading values',
    category: 'Correctness',
    severity: 'warning',
    line: 'L232-235',
    description: 'The consistency formula 1 - (std / |mean|) can produce values > 1 when std > 2\u00D7mean, or negative values when mean is near zero. The clip(0,1) handles the negative case but values near 0.5 are ambiguous.',
    details: 'Example scenarios:\n\u2022 All windows \u03B1 = 0.55 \u2192 mean=0.55, std=0 \u2192 consistency=1.0 \u2713\n\u2022 Windows \u03B1 = [0.40, 0.55, 0.70] \u2192 mean=0.55, std=0.15 \u2192 consistency=0.73\n\u2022 Windows \u03B1 = [0.30, 0.55, 0.80] \u2192 mean=0.55, std=0.25 \u2192 consistency=0.55\n\u2022 Windows \u03B1 = [0.20, 0.55, 0.90] \u2192 mean=0.55, std=0.35 \u2192 consistency=0.36\n\nThe metric works but the interpretation isn\'t intuitive.',
    code: "results['DFA_consistency'] = (\n    1 - (results['DFA_cross_std'] / (results['DFA_cross_mean'].abs() + 1e-8))\n).clip(0, 1)",
    suggestion: 'Consider using coefficient of variation directly, or a simpler approach based on regime agreement:\n\n# Percentage of windows agreeing on regime\nresults[\'DFA_consistency\'] = results[regime_cols].apply(\n    lambda row: row.value_counts().max() / row.count(), axis=1\n)'
  },
  {
    id: 'design-imports',
    title: 'Import inside function body',
    category: 'Quality',
    severity: 'info',
    line: 'L247',
    description: 'The from collections import Counter import is inside the majority_regime function, which means it is re-imported on every call (1500+ times). While Python caches imports, this is poor practice.',
    details: 'Python does cache module imports, so the performance impact is negligible after the first call. But it is:\n\u2022 Unconventional and confusing to readers\n\u2022 Makes dependency tracking harder\n\u2022 Violates PEP 8 import conventions',
    code: 'def majority_regime(row):\n    regimes = [...]\n    from collections import Counter  # imported inside function\n    return Counter(regimes).most_common(1)[0][0]',
    suggestion: 'Move to top of file:\nfrom collections import Counter\n\nOr better yet, replace with the vectorized mode() approach suggested earlier.'
  },
  {
    id: 'positive-output',
    title: 'Well-structured output with interpretation guide',
    category: 'Quality',
    severity: 'positive',
    description: 'The output section provides clear summary statistics, regime distributions, column descriptions, and a quick interpretation guide. This makes the tool self-documenting and easy to use for team members.',
    details: 'The output includes:\n\u2022 Per-window summary statistics (mean, std, min, max \u03B1)\n\u2022 Regime distribution percentages\n\u2022 Column-by-column validity counts\n\u2022 Quick interpretation guide at the end\n\u2022 Clear success/error messages\n\nThis is excellent for a data pipeline tool \u2014 users can understand results without reading the code.',
  },
];
