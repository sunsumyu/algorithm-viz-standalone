import { describe, it, expect } from 'vitest';
import {
  buildHldSteps,
  HLD_CODES,
  HLD_LINES,
} from './hld-step-compiler';
import { renderHldCanvas } from './hld-canvas-adapter';

describe('HLD 121 Step Compiler & Canvas Adapter', () => {
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8]
  ];

  it('should generate valid heavy-light decomposition steps', () => {
    const steps = buildHldSteps(edges);

    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    expect(steps[0].codeLine).toEqual(HLD_LINES.entry);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.decision).toContain('树链剖分完成');
    expect(lastStep.statusBadge?.type).toBe('success');
    expect(lastStep.heavyEdges.length).toBeGreaterThan(0);

    // All steps have nodes and edges
    for (const step of steps) {
      expect(step.nodes.length).toBe(8);
      expect(step.edges.length).toBe(7);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(HLD_CODES.java.join('\n')).toContain('dfs1');
    expect(HLD_CODES.cpp.join('\n')).toContain('dfs1');
    expect(HLD_CODES.python.join('\n')).toContain('dfs1');
    expect(HLD_CODES.javascript.join('\n')).toContain('dfs1');

    for (const [, line] of Object.entries(HLD_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildHldSteps(edges);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderHldCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('重儿子与重链顶端分配表');
    expect(container.innerHTML).toContain('重链剖分状态');
  });
});
