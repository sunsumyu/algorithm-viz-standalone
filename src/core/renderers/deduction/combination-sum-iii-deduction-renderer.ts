/**
 * 组合总和 III (Combination Sum III · LeetCode 216)
 * 全景推演树渲染策略 (CombinationSumIIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CombinationSumIIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'combination-sum-iii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'combination-sum-iii' ||
      modelId === '216' ||
      modelId === 'leetcode-216' ||
      modelId === 'combination-sum-3'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 216. 组合总和 III (Combination Sum III) · 全景推演树',
      badge: '1~9 有限空间选 k 个数 · 双重剪枝 (总和剪枝 + 数量剪枝) · 回溯树',
      descriptionHtml: `
        核心目标：找出所有相加之和为 <code>n</code> 的 <code>k</code> 个数的组合。组合中只允许含有 $1 \sim 9$ 的正整数，且每个数字最多使用一次。<br/>
        <strong>《代码随想录》核心教研范式——双重严密剪枝公理：</strong><br/>
        1. <strong>累加和提前剪枝（Sum Pruning）</strong>：<br/>
        因为所有数字均为正整数，若当前路径累加和已满足 <code>sum > n</code>，后续深入只能越加越大，<strong>必须立即 <code>return</code> 终止深搜</strong>；<br/>
        2. <strong>剩余数量剪枝（Count Pruning）</strong>：<br/>
        可选数字上限是 9，当前还需要 <code>k - path.size()</code> 个元素。因此 <code>i</code> 的最大合法选择起点必须满足 <code>9 - i + 1 >= k - path.size()</code>，即：<br/>
        <code>i <= 9 - (k - path.size()) + 1</code>！<br/>
        3. <strong>叶子节点双重判定</strong>：<br/>
        只有当路径元素个数恰好等于 <code>k</code>（<code>path.size() == k</code>）且总和恰好等于 <code>n</code>（<code>sum == n</code>）时，方才收割进结果集。
      `,
      initialStateText: `组合总和入口：combinationSum3(k, n) ➔ backtracking(targetSum=n, k, sum=0, startIndex=1)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '累加和超标剪枝 (Sum Overflow)',
        valuesStr: 'sum > n ➔ 当前和已超出目标值，立即 return 剪枝',
      },
      {
        prefix: '└───',
        label: '叶子满额判定 (Hit k Elements)',
        valuesStr: 'path.size() == k ➔ 若 sum == n 则收集结果，无论是否命中均执行 return',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树层遍历与双重剪枝控制 (Sum & Count Pruned Loop)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Double Prune</span>',
      detailLines: [
        'for (int i = startIndex; i <= 9 - (k - path.size()) + 1; i++) {',
        '  if (sum + i > n) break; // 当前加和超标，后续更大数字直接截断',
        '  path.add(i);',
      ],
      fillLine: '双重守门：元素剩余数量不足直接不入循环，累加和超标直接 break 截断',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推步进一位 (Recurse to i + 1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">sum + i, i + 1</span>',
      detailLines: [
        '  backtracking(targetSum, k, sum + i, i + 1);',
      ],
      fillLine: '向下延伸：更新累加和 sum + i，并推进起始下标 i + 1，保证数字不重复使用',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销路径尾项 (Backtrack & Pop)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.remove()</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '}',
      ],
      fillLine: '恢复原状：弹出当前尝试的数字，恢复原路径，继续探寻同层下一个可行数字',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '组合总和 III 双重剪枝推演流 (Double Prune ➔ Recurse i+1 ➔ Undo)',
      subtitle: 'LeetCode 216 Combination Sum III Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有相加为 n 的 k 个数不重复组合列表',
      complexityStr: '时间复杂度: O(C(9, k) * k) · 空间复杂度: O(k) 递归树深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
