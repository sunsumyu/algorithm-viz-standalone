/**
 * 二叉搜索子树的最大键值和 (Maximum Sum BST in Binary Tree · LeetCode 1373 / Class 036 Code03)
 * 全景推演树渲染策略 (MaxSumBstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaxSumBstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'max-sum-bst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'max-sum-bst' ||
      modelId === 'max-sum-bst-036' ||
      modelId === '1373' ||
      modelId === 'leetcode-1373' ||
      modelId === 'maximum-sum-bst-in-binary-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1373. 二叉搜索子树的最大键值和 (Maximum Sum BST) · 全景推演树',
      badge: '左程云 Class 036 & 代码随想录 · 树形 DP 黄金模板 / Info 四元组汇聚 / 哨兵极值判定',
      descriptionHtml: `
        目标：在一棵任意二叉树中，找出所有满足<strong>二叉搜索树（BST）</strong>特性的子树，并计算其<strong>键值和的最大值</strong>（若无正和则返回 0）。<br/>
        <strong>左程云算法体系教学破局点——二叉树递归套路之集大成者 (Tree DP Info 架构)：</strong><br/>
        判定当前子树是否为合法 BST，必须向左、右子树索要<strong>四维对称信息包裹</strong>：<br/>
        1. <strong>isBST</strong>：左右子树各自是否为合法 BST？<br/>
        2. <strong>max / min</strong>：当前节点权值是否严格满足 <code>cur.val > left.max && cur.val < right.min</code>？<br/>
        3. <strong>sum</strong>：当前子树键值总和 <code>cur.val + left.sum + right.sum</code>。<br/>
        <strong>哨兵极值的数学之美</strong>：空节点定义为 <code>min = +∞, max = -∞, sum = 0, isBST = true</code>，使叶子节点天然满足大小界限校验，消灭一切冗余边界特判！
      `,
      initialStateText: `计算入口：maxSumBST(root) ➔ 全局 maxSum 初始化为 0，自底向上展开后序四元组归纳。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点哨兵基准 (Base Null Sentinel)',
        valuesStr: 'node == null ➔ Info(isBST: true, min: +∞, max: -∞, sum: 0) (哨兵极值天然契合父级比对)',
      },
      {
        prefix: '└───',
        label: '合法 BST 充要准则 (BST Validity Condition)',
        valuesStr: 'left.isBST && right.isBST && cur.val > left.max && cur.val < right.min ➔ 确凿判定为合法 BST',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 树形 DP Info 结构体搜集与全局刷新 (Full Tree DP Info)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Tree DP Info</span>',
      detailLines: [
        'Info left = process(node.left); Info right = process(node.right) ➔ 后序分治收集左右子树四元组',
        'isBST = left.isBST && right.isBST && node.val > left.max && node.val < right.min ➔ 四重合规性检验',
        'if (isBST) { sum = node.val + left.sum + right.sum; maxSum = Math.max(maxSum, sum); } ➔ 刷新全局最大键值和',
        'return Info(isBST, Math.min(node.val, left.min), Math.max(node.val, right.max), sum) ➔ 向上汇聚',
      ],
      fillLine: '四元组递归套路：时间复杂度严格 O(N)，空间复杂度 O(H)，树形 DP 信息归纳集大成者',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 破损非 BST 快速失效剪枝 (Fast Failure Pruning)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Failure Pruning</span>',
      detailLines: [
        '若 left.isBST === false 或 right.isBST === false，祖先节点必不可能再构成合法 BST！',
        '立即直接向上传导 isBST = false 与占位哑值，免除无效的 min/max 复杂极值比对与累加运算',
        '剪枝加速深层子树失效传导，大幅压缩大规模复杂破损树上的常数消耗',
      ],
      fillLine: '破损向上传导：利用布尔逻辑短路，阻止失效分支的无效状态计算',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 显式后序遍历与单调栈迭代 (Explicit Stack Iteration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Explicit Stack</span>',
      detailLines: [
        '使用双栈模拟后序遍历递归流，确保叶节点率先弹栈并记录 Info 结果至哈希表',
        '父节点后序弹栈时刻，左右孩子 Info 必已就绪，直接查表完成四重校验与全局 maxSum 刷新',
        '彻底切断深层树结构下的系统调用栈溢出（StackOverflowError）风险',
      ],
      fillLine: '工程级解耦：确定性迭代栈循环推演，状态缓存表保证时空确定性',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Tree DP Info ➔ Failure Pruning ➔ Explicit Stack)',
      subtitle: 'Zuoshen Class 036 & LeetCode 1373 Max Sum BST Subtree',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxSum; // 任意二叉搜索子树的最大键值和 (非负)',
      answerDescription: '时间复杂度严格 O(N)，每个节点仅访问一次；空间复杂度取决于树高 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
