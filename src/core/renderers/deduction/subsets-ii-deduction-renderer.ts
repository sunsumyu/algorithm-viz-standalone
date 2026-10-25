/**
 * 子集 II (Subsets II · LeetCode 90)
 * 全景推演树渲染策略 (SubsetsIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SubsetsIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'subsets-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'subsets-ii' ||
      modelId === '90' ||
      modelId === 'leetcode-90' ||
      modelId === 'subsets-with-dup'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 90. 子集 II (Subsets II) · 全景推演树',
      badge: '含重复元素子集 · 排序奠基 · i > startIndex 树层去重黄金公理 · 全节点收集',
      descriptionHtml: `
        核心目标：在可能包含重复元素的整数数组 <code>nums</code> 中，返回该数组所有可能的子集（幂集），解集不能包含重复的子集。<br/>
        <strong>《代码随想录》核心教研范式——节点全收集与树层去重公理：</strong><br/>
        1. <strong>两大法宝融合（Collect All + Layer Dedup）</strong>：<br/>
        • <strong>法宝 ①</strong>：继承 LC 78“进入函数即收割”公理，不设终止判断，直接将当前节点收入结果 <code>res.add(new ArrayList<>(path))</code>；<br/>
        • <strong>法宝 ②</strong>：继承 LC 40“排序后树层去重”公理，杜绝相同元素在同一层重复展开；<br/>
        2. <strong>排序相邻聚拢</strong>：<br/>
        先执行 <code>Arrays.sort(nums)</code>，确保相同数值连续排布；<br/>
        3. <strong>树层去重黄金判定式</strong>：<br/>
        <code>if (i > startIndex && nums[i] == nums[i - 1]) continue;</code>！<br/>
        当 <code>i > startIndex</code> 时，表示当前节点并非本层第一个被选取的元素；若它与同层前一个元素相等，其派生出的所有子集已被前驱兄长分支完全囊括，<strong>无条件 <code>continue</code> 跳过</strong>！
      `,
      initialStateText: `子集去重入口：subsetsWithDup(nums) ➔ Arrays.sort(nums) ➔ backtracking(nums, 0)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '入口即收集全节点 (Collect Every Valid Node)',
        valuesStr: '进入函数首行：res.add(new ArrayList<>(path))，所有树层去重后的节点皆合法',
      },
      {
        prefix: '└───',
        label: '树层去重拦截 (Layer Deduplication Filter)',
        valuesStr: 'i > startIndex && nums[i] == nums[i-1] ➔ continue 跳过同层雷同子树',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树上有效节点全量落盘 (Record Current Unique Node)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">res.add()</span>',
      detailLines: [
        'res.add(new ArrayList<>(path));',
      ],
      fillLine: '全景收集：每一个被树层去重筛选后的状态均为唯一合法的幂集子集',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 树层去重判断与纵深步进 (Layer Dedup & Recurse)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Layer Dedup</span>',
      detailLines: [
        'for (int i = startIndex; i < nums.length; i++) {',
        '  if (i > startIndex && nums[i] == nums[i - 1]) continue; // 关键树层去重！',
        '  path.add(nums[i]);',
        '  backtracking(nums, i + 1);',
      ],
      fillLine: '树层去重：同层后继重复元素直接 pass，不重复者压栈并递归深入 i + 1',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销路径末项 (Backtrack & Pop)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.remove()</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '}',
      ],
      fillLine: '平滑回退：弹出刚刚处理的数字，退回上一层决策节点，探索下一个候选数字',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '子集 II 树层去重推演流 (Collect Node ➔ Layer Dedup ➔ Recurse i+1 ➔ Undo)',
      subtitle: 'LeetCode 90 Subsets II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有不重复的子集集合 List<List<Integer>>',
      complexityStr: '时间复杂度: O(N * 2^N) · 空间复杂度: O(N) 递归树最大深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
