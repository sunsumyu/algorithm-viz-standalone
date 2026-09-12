import { describe, it, expect } from 'vitest';
import { UniversalFidelityAuditor } from './fidelity-auditor';
import { algorithmRegistry } from './algorithm-registry';
import { loadAllAlgorithmBatches } from './algorithm-loader';
import { ALL_ALGORITHM_METADATA } from './algorithm-catalog.generated';

describe('Universal Algorithm Fidelity Auditor', () => {
  it('should audit all registered algorithms and report integrity', async () => {
    // 预热加载所有 batch 模块
    await loadAllAlgorithmBatches();

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
  }, 60000);

  it('should verify every entry in ALL_ALGORITHM_METADATA is loadable by AlgorithmRegistry individually', async () => {
    const errors: string[] = [];
    for (const meta of ALL_ALGORITHM_METADATA) {
      const loaded = await algorithmRegistry.resolve(meta.id);
      if (!loaded || !loaded.Visualizer || !loaded.template) {
        errors.push(`Missing loader or visualizer for metadata id: "${meta.id}" (name: "${meta.name}", viewId: "${meta.viewId}")`);
      }
    }
    if (errors.length > 0) {
      console.error('Unloadable algorithms in metadata:', errors);
    }
    expect(errors).toEqual([]);
  });
});
