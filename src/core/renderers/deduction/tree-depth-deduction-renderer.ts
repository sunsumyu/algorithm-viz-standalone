/**
 * 二叉树的最大深度 (Maximum Depth of Binary Tree · LeetCode 104 / Class 036 Code04)
 * 全景推演树渲染策略 (TreeDepthDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeDepthDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-depth';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-depth' ||
      modelId === '104' ||
      modelId === 'leetcode-104' ||
      modelId === 'maximum-depth-of-binary-tree' ||
      modelId === 'tree-036-depth-of-binary-tree' ||
      modelId === 'class036-code04'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 104. 二叉树的最大深度 (Maximum Depth of Binary Tree) · 全景推演树',
      badge: '代码随想录 · 后序自底向上归约 / 层次遍历 BFS 队列 / 静态数组极致优化',
      descriptionHtml: `
        二叉树的最大深度定义：<strong>从根节点到最远叶子节点的最长路径上的节点数</strong>。<br/>
        <strong>《代码随想录》教学破局点——深度（Depth）与高度（Height）的本源辨析：</strong><br/>
        1. <strong>深度（Depth）</strong>：任意节点到根节点的距离（自顶向下），常使用<strong>前序遍历</strong>（求根到节点的路径长度）；<br/>
        2. <strong>高度（Height）</strong>：任意节点到叶子节点的最长距离（自底向上），常使用<strong>后序遍历</strong>。<br/>
        因为<strong>根节点的高度即为整棵二叉树的最大深度</strong>，故后序自底向上分治归约是求二叉树深度的最优雅经典范式！
      `,
      initialStateText: `计算入口：maxDepth(root) ➔ 从根节点向下递归发散或入队层序推进。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ return 0 (空树高度与深度均为 0，向上返回高度贡献 0)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归后序自底向上高度归约 (Postorder Bottom-Up DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Postorder DFS</span>',
      detailLines: [
        'left = maxDepth(root.left) ➔ 递归探针深潜左子树，收集左子树最大深度',
        'right = maxDepth(root.right) ➔ 递归探针深潜右子树，收集右子树最大深度',
        'return Math.max(left, right) + 1 ➔ 后序归约结算：当前子树深度 = 左右最大深度 + 1 (当前根自身)',
      ],
      fillLine: '自底向上归约法：时间复杂度 O(N)，空间复杂度 O(H)，调用栈深度即树的高度',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 层次遍历 BFS 队列逐层扩展 (Breadth-First Search)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Levelorder BFS</span>',
      detailLines: [
        'queue.push(root); depth = 0 ➔ 根节点入队，初始化深度计数器为 0',
        'size = queue.length ➔ 锁定当前层节点总数，开启同层节点出队循环',
        'for (i = 0; i < size; i++) { node = queue.shift(); if (node.left) queue.push(node.left); if (node.right) queue.push(node.right); }',
        'depth++ ➔ 当前层所有节点出队并收集齐下层节点后，层级计数 depth 自增 1',
      ],
      fillLine: '广度优先逐层清空：空间复杂度 O(W)（树的最大宽度），直观展示物理层级扩展',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 左程云 Class 036 静态数组模拟队列 (Static Array Fast Queue)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Zero-GC Fast Queue</span>',
      detailLines: [
        'TreeNode[] queue = new TreeNode[MAXN]; int l = 0, r = 0; queue[r++] = root ➔ 预分配平坦内存，指针 r 入队',
        'while (l < r) { int size = r - l; depth++; ... } ➔ 基于 r - l 确定层大小，极速自增 depth',
        'l 指针单调递增出队，零对象创建与零 GC 开销，在大规模树节点下达到极致常数性能',
      ],
      fillLine: '工程级性能压榨：平坦连续内存与双指针模拟，杜绝动态数组频繁扩容与垃圾回收停顿',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Postorder DFS ➔ Levelorder BFS ➔ Zero-GC Fast Queue)',
      subtitle: 'Programmer Carl Tree Depth Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return depth; // 整棵二叉树的最大深度（根节点的高度）',
      answerDescription: '时间复杂度严格 O(N)，每个节点仅访问一次；空间复杂度取决于树高或最大层宽 O(H) ~ O(W)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
