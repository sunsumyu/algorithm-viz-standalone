import { describe, it, expect } from 'vitest';
import { ConvexHull3DVisualizer, buildConvexHull3DSteps } from './convex-hull-3d-renderer';
import { CONVEX_HULL_3D_CODE_LANGUAGES } from './convex-hull-3d-problem-content';

describe('ConvexHull3D (3D Convex Hull - P4724)', () => {
  it('should instantiate ConvexHull3DVisualizer properly', () => {
    const viz = new ConvexHull3DVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new ConvexHull3DVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'convex-hull-3d',
      viewId: 'algo-convex-hull-3d-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });

  it('buildConvexHull3DSteps 必须生成精细逐语句执行流 (>= 20 步) 且行号在 Java 源码范围内', () => {
    const steps = buildConvexHull3DSteps();
    const javaLines = CONVEX_HULL_3D_CODE_LANGUAGES.java.length;

    expect(steps.length).toBeGreaterThanOrEqual(20);
    expect(javaLines).toBeGreaterThanOrEqual(60);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.metrics).toBeDefined();
      expect(step.metrics.vertices).toBeDefined();
      expect(step.metrics.faces).toBeDefined();
      expect(step.metrics.euler).toBeDefined();

      const rawLines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of rawLines) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(javaLines);
      }
    }

    expect(steps[0].codeLine).toBe(37);
    expect(steps[steps.length - 1].codeLine).toBe(66);
  });
});
