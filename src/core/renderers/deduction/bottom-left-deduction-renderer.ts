/**
 * 找树左下角的值 (Find Bottom Left Tree Value · LeetCode 513)
 * 全景推演树渲染策略 (BottomLeftDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BottomLeftDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bottom-left';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bottom-left' ||
      modelId === '513' ||
      modelId === 'leetcode-513' ||
      modelId === 'find-bottom-left-value' ||
      modelId === 'find-bottom-left-tree-value'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 513. 找树左下角的值 (Find Bottom Left Tree Value) · 全景推演树',
      badge: '代码随想录 · 先序先登者锁定 / 标准 BFS 层首捕获 / 逆向右先 BFS 终节点秒杀',
      descriptionHtml: `
        目标：找出二叉树<strong>最底层（最大深度）、最左边节点的值</strong>。<br/>
        <strong>《代码随想录》教学破局点——“最左”与“底层”的双维求解范式：</strong><br/>
        1. <strong>先序递归 DFS（先登者锁定）</strong>：优先向左下潜，当 <code>curDepth > maxDepth</code> 时，首次到达新深度，该节点<strong>必为该深度最左节点</strong>；<br/>
        2. <strong>标准 BFS 队列</strong>：逐层扫描，记录每层 <code>i === 0</code> 的首个出队节点，直到最后一层；<br/>
        3. <strong>逆向右先 BFS（神仙解法）</strong>：入队顺序改为<strong>先右后左</strong>，整棵树<strong>最后一个出队的节点</strong>天然就是最底层最左边的节点，无需记录层大小！
      `,
      initialStateText: `计算入口：findBottomLeftValue(root) ➔ 维护深度与最左候选值，多路搜索推演。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单节点根树基准 (Single Root Base)',
        valuesStr: 'root.left == null && root.right == null ➔ return root.val (自身既是最底层也是最左边)',
      },
      {
        prefix: '└───',
        label: '深度更新条件 (Depth Overwrite Condition)',
        valuesStr: 'curDepth > maxDepth ➔ 锁定先登者 result = cur.val, maxDepth = curDepth',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 先序递归 DFS 与最深层先登者锁定 (Preorder DFS First-Arrival Lock)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Preorder DFS</span>',
      detailLines: [
        'traversal(cur, depth): if (depth > maxDepth) { maxDepth = depth; result = cur.val; } ➔ 优先向左深潜，首次探访新深度即最左节点',
        'if (cur.left) traversal(cur.left, depth + 1) ➔ 左路优先下潜递归',
        'if (cur.right) traversal(cur.right, depth + 1) ➔ 右路后序下潜，由于 depth <= maxDepth，不会错误覆盖同层左节点',
      ],
      fillLine: '先序先登法则：时间复杂度 O(N)，空间复杂度 O(H)，严守先左后右顺序达成隐式最左保护',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 标准层序 BFS 队列与层首捕获 (Standard Level-Order BFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Levelorder BFS</span>',
      detailLines: [
        'queue.push(root); while (queue.length > 0) { size = queue.length; for (i = 0; i < size; i++) { ... } } ➔ 按层出队',
        'node = queue.shift(); if (i === 0) result = node.val ➔ 捕获当前层首个出队元素，暂存为本层最左值',
        'if (node.left) queue.push(node.left); if (node.right) queue.push(node.right) ➔ 经典先左后右推入下一层',
      ],
      fillLine: '标准层序广播：空间复杂度 O(W)，最后一层的首个出队节点最终保留在 result 中',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 逆向右先层序 BFS (Reverse Right-to-Left BFS · 最优极简)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Reverse BFS</span>',
      detailLines: [
        'queue.push(root); TreeNode cur = null ➔ 单队列循环，无需 size 维护分层',
        'while (!queue.isEmpty()) { cur = queue.poll(); if (cur.right) queue.push(cur.right); if (cur.left) queue.push(cur.left); }',
        '由于入队顺序是【先右后左】，出队扫描拓扑为【自顶向下，从右往左】，故最后一个被弹出的 cur 必是左下角终点！',
      ],
      fillLine: '拓扑几何对称性：代码仅 5 行，常数效率极高，出队终点即最终答案',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Preorder DFS ➔ Standard BFS ➔ Reverse BFS)',
      subtitle: 'Programmer Carl Bottom Left Value Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return result; // 最底层最左侧节点的数值',
      answerDescription: '时间复杂度: O(N) 遍历节点；空间复杂度: DFS O(H) / BFS O(W)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
