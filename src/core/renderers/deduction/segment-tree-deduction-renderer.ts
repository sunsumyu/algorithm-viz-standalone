/**
 * 经典线段树与懒标记 (Segment Tree with Lazy Tag · 洛谷 P3372 / Class 110)
 * 全景推演树渲染策略 (SegmentTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SegmentTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'segment-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'segment-tree' ||
      modelId === 'segment-tree-110' ||
      modelId === 'class110-code01' ||
      modelId === 'segment-tree-lazy' ||
      modelId === 'p3372'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P3372. 经典线段树与区间懒标记 (Segment Tree) · 全景推演树',
      badge: '左程云 Class 110 · 完全二叉树静态 4N 数组 / 懒标记 (Lazy Tag) 延迟下传 / 区间增改查 O(log N)',
      descriptionHtml: `
        核心目标：给定长度为 <code>N</code> 的序列，支持任意区间 <code>[ql, qr]</code> 的批量增加值，以及任意区间 <code>[ql, qr]</code> 的区间和高速查询。<br/>
        <strong>左程云算法体系教学核心——线段树完全二叉树与懒惰标记（Lazy Tag）公理：</strong><br/>
        1. <strong>4N 静态数组完全二叉树架构</strong>：<br/>
        对于长度为 $N$ 的数组，其线段树节点最多不超过 $4N$ 个！用连续静态数组 <code>sum[4N]</code> 与 <code>lazy[4N]</code> 管理完全二叉树：<br/>
        • 节点 <code>rt</code> 的左孩子：<code>rt << 1</code>（<code>2 * rt</code>），管理区间 <code>[l, mid]</code>；<br/>
        • 节点 <code>rt</code> 的右孩子：<code>rt << 1 | 1</code>（<code>2 * rt + 1</code>），管理区间 <code>[mid + 1, r]</code>。<br/>
        2. <strong>懒惰标记（Lazy Tag）核心破局点</strong>：<br/>
        若每次区间修改都递归渗透到底层叶子，单次修改耗时退化为 $O(N)$；<br/>
        <strong>懒惰公理</strong>：当任务修改区间 <code>[ql, qr]</code> <strong>全包围</strong>当前节点管辖区间 <code>[l, r]</code> 时（即 <code>ql <= l && r <= qr</code>），<strong>立即停止向下渗透</strong>！<br/>
        • 仅更新当前节点的区间和：<code>sum[rt] += v * (r - l + 1)</code>；<br/>
        • 给当前节点打上懒惰欠账标记：<code>lazy[rt] += v</code> 并直接 <code>return</code>！<br/>
        3. <strong>向下下传任务（pushDown）</strong>：<br/>
        仅当后续有更细粒度的查询或修改穿透必须访问子节点时，才将当前节点的 <code>lazy[rt]</code> 欠账顺手下传分发给左右孩子，并清空当前标记！实现严格均摊 <strong>O(log N)</strong>！
      `,
      initialStateText: `线段树初始化：数组规模 4N，自底向上 build 建树，懒标记 lazy 初始化为 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '全包围拦截基准 (Full Coverage Base)',
        valuesStr: 'ql <= l && r <= qr ➔ sum[rt] += v * len, lazy[rt] += v, return (截断不向下走)',
      },
      {
        prefix: '└───',
        label: '单叶子建树基准 (Single Leaf Base)',
        valuesStr: 'l == r ➔ sum[rt] = arr[l], return (递归树底点)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 静态数组自底向上构建线段树 (Build & PushUp)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(N) Build</span>',
      detailLines: [
        'mid = (l + r) >> 1;',
        'build(l, mid, rt << 1); build(mid + 1, r, rt << 1 | 1);',
        'pushUp(rt): sum[rt] = sum[rt << 1] + sum[rt << 1 | 1];',
      ],
      fillLine: '后序汇总：左右子树建好后，父节点合并左右孩子区间和',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 懒惰标记拦截与下传机制 (Lazy Tag & PushDown)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(log N) Update</span>',
      detailLines: [
        'void pushDown(rt, ln, rn):',
        'if (lazy[rt] != 0) {',
        '  lazy[rt << 1] += lazy[rt]; sum[rt << 1] += lazy[rt] * ln;',
        '  lazy[rt << 1 | 1] += lazy[rt]; sum[rt << 1 | 1] += lazy[rt] * rn;',
        '  lazy[rt] = 0; // 下传后清空当前层标记',
        '}',
      ],
      fillLine: '惰性下传：不查不用不下发，每次最多访问 4 条树链，区间修改降至 O(log N)',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 区间分裂查询与结果归约 (Range Query)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(log N) Query</span>',
      detailLines: [
        'if (ql <= l && r <= qr) return sum[rt]; // 全包围直接返回',
        'pushDown(rt, mid - l + 1, r - mid); // 裂变前必先下传',
        'ans = 0; if (ql <= mid) ans += query(ql, qr, l, mid, rt << 1);',
        'if (qr > mid) ans += query(ql, qr, mid + 1, r, rt << 1 | 1);',
      ],
      fillLine: '分治聚类：跨中点区间拆分为左区间与右区间，二分汇聚',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '线段树区间修改与查询全景推演流 (Build ➔ Lazy Intercept ➔ PushDown ➔ Query)',
      subtitle: 'Luogu P3372 & Zuoshen Class 110 Segment Tree Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return rangeSum; // 目标区间 [ql, qr] 的最新累加和',
      answerDescription: '区间修改与区间查询时间复杂度均严格为 O(log N)，完全二叉树静态空间为 O(4N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
