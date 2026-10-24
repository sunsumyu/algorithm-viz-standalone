/**
 * 左叶子之和 (Sum of Left Leaves · LeetCode 404)
 * 全景推演树渲染策略 (LeftLeavesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LeftLeavesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'left-leaves';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'left-leaves' ||
      modelId === '404' ||
      modelId === 'leetcode-404' ||
      modelId === 'sum-of-left-leaves'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 404. 左叶子之和 (Sum of Left Leaves) · 全景推演树',
      badge: '代码随想录 · 父节点前瞻探查法则 / 递归分治后序归约 / BFS 与显式栈模拟',
      descriptionHtml: `
        二叉树的左叶子充要定义：<strong>节点自身为叶子节点（左右孩子皆空），且必须是其父节点的左孩子</strong>。<br/>
        <strong>《代码随想录》教学破局点——父节点前瞻探查法则 (Parent Lookahead Probe)：</strong><br/>
        二叉树节点通常只持有左右指针，无向上回溯的 <code>parent</code> 指针。<br/>
        如果递归深入到当前节点自身，节点<strong>无法获知自己究竟是父节点的左孩子还是右孩子</strong>！<br/>
        因此破局关键在于<strong>站在父节点视角前瞻审视其左孩子</strong>：<br/>
        当满足 <code>node.left != null && node.left.left == null && node.left.right == null</code> 时，即可铁证锁定 <code>node.left</code> 必为左叶子！
      `,
      initialStateText: `计算入口：sumOfLeftLeaves(root) ➔ 携带根节点自顶向下探测左叶子贡献。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ return 0 (空树无叶子节点，贡献 0)',
      },
      {
        prefix: '└───',
        label: '单节点根树特判 (Single Root Not Left Leaf)',
        valuesStr: 'root.left == null && root.right == null ➔ return 0 (根节点无父节点，非左叶子，贡献 0)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 后序分治递归与父节点前瞻探查 (Postorder Recursive DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Postorder DFS</span>',
      detailLines: [
        'int midValue = 0; if (root.left != null && root.left.left == null && root.left.right == null) midValue = root.left.val ➔ 站在父节点前瞻锁定左叶子',
        'int leftSum = sumOfLeftLeaves(root.left) ➔ 递归探入左子树，收集左子树深层其余左叶子之和',
        'int rightSum = sumOfLeftLeaves(root.right) ➔ 递归探入右子树，收集右子树内部所有左叶子之和',
        'return midValue + leftSum + rightSum ➔ 后序自底向上归约聚合总和',
      ],
      fillLine: '父级前瞻判定：时间复杂度 O(N)，空间复杂度 O(H)，优雅解除无父指针困境',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 广度优先搜索层序队列遍历 (BFS Queue Traversal)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Levelorder BFS</span>',
      detailLines: [
        'queue.push(root); int total = 0 ➔ 根节点入队，初始化累加器',
        'while (queue.length > 0) { node = queue.shift(); ... } ➔ 逐层出队',
        'if (node.left && !node.left.left && !node.left.right) total += node.left.val ➔ 检查出队父节点的左孩子，命中则累加',
        'if (node.left) queue.push(node.left); if (node.right) queue.push(node.right) ➔ 非叶子子节点入队推演',
      ],
      fillLine: '队列层序扫描：空间复杂度 O(W)，平铺展开父子拓扑关系，直观展现逐层叶子捕获',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 显式迭代栈遍历与左叶子累加 (Iterative Stack DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Explicit Stack</span>',
      detailLines: [
        'Stack<TreeNode> stack = new Stack<>(); stack.push(root) ➔ 显式调用栈模拟系统栈',
        'while (!stack.isEmpty()) { cur = stack.pop(); ... } ➔ 深度优先弹栈',
        'if (cur.left && !cur.left.left && !cur.left.right) total += cur.left.val ➔ 栈顶父节点前瞻收集',
        'if (cur.right) stack.push(cur.right); if (cur.left) stack.push(cur.left) ➔ 右左相继压栈（确保左路优先遍历）',
      ],
      fillLine: '显式栈控流：摆脱系统递归栈调用深度的栈溢出风险，工业级鲁棒性保证',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Postorder DFS ➔ Levelorder BFS ➔ Explicit Stack)',
      subtitle: 'Programmer Carl Left Leaves Sum Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return total; // 严格匹配定义的所有合法左叶子权值总和',
      answerDescription: '时间复杂度: O(N) 全节点遍历；空间复杂度: DFS/显式栈 O(H) / BFS O(W)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
