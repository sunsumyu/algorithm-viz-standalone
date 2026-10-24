/**
 * 手动实现加强堆 (Heap Greater · Class 041)
 * 全景推演树渲染策略 (HeapGreaterDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class HeapGreaterDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'heap-greater';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'heap-greater' ||
      modelId === 'heap-greater-041' ||
      modelId === 'heap-greater-026' ||
      modelId === 'class026' ||
      modelId === 'class026-code01' ||
      modelId === 'class041-code01' ||
      modelId === 'indexed-priority-queue'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 041. 手动实现加强堆 (Heap Greater) · 全景推演树',
      badge: '反向索引表 Index Map / 动态修改 resign O(log N) / 任意指定对象删除 remove O(log N)',
      descriptionHtml: `
        核心目标：系统默认的堆（如 Java <code>PriorityQueue</code> 或 C++ <code>std::priority_queue</code>）仅支持对堆顶的查询与弹出，一旦内部元素的值被外界动态修改，或者业务需要删除堆内某个特定对象时，系统堆必须以 <code>O(N)</code> 遍历全堆！<br/>
        <strong>左程云算法体系教学核心——反向索引表实现 O(log N) 动态操作：</strong><br/>
        1. <strong>反向索引表核心公理（Index Map）</strong>：<br/>
        • 堆数组 <code>heap[i] = obj</code> 记录了位置到对象的正向映射；<br/>
        • 反向索引表 <code>indexMap.put(obj, i)</code> 记录了<strong>每个对象在堆数组中的物理索引</strong>；<br/>
        • <strong>神级交换规范（swap）</strong>：堆中任何两元素发生交换时，必须强制同步更新 <code>indexMap</code> 中两者的索引值！保证物理位置与反向表时刻 100% 同构！<br/>
        2. <strong>动态重调 resign(obj) —— 仅耗时 O(log N)</strong>：<br/>
        当外部业务将 <code>obj</code> 的关键权值修改后：<br/>
        • 通过 <code>indexMap.get(obj)</code> 在 <code>O(1)</code> 内精确锁定其在堆中的当前下标 <code>index</code>；<br/>
        • 依次执行 <code>heapInsert(index)</code>（尝试向上浮）与 <code>heapify(index, heapSize)</code>（尝试向下沉）；<br/>
        • 无论变大还是变小，两者必有一个触发执行，在严格 <strong>O(log N)</strong> 时间内完成重平衡！<br/>
        3. <strong>任意指定对象删除 remove(obj) —— 仅耗时 O(log N)</strong>：<br/>
        • 查出 <code>obj</code> 当前下标 <code>i</code>；<br/>
        • 将堆最后一个有效元素与 <code>i</code> 位置元素交换，并将 <code>obj</code> 从 <code>indexMap</code> 中注销；<br/>
        • <code>heapSize--</code>，对新位于 <code>i</code> 位置的元素执行 <code>resign</code>，总耗时同样仅为 <strong>O(log N)</strong>！
      `,
      initialStateText: `加强堆初始化：heap 数组与 indexMap 同构绑定，支持 O(1) 寻址与 O(log N) 动态重排。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '反向索引双向同步公理 (Bidirectional Mapping Invariant)',
        valuesStr: 'indexMap.get(heap[i]) === i 且 heap[indexMap.get(obj)] === obj',
      },
      {
        prefix: '└───',
        label: '注销清空标记 (Tombstone Sentinel)',
        valuesStr: 'indexMap.put(obj, -1) 或 indexMap.remove(obj) ➔ 标记对象已从堆中移除',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 底层换位拦截与反向索引同步 (Custom Swap)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(1) Swap</span>',
      detailLines: [
        'void swap(int i, int j) {',
        '  T o1 = heap[i], o2 = heap[j];',
        '  heap[i] = o2; heap[j] = o1;',
        '  indexMap.put(o1, j); indexMap.put(o2, i); // 换位双向更新反向表',
        '}',
      ],
      fillLine: '同步心法：所有上浮 heapInsert 与下沉 heapify 统一调用此 swap，索引表绝不失效',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 动态修改与原地重调 (Resign Modified Object)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(log N) Resign</span>',
      detailLines: [
        'int i = indexMap.get(obj); // O(1) 秒杀定位',
        'heapInsert(i); // 权值增大时上浮',
        'heapify(i, heapSize); // 权值减小时下沉',
      ],
      fillLine: '精准制导：不再需要扫描整个堆，直接从发生异动的节点就地做树上调整',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 任意元素快速注销删除 (Arbitrary Remove)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(log N) Remove</span>',
      detailLines: [
        'int i = indexMap.get(obj); T replace = heap[--heapSize];',
        'indexMap.remove(obj);',
        'if (obj != replace) { heap[i] = replace; indexMap.put(replace, i); resign(replace); }',
      ],
      fillLine: '末位顶替法：与堆末尾交换后直接截断堆，并对换上来的替补元素做局部重调',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '加强堆反向表驱动全景推演流 (Bidirectional Swap ➔ O(1) Locate ➔ O(log N) Resign/Remove)',
      subtitle: 'Zuoshen Class 041 Heap Greater Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return heapGreater; // 具备 O(log N) 动态重排与删除能力的终极加强堆',
      answerDescription: '大幅优化 Dijkstra 算法 (O((V+E) log V))、贪心调度与动态排名业务场景。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
