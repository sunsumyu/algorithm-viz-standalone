import { describe, it, expect } from 'vitest';
import { StaticDeductionTreeAdapter } from './static-deduction-tree-adapter';

describe('StaticDeductionTreeAdapter (全景静态推演展板适配器)', () => {
  it('应当正确判断支持的模型', () => {
    expect(StaticDeductionTreeAdapter.isSupported('unique-paths')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('longest-common-subsequence')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('edit-distance')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('distinct-subsequences')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('binary-search')).toBe(false);
  });

  it('应当能正确为 unique-paths 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'unique-paths',
      m: 3,
      n: 4,
    });
    expect(container.innerHTML).toContain('LeetCode 62. 不同路径 · 全景推演树');
    expect(container.innerHTML).toContain('第一阶段：填 Base Case');
    expect(container.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(container.innerHTML).toContain('第三阶段：返回最终结果');
    expect(container.innerHTML).toContain('10 ✅');
  });

  it('应当能正确为 longest-common-subsequence 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'longest-common-subsequence',
      text1: 'abcde',
      text2: 'ace',
    });
    expect(container.innerHTML).toContain('LeetCode 1143. 最长公共子序列 · 全景推演树');
    expect(container.innerHTML).toContain('✔ 字符相同');
    expect(container.innerHTML).toContain('3 ✅');
  });

  it('应当能正确为 edit-distance 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'edit-distance',
      word1: 'horse',
      word2: 'ros',
    });
    expect(container.innerHTML).toContain('LeetCode 72. 编辑距离 · 全景推演树');
    expect(container.innerHTML).toContain('3 ✅');
  });

  it('应当能正确为 distinct-subsequences 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'distinct-subsequences',
      s: 'babgbag',
      t: 'bag',
    });
    expect(container.innerHTML).toContain('LeetCode 115. 不同的子序列 · 全景推演树');
    expect(container.innerHTML).toContain('5 ✅');
  });

  it('应当能通用支持任意动规模型 (如 climb-stairs 爬楼梯)', () => {
    expect(StaticDeductionTreeAdapter.isSupported('climb-stairs')).toBe(true);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'climb-stairs',
      n: 5,
    });
    expect(container.innerHTML).toContain('爬楼梯 · 全景推演树');
    expect(container.innerHTML).toContain('第一阶段：填 Base Case');
    expect(container.innerHTML).toContain('第二阶段：核心状态转移推演树');
    expect(container.innerHTML).toContain('第三阶段：返回最终结果');
    expect(container.innerHTML).toContain('✅');
  });

  it('应当能通用支持二维网格与背包等动规模型 (如 min-path-sum 与 knapsack-01)', () => {
    expect(StaticDeductionTreeAdapter.isSupported('min-path-sum')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('knapsack-01')).toBe(true);

    const containerMinPath = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerMinPath, {
      modelId: 'min-path-sum',
      m: 3,
      n: 3,
    });
    expect(containerMinPath.innerHTML).toContain('全景推演树');
    expect(containerMinPath.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerMinPath.innerHTML).toContain('第三阶段：返回最终结果');

    const containerKnapsack = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerKnapsack, {
      modelId: 'knapsack-01',
      m: 3,
      n: 4,
    });
    expect(containerKnapsack.innerHTML).toContain('全景推演树');
    expect(containerKnapsack.innerHTML).toContain('第三阶段：返回最终结果');
  });
});
