// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTreeKnapsack088Steps } from './tree-knapsack-dp-088-step-compiler';
import { treeKnapsackDp088CanvasAdapter } from './tree-knapsack-dp-088-canvas-adapter';

describe('tree-knapsack-dp-088 step compiler & adapter', () => {
  it('应正确生成树上背包 DP 步骤且行号合法', () => {
    const steps = buildTreeKnapsack088Steps({
      nodes: [
        { id: 0, score: 0 },
        { id: 1, score: 3 },
        { id: 2, score: 2 },
      ],
      edges: [
        [0, 1],
        [1, 2],
      ],
      m: 2,
    });
    expect(steps.length).toBeGreaterThan(4);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }

    const lastStep = steps[steps.length - 1]!;
    expect(lastStep.dpRow).toBeDefined();
  });

  it('CanvasAdapter 渲染 DOM 应正常挂载且无 NaN', () => {
    const steps = buildTreeKnapsack088Steps();
    const container = document.createElement('div');
    treeKnapsackDp088CanvasAdapter.render(container, steps[0]!);
    expect(container.innerHTML).toContain('树形依赖背包');
    expect(container.innerHTML).not.toContain('NaN');
  });
});
