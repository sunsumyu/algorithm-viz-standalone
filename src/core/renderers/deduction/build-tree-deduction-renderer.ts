/**
 * 从前序/后序与中序构造二叉树 (Construct Binary Tree · LeetCode 105 & 106 / Zuoshen Class 036 Code07)
 * 全景推演树渲染策略 (BuildTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BuildTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'build-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'build-tree' ||
      modelId === 'build-tree-2' ||
      modelId === '105' ||
      modelId === '106' ||
      modelId === 'leetcode-105' ||
      modelId === 'leetcode-106' ||
      modelId === 'tree-036-build-tree-preorder-inorder' ||
      modelId === 'build-tree-from-preorder-inorder' ||
      modelId === 'construct-binary-tree-from-inorder-and-postorder'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 105 / 106. 从前序/后序与中序遍历构造二叉树 (Construct Binary Tree) · 全景推演树',
      badge: '代码随想录 · 六步切分法 / 双向区间分治 / 零哈希显式栈',
      descriptionHtml: `
        二叉树重构经典分治命题：已知中序遍历和（前序/后序）遍历，恢复二叉树拓扑结构。<br/>
        <strong>《代码随想录》核心教学洞见——六步切分法：</strong><br/>
        1. 递归终止判定（区间无效返回 null，单节点快速返回叶子）；<br/>
        2. 取前序首元素 / 后序尾元素作为当前子树根节点值；<br/>
        3. 实例化当前根节点 <code class="font-mono bg-amber-50 text-amber-700 px-1 py-0.5 rounded font-bold">new TreeNode(rootVal)</code>；<br/>
        4. 在中序序列中定位根节点索引 inRoot，以其为界切分中序左、右两段；<br/>
        5. 计算中序左子树长度 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">leftLen = inRoot - inL</code>，联动切分前序/后序左、右两段；<br/>
        6. 递归构建左右子树并挂载到 root.left / root.right，返回根节点。
      `,
      initialStateText: `根调用入口：buildTree(preorder/postorder, inorder) ➔ 预建中序哈希表 inMap 提速至 O(1) 定位根，初始范围 [0..N-1]。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空区间越界基准 (Empty Range)',
        valuesStr: 'pL > pR || iL > iR ➔ return null (当前子树为空，终止递归)',
      },
      {
        prefix: '└───',
        label: '单节点叶子快速构建 (Single Leaf Node)',
        valuesStr: 'pL == pR ➔ return new TreeNode(val) (无孩子，直接返回叶节点)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 前序+中序分治切分递归构造 (LC 105 · Preorder + Inorder)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">preorder[pL] ➔ Root</span>',
      detailLines: [
        'rootVal = preorder[pL] ➔ 前序首位必为当前子树根节点',
        'inRoot = inMap.get(rootVal), leftLen = inRoot - iL ➔ 中序定位根并算出左子树跨度',
        'root.left = build(pL + 1, pL + leftLen, iL, inRoot - 1) ➔ 递归切分左子树',
        'root.right = build(pL + leftLen + 1, pR, inRoot + 1, iR) ➔ 递归切分右子树',
      ],
      fillLine: '前序 [根|左子树|右子树] 与中序 [左子树|根|右子树] 严格保持左子树长度一致',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 后序+中序分治切分递归构造 (LC 106 · Postorder + Inorder)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">postorder[pR] ➔ Root</span>',
      detailLines: [
        'rootVal = postorder[pR] ➔ 后序末位必为当前子树根节点',
        'inRoot = inMap.get(rootVal), leftLen = inRoot - iL ➔ 中序切分左子树 [iL..inRoot-1] 与右子树 [inRoot+1..iR]',
        'root.left = build(postL, postL + leftLen - 1, iL, inRoot - 1) ➔ 切割后序左子树',
        'root.right = build(postL + leftLen, postR - 1, inRoot + 1, iR) ➔ 切割后序右子树（扣除末位根）',
      ],
      fillLine: '后序 [左子树|右子树|根] 与中序 [左子树|根|右子树] 保持左子树长度 leftLen 严格对齐',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 迭代显式栈模拟前序重构 ($O(N)$ 零哈希表 · LC 105 迭代法)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[9px]">Deque<TreeNode> stack</span>',
      detailLines: [
        'stack.push(root) ➔ 遍历前序，沿左侧链连续入栈挂载为 left',
        'while (stack.peek().val == inorder[inIdx]) stack.pop(), inIdx++ ➔ 匹配中序，逆序弹出追溯拐点',
        'node.right = new TreeNode(preorder[i]), stack.push(node.right) ➔ 挂载拐点右孩子并重新深入',
      ],
      fillLine: '利用显式栈逆序还原调用栈深度，达到 O(N) 时间与 O(H) 空间的极致性能',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯状态推演流 (From Basic to Advanced)',
      subtitle: 'Programmer Carl Six-Step Slicing Progression',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 返回重建完成的完整二叉树根节点',
      answerDescription: '重构完成，返回树根。时间复杂度 O(N)，空间复杂度 O(N)。前提是序列无重复元素。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
