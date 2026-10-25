/**
 * 全排列 II (Permutations II · LeetCode 47)
 * 全景推演树渲染策略 (PermutationIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PermutationIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'permutation-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'permutation-ii' ||
      modelId === '47' ||
      modelId === 'leetcode-47' ||
      modelId === 'permutations-ii'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 47. 全排列 II (Permutations II) · 全景推演树',
      badge: '含重复元素全排列 · 排序奠基 · used[i-1] == false 树层去重神级公理 · 严格 N! 剪枝',
      descriptionHtml: `
        核心目标：给定一个可包含重复数字的序列 <code>nums</code>，按任意顺序返回所有不重复的全排列。<br/>
        <strong>《代码随想录》核心教研范式——<code>used[i - 1] == false</code> 树层去重神级公理：</strong><br/>
        1. <strong>排序奠基（Sorting First）</strong>：<br/>
        首先调用 <code>Arrays.sort(nums)</code>，使相同元素紧密相邻；<br/>
        2. <strong>树枝纵深 vs 树层横向的核心辨析</strong>：<br/>
        当 <code>i > 0 && nums[i] == nums[i - 1]</code> 时：<br/>
        • <strong>若 <code>used[i - 1] == true</code></strong>：说明 <code>nums[i - 1]</code> 存在于当前排列的父祖先中（树枝纵向深度使用），同一排列内包含两个来自不同下标的相同数值完全合法；<br/>
        • <strong>若 <code>used[i - 1] == false</code></strong>：说明 <code>nums[i - 1]</code> 在<strong>同一树层的左侧兄弟分支</strong>刚刚被完整探索过并已回溯释放！当前分支若继续以相同的数值作为该槽位的选项，将 100% 产生重复的全排列！<br/>
        因此，<strong>必须严正断言：<code>used[i - 1] == false</code> 时无条件 <code>continue</code> 跳过</strong>！
      `,
      initialStateText: `去重全排列入口：permuteUnique(nums) ➔ Arrays.sort(nums) ➔ used = new boolean[n]，backtracking(nums, used)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '排列满员收割 (Hit Full Permutation)',
        valuesStr: 'path.size() == nums.length ➔ 命中叶子节点，res.add(new ArrayList<>(path))，执行 return',
      },
      {
        prefix: '└───',
        label: 'used[i-1] == false 树层去重 (Layer Dedup Filter)',
        valuesStr: 'nums[i] == nums[i-1] && !used[i-1] ➔ 左侧同值兄弟已穷尽所有可能，continue 剪枝',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树层去重判定与树枝防重核验 (Layer Dedup & Branch Check)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">!used[i-1]</span>',
      detailLines: [
        'for (int i = 0; i < nums.length; i++) {',
        '  if (used[i]) continue; // 树枝已用防重',
        '  if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue; // 核心树层去重！',
        '  used[i] = true; path.add(nums[i]);',
      ],
      fillLine: '神级去重：used[i-1]==false 表明前一个相同元素在同层已被使用完毕并回溯，当前元素必须跳过',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推进入排列下一槽位 (Recurse with Updated used)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Recurse</span>',
      detailLines: [
        '  backtracking(nums, used);',
      ],
      fillLine: '锁定深入：携当前选择深入下一层决策，继续为排列剩余槽位寻找合法元素',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与双重解锁 (Backtrack & Unlock)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">used[i] = false</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '  used[i] = false;',
        '}',
      ],
      fillLine: '恢复现场：弹出数字并清空 used[i] 锁标记，将状态完好无损地交回上一层',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '全排列 II 树层去重推演流 (!used[i-1] Filter ➔ Lock & Recurse ➔ Backtrack Pop)',
      subtitle: 'LeetCode 47 Permutations II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有不重复全排列集合 List<List<Integer>>',
      complexityStr: '时间复杂度: O(N * N!) 最坏无重复情况 · 空间复杂度: O(N) 递归树深度与 used 数组',
    });

    return header + baseCase + round + finalReturn;
  }
}
