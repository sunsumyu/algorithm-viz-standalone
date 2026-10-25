/**
 * 组合总和 (Combination Sum · LeetCode 39)
 * 全景推演树渲染策略 (CombinationSumDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CombinationSumDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'combination-sum';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'combination-sum' ||
      modelId === '39' ||
      modelId === 'leetcode-39' ||
      modelId === 'combination-sum-unlimited'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 39. 组合总和 (Combination Sum) · 全景推演树',
      badge: '无限制重复选取 · 升序排序提前剪枝 · 传递自身下标 i · 回溯树',
      descriptionHtml: `
        核心目标：在无重复元素的正整数数组 <code>candidates</code> 中，找出和为目标数 <code>target</code> 的所有不同组合，同一个数字可无限制重复选取。<br/>
        <strong>《代码随想录》核心教研范式——重复选取机制与排序剪枝：</strong><br/>
        1. <strong>可复选与去重的平衡点（Recursive Index i）</strong>：<br/>
        为允许数字重复选取，递归调用时<strong>传入自身当前下标 <code>i</code> 而不是 <code>i + 1</code></strong>（<code>backtracking(candidates, target, sum, i)</code>）；同时由 <code>startIndex</code> 限制不回头选更早的数字，彻底规避如 <code>[2,3,2]</code> 与 <code>[2,2,3]</code> 的排列重复；<br/>
        2. <strong>排序奠基与提前横向剪枝（Pre-sorting Pruning）</strong>：<br/>
        先对数组执行升序排序 <code>Arrays.sort(candidates)</code>。当循环探测到 <code>sum + candidates[i] > target</code> 时，因为后续候选元素数值递增，其累加和必然全部超标，<strong>可直接使用 <code>break</code> 斩断当前层剩余所有分支</strong>！<br/>
        3. <strong>叶子节点命中</strong>：当 <code>sum == target</code> 时，当前路径和恰好达标，全量收割。
      `,
      initialStateText: `组合总和入口：combinationSum(candidates, target) ➔ Arrays.sort(candidates) ➔ backtracking(c, target, 0, 0)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '目标和精准命中 (Hit Target)',
        valuesStr: 'sum == target ➔ 命中合法组合，res.add(new ArrayList<>(path))，执行 return',
      },
      {
        prefix: '└───',
        label: '排序横向剪枝 (Sum Overflow Pruning)',
        valuesStr: 'sum + candidates[i] > target ➔ 升序数组后续数字更大，直接 break 终止同层循环',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树层遍历与总和剪枝拦截 (Check Sum & Prune)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Sum Check</span>',
      detailLines: [
        'for (int i = startIndex; i < candidates.length; i++) {',
        '  if (sum + candidates[i] > target) break; // 关键剪枝：后续全部越界，直接跳出',
        '  path.add(candidates[i]);',
      ],
      fillLine: '未卜先知：先算加和是否超标，若超标则利用排序单调性直接截断整个右翼分支',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 递归深入与传递自身下标复选 (Recurse with Index i)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Pass i (Repeatable)</span>',
      detailLines: [
        '  backtracking(candidates, target, sum + candidates[i], i); // 传入 i 允许重复选择',
      ],
      fillLine: '自由复选：传入下标 i，使得下一层仍能继续消费当前候选数，满足无限次选取题意',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销路径尾项 (Backtrack & Pop)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.remove()</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '}',
      ],
      fillLine: '还原现场：弹出当前试探数字，退回上一状态，继续尝试同层下一个更大的数',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '组合总和回溯推演流 (Sort Prune ➔ Pass Index i ➔ Pop & Backtrack)',
      subtitle: 'LeetCode 39 Combination Sum Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有和为 target 的不重复组合列表',
      complexityStr: '时间复杂度: O(S) S 为所有可行解长度之和 · 空间复杂度: O(target / min_val) 栈深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
