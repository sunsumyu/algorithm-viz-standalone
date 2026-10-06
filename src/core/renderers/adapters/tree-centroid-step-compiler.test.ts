import { describe, it, expect } from 'vitest';
import {
  buildTreeCentroidSteps,
  TREE_CENTROID_CODES,
  TREE_CENTROID_LINES,
} from './tree-centroid-step-compiler';
import { renderTreeCentroidCanvas } from './tree-centroid-canvas-adapter';

describe('TreeCentroid 120 Step Compiler & Canvas Adapter', () => {
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8]
  ];

  it('should generate valid tree centroid tree DP steps', () => {
    const steps = buildTreeCentroidSteps(edges);

    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    expect(steps[0].codeLine).toEqual(TREE_CENTROID_LINES.entry);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.currentCentroid).toBeGreaterThan(0);
    expect(lastStep.bestMaxPart).toBeLessThan(8);
    expect(lastStep.decision).toContain('搜索完毕');
    expect(lastStep.statusBadge?.type).toBe('success');

    // All steps have nodes and edges
    for (const step of steps) {
      expect(step.nodes.length).toBe(8);
      expect(step.edges.length).toBe(7);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(TREE_CENTROID_CODES.java.join('\n')).toContain('findCentroid');
    expect(TREE_CENTROID_CODES.cpp.join('\n')).toContain('findCentroid');
    expect(TREE_CENTROID_CODES.python.join('\n')).toContain('find_centroid');
    expect(TREE_CENTROID_CODES.javascript.join('\n')).toContain('findCentroid');

    for (const [, line] of Object.entries(TREE_CENTROID_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildTreeCentroidSteps(edges);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderTreeCentroidCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('当前重心候选');
    expect(container.innerHTML).toContain('删除后最大连通块');
  });
});
