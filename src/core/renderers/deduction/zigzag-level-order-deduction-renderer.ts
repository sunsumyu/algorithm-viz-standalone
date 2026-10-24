/**
 * 二叉树锯齿形层序遍历 (Binary Tree Zigzag Level Order Traversal · LeetCode 103 / Class 036 Code02)
 * 全景推演树渲染策略 (ZigzagLevelOrderDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ZigzagLevelOrderDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'zigzag-level-order';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'zigzag-level-order' ||
      modelId === '103' ||
      modelId === 'leetcode-103' ||
      modelId === 'tree-036-zigzag-level-order' ||
      modelId === 'binary-tree-zigzag-level-order-traversal'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 103. 二叉树的锯齿形层序遍历 (Binary Tree Zigzag Level Order) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 036 · 双端队列方向标志 / 静态数组队列 / DFS 深度分桶',
      descriptionHtml: `
        目标：给你二叉树的根节点 <code>root</code>，返回其节点值的<strong>之字形（锯齿形）层序遍历</strong>。<br/>
        即先从左往右，下一层从右往左，层与层之间交替折返（第 1 层从左向右，第 2 层从右向左，第 3 层再从左向右...）。<br/>
        <strong>《代码随想录》与左程云算法体系核心破局点——出队顺序与收集方向解耦：</strong><br/>
        1. <strong>标准 BFS 队列 + isReverse 标志位（Stage 1）</strong>：树的广度遍历本身顺序绝对不变（严格左到右入队出队维护拓扑顺序），仅在收集当前层结果时，借助 <code>LinkedList / Deque</code> 根据标志位选择 <code>addLast()</code> 或 <code>addFirst()</code>；<br/>
        2. <strong>左程云静态数组循环队列（Stage 2）</strong>：连续内存预分配，指针 <code>l/r</code> 极速推进，根据层奇偶在本地缓冲区倒序或正序拷贝，彻底规避 GC 损耗；<br/>
        3. <strong>先序递归 DFS 深度折返插入（Stage 3）</strong>：利用 <code>depth % 2 == 0</code> 判定插入头部还是尾部，展示树遍历的双重视角。
      `,
      initialStateText: `遍历入口：zigzagLevelOrder(root) ➔ 根节点入队，isReverse = false（首层左向右），开启之字形推演。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空树基准 (Base Null)',
        valuesStr: 'root == null ➔ return [] (空树直接返回空二维列表)',
      },
      {
        prefix: '└───',
        label: '层队列与方向标志初始化',
        valuesStr: 'queue.push(root); isReverse = false; res = []',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 标准 BFS 队列与 Deque 双端插法 (Queue + isReverse · 经典解)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Deque BFS</span>',
      detailLines: [
        'int size = queue.size() ➔ 循环前固化本层节点总数，隔离下一层新入队子节点',
        'LinkedList<Integer> level = new LinkedList<>() ➔ 借助双端链表实现 O(1) 头尾双向插入',
        'for (int i = 0; i < size; i++) { cur = queue.poll(); if (isReverse) level.addFirst(cur.val); else level.addLast(cur.val); }',
        'isReverse = !isReverse ➔ 每层结算后翻转方向标志位，实现锯齿形折返交替',
      ],
      fillLine: '拓扑出队与层内收集解耦：保持拓扑单向推演，只在收集输出层做方向投影',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 左程云 Class 036 静态数组模拟队列 (Static Array Fast Queue)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Zero-GC Array</span>',
      detailLines: [
        'TreeNode[] queue = new TreeNode[MAXN]; int l = 0, r = 0; queue[r++] = root ➔ 预分配连续内存',
        'int size = r - l; 利用循环一次性弹出当前层所有节点，正向/反向填入结果切片',
        '指针 l/r 移动无任何对象包装，性能达到纳秒级极限，适合海量节点超限压测场景',
      ],
      fillLine: '工业级高性能范式：彻底消除对象分配与垃圾回收停顿，空间利用率 100%',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 深度优先 DFS 先序遍历与深度奇偶折返 (Recursive DFS Parity)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">DFS Parity</span>',
      detailLines: [
        'dfs(node, level): if (res.size() == level) res.add(new LinkedList<>()) ➔ 首次达深度动态扩容',
        'if (level % 2 == 1) res.get(level).addFirst(node.val); else res.get(level).addLast(node.val);',
        '递归深入左右孩子: dfs(node.left, level + 1); dfs(node.right, level + 1);',
      ],
      fillLine: '递归精简视角：利用栈空间直接按 depth % 2 奇偶分流，无需显式队列调度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Deque BFS ➔ Zero-GC Fast Queue ➔ DFS Parity)',
      subtitle: 'Programmer Carl & Zuoshen Class 036 Zigzag Level Order Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return res; // 严格锯齿折返交替的二维节点值列表',
      answerDescription: '时间复杂度严格 O(N)，全树各节点进出队恰好一次；空间复杂度 O(W)（树的最大层宽）。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
