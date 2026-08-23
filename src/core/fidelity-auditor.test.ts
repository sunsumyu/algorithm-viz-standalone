import { describe, it, expect } from 'vitest';
import { UniversalFidelityAuditor } from './fidelity-auditor';
import { AlgorithmManager } from './algorithm-manager';

describe('Universal Algorithm Fidelity Auditor', () => {
  it('should audit all registered algorithms and report integrity', () => {
    // 触发单例初始化以加载所有 batch 索引中的算法
    AlgorithmManager.getInstance();

    const summary = UniversalFidelityAuditor.runGlobalAudit();

    expect(summary.totalAlgorithms).toBeGreaterThan(50);
    console.log(
      `[Audit Summary] Total: ${summary.totalAlgorithms}, Passed: ${summary.passedCount}, Failed: ${summary.failedCount}, Warnings: ${summary.warningCount}`
    );

    // 检查是否有致命行号越界错误
    const failedList = summary.results.filter((r) => !r.passed);
    if (failedList.length > 0) {
      console.error('Failed algorithms:', failedList.map((f) => ({ id: f.id, errors: f.errors })));
    }

    expect(summary.failedCount).toBe(0);
  });

  it('should verify fidelity and multi-language alignment for core DP algorithms', () => {
    const dpAlgorithms = [
      { id: 'unique-paths', title: '不同路径' },
      { id: 'climb-stairs', title: '爬楼梯' },
      { id: 'min-cost-climbing-stairs', title: '使用最小花费爬楼梯' },
    ];

    for (const algo of dpAlgorithms) {
      const result = UniversalFidelityAuditor.auditUniversalDpAlgorithm(algo.id, algo.title);
      if (!result.passed) {
        console.error(`DP Fidelity Failure for ${algo.id}:`, result.errors);
      }
      expect(result.passed).toBe(true);
      expect(result.totalSteps).toBeGreaterThan(0);
    }
  });
});
