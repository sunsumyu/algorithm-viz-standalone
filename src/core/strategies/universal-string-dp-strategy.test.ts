import { describe, it, expect } from 'vitest';
import { UniversalStringDpStrategy } from './universal-string-dp-strategy';
import { AlgorithmModelRepository } from '../model-repository';

describe('UniversalStringDpStrategy', () => {
  const strategy = new UniversalStringDpStrategy('longest-common-subsequence');
  const model = AlgorithmModelRepository.getModel('longest-common-subsequence');

  it('canHandle 能够正确匹配 longest-common-subsequence 与 lcs', () => {
    expect(strategy.canHandle('longest-common-subsequence')).toBe(true);
    expect(strategy.canHandle('lcs')).toBe(true);
    expect(strategy.canHandle('edit-distance')).toBe(false);
  });

  it('Stage 1 递归必须生成 DFS 树并维护 activeStack 调用栈轨迹', () => {
    const steps = strategy.generateSteps(model, {
      stage: 1,
      direction: 'forward',
      isMemo: false,
    });
    expect(steps.length).toBeGreaterThan(0);
    const deepSteps = steps.filter((s) => (s.activeStack?.length || 0) >= 2);
    expect(deepSteps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('return');
    expect(lastStep.treeRoot).toBeDefined();
  });

  it('Stage 2 记忆化搜索必须能够记录 cache-hit 步骤', () => {
    const steps = strategy.generateSteps(model, {
      stage: 2,
      direction: 'forward',
      isMemo: true,
    });
    expect(steps.length).toBeGreaterThan(0);
    const hitSteps = steps.filter((s) => s.type === 'cache-hit');
    expect(hitSteps.length).toBeGreaterThan(0);
  });

  it('Stage 3 严格二维表必须初始为 null，计算中为 eval，转移完成后写入数值且最终解为 3', () => {
    const steps = strategy.generateSteps(model, {
      stage: 3,
      direction: 'forward',
    });
    expect(steps.length).toBeGreaterThan(0);
    const step0 = steps[0];
    expect(step0.type).toBe('init');
    // 单元格 (1, 1) 在初始状态必须为 null（未计算状态防御）
    expect(step0.grid[1][1]).toBeNull();
    // 首行首列空串基底必须为 0
    expect(step0.grid[0][0]).toBe(0);
    expect(step0.grid[0][1]).toBe(0);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('return');
    expect(lastStep.grid[5][3]).toBe(3);
  });

  it('Stage 4 一维空间优化必须能够记录 leftUp 暂存并在末尾返回 3', () => {
    const steps = strategy.generateSteps(model, {
      stage: 4,
      direction: 'forward',
    });
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.grid[0][3]).toBe(3);
  });
});
