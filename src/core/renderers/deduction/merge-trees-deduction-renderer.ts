/**
 * 合并二叉树 (Merge Two Binary Trees · LeetCode 617)
 * 全景推演树渲染策略 (MergeTreesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MergeTreesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'merge-trees';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'merge-trees' ||
      modelId === '617' ||
      modelId === 'leetcode-617' ||
      modelId === 'merge-two-binary-trees'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 617. 合并二叉树 (Merge Two Binary Trees) · 全景推演树',
      badge: '代码随想录 · 双树同步遍历 / 现场复用合并 / BFS 队列归并',
      descriptionHtml: `
        将两棵二叉树合并为一棵新二叉树：重叠节点值相加，单边存在节点直接继承。<br/>
        <strong>《代码随想录》核心教学洞见——双树同步遍历思维：</strong><br/>
        二叉树遍历通常只操作单树指针，而本题核心在于<strong>同时递归两棵树的对应位置</strong>（参数传入 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">root1, root2</code>）。<br/>
        前序、中序、后序均可完成合并；以 root1 作为原地合并载体或创建新树，体会引用直接继承的妙处！
      `,
      initialStateText: `根调用入口：mergeTrees(root1, root2) ➔ 若一侧为空直接返回对侧，初始双指针指向各自根节点。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: 'T1 为空直接继承 T2 (T1 Null)',
        valuesStr: 'root1 == null ➔ return root2 (无需继续深潜，直接返回 T2 完整子树引用)',
      },
      {
        prefix: '└───',
        label: 'T2 为空直接保留 T1 (T2 Null)',
        valuesStr: 'root2 == null ➔ return root1 (无需修改，直接保留 T1 既有子树)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归 DFS 同步下潜合并 (Simultaneous DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">O(min(M,N)) DFS</span>',
      detailLines: [
        'root1.val += root2.val ➔ 对应位置重叠节点数值累加，原地复用 root1 作为合并基底',
        'root1.left = mergeTrees(root1.left, root2.left) ➔ 双指针同步深入两树左孩子',
        'root1.right = mergeTrees(root1.right, root2.right) ➔ 双指针同步深入两树右孩子',
      ],
      fillLine: '双树同步遍历前序构建：根节点值相加 ➔ 递归切分左子树 ➔ 递归切分右子树 ➔ 返回 root1',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 2: 迭代 BFS 队列同步节点对合并 (Queue BFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Queue<NodePair></span>',
      detailLines: [
        'Queue<TreeNode[]> queue.offer(new TreeNode[]{root1, root2}) ➔ 同步节点对入队',
        'node1.val += node2.val ➔ 出队节点对相加',
        'if (node1.left && node2.left) queue.offer(...) ➔ 两者皆有则入队继续推进',
        'else if (!node1.left && node2.left) node1.left = node2.left ➔ 单边嫁接引用继承',
      ],
      fillLine: '广度优先层序迭代：队列维护对应节点对，单边存在直接嫁接指针，规避极端单链树栈溢出',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '二级演化阶梯状态推演流 (From Basic to Advanced)',
      subtitle: 'Programmer Carl Simultaneous Tree Traversal Progression',
      stepLinesHtml: step1 + step2,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root1; // 返回合并后的完整新二叉树根节点',
      answerDescription: '重叠遍历两树公共部分，时间复杂度 O(min(M, N))，空间复杂度 O(min(H1, H2))。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
