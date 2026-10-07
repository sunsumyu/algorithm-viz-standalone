// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseMinCostTicketsInputs,
  buildMinCostTickets066Steps,
} from './min-cost-tickets-step-compiler';
import {
  createMinCostTicketsStages,
  renderTravelJumpSandbox,
  renderMinCostTicketsStage3Metrics,
} from './min-cost-tickets-canvas-adapter';

describe('MinCostTicketsStepCompiler & CanvasAdapter 伴生测试', () => {
  it('parseMinCostTicketsInputs 应正确解析预设与自定义输入', () => {
    const std = parseMinCostTicketsInputs({ preset: 'standard' });
    expect(std.days).toEqual([1, 4, 6, 7, 8, 20]);
    expect(std.costs).toEqual([2, 7, 15]);

    const custom = parseMinCostTicketsInputs({ days: '1, 2, 5', costs: '1, 3, 10' });
    expect(custom.days).toEqual([1, 2, 5]);
    expect(custom.costs).toEqual([1, 3, 10]);
  });

  it('buildMinCostTickets066Steps 应正确推导全局最低花费与行号', () => {
    const steps = buildMinCostTickets066Steps([1, 4, 6, 7, 8, 20], [2, 7, 15]);
    expect(steps.length).toBeGreaterThan(5);

    const first = steps[0];
    expect(first.line).toBeGreaterThan(0);
    expect(first.codeLine).toBeDefined();

    const last = steps[steps.length - 1];
    expect(last.dp[0]).toBe(11);
    expect(last.bestCost).toBe(11);
    for (const step of steps) {
      expect(step.line).toBeGreaterThan(0);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 阶段声明与沙盘渲染应无崩溃', () => {
    const stages = createMinCostTicketsStages();
    expect(stages.length).toBe(4);

    const steps = buildMinCostTickets066Steps([1, 4, 6, 7, 8, 20], [2, 7, 15]);
    const container = document.createElement('div');

    const html = renderTravelJumpSandbox(steps[2]);
    expect(html).toContain('旅行日跳跃跨度');

    renderMinCostTicketsStage3Metrics(container, steps[2]);
    expect(container.innerHTML).toBeTruthy();

    const inputs = { days: '1, 4, 6, 7, 8, 20', costs: '2, 7, 15' };
    const s1Steps = stages[0].buildSteps(inputs);
    stages[0].renderCanvas(container, s1Steps[0]);
    expect(container.innerHTML).toBeTruthy();

    const s2Steps = stages[1].buildSteps(inputs);
    stages[1].renderCanvas(container, s2Steps[0]);
    expect(container.innerHTML).toBeTruthy();

    stages[2].renderCanvas(container, steps[2]);
    expect(container.innerHTML).toBeTruthy();

    const s4Steps = stages[3].buildSteps(inputs);
    stages[3].renderCanvas(container, s4Steps[0]);
    expect(container.innerHTML).toBeTruthy();
  });
});
