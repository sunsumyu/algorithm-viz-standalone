/**
 * 二叉搜索树中的搜索与插入 (Search & Insert in BST · LeetCode 700 / 701)
 * 全景推演树渲染策略 (BstSearchDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BstSearchDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bst-search';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bst-search' ||
      modelId === '700' ||
      modelId === '701' ||
      modelId === 'leetcode-700' ||
      modelId === 'leetcode-701' ||
      modelId === 'bst-insert' ||
      modelId === 'insert-into-a-binary-search-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 700 & 701. 二叉搜索树的检索与插入 (BST Search & Insert) · 全景推演树',
      badge: '代码随想录 · 单向二分剪枝 / 递归返回值挂接 / 迭代 O(1) 穿透',
      descriptionHtml: `
        二叉搜索树（BST）核心属性：<strong>天然具备二分查找特性</strong>！<br/>
        左子树所有节点值 &lt; 根节点值 &lt; 右子树所有节点值。检索时每次比对即可<strong>直接剪掉一半子树</strong>，无需两边同时遍历。<br/>
        <strong>《代码随想录》核心教学洞见——搜索与插入的一体两面：</strong><br/>
        二叉搜索树的<strong>插入本质上就是一次未命中的搜索</strong>！<br/>
        沿着 BST 规则一路单向剪枝向下探测，当遇到 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded">null</code> 空节点时，正是新值应当驻留的合法空位！利用递归返回值直接挂接（<code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">root.left = insertIntoBST(...)</code>），极其精妙且天然维护指针结构。
      `,
      initialStateText: `检索入口：searchBST(root, val) / insertIntoBST(root, val) ➔ 目标值 val 与当前节点比对，单向分流推进。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ 检索未命中返回 null；插入操作则命中空位 return new TreeNode(val)',
      },
      {
        prefix: '└───',
        label: '目标命中基准 (Match Hit)',
        valuesStr: 'root.val == val ➔ 检索成功，立即返回当前子树根节点 root',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 迭代单向剪枝查找 (Iterative BST Search · O(1) 空间)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Iterative O(1)</span>',
      detailLines: [
        'while (cur != null) ➔ 遍历指针原地迭代推进，无调用栈开销',
        'if (target < cur.val) cur = cur.left ➔ 目标较小，右半边全部剪掉，单向走向左孩子',
        'else if (target > cur.val) cur = cur.right ➔ 目标较大，左半边全部剪掉，单向走向右孩子',
      ],
      fillLine: '迭代单向滑行：树形结构的二分查找，零递归隐式栈开销，防极端树高爆栈',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 递归分治单侧搜索 (Recursive BST Search)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Recursive Divide</span>',
      detailLines: [
        'if (target < root.val) return searchBST(root.left, target) ➔ 深入左子树单侧递归',
        'else return searchBST(root.right, target) ➔ 深入右子树单侧递归',
      ],
      fillLine: '递归推演折线：单分支深入，不分叉不回溯，递归深度严格等同于查找路径长度',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 动态插入与返回值挂接 (BST Insertion with Node Linkage)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[9px]">Insertion Return Link</span>',
      detailLines: [
        'if (root == null) return new TreeNode(val) ➔ 寻得合法叶子空位，封装新节点向上传递',
        'if (val < root.val) root.left = insertIntoBST(root.left, val) ➔ 父节点接收子调用返回，重定左孩子引用',
        'else if (val > root.val) root.right = insertIntoBST(root.right, val) ➔ 父节点接收子调用返回，重定右孩子引用',
        'return root ➔ 回溯保持整树拓扑指针连贯',
      ],
      fillLine: '返回值挂接法：父节点借由子树返回值完成引用嫁接，消除繁琐的前驱父指针维护',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (From Search to Dynamic Insertion)',
      subtitle: 'Programmer Carl BST Search & Insert Paradigms Progression',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 返回目标子树或插入完成后的整树根节点',
      answerDescription: '平均时间复杂度 O(log N)（退化单链为 O(N)）；迭代查找空间复杂度 O(1)，递归空间复杂度 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
