/**
 * 数据流的中位数 (Find Median from Data Stream · LeetCode 295 / Class 042)
 * 全景推演树渲染策略 (HeapMedianStreamDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class HeapMedianStreamDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'heap-median-stream';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'heap-median-stream' ||
      modelId === 'heap-median-stream-042' ||
      modelId === '295' ||
      modelId === 'leetcode-295' ||
      modelId === 'find-median-from-data-stream' ||
      modelId === 'dual-heap' ||
      modelId === 'class042-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 295. 数据流的中位数 (Find Median from Data Stream) · 全景推演树',
      badge: '左程云 Class 042 · 对顶堆双堆平衡 / 大根堆存小半区 / 小根堆存大半区 / O(1) 瞬时查询',
      descriptionHtml: `
        目标：设计一个支持 <code>addNum(num)</code> 从数据流添加整数、并在 <code>findMedian()</code> 中瞬时返回当前所有元素中位数的数据结构。<br/>
        <strong>左程云算法体系教学核心——对顶双堆物理平衡机制：</strong><br/>
        1. <strong>对顶双堆结构划分公理</strong>：<br/>
        • <strong>大根堆 <code>maxHeap</code></strong>：维护数据流中<strong>较小的一半元素</strong>，堆顶是较小半区的最大值；<br/>
        • <strong>小根堆 <code>minHeap</code></strong>：维护数据流中<strong>较大的一半元素</strong>，堆顶是较大半区的最小值；<br/>
        • 保证不变式：对于任意时刻，<code>maxHeap.peek() <= minHeap.peek()</code>。<br/>
        2. <strong>元素分流入堆决策</strong>：<br/>
        • 若 <code>maxHeap</code> 为空或 <code>num <= maxHeap.peek()</code>，元素应归入较小半区，放入 <code>maxHeap</code>；<br/>
        • 否则，元素归入较大半区，放入 <code>minHeap</code>。<br/>
        3. <strong>动态容量平衡维护（size 相差 <= 1）</strong>：<br/>
        • 若 <code>maxHeap.size() - minHeap.size() > 1</code>：大根堆元素过多，将 <code>maxHeap.poll()</code> 弹入 <code>minHeap</code>；<br/>
        • 若 <code>minHeap.size() - maxHeap.size() > 1</code>：小根堆元素过多，将 <code>minHeap.poll()</code> 弹入 <code>maxHeap</code>；<br/>
        4. <strong>中位数 O(1) 瞬时求解</strong>：<br/>
        • 若两堆元素总数为奇数：较多元素的堆顶即为严格中位数！<br/>
        • 若两堆元素总数为偶数：中位数为两堆堆顶均值 <code>(maxHeap.peek() + minHeap.peek()) / 2.0</code>！
      `,
      initialStateText: `对顶堆初始化：maxHeap (大根堆) 与 minHeap (小根堆) 就绪，容量平衡 invariant: |size1 - size2| <= 1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '对顶相对有序不变式 (Cross Heap Invariant)',
        valuesStr: 'maxHeap.peek() <= minHeap.peek() (小半区最大值 <= 大半区最小值)',
      },
      {
        prefix: '└───',
        label: '双堆规模平衡不变式 (Size Balance Invariant)',
        valuesStr: 'Math.abs(maxHeap.size() - minHeap.size()) <= 1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 数据流元素判定与分流下发 (Add Number & Routing)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(log N) Route</span>',
      detailLines: [
        'if (maxHeap.isEmpty() || num <= maxHeap.peek()) maxHeap.offer(num);',
        'else minHeap.offer(num);',
        '依据当前中位数锚点，把新元素分流进左半区或右半区',
      ],
      fillLine: '按值分区：大根堆承载较小半区，小根堆承载较大半区',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 跨堆弹出再平衡 (Rebalancing Cross-Heap)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Rebalance</span>',
      detailLines: [
        'if (maxHeap.size() - minHeap.size() > 1) minHeap.offer(maxHeap.poll());',
        'if (minHeap.size() - maxHeap.size() > 1) maxHeap.offer(minHeap.poll());',
      ],
      fillLine: '维持天平：最多单次弹出交换，迅速将堆规模差值约束在 1 以内',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 堆顶 O(1) 瞬时查询中位数 (Instant Median Retrieval)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(1) Query</span>',
      detailLines: [
        'if (maxHeap.size() == minHeap.size()) return (maxHeap.peek() + minHeap.peek()) / 2.0;',
        'return maxHeap.size() > minHeap.size() ? maxHeap.peek() : minHeap.peek();',
      ],
      fillLine: '秒杀查询：中位数恰好被夹在两个堆顶之间，完全无需排序',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '对顶堆数据流中位数推演流 (Routing ➔ Rebalancing ➔ O(1) Median)',
      subtitle: 'LeetCode 295 & Zuoshen Class 042 Dual-Heap Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return median; // 当前数据流的动态中位数',
      answerDescription: '添加单个数字时间复杂度 O(log N)，查询中位数时间复杂度 O(1)，空间复杂度严格 O(N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
