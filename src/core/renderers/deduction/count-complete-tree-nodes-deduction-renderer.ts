/**
 * 完全二叉树节点个数 (Count Complete Tree Nodes · LeetCode 222 / Class 036 Code06)
 * 全景推演树渲染策略 (CountCompleteTreeNodesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CountCompleteTreeNodesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'count-complete-tree-nodes';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'count-complete-tree-nodes' ||
      modelId === '222' ||
      modelId === 'leetcode-222' ||
      modelId === 'tree-036-count-complete-tree-nodes' ||
      modelId === 'count-nodes' ||
      modelId === 'tree-036-code06'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 222. 完全二叉树的节点个数 (Count Complete Tree Nodes) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 036 · 右子树探底剪枝 O((log N)²) / 二分位运算查找 / 满树公式',
      descriptionHtml: `
        目标：给你一棵<strong>完全二叉树</strong>的根节点 <code>root</code>，求出该树的节点总数。<br/>
        <strong>《代码随想录》与左程云算法体系教学破局点——如何突破 O(N) 线性遍历壁垒：</strong><br/>
        1. <strong>左程云 Class 036 极速分治剪枝（Stage 2 · O((log N)²) 理论极限）</strong>：<br/>
        先沿整树最左边缘一路向下探到底，测出整树总深度 <code>h</code>；<br/>
        在当前节点 <code>cur</code> 处，<strong>探测其右子树的最左分支深度</strong>：<br/>
        • 若右树最左深度恰好触及底层 <code>h</code>：说明<strong>左子树是一棵完完全全的满二叉树</strong>！左子树节点数 + 根节点 = <code>1 << (h - level)</code>，直接位运算闭式求出，仅需递归探测右子树！<br/>
        • 若右树最左深度未触及底层（等于 <code>h - 1</code>）：说明最后一层叶子未蔓延至右树，<strong>右子树是一棵高度为 h - 1 的满二叉树</strong>！右子树 + 根节点 = <code>1 << (h - level - 1)</code>，直接位运算闭式求出，仅需递归探测左子树！<br/>
        每一层递归只往一边走，单次探底 O(log N)，递归层数 O(log N)，总时间复杂度严格 <strong>O((log N)²)</strong>！<br/>
        2. <strong>二分查找 + 路径位运算判定（Stage 3）</strong>：将最底层可能的序号 [0 .. 2^h - 1] 作为二分区间，根据二进制位 0/1 指引向左或向右导航探测节点是否存在。
      `,
      initialStateText: `统计入口：countNodes(root) ➔ 沿最左路径测得整树高度 h，进入右子树深度探测递归。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'cur == null ➔ return 0 (空树节点个数为 0)',
      },
      {
        prefix: '└───',
        label: '整树高度预探 (Tree Height)',
        valuesStr: 'h = mostLeft(root, 1) ➔ 沿根节点左指针链一次下探测得整树深度 h',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 朴素递归 DFS / 满二叉树左右双探 (Carl DFS Baseline)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(N) DFS</span>',
      detailLines: [
        'leftDepth = countLeft(root.left); rightDepth = countRight(root.right);',
        'if (leftDepth == rightDepth) return (2 << leftDepth) - 1 ➔ 局部若为满二叉树直接利用公式闭式返回',
        'else return countNodes(root.left) + countNodes(root.right) + 1 ➔ 否则后序汇总',
      ],
      fillLine: '经典教学基准：虽然利用了局部满二叉树公式剪枝，但在最坏情况下仍可能退化为 O(N)',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 左程云 Class 036 右子树最左探底剪枝 (Zuoshen O((log N)²) Fast Divide)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O((log N)²)</span>',
      detailLines: [
        'rLeftHeight = mostLeft(cur.right, level + 1) ➔ 探测右子树最左深度',
        '若 rLeftHeight == h ➔ 左子树为满树: return (1 << (h - level)) + f(cur.right, level + 1, h)',
        '若 rLeftHeight < h ➔ 右子树为满树: return (1 << (h - level - 1)) + f(cur.left, level + 1, h)',
      ],
      fillLine: '降维打击：每一层仅深入一侧子树，另一侧直接用位运算 1 << k 秒杀，时间复杂度严格 O((log N)²)',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 底层序号二分查找与二进制导航 (Binary Search + Bit Navigation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Binary Search</span>',
      detailLines: [
        '底层叶子节点编号范围 [0 .. 2^(h-1) - 1]，二分查找 mid 序号',
        '通过检查 mid 的高位到低位二进制 0/1（0走左，1走右）从根节点精确导航',
        '若导航终点存在节点 ➔ low = mid；若为空 ➔ high = mid - 1',
      ],
      fillLine: '位运算与树拓扑的精妙映射：将树高转为二分范围，时间复杂度同样达到 O((log N)²)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Carl DFS ➔ Zuoshen Fast Divide ➔ Binary Search Navigation)',
      subtitle: 'Programmer Carl & Zuoshen Class 036 Count Nodes Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalNodes; // 完全二叉树的总节点个数',
      answerDescription: '左程云剪枝法与二分查找法时间复杂度均为 O((log N)²)，远优于普通树的 O(N) 遍历。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
