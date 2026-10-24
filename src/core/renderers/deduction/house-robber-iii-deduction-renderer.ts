/**
 * 打家劫舍 III (House Robber III · LeetCode 337 / Class 037 Code07)
 * 全景推演树渲染策略 (HouseRobberIIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class HouseRobberIIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'house-robber-iii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'house-robber-iii' ||
      modelId === '337' ||
      modelId === 'leetcode-337' ||
      modelId === 'tree-037-house-robber-iii' ||
      modelId === 'tree-dp-house-robber' ||
      modelId === 'house-robber-3'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 337. 打家劫舍 III (House Robber III · 树形 DP) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 037 · 树形动态规划 / 后序遍历 / 互斥二元组 [notRob, robCur]',
      descriptionHtml: `
        目标：小偷发现了一个新的可行窃地点，这个地区的房屋排列成一棵二叉树。如果<strong>两个直接相连的房子在同一天晚上被打劫，房屋将自动报警</strong>。<br/>
        计算在不触发报警的情况下，小偷能够盗取的最高金额。<br/>
        <strong>《代码随想录》与左程云算法体系教学破局点——树形 DP 状态机与自底向上归约：</strong><br/>
        1. <strong>状态设计（二元组承载）</strong>：<br/>
        定义树中每个节点 <code>cur</code> 向上层返回一个长度为 2 的数组 <code>res = [notRob, robCur]</code>：<br/>
        • <code>res[0] (notRob)</code>：<strong>不偷当前节点</strong>时，以 <code>cur</code> 为根的子树能够获得的最大金额；<br/>
        • <code>res[1] (robCur)</code>：<strong>偷当前节点</strong>时，以 <code>cur</code> 为根的子树能够获得的最大金额。<br/>
        2. <strong>后序状态转移方程推导</strong>：<br/>
        必须采用<strong>后序遍历（左右根）</strong>，先拿到左孩子 <code>left[0, 1]</code> 与右孩子 <code>right[0, 1]</code>：<br/>
        • <strong>偷当前节点</strong>：左右孩子严禁被偷！<code>robCur = cur.val + left[0] + right[0]</code>；<br/>
        • <strong>不偷当前节点</strong>：左右孩子爱偷不偷，各自选择最优策略！<code>notRob = max(left[0], left[1]) + max(right[0], right[1])</code>。<br/>
        3. <strong>全树根节点结算</strong>：最终最优答案即为 <code>Math.max(rootRes[0], rootRes[1])</code>。
      `,
      initialStateText: `树形DP入口：rob(root) ➔ 递归深入叶子，后序自底向上汇聚 [notRob, robCur] 二元组。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'cur == null ➔ return [0, 0] (空节点无论偷或不偷金额均为 0)',
      },
      {
        prefix: '└───',
        label: '叶子节点基准 (Leaf Base)',
        valuesStr: '叶子节点 ➔ notRob = 0, robCur = cur.val ➔ return [0, cur.val]',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 左右子树后序深入 (Postorder Subtree Traversal)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Postorder DFS</span>',
      detailLines: [
        'int[] left = robTree(cur.left); ➔ 自底向上获得左子树 [不偷左, 偷左] 二元组',
        'int[] right = robTree(cur.right); ➔ 自底向上获得右子树 [不偷右, 偷右] 二元组',
      ],
      fillLine: '严格树形后序遍历：先深入获取左右孩子完备信息，父节点方可执行互斥决策',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 状态机互斥决策推导 (Mutual Exclusion Decision)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">State Transition</span>',
      detailLines: [
        'int robCur = cur.val + left[0] + right[0] ➔ 偷当前节点：左右孩子绝对不能偷，强绑定 left[0] 与 right[0]',
        'int notRob = Math.max(left[0], left[1]) + Math.max(right[0], right[1]) ➔ 不偷当前：左右孩子自由选择各自最大收益',
      ],
      fillLine: '互斥决策闭环：将邻接相克约束转化为状态数组不同槽位的条件累加',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 二元组向父层后序归约 (Bottom-up Reduction)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Return Pair</span>',
      detailLines: [
        'return new int[]{ notRob, robCur } ➔ 向父调用帧返回当前子树最优二元组',
        '全过程零记忆化哈希表开销，内存随递归栈自然释放，空间严格 O(H)',
      ],
      fillLine: '极简工业美学：仅靠 2 个元素的数组自底向上归约，时间 O(N) 空间 O(H) 双优极限',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Postorder DFS ➔ State Transition ➔ Bottom-up Reduction)',
      subtitle: 'Programmer Carl & Zuoshen Class 037 House Robber III Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return Math.max(res[0], res[1]); // 全树最大盗窃金额',
      answerDescription: '时间复杂度严格 O(N)，每个节点仅访问一次；空间复杂度 O(H)（递归调用栈深度）。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
