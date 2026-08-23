import { describe, it, expect } from 'vitest';
import {
  EVOLUTION_MODES,
  FIB_EVOLUTION_CODES,
  buildEvolutionSteps,
} from './fib-evolution-steps';

describe('Fibonacci Evolution Steps & Code Switching', () => {
  it('should define all 4 evolution modes with languages and lines', () => {
    expect(EVOLUTION_MODES).toHaveLength(4);
    expect(EVOLUTION_MODES.map(m => m.id)).toEqual([
      'naive-recursive',
      'memo-topdown',
      'tabulation-bottomup',
      'space-optimized',
    ]);

    for (const mode of EVOLUTION_MODES) {
      const langConfig = FIB_EVOLUTION_CODES[mode.id];
      expect(langConfig).toBeDefined();
      expect(langConfig.languages.java).toBeDefined();
      expect(langConfig.languages.python).toBeDefined();
      expect(langConfig.languages.cpp).toBeDefined();
      expect(langConfig.languages.javascript).toBeDefined();
      expect(langConfig.lineExplanations).toBeDefined();
      expect(langConfig.keyPoints).toBeDefined();
    }
  });

  it('should generate valid steps for naive recursive mode', () => {
    const steps = buildEvolutionSteps(4, 'naive-recursive');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].evolutionMode).toBe('naive-recursive');
    expect(steps[0].tree).toBeDefined();
    expect(steps[steps.length - 1].metrics?.answer).toBe(3);
  });

  it('should generate valid steps for memo topdown mode', () => {
    const steps = buildEvolutionSteps(5, 'memo-topdown');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].evolutionMode).toBe('memo-topdown');
    expect(steps.some(s => s.memoTable && s.memoTable.size > 0)).toBe(true);
    expect(steps[steps.length - 1].metrics?.answer).toBe(5);
  });

  it('should generate valid steps for tabulation bottomup mode', () => {
    const steps = buildEvolutionSteps(6, 'tabulation-bottomup');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].evolutionMode).toBe('tabulation-bottomup');
    expect(steps[steps.length - 1].dp1d).toEqual([0, 1, 1, 2, 3, 5, 8]);
    expect(steps[steps.length - 1].metrics?.answer).toBe(8);
  });

  it('should generate valid steps for space-optimized mode', () => {
    const steps = buildEvolutionSteps(6, 'space-optimized');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].evolutionMode).toBe('space-optimized');
    expect(steps[steps.length - 1].rollingVars).toBeDefined();
    expect(steps[steps.length - 1].rollingVars?.curr).toBe(8);
  });
});
