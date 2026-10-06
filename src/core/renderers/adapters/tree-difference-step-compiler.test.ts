import { describe, it, expect } from 'vitest';
import {
  buildTreeDiffSteps,
  TREE_DIFFERENCE_CODES,
  TREE_DIFFERENCE_LINES,
} from './tree-difference-step-compiler';
import { renderTreeDiffCanvas } from './tree-difference-canvas-adapter';

describe('TreeDifference 122 Step Compiler & Canvas Adapter', () => {
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8]
  ];
  const paths: [number, number][] = [
    [4, 7], [8, 6]
  ];

  it('should generate valid steps for tree difference paths', () => {
    const steps = buildTreeDiffSteps(edges, paths);

    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    expect(steps[0].stage).toBe('diff');
    expect(steps[0].codeLine).toEqual(TREE_DIFFERENCE_LINES.entry);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.stage).toBe('done');
    expect(lastStep.decision).toContain('树上差分与子树求和完毕');
    expect(lastStep.metrics?.['最大点覆盖']).toBeDefined();

    // Verify all steps have nodes and edges
    for (const step of steps) {
      expect(step.nodes.length).toBe(8);
      expect(step.edges.length).toBe(7);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(TREE_DIFFERENCE_CODES.java.join('\n')).toContain('addPath');
    expect(TREE_DIFFERENCE_CODES.cpp.join('\n')).toContain('addPath');
    expect(TREE_DIFFERENCE_CODES.python.join('\n')).toContain('add_path');
    expect(TREE_DIFFERENCE_CODES.javascript.join('\n')).toContain('addPath');

    for (const [, line] of Object.entries(TREE_DIFFERENCE_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildTreeDiffSteps(edges, paths);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderTreeDiffCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('树上差分点权计算');
    expect(container.innerHTML).toContain('当前各节点点差分标记');
  });
});
