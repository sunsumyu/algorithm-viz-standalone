import { describe, it, expect } from 'vitest';
import { DpEvolutionAuditor } from './dp-evolution-auditor';

describe('Dp Evolution Fidelity Auditor', () => {
  it('should verify fidelity and multi-language alignment for core DP algorithms', () => {
    const dpAlgorithms = [
      { id: 'unique-paths', title: '不同路径' },
      { id: 'climb-stairs', title: '爬楼梯' },
      { id: 'min-cost-climbing-stairs', title: '使用最小花费爬楼梯' },
    ];

    for (const algo of dpAlgorithms) {
      const result = DpEvolutionAuditor.auditUniversalDpAlgorithm(algo.id, algo.title);
      if (!result.passed) {
        console.error(`DP Fidelity Failure for ${algo.id}:`, result.errors);
      }
      expect(result.passed).toBe(true);
      expect(result.totalSteps).toBeGreaterThan(0);
    }
  });
});
