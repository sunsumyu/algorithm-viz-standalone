/**
 * 权值线段树与单点更新 (Value Segment Tree · 洛谷 P3369 / P1138 / Class 112)
 * 全景推演树渲染策略 (ValueSegmentTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ValueSegmentTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'value-segment-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'value-segment-tree' ||
      modelId === 'value-segment-tree-112' ||
      modelId === 'class112-code01' ||
      modelId === 'kth-smallest-seg-tree' ||
      modelId === 'p1138' ||
      modelId === 'p3369'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P3369 / P1138. 权值线段树与动态第 K 小 (Value Segment Tree) · 全景推演树',
      badge: '左程云 Class 112 · 值域区间二分统计 / 节点记录出现频次 count / 左右子树计数分流 O(log V)',
      descriptionHtml: `
        核心目标：给定一个动态集合，支持实时插入数字 <code>add(x)</code>、删除数字 <code>remove(x)</code>，并在 <strong>O(log V)</strong> 内查询当前集合中<strong>第 K 小的数（或第 K 大的数）</strong>。<br/>
        <strong>左程云算法体系教学核心——权值线段树与二叉搜索分流机制：</strong><br/>
        1. <strong>普通线段树 vs 权值线段树的根本区别</strong>：<br/>
        • 普通线段树维护的是<strong>序列下标</strong>区间 $[1 .. N]$；<br/>
        • 权值线段树维护的是<strong>数据值域</strong>区间 $[V_{min} .. V_{max}]$！<br/>
        • 节点 <code>count[rt]</code> 记录：当前值域区间内<strong>一共有多少个数值落入其中</strong>（桶频次之和）。<br/>
        2. <strong>查询第 K 小数值的树上二分导向公理</strong>：<br/>
        对于当前节点 <code>rt</code>（管辖值域 $[l, r]$，中点 $mid$）：<br/>
        • 其左孩子管辖较小半区 $[l, mid]$，包含元素个数为 <code>leftCount = count[rt << 1]</code>；<br/>
        • <strong>决策判定 1</strong>：若 $K \\le \\text{leftCount}$，说明第 $K$ 小的数字<strong>必定藏在左子树的值域内</strong>！直接递归转向左子树查找第 $K$ 小：<code>query(rt << 1, l, mid, K)</code>；<br/>
        • <strong>决策判定 2</strong>：若 $K > \\text{leftCount}$，说明第 $K$ 小的数字<strong>落在右子树值域内</strong>！并且它在右子树的局部排名为：<strong>$K - \\text{leftCount}$</strong>！直接转向右子树查找：<code>query(rt << 1 | 1, mid + 1, r, K - leftCount)</code>！<br/>
        3. <strong>复杂度与平衡树等价替代</strong>：<br/>
        当递归触碰到叶子节点 $l == r$ 时，当前数值 $l$ 即为全局第 $K$ 小！树高恒为 $\\log V$，无需复杂旋转即可实现平衡二叉树的核心功能！
      `,
      initialStateText: `权值线段树初始化：值域 [1 .. V]，初始 count 数组清零，支持动态插入与二分分流。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '叶子数值锁定基准 (Leaf Base l == r)',
        valuesStr: 'l == r ➔ 当前叶节点对应数值 l 即为所求第 K 小元素，直接 return l',
      },
      {
        prefix: '└───',
        label: '右子树名次衰减不变式 (Rank Attenuation Invariant)',
        valuesStr: '转向右子树时名次扣减: newK = K - leftCount',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 单点权值插入与沿途频次累加 (Value Point Add)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(log V) Add</span>',
      detailLines: [
        'add(x): 二分下潜至包含 x 的叶子节点，count[leaf]++',
        '回溯每一层父节点：count[rt] = count[rt << 1] + count[rt << 1 | 1];',
      ],
      fillLine: '频次上浮：每个数值落入对应的桶中，祖先节点记录区间内的元素总频次',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 树上二分分流检索第 K 小 (Kth Query Binary Navigation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(log V) Query</span>',
      detailLines: [
        'int leftCount = count[rt << 1];',
        'if (k <= leftCount) return query(rt << 1, l, mid, k);',
        'else return query(rt << 1 | 1, mid + 1, r, k - leftCount);',
      ],
      fillLine: '确定性分流：比较 K 与左子树大小，每次排除一半值域，单向直击目标数值',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 离散化与动态开点高阶进阶 (Rank Compression / Dynamic Node)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Advanced</span>',
      detailLines: [
        '若值域达 10^9：结合动态开点，空间降至 O(N log V)',
        '若离线预知所有数：先离散化 rank 映射，值域直接收缩至 [1 .. N]',
      ],
      fillLine: '替代平衡树：代码量远小于红黑树、Splay 或 Treap，常数极度稳定',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '权值线段树动态第 K 小推演流 (Value Bucket ➔ Frequency PushUp ➔ Binary Kth Search)',
      subtitle: 'Luogu P3369/P1138 & Zuoshen Class 112 Value Segment Tree',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return kthValue; // 当前集合中排名严格第 K 位的元素值',
      answerDescription: '插入与第 K 小查询时间复杂度均为严格 O(log V)，结构简洁，扩展性极强。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
