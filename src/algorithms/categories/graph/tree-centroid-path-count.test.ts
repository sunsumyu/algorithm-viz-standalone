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
      expect(step.metrics['metric-centroid']).toBeDefined();
      expect(step.metrics['metric-raw-pairs']).toBeDefined();
      expect(step.metrics['metric-deduct-pairs']).toBeDefined();
      expect(step.metrics['metric-valid-pairs']).toBeDefined();

      const rawLines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of rawLines) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(javaLines);
      }
    }

    expect(steps[0].codeLine).toBe(86);
    expect(steps[steps.length - 1].codeLine).toBe(105);
  });
});
