import { describe, it, expect } from 'vitest';
import {
  buildTreeLcaSteps,
  TREE_LCA_CODES,
  TREE_LCA_LINES,
} from './tree-lca-step-compiler';
import { renderTreeLcaCanvas } from './tree-lca-canvas-adapter';

describe('TreeLca 118 Step Compiler & Canvas Adapter', () => {
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8]
  ];

  it('should generate valid binary lifting LCA steps', () => {
    const steps = buildTreeLcaSteps(edges, 8, 4);

    expect(steps.length).toBeGreaterThanOrEqual(3);

    // Initial step
    expect(steps[0].codeLine).toEqual(TREE_LCA_LINES.entry);
    expect(steps[0].u).toBe(8);
    expect(steps[0].v).toBe(4);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.lcaResult).toBe(2);
    expect(lastStep.decision).toContain('逼近完成');
    expect(lastStep.statusBadge?.type).toBe('success');

    // All steps have nodes and edges
    for (const step of steps) {
      expect(step.nodes.length).toBe(8);
      expect(step.edges.length).toBe(7);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(TREE_LCA_CODES.java.join('\n')).toContain('lca');
    expect(TREE_LCA_CODES.cpp.join('\n')).toContain('lca');
    expect(TREE_LCA_CODES.python.join('\n')).toContain('lca');
    expect(TREE_LCA_CODES.javascript.join('\n')).toContain('lca');

    for (const [, line] of Object.entries(TREE_LCA_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildTreeLcaSteps(edges, 8, 4);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderTreeLcaCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('LCA 倍增搜索进度');
  });
});
