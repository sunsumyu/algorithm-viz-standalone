/**
 * 翻转二叉树 (Invert Binary Tree · LeetCode 226)
 * 全景推演树渲染策略 (TreeInvertDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeInvertDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-invert';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-invert' ||
      modelId === '226' ||
      modelId === 'leetcode-226' ||
      modelId === 'invert-binary-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 226. 翻转二叉树 (Invert Binary Tree) · 全景推演树',
      badge: '代码随想录 · 前序/后序递归指针互换 / 层序队列广搜 / 静态数组零 GC',
      descriptionHtml: `
        翻转二叉树的核心计算本质：<strong>将整棵二叉树中每一个非空节点的左右孩子指针全部互换</strong>！<br/>
        <strong>《代码随想录》避坑教学指南——遍历顺序选择与中序陷阱：</strong><br/>
        1. <strong>前序遍历最为顺畅自然</strong>：先互换当前节点的两只孩子（<code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">swap(root.left, root.right)</code>），再分别深入翻转左右子树；<br/>
        2. <strong>后序遍历同理可行</strong>：先深入到底层把左右子树分别翻转好，最后回溯到当前节点互换两只手；<br/>
        3. <strong>中序遍历暗藏陷阱</strong>：若写为“翻左 ➔ 换根 ➔ 翻右”，则换根后右孩子实际上是刚翻转过的左孩子，导致左子树被连续翻转两次！若用中序，换完后必须继续翻转 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded">root.left</code>；<br/>
        4. <strong>广度优先遍历 (BFS)</strong>：借助队列逐层出队节点，并在出队瞬间完成孩子交换，拓扑变化最为直观清晰。
      `,
      initialStateText: `翻转入口：invertTree(root) ➔ 递归遍历树中每个节点，执行 swap(cur.left, cur.right)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '└───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ 遇到叶子底端空节点，无需翻转直接返回 return null',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 前序递归自顶向下翻转 (Recursive Preorder DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Preorder Swap</span>',
      detailLines: [
        'swap(root.left, root.right) ➔ 优先原地互换当前根节点的左右孩子指针',
        'invertTree(root.left) ➔ 递归下潜翻转已互换后的新左子树',
        'invertTree(root.right) ➔ 递归下潜翻转已互换后的新右子树',
      ],
      fillLine: '自顶向下先序下潜：先定根部格局，再深入子树各层级，逐层完成镜像逆转',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 队列广度优先层序翻转 (Queue BFS Iteration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Queue&lt;TreeNode&gt;</span>',
      detailLines: [
        'queue.push(root) ➔ 根节点入队开启层序循环',
        'cur = queue.shift(); swap(cur.left, cur.right) ➔ 节点出队即刻互换左右指针',
        'if (cur.left) queue.push(cur.left); if (cur.right) queue.push(cur.right) ➔ 活跃子节点入队推进',
      ],
      fillLine: '层序迭代解法：逐层出队交换指针，杜绝深层单链递归调用栈溢出风险',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 静态数组循环队列零 GC (Static Array Zero-GC BFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Zero-GC Ring</span>',
      detailLines: [
        '预先分配定长环形缓冲数组，以 head / tail 指针移动代替动态 shift / push',
        '彻底化解大规模树节点对象频繁分配带来的内存抖动，保障极致动画帧率',
      ],
      fillLine: '生产级工程优化：规避 V8 垃圾回收周期，保持高频高并发渲染流畅度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Preorder DFS to BFS & Ring Buffer)',
      subtitle: 'Programmer Carl Invert Binary Tree Paradigms Progression',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 返回完成全树镜像翻转后的原二叉树根节点',
      answerDescription: '时间复杂度严格 O(N)，每个节点仅访问并交换一次；空间复杂度为树高或层宽 O(H) ~ O(W)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
