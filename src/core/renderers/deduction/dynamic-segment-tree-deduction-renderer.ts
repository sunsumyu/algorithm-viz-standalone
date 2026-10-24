/**
 * 动态开点线段树 (Dynamic Segment Tree · LeetCode 715 / 洛谷 P2781 / Class 111)
 * 全景推演树渲染策略 (DynamicSegmentTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DynamicSegmentTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dynamic-segment-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dynamic-segment-tree' ||
      modelId === 'dynamic-segment-tree-111' ||
      modelId === 'class111-code01' ||
      modelId === 'p2781' ||
      modelId === 'leetcode-715'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P2781 / 力扣 715. 动态开点线段树 (Dynamic Segment Tree) · 全景推演树',
      badge: '左程云 Class 111 · 10^9 巨大坐标轴 / 惰性按需指针开点 / 零离散化在线维护 / 单次修改仅消耗 O(log C) 空间',
      descriptionHtml: `
        核心目标：当题目坐标轴范围达到 <code>10^9</code> 甚至更大时，普通的 <code>4N</code> 静态数组需要消耗数十吉字节内存直接导致 MLE 崩溃；动态开点线段树在不借助离散化的前提下在线支持大值域区间增查。<br/>
        <strong>左程云算法体系教学核心——动态开点与指针按需延迟分配：</strong><br/>
        1. <strong>打破静态 2*rt 索引映射枷锁</strong>：<br/>
        静态线段树强依赖 <code>rt << 1</code> 和 <code>rt << 1 | 1</code> 编号；动态开点线段树中，每个节点显式记录左右孩子的指针/下标 <code>left</code> 和 <code>right</code>；<br/>
        初始时整棵树仅有一个根节点 <code>root = 1</code>，左右指针均为 0（代表空孩子）。<br/>
        2. <strong>按需开点公理（Lazy Allocation）</strong>：<br/>
        当修改或查询路径向下推进到某一区间时：<br/>
        • 若 <code>node.left == 0</code> 且当前操作需要下潜至左半区间，<strong>当场临时分配一个全新节点编号</strong> <code>node.left = ++cnt</code>；<br/>
        • 右孩子同理：<code>node.right = ++cnt</code>；<br/>
        • 未被查询或修改触及的大片荒芜区间永远保持空指针，零内存浪费！<br/>
        3. <strong>空间复杂度飞跃</strong>：<br/>
        单次区间操作最多经过 $\\log C$ 层（$C = 10^9$ 时 $\\log C \\approx 30$），每次操作最多新开辟 $O(\\log C)$ 个节点；$M$ 次操作总空间严格被约束在 <strong>O(M log C)</strong>，完美秒杀超大值域在线难题！
      `,
      initialStateText: `动态开点初始化：值域 [1, 10^9]，根节点 root=1，cnt=1，惰性按需开辟子节点。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点指针定义 (Null Sentinel)',
        valuesStr: 'node.left == 0 || node.right == 0 ➔ 尚未开辟物理子节点，代表该区间未发生异动',
      },
      {
        prefix: '└───',
        label: '按需开点原子操作 (Allocation Invariant)',
        valuesStr: 'if (tree[cur].left == 0) tree[cur].left = ++cnt;',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 沿途下潜与按需开辟节点 (Dynamic Allocation on Demand)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(log C) Alloc</span>',
      detailLines: [
        'mid = l + ((r - l) >> 1);',
        'if (tree[cur].left == 0) tree[cur].left = ++cnt;',
        'if (tree[cur].right == 0) tree[cur].right = ++cnt;',
        '仅在任务必须深入子树时瞬间实例化，避免无意义预分配',
      ],
      fillLine: '按需萌芽：只有受区间修改影响的树枝才会生长，未访问区域保持虚空',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 动态下传懒惰标记 (Dynamic PushDown)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Lazy Tag</span>',
      detailLines: [
        'void pushDown(cur, l, r):',
        'if (tree[cur].lazy != 0) {',
        '  ensureChildren(cur); // 确保左右孩子存在',
        '  tree[lc].lazy += lazy; tree[lc].sum += lazy * ln;',
        '  tree[rc].lazy += lazy; tree[rc].sum += lazy * rn;',
        '  tree[cur].lazy = 0;',
        '}',
      ],
      fillLine: '惰性下传：懒标记下发前自动触发子节点开辟，保证欠账不遗失',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 大值域稀疏求和与查询 (Sparse Range Query)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(log C) Query</span>',
      detailLines: [
        'if (cur == 0) return 0; // 未开辟节点区间和天然为 0，直接短路剪枝',
        'if (ql <= l && r <= qr) return tree[cur].sum;',
      ],
      fillLine: '天然剪枝：凡是未开点的空分支直接返回 0，查询速度极大提升',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '动态开点线段树全景推演流 (On-Demand Allocation ➔ PushDown ➔ Pruned Query)',
      subtitle: 'Luogu P2781 & Zuoshen Class 111 Dynamic Segment Tree',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return rangeSum; // 超大坐标值域下的精确区间和',
      answerDescription: '时间复杂度 O(log C)，空间复杂度由 O(C) 暴降至严格 O(M log C)，支持在线实时操作。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
