import { describe, it, expect } from 'vitest';
import {
  buildTreeDiameterSteps,
  TREE_DIAMETER_CODES,
  TREE_DIAMETER_LINES,
} from './tree-diameter-step-compiler';
import { renderTreeDiameterCanvas } from './tree-diameter-canvas-adapter';

describe('TreeDiameter 123 Step Compiler & Canvas Adapter', () => {
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8]
  ];

  it('should generate valid two-pass BFS diameter steps', () => {
    const steps = buildTreeDiameterSteps(edges, 1);

    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    expect(steps[0].bfsRound).toBe(1);
    expect(steps[0].codeLine).toEqual(TREE_DIAMETER_LINES.entry);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.bfsRound).toBe(2);
    expect(lastStep.diameter).toBeGreaterThan(0);
    expect(lastStep.farthestX).toBeDefined();
    expect(lastStep.farthestY).toBeDefined();
    expect(lastStep.diameterPath?.length).toBeGreaterThan(1);
    expect(lastStep.decision).toContain('第二遍 BFS 结束');

    // All steps have nodes and valid codeLine
    for (const step of steps) {
      expect(step.nodes.length).toBe(8);
      expect(step.edges.length).toBe(7);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(TREE_DIAMETER_CODES.java.join('\n')).toContain('getDiameter');
    expect(TREE_DIAMETER_CODES.cpp.join('\n')).toContain('getDiameter');
    expect(TREE_DIAMETER_CODES.python.join('\n')).toContain('get_diameter');
    expect(TREE_DIAMETER_CODES.javascript.join('\n')).toContain('getDiameter');

    for (const [, line] of Object.entries(TREE_DIAMETER_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildTreeDiameterSteps(edges, 1);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderTreeDiameterCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('第一遍最远点 x');
    expect(container.innerHTML).toContain('第二遍最远点 y');
    expect(container.innerHTML).toContain('树的直径长度');
  });
});
