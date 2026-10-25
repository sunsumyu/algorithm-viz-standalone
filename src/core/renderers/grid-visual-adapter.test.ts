// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { GridVisualAdapter } from './grid-visual-adapter';

describe('GridVisualAdapter 递归足迹与探索路径深度契约门禁 (Active Trail & Footprints)', () => {
  it('1. extractActiveTrail 必须能将 dfs/dfsMemo/函数格式调用栈精准归一化为坐标 "r,c"', () => {
    const stepWithFnNames = {
      i: 2,
      j: 1,
      activeStack: ['dfs(0,2)', 'dfs(1,1)', 'dfs(2,1)']
    };
    const trails = GridVisualAdapter.extractActiveTrail(stepWithFnNames);
    expect(trails).toEqual(['0,2', '1,1', '2,1']);
  });

  it('2. extractActiveTrail 必须能将对象格式与数组格式调用栈精准归一化为坐标 "r,c"', () => {
    const stepWithObjects = {
      i: 1,
      j: 2,
      activeStack: [{ i: 0, j: 2 }, { r: 1, c: 2 }]
    };
    const trails = GridVisualAdapter.extractActiveTrail(stepWithObjects);
    expect(trails).toEqual(['0,2', '1,2']);
  });

  it('3. renderLabeledGrid 必须为走过的调用栈祖先节点渲染 "is-trail"、"🐾" 探索足迹及天蓝虚线框', () => {
    const container = document.createElement('div');
    const step = {
      i: 2,
      j: 1,
      grid: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ],
      activeStack: ['dfs(0,2)', 'dfs(1,1)', 'dfs(2,1)']
    };

    GridVisualAdapter.renderLabeledGrid(container, step, {
      m: 3,
      n: 3,
      modelId: 'coins-from-piles',
      rowLabels: ['栈 0', '栈 1', '栈 2'],
      colLabels: ['容 0', '容 1', '容 2']
    });

    const html = container.innerHTML;

    // 当前活跃位置 (2, 1) 是小人，不是 trail
    const cell21 = container.querySelector('[data-coord="2,1"]');
    expect(cell21).not.toBeNull();
    expect(cell21?.className).toContain('is-cur');

    // 祖先位置 (0, 2) 必须是探索中足迹 is-trail
    const cell02 = container.querySelector('[data-coord="0,2"]');
    expect(cell02).not.toBeNull();
    expect(cell02?.className).toContain('is-trail');
    expect(cell02?.innerHTML).toContain('🐾');

    // 祖先位置 (1, 1) 必须是探索中足迹 is-trail
    const cell11 = container.querySelector('[data-coord="1,1"]');
    expect(cell11).not.toBeNull();
    expect(cell11?.className).toContain('is-trail');
    expect(cell11?.innerHTML).toContain('🐾');

    // 其他未涉足位置 (0, 0) 必须是空单元格 is-empty
    const cell00 = container.querySelector('[data-coord="0,0"]');
    expect(cell00).not.toBeNull();
    expect(cell00?.className).toContain('is-empty');
  });
});
