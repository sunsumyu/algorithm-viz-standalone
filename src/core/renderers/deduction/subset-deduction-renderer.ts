/**
 * 子集 (Subsets · LeetCode 78)
 * 全景推演树渲染策略 (SubsetDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SubsetDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'subset';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'subset' ||
      modelId === '78' ||
      modelId === 'leetcode-78' ||
      modelId === 'subsets'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 78. 子集 (Subsets) · 全景推演树',
      badge: '遍历树上所有节点收集 · 无终止条件拦截 · 严格 2^N 状态空间 · 回溯树',
      descriptionHtml: `
        核心目标：在不含重复元素的数组 <code>nums</code> 中，返回该数组所有可能的子集（幂集），解集不能包含重复的子集。<br/>
        <strong>《代码随想录》核心教研范式——节点全收集公理：</strong><br/>
        1. <strong>叶子节点收集 vs 全节点收集</strong>：<br/>
        • 组合问题与分割问题是收集树的<strong>叶子节点</strong>，需要达到固定长度或切完才收集；<br/>
        • 子集问题是收集整棵决策树的<strong>所有节点</strong>！因此，<strong>进入递归函数的第一行，不加任何前置判断，直接收割当前路径</strong>：<code>res.add(new ArrayList<>(path))</code>；<br/>
        2. <strong>自然收敛终止</strong>：<br/>
        当 <code>startIndex >= nums.length</code> 时，下方的 <code>for</code> 循环条件不成立自然跳出，天然构成递归基；<br/>
        3. <strong>单层递归与回溯</strong>：从 <code>startIndex</code> 遍历到末尾，选择当前数、深入 <code>i + 1</code>、回退撤销。
      `,
      initialStateText: `子集入口：subsets(nums) ➔ backtracking(nums, startIndex=0)，path = [], res = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '入口即收集无门槛收割 (Collect Every Node)',
        valuesStr: '进入函数首行：res.add(new ArrayList<>(path))，空集与所有中间状态全覆盖',
      },
      {
        prefix: '└───',
        label: '数组边界自然终止 (Exhausted Invariant)',
        valuesStr: 'startIndex >= nums.length ➔ 树枝无后续候选元素，循环不执行并自然向上返回',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树上全节点无差别收集落盘 (Collect Current Node)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">res.add()</span>',
      detailLines: [
        'res.add(new ArrayList<>(path)); // 遍历到每个节点都必须全量收割',
      ],
      fillLine: '全员收割：不论空集还是满集，每一个中间决策节点皆为数学上的合法子集',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 树层展开与纵深推进 (Expand Branch & Recurse)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">i + 1</span>',
      detailLines: [
        'for (int i = startIndex; i < nums.length; i++) {',
        '  path.add(nums[i]);',
        '  backtracking(nums, i + 1);',
      ],
      fillLine: '向下生枝：选择当前元素压入路径，以 i + 1 为起点向子树递推探索更长子集',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销路径末项 (Backtrack & Pop)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.remove()</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '}',
      ],
      fillLine: '回溯撤回：弹出末位数字恢复调用前路径，平滑让渡给同层下一个兄弟分支',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '子集全节点收集推演流 (Collect Node ➔ Recurse i+1 ➔ Undo Pop)',
      subtitle: 'LeetCode 78 Subsets Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '全分子集集合 List<List<Integer>>，数量恰好为 2^N',
      complexityStr: '时间复杂度: O(N * 2^N) 恰有 2^N 个状态 · 空间复杂度: O(N) 递归树深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
