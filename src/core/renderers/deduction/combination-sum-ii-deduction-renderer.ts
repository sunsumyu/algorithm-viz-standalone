/**
 * 组合总和 II (Combination Sum II · LeetCode 40)
 * 全景推演树渲染策略 (CombinationSumIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CombinationSumIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'combination-sum-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'combination-sum-ii' ||
      modelId === '40' ||
      modelId === 'leetcode-40' ||
      modelId === 'combination-sum-dedup'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 40. 组合总和 II (Combination Sum II) · 全景推演树',
      badge: '树枝可重而树层去重公理 · 排序相邻聚拢 · i > startIndex 去重判断 · 回溯树',
      descriptionHtml: `
        核心目标：在可能包含重复元素的数组 <code>candidates</code> 中，找出和为 <code>target</code> 的所有不同组合，每个数字在每个组合中只能使用一次。<br/>
        <strong>《代码随想录》核心教研范式——“树层去重”核心黄金公理：</strong><br/>
        1. <strong>树枝去重 vs 树层去重的本质辨析</strong>：<br/>
        • <strong>树枝上（纵向深度）</strong>：同一个组合内部可以包含重复数字（例如两个 1 组成 <code>[1, 1, 6]</code>，只要它们来自数组不同下标，完全合法）；<br/>
        • <strong>树层上（横向广度）</strong>：同一树层的不同分支如果选取了相同的数字，将产生完全雷同的子树，导致结果集出现重复组合，<strong>必须坚决去重</strong>！<br/>
        2. <strong>排序相邻聚拢（Sorting Cornerstone）</strong>：<br/>
        必须先 <code>Arrays.sort(candidates)</code>，将相同的数字排列在相邻槽位；<br/>
        3. <strong>经典树层去重黄金判定式</strong>：<br/>
        <code>if (i > startIndex && candidates[i] == candidates[i - 1]) continue;</code>！<br/>
        只要 <code>i > startIndex</code>，就证明 <code>candidates[i - 1]</code> 在<strong>同一树层</strong>已经作为首选元素递归探索过其所能构成的所有组合，当前分支直接 <code>continue</code> 跳过！
      `,
      initialStateText: `去重入口：combinationSum2(candidates, target) ➔ Arrays.sort(candidates) ➔ backtracking(c, target, 0, 0)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '目标和精准命中 (Hit Target)',
        valuesStr: 'sum == target ➔ res.add(new ArrayList<>(path))，返回上一层',
      },
      {
        prefix: '└───',
        label: '树层去重与溢出剪枝 (Layer Deduplication & Pruning)',
        valuesStr: 'i > startIndex && candidates[i] == candidates[i-1] ➔ continue 跳过同层重复分支',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树层遍历与黄金去重判定 (Layer Deduplication Check)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Layer Dedup</span>',
      detailLines: [
        'for (int i = startIndex; i < candidates.length; i++) {',
        '  if (sum + candidates[i] > target) break; // 排序后累加和超标剪枝',
        '  if (i > startIndex && candidates[i] == candidates[i - 1]) continue; // 核心树层去重！',
        '  path.add(candidates[i]);',
      ],
      fillLine: '树层过滤：同层前驱兄弟已全量展开该数值决策空间，后继相同数字无条件跳过',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推步进一位防自身重选 (Recurse to i + 1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">i + 1 (Single Use)</span>',
      detailLines: [
        '  backtracking(candidates, target, sum + candidates[i], i + 1); // 严格向后步进',
      ],
      fillLine: '单次消费：传入 i + 1 确保每个物理槽位元素在单条路径中至多被选取一次',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销选择 (Backtrack & Undo)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.remove()</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '}',
      ],
      fillLine: '还原现场：弹出末位数字恢复调用前路径，平滑过渡至同层下一个候选数值',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '组合总和 II 树层去重推演流 (Sort Prune ➔ Layer Dedup ➔ Recurse i+1 ➔ Undo)',
      subtitle: 'LeetCode 40 Combination Sum II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有和为 target 的不重复组合列表',
      complexityStr: '时间复杂度: O(2^N) 最坏子集空间 · 空间复杂度: O(N) 递归树最大深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
