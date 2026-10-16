// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  PathMinEffortCanvasAdapter,
  renderPathMinEffortCanvas,
} from './path-min-effort-canvas-adapter';
import { buildPathMinEffortSteps } from '../../../algorithms/categories/graph/path-min-effort-step-compiler';

describe('PathMinEffortCanvasAdapter', () => {
  it('应当能正确为最小体力消耗路径步骤渲染网格与落差胶囊', () => {
    const steps = buildPathMinEffortSteps('classic_mountain_3x3');
    const container = document.createElement('div');

    // 初始步
    renderPathMinEffortCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('起点');
    expect(container.innerHTML).toContain('终点');
    expect(container.innerHTML).toContain('落差');

    // 中间探索步
    const exploreStep = steps.find((s) => (s.curR > 0 || s.curC > 0) && s.status !== 'done') || steps[5];
    PathMinEffortCanvasAdapter.render(container, exploreStep);
    expect(container.innerHTML).toContain('探索');

    // 完成步
    const doneStep = steps[steps.length - 1];
    PathMinEffortCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('最优');
    expect(container.innerHTML).toContain('落差: 2');
  });

  it('应当能正确为最小体力消耗路径渲染 Card 2 动态搜索推演树', () => {
    const steps = buildPathMinEffortSteps('classic_mountain_3x3');
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 600 });
    Object.defineProperty(container, 'clientHeight', { value: 300 });

    const step = steps[steps.length - 1];
    expect(step.treeRoot).toBeDefined();
    expect(step.activeNodeId).toBeDefined();

    PathMinEffortCanvasAdapter.renderCustomMetrics(container, step);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.innerHTML).toContain('(0,0) eff:0');
    expect(container.innerHTML).toContain('🚩 起点');
  });
});
