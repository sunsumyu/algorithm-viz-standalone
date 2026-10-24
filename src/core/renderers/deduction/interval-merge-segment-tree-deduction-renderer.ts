/**
 * 区间合并线段树 (Interval Merge Segment Tree · 洛谷 P4513 / GSS1 / Class 113)
 * 全景推演树渲染策略 (IntervalMergeSegmentTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class IntervalMergeSegmentTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'interval-merge-segment-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'interval-merge-segment-tree' ||
      modelId === 'interval-merge-segment-tree-113' ||
      modelId === 'class113-code01' ||
      modelId === 'max-subarray-sum-seg-tree' ||
      modelId === 'p4513' ||
      modelId === 'gss1'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P4513. 区间最大子段和线段树 (Interval Merge Segment Tree) · 全景推演树',
      badge: '左程云 Class 113 / SPOJ GSS1 · 四元组 (sum, lmax, rmax, max) 规约 / 跨中点拼接定理 / 单点修改与区间查询 O(log N)',
      descriptionHtml: `
        核心目标：给定包含正负数的序列，支持单点修改，并能以 <strong>O(log N)</strong> 查询任意指定区间 <code>[L, R]</code> 内的<strong>最大连续子段和</strong>。<br/>
        <strong>左程云算法体系教学核心——线段树四元组合并公理：</strong><br/>
        1. <strong>信息不封闭痛点与四元组破局</strong>：<br/>
        单纯记录区间的最大连续和 <code>max</code> 无法合并左右孩子，因为最大连续子段可能横跨左右子树！<br/>
        每个线段树节点必须完备维护四个关键状态：<br/>
        • <code>sum</code>：当前区间的<strong>总和</strong>；<br/>
        • <code>lmax</code>：必须以<strong>左端点为起点的最大前缀和</strong>；<br/>
        • <code>rmax</code>：必须以<strong>右端点为终点的最大后缀和</strong>；<br/>
        • <code>max</code>：当前区间内的<strong>全局最大连续子段和</strong>。<br/>
        2. <strong>合并状态转移公理（pushUp）</strong>：<br/>
        当左孩子 <code>lc</code> 与右孩子 <code>rc</code> 信息就绪时，父节点 <code>rt</code> 的四元组闭式推导如下：<br/>
        • <code>sum = lc.sum + rc.sum</code>；<br/>
        • <code>lmax = Math.max(lc.lmax, lc.sum + rc.lmax)</code>（左孩子前缀 vs 左孩子全拿并拼接右孩子前缀）；<br/>
        • <code>rmax = Math.max(rc.rmax, rc.sum + lc.rmax)</code>（右孩子后缀 vs 右孩子全拿并拼接左孩子后缀）；<br/>
        • <code>max = Math.max(lc.max, rc.max, lc.rmax + rc.lmax)</code>（完全在左树内、完全在右树内、或<strong>跨越中点横跨左右</strong>）！
      `,
      initialStateText: `四元组线段树初始化：叶节点初值 sum=lmax=rmax=max=val，自底向上递归建树。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单点叶节点基准 (Leaf Base L == R)',
        valuesStr: 'sum = lmax = rmax = max = arr[L]',
      },
      {
        prefix: '└───',
        label: '跨越中点拼接不变式 (Cross-Boundary Invariant)',
        valuesStr: 'crossMax = lc.rmax + rc.lmax (左最大后缀 + 右最大前缀)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 节点四元组信息装配与向上推送 (PushUp Merger)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">PushUp O(1)</span>',
      detailLines: [
        'rt.sum = lc.sum + rc.sum;',
        'rt.lmax = max(lc.lmax, lc.sum + rc.lmax);',
        'rt.rmax = max(rc.rmax, rc.sum + lc.rmax);',
        'rt.max = max(lc.max, rc.max, lc.rmax + rc.lmax);',
      ],
      fillLine: '完全代数结构：四个状态互为依存，自底向上自然闭环合并',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 单点修改与沿途回溯重平衡 (Point Update)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(log N) Update</span>',
      detailLines: [
        'update(x, v): 二分逼近至目标叶子节点，重置四元组为 v',
        '回溯路径上每一层父节点重新执行 pushUp 向上归约',
      ],
      fillLine: '局部修改：仅耗费 O(log N) 时间更新一条树链，全树四元组秩序立即恢复',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 任意区间 [L, R] 临时分治合并查询 (Segment Merge Query)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(log N) Query</span>',
      detailLines: [
        '若 [L, R] 跨越中点：分别递归查询左子树区间与右子树区间',
        '将返回的两个临时 Node 像普通 pushUp 一样进行四元组合并！',
        '最终返回临时合成 Node 的 max 属性！',
      ],
      fillLine: '虚拟合成：利用分治产生的临时子段四元组瞬时拼出跨区间答案',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '区间合并线段树推演流 (Leaf Quad ➔ PushUp Merger ➔ Cross-Mid Query)',
      subtitle: 'Luogu P4513 & Zuoshen Class 113 Interval Merge Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return queryNode.max; // 目标区间 [L, R] 的最大连续子段和',
      answerDescription: '单点修改与任意区间最大子段和查询均严格在 O(log N) 内完成，彻底颠覆暴力 O(N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
