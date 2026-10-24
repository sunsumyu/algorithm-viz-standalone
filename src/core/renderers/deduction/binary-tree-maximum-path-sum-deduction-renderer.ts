/**
 * 二叉树中的最大路径和 (Binary Tree Maximum Path Sum · LeetCode 124 / Class 077)
 * 全景推演树渲染策略 (BinaryTreeMaximumPathSumDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BinaryTreeMaximumPathSumDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'binary-tree-maximum-path-sum';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'binary-tree-maximum-path-sum' ||
      modelId === '124' ||
      modelId === 'leetcode-124' ||
      modelId === 'max-path-sum-tree' ||
      modelId === 'leetcode-124-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 124. 二叉树中的最大路径和 (Binary Tree Maximum Path Sum) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 077 · 树形 DP / 单边向上贡献与跨根拱形和解耦 / 二元 Info 汇聚',
      descriptionHtml: `
        目标：求二叉树中任意两节点间路径的最大权值和（路径至少包含一个节点，可不经过根）。<br/>
        <strong>《代码随想录》与左程云体系教学破局点——单边向上贡献与跨根拱形全路径和的严格解耦：</strong><br/>
        1. <strong>单边向上贡献（One-sided Gain）</strong>：递归函数向父节点返回时，<strong>只能选择走左边或走右边一条单链</strong>（若子树增益为负则舍弃取 0，即 <code>max(0, gain)</code>），绝不能左右兼走（否则在父层视角将发生非法分叉！）；<br/>
        2. <strong>跨根拱形路径和（Arch Path Sum）</strong>：以当前节点为最高折返点的全路径为 <code>node.val + leftGain + rightGain</code>，用于在后序位置<strong>并发挑战全局最大值 <code>maxSum</code></strong>；<br/>
        3. <strong>树形 DP 二元信息模型（Stage 2）</strong>：严格定义 <code>Info { maxPathSum, maxPathSumFromHead }</code>，自底向上实现完备推导。
      `,
      initialStateText: `计算入口：maxPathSum(root) ➔ 全局 maxSum 初始化为 -Infinity，自底向上后序递归。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准贡献 (Base Null Gain)',
        valuesStr: 'node == null ➔ return 0 (空子树对父节点贡献收益严格为 0)',
      },
      {
        prefix: '└───',
        label: '负增益剪枝保护 (Negative Gain Pruning)',
        valuesStr: 'gain < 0 ➔ Math.max(0, gain) (负数贡献舍弃不选，避免拉低总路径和)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归后序自底向上与单边最大贡献分离 (LC 124 经典后序)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Postorder DFS</span>',
      detailLines: [
        'leftGain = Math.max(0, maxGain(node.left)) ➔ 深入左子树收集单边正增益',
        'rightGain = Math.max(0, maxGain(node.right)) ➔ 深入右子树收集单边正增益',
        'archSum = node.val + leftGain + rightGain; maxSum = Math.max(maxSum, archSum) ➔ 结算以当前节点为顶点的拱形全路径',
        'return node.val + Math.max(leftGain, rightGain) ➔ 向上仅返回单侧最大链延伸',
      ],
      fillLine: '返回值与全局结算解耦：时间复杂度 O(N)，空间复杂度 O(H)，树形 DP 黄金标杆',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 树形 DP 二元信息汇聚模型 (Zuoshen Class 077 Info 范式)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Tree DP Info</span>',
      detailLines: [
        'Info { maxPathSum: 全局路径和, fromHead: 从当前根出发向下单链最大和 }',
        'fromHead = Math.max(cur.val, cur.val + Math.max(left.fromHead, right.fromHead))',
        'maxPathSum = Math.max(left.maxPathSum, right.maxPathSum, cur.val + max(0, left.fromHead) + max(0, right.fromHead))',
        '自底向上全信息包裹汇聚，完全无全局变量副作用，形式化数学归纳无懈可击',
      ],
      fillLine: '无副作用纯函数模型：向子树要完备解空间信息，彻底消除隐式全局变量依赖',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 显式后序遍历与状态表映射 (零递归栈迭代)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Explicit Stack</span>',
      detailLines: [
        '使用双栈模拟后序遍历调用流：根节点先出栈即最后处理',
        'Map<TreeNode, Integer> gainMap 缓存各子树计算完毕的单侧增益',
        '左右孩子增益就绪后，在父节点弹栈时刻完成拱形挑战与单侧向上缓存',
      ],
      fillLine: '系统栈溢出彻底免疫：在极端单侧退化链或数万节点树深下稳健运行',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Postorder DFS ➔ Tree DP Info ➔ Explicit Stack)',
      subtitle: 'LeetCode 124 & Zuoshen Class 077 Binary Tree Max Path Sum',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxSum; // 全局历史出现过的最大路径权值和',
      answerDescription: '时间复杂度严格 O(N)，遍历整棵树一次；空间复杂度取决于树高 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
