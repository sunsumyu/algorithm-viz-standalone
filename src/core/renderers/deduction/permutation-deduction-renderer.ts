/**
 * 全排列 (Permutations · LeetCode 46)
 * 全景推演树渲染策略 (PermutationDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PermutationDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'permutation';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'permutation' ||
      modelId === 'permutations' ||
      modelId === '46' ||
      modelId === 'leetcode-46' ||
      modelId === 'permutations-all'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 46. 全排列 (Permutations) · 全景推演树',
      badge: '全局树层从 0 遍历 · used[] 树枝布尔标记 · 严格 N! 决策树状态空间',
      descriptionHtml: `
        核心目标：给定一个不含重复数字的数组 <code>nums</code>，返回其所有可能的全排列。<br/>
        <strong>《代码随想录》核心教研范式——排列回溯的全局循环与树枝标记：</strong><br/>
        1. <strong>排列与组合的根本分水岭</strong>：<br/>
        组合问题中 <code>[1, 2]</code> 与 <code>[2, 1]</code> 视为同一解，必须靠 <code>startIndex</code> 单向约束；<br/>
        而排列问题中顺序决定不同解，<code>[1, 2]</code> 与 <code>[2, 1]</code> 皆为合法全排列，<strong>因此每层循环必须无例外从 0 开始完整遍历</strong>；<br/>
        2. <strong>used 树枝布尔标记公理</strong>：<br/>
        引入 <code>boolean[] used</code> 跟踪当前纵向树枝中哪些元素已被选取。若 <code>used[i] == true</code>，表示该数已在当前排列祖先中就位，<strong>直接 <code>continue</code> 跳过</strong>；<br/>
        3. <strong>叶子节点收割</strong>：当 <code>path.size() == nums.length</code> 时，所有可用数字全部入列，收割一个有效排列并 <code>return</code>。
      `,
      initialStateText: `全排列入口：permute(nums) ➔ used = new boolean[nums.length]，backtracking(nums, used)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '排列满员收割 (Hit Full Permutation)',
        valuesStr: 'path.size() == nums.length ➔ 命中叶子节点，res.add(new ArrayList<>(path))，执行 return',
      },
      {
        prefix: '└───',
        label: '树枝已用拦截 (Branch In-Use Filter)',
        valuesStr: 'used[i] == true ➔ 该数字在当前纵深路径中已被选取，continue 跳过',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 全局树层遍历与 used 状态甄别 (Global Loop & used Probe)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">used[i]</span>',
      detailLines: [
        'for (int i = 0; i < nums.length; i++) { // 排列问题：恒定从 0 开始遍历',
        '  if (used[i]) continue; // 树枝已选，禁止重复抽取',
        '  used[i] = true; path.add(nums[i]);',
      ],
      fillLine: '树层撒网：每次从首位扫描全局候选，排除已被当前树枝占用的数字并上锁',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推进入排列下一槽位 (Recurse to Next Slot)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Recurse</span>',
      detailLines: [
        '  backtracking(nums, used); // 下一层继续尝试未选元素',
      ],
      fillLine: '向下延伸：携带已上锁的 used 数组，深入下一层为下一个排列槽位选值',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与双重解锁 (Backtrack & Unlock)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">used[i] = false</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '  used[i] = false; // 核心回溯：解开标记，供其他分支选用',
        '}',
      ],
      fillLine: '恢复现场：弹出路径末项，重置 used[i] 为 false，释放该数字供后续同层兄弟分支使用',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '全排列回溯推演流 (Probe used ➔ Lock & Recurse ➔ Unlock & Pop)',
      subtitle: 'LeetCode 46 Permutations Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有全排列集合 List<List<Integer>>，数量恰好为 N!',
      complexityStr: '时间复杂度: O(N * N!) 共有 N! 个排列 · 空间复杂度: O(N) 递归深度与 used 标记',
    });

    return header + baseCase + round + finalReturn;
  }
}
