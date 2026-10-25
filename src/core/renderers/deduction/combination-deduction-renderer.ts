/**
 * 组合问题 (Combinations · LeetCode 77)
 * 全景推演树渲染策略 (CombinationDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CombinationDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'combination';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'combination' ||
      modelId === 'combination-optimized' ||
      modelId === '77' ||
      modelId === 'leetcode-77' ||
      modelId === 'combinations'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 77. 组合 (Combinations) · 全景推演树',
      badge: '回溯三部曲标准范式 · 剪枝优化公理 i <= n - (k - path.size()) + 1 · 状态回退 · O(C(n, k))',
      descriptionHtml: `
        核心目标：给定两个整数 <code>n</code> 和 <code>k</code>，返回范围 <code>[1, n]</code> 中所有可能的 <code>k</code> 个数的组合。<br/>
        <strong>《代码随想录》核心教研范式——回溯三部曲与剪枝公理：</strong><br/>
        1. <strong>递归函数签名与参数</strong>：<br/>
        <code>void backtracking(int n, int k, int startIndex)</code>：通过 <code>startIndex</code> 限制当前层只能选取其后的数字，天然杜绝排列层面的重复倒序；<br/>
        2. <strong>叶子节点收集与终止</strong>：<br/>
        当 <code>path.size() == k</code> 时，说明已选满 $k$ 个数，收割当前路径 <code>res.add(new ArrayList<>(path))</code> 并 <code>return</code>；<br/>
        3. <strong>核心剪枝公理（Pruning Axiom）</strong>：<br/>
        若已选数量为 <code>path.size()</code>，则还需 <code>k - path.size()</code> 个元素。列表末尾至少要保留该数量的数字，因此循环上界强剪枝为：<br/>
        <code>i <= n - (k - path.size()) + 1</code>！后续不足量的无用分支直接从树根处剔除。
      `,
      initialStateText: `组合入口：combine(n, k) ➔ backtracking(n, k, 1)，path = [], res = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '组合满额终止 (Hit k Elements)',
        valuesStr: 'path.size() == k ➔ 命中叶子节点，res.add(new ArrayList<>(path))，执行 return',
      },
      {
        prefix: '└───',
        label: '剪枝防空转拦截 (Pruning Boundary)',
        valuesStr: 'i > n - (k - path.size()) + 1 ➔ 剩余备选元素数量不足以凑满 k 个，直接 break 剪枝',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树层遍历与强力剪枝判定 (Branch Exploration & Pruning)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pruned For</span>',
      detailLines: [
        'for (int i = startIndex; i <= n - (k - path.size()) + 1; i++) {',
        '  path.add(i); // 做选择：将数字压入当前路径',
      ],
      fillLine: '树层开拓：沿剪枝安全界限逐一尝试候选数字，并压入当前暂存路径',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推步进与下层决策 (Recurse to Next Depth)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">i + 1</span>',
      detailLines: [
        '  backtracking(n, k, i + 1); // 递归深入：下一层从 i + 1 开始选择',
      ],
      fillLine: '树枝纵深：递归进入下一层，限制下标递增，严防逆序选择造成重复组合',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销选择 (Backtrack & Undo)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.remove()</span>',
      detailLines: [
        '  path.remove(path.size() - 1); // 撤销选择：弹出末尾元素，为兄弟分支让路',
        '}',
      ],
      fillLine: '恢复现场：弹出刚探索完毕的数字，恢复洁净状态，静候同层下一个候选分支',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '组合回溯决策推演流 (Pruned Branch ➔ Recurse i+1 ➔ Backtrack Undo)',
      subtitle: 'LeetCode 77 Combinations Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有长度为 k 的不重复组合列表 List<List<Integer>>',
      complexityStr: '时间复杂度: O(C(n, k) * k) · 空间复杂度: O(k) 递归系统栈与路径缓存开销',
    });

    return header + baseCase + round + finalReturn;
  }
}
