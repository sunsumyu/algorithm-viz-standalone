import { describe, it, expect } from 'vitest';
import { TreeCentroidPathCountVisualizer, buildTreeCentroidPathCountSteps } from './tree-centroid-path-count-renderer';
import { TREE_PATH_COUNT_CODE_LANGUAGES } from './tree-centroid-path-count-problem-content';

describe('TreeCentroidPathCount (POJ 1741 / P3806)', () => {
  it('should instantiate TreeCentroidPathCountVisualizer properly', () => {
    const viz = new TreeCentroidPathCountVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreeCentroidPathCountVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-centroid-path-count',
      viewId: 'algo-tree-centroid-path-count-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });

  it('buildTreeCentroidPathCountSteps 必须生成精细逐语句执行流 (>= 20 步) 且行号在 Java 源码范围内', () => {
    const steps = buildTreeCentroidPathCountSteps(5);
    const javaLines = TREE_PATH_COUNT_CODE_LANGUAGES.java.length;

    expect(steps.length).toBeGreaterThanOrEqual(20);
    expect(javaLines).toBeGreaterThanOrEqual(80);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.metrics).toBeDefined();
      expect(step.metrics!['metric-centroid']).toBeDefined();
      expect(step.metrics!['metric-raw-pairs']).toBeDefined();
      expect(step.metrics!['metric-deduct-pairs']).toBeDefined();
      expect(step.metrics!['metric-valid-pairs']).toBeDefined();

      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine ? (step.codeLine as any).java : step.codeLine;
      const rawLines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of rawLines) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(javaLines);
      }
    }

    const firstLine = typeof steps[0].codeLine === 'object' && steps[0].codeLine !== null ? (steps[0].codeLine as any).java : steps[0].codeLine;
    const lastLine = typeof steps[steps.length - 1].codeLine === 'object' && steps[steps.length - 1].codeLine !== null ? (steps[steps.length - 1].codeLine as any).java : steps[steps.length - 1].codeLine;
    expect(firstLine).toBe(86);
    expect(lastLine).toBe(105);
  });
});
