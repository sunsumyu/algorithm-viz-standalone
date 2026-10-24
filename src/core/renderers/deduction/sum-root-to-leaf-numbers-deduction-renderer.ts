/**
 * 求根节点到叶节点数字之和 (Sum Root to Leaf Numbers · LeetCode 129 / Class 036)
 * 全景推演树渲染策略 (SumRootToLeafNumbersDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SumRootToLeafNumbersDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sum-root-to-leaf-numbers';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sum-root-to-leaf-numbers' ||
      modelId === '129' ||
      modelId === 'leetcode-129' ||
      modelId === 'sum-numbers' ||
      modelId === 'sum-root-to-leaf'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 129. 求根节点到叶节点数字之和 (Sum Root to Leaf Numbers) · 全景推演树',
      badge: '代码随想录 · 十进制位移累加 / 叶子节点终态结算 / BFS 双队列 / 显式双栈迭代',
      descriptionHtml: `
        目标：树中每个节点存储 0~9 的数字，每条从根到叶节点的路径代表一个多位整数（如 <code>1->2->3</code> 代表 <code>123</code>），求所有根到叶路径数字之总和。<br/>
        <strong>《代码随想录》教学破局点——十进制位移在树形递归中的自顶向下推进：</strong><br/>
        1. <strong>自顶向下十进制前缀移位（Stage 1）</strong>：进入当前节点时，当前路径值为 <code>curSum = preSum * 10 + node.val</code>；<br/>
        2. <strong>叶子节点终止判定</strong>：当且仅当 <code>node.left == null && node.right == null</code> 时，说明当前数字已完整拼装，直接返回 <code>curSum</code>；<br/>
        3. <strong>非叶节点分治下发</strong>：若非叶子，递归分治 <code>dfs(node.left, curSum) + dfs(node.right, curSum)</code> 并向父层归纳总和；<br/>
        4. <strong>BFS 双队列层序演化（Stage 2）</strong>与<strong>显式双栈（Stage 3）</strong>：同步推进节点与当前累积数值，彻底规避深层递归栈溢出。
      `,
      initialStateText: `计算入口：sumNumbers(root) ➔ 初始 preSum = 0，从根节点展开十进制深潜。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'node == null ➔ return 0 (空分支不构成任何有效数字，贡献和为 0)',
      },
      {
        prefix: '└───',
        label: '叶子节点结算基准 (Leaf Completed Base)',
        valuesStr: 'node.left == null && node.right == null ➔ return curSum (数字构造完毕，立即贡献当前数值)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 前序遍历与自顶向下累加递归 (LC 129 经典前序分治)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Preorder DFS</span>',
      detailLines: [
        'int curSum = preSum * 10 + node.val ➔ 十进制高位左移累加当前节点权值',
        'if (node.left == null && node.right == null) return curSum ➔ 触碰叶节点，直接结算单条完整路径数值',
        'return dfs(node.left, curSum) + dfs(node.right, curSum) ➔ 左右子树双向并行推进并汇总和',
      ],
      fillLine: '前序自顶向下流式计算：时间复杂度 O(N)，空间复杂度 O(H)，十进制位移天然保真',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 广度优先搜索双队列同步推进 (BFS Dual Queues)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Dual Queue BFS</span>',
      detailLines: [
        'Queue<TreeNode> nodeQueue; Queue<Integer> numQueue; 根节点与初始数值同步入队',
        'cur = nodeQueue.poll(); num = numQueue.poll(); ➔ 同步出队',
        'if (cur 是叶子) total += num; ➔ 命中叶子节点立即累加到全局总和',
        '若有孩子节点：子节点与 num * 10 + child.val 严格同步入队',
      ],
      fillLine: '层序广度优先无回溯：空间复杂度 O(W)，动态展现所有路径数字在层级扩展中的并行衍生',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 显式双栈迭代 DFS 与状态解耦 (Explicit Dual Stacks)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Dual Stacks</span>',
      detailLines: [
        'Stack<TreeNode> nodeStack; Stack<Integer> numStack; 维护节点与路径数双轨',
        'pop 弹出栈顶节点与对应累积数，遇叶子直接累加到 totalSum',
        '右左子节点成对压入栈中，完全规避函数调用栈深层递归导致的 StackOverflowError',
      ],
      fillLine: '显式双轨栈：兼具 DFS 内存友好优势与工业级工程鲁棒性',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Preorder DFS ➔ Dual Queue BFS ➔ Dual Stacks)',
      subtitle: 'Programmer Carl & LeetCode 129 Sum Root to Leaf Numbers',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalSum; // 所有根节点到叶子节点路径生成的十进制数字之总和',
      answerDescription: '时间复杂度严格 O(N)，全树每个节点仅遍历一次；空间复杂度取决于树高 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
