/**
 * 二叉树的层序遍历 (Binary Tree Level Order Traversal · LeetCode 102 / Class 036 Code01)
 * 全景推演树渲染策略 (BinaryTreeLevelDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BinaryTreeLevelDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'binary-tree-level';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'binary-tree-level' ||
      modelId === '102' ||
      modelId === 'leetcode-102' ||
      modelId === 'tree-036-level-order' ||
      modelId === 'binary-tree-level-order-traversal'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 102. 二叉树的层序遍历 (Binary Tree Level Order Traversal) · 全景推演树',
      badge: '代码随想录 · 层次遍历 BFS 经典批处理 / DFS 深度分桶 / 静态数组极致零 GC',
      descriptionHtml: `
        目标：给你二叉树的根节点 <code>root</code>，返回其节点值的<strong>层序遍历</strong>（即逐层地、从左到右访问所有节点，分层输出二维列表）。<br/>
        <strong>《代码随想录》与左程云算法体系教学破局点——层级边界如何精准切割：</strong><br/>
        1. <strong>标准 BFS 队列批处理（Stage 2）</strong>：在每层循环开始前，用 <code>size = queue.length</code> 拍摄当前层的“快照”，严格循环 <code>size</code> 次，保证本层出队与下一层入队互不干扰；<br/>
        2. <strong>先序递归 DFS 深度分桶（Stage 1）</strong>：利用 <code>depth</code> 索引直接映射结果二维数组 <code>res[depth].push(node.val)</code>，证明递归亦可解层序；<br/>
        3. <strong>静态数组循环队列（Stage 3）</strong>：预分配连续内存数组，利用双指针 <code>l/r</code> 维护滑动窗口，彻底消除频繁对象创建与垃圾回收（GC）停顿。
      `,
      initialStateText: `计算入口：levelOrder(root) ➔ 根节点入队，开启逐层分批扫描推演。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空树基准 (Base Null)',
        valuesStr: 'root == null ➔ return [] (空树直接返回空二维列表)',
      },
      {
        prefix: '└───',
        label: '层队列初始化 (Queue Setup)',
        valuesStr: 'queue.push(root); res = [] (首层仅含根节点，深度从 0 开始)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 标准 BFS 队列与 size 快照批处理 (Standard Queue BFS · 经典标准解)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Standard BFS</span>',
      detailLines: [
        'int size = queue.size() ➔ 核心关键：循环前固化本层节点总数，隔离新加入的子节点',
        'List<Integer> level = new ArrayList<>() ➔ 初始化当前层的数值收集槽',
        'for (int i = 0; i < size; i++) { cur = queue.poll(); level.add(cur.val); if (cur.left) queue.offer(cur.left); if (cur.right) queue.offer(cur.right); }',
        'res.add(level) ➔ 本层全部节点处理完毕，整层结果压入总输出',
      ],
      fillLine: '时间切片快照机制：单队列巧妙实现分层，空间复杂度严格受控于树最大宽度 O(W)',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 先序递归 DFS 与 depth 深度分桶映射 (Recursive DFS Level Grouping)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Recursive DFS</span>',
      detailLines: [
        'dfs(cur, depth): if (res.size() == depth) res.add(new ArrayList<>()) ➔ 首次探访新深度时动态创建分桶',
        'res.get(depth).add(cur.val) ➔ 节点值精确填入对应深度槽位',
        'if (cur.left) dfs(cur.left, depth + 1); if (cur.right) dfs(cur.right, depth + 1); ➔ 携带递增深度自顶向下探寻',
      ],
      fillLine: '函数调用栈分桶：空间复杂度 O(H)，代码极为精巧，展现树遍历的对偶视角',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 左程云 Class 036 静态数组队列 (Static Array Fast Queue · 工业性能)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Zero-GC Array</span>',
      detailLines: [
        'TreeNode[] queue = new TreeNode[MAXN]; int l = 0, r = 0; queue[r++] = root ➔ 预分配连续内存',
        'while (l < r) { int size = r - l; for (int i = 0; i < size; i++) { cur = queue[l++]; ... queue[r++] = ... } }',
        '指针 l/r 毫秒级移位，零动态对象分配，规避 Java/V8 GC 频繁触发，超大数据集性能提升 3~5 倍',
      ],
      fillLine: '硬核工业优化：平坦内存连续布局，缓存友好，算法竞赛与高性能服务端必备范式',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Standard BFS ➔ Recursive DFS ➔ Zero-GC Fast Queue)',
      subtitle: 'Programmer Carl & Zuoshen Class 036 Level Order Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return res; // 严格按层组织的二维节点值列表',
      answerDescription: '时间复杂度严格 O(N)，全树各节点恰好进出队一次；空间复杂度 O(W)（树的最大层宽）。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
