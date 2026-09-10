import { describe, it, expect } from 'vitest';
import { TreePathIntersectionVisualizer, buildTreePathIntersectSteps } from './tree-path-intersection-renderer';
import { TREE_PATH_INTERSECT_CODE_LANGUAGES } from './tree-path-intersection-problem-content';

describe('TreePathIntersection', () => {
  it('should instantiate TreePathIntersectionVisualizer properly', () => {
    const viz = new TreePathIntersectionVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreePathIntersectionVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-path-intersection',
      viewId: 'algo-tree-path-intersection-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });

  it('buildTreePathIntersectSteps 必须生成精细逐语句执行流 (>= 20 步) 且行号在 Java 源码范围内', () => {
    const cases = [true, false];
    const javaLines = TREE_PATH_INTERSECT_CODE_LANGUAGES.java.length;

    expect(javaLines).toBeGreaterThanOrEqual(80);

    for (const isIntersect of cases) {
      const steps = buildTreePathIntersectSteps(isIntersect);
      expect(steps.length).toBeGreaterThanOrEqual(20);

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        expect(step.message).toBeTruthy();
        expect(step.log).toBeTruthy();
        expect(step.metrics).toBeDefined();
        expect(step.metrics?.['metric-lca-p1']).toBeDefined();
        expect(step.metrics?.['metric-lca-p2']).toBeDefined();
        expect(step.metrics?.['metric-intersect-result']).toBeDefined();
        expect(step.metrics?.['metric-overlap-nodes']).toBeDefined();

        const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine ? (step.codeLine as any).java : step.codeLine;
        const rawLines = Array.isArray(javaLine) ? javaLine : [javaLine];
        for (const line of rawLines) {
          expect(line).toBeGreaterThanOrEqual(1);
          expect(line).toBeLessThanOrEqual(javaLines);
        }
      }

      const firstLine = typeof steps[0].codeLine === 'object' && steps[0].codeLine !== null ? (steps[0].codeLine as any).java : steps[0].codeLine;
      const lastLine = typeof steps[steps.length - 1].codeLine === 'object' && steps[steps.length - 1].codeLine !== null ? (steps[steps.length - 1].codeLine as any).java : steps[steps.length - 1].codeLine;
      expect(firstLine).toBe(68);
      expect(lastLine).toBe(81);
    }
  });
});
