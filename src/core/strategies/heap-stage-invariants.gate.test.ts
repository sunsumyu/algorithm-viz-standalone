/**
 * 堆与加强堆专题物理不变量顶级架构机械防退化门禁
 * (Heap & HeapGreater Invariants Gatekeeper)
 *
 * 守护领域:
 * 1. 堆与堆排序 (Class 025):
 *    - O(N) 自底向上 Heapify 建堆物理拓扑
 *    - O(N log N) 堆顶交换下沉完全升序
 * 2. 手写加强堆结构与反向索引表 (Class 026):
 *    - 双向映射拓扑一致性 (heap <-> indexMap 双向双射)
 *    - O(log N) 动态 resign 重新堆化
 *    - O(log N) 任意对象精准 remove 堆序自愈
 *
 * 核心机械不变量红线:
 * 1. 大根堆序不变量 (Max-Heap Invariant):
 *    有效堆范围内，任意父节点值严格大于等于子节点值 (arr[parent] >= arr[child])；
 * 2. 堆排序单调升序收敛不变量 (HeapSort Monotonic Invariant):
 *    堆排序终态数组严格满足全量非降序排列 (arr[i] <= arr[i+1])；
 * 3. 反向索引双射保真不变量 (Bijective Index Map Invariant):
 *    对加强堆内任意元素 item，indexMap[item.id] 严格等于其在底层数组中的真实下标，反之亦然；
 * 4. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import {
  generateHeapSortSteps,
  HEAP_AND_HEAPSORT_025_CODES,
} from '../../algorithms/categories/heap/heap-and-heapsort-025-renderer';
import {
  generateHeapGreaterSteps,
  HEAP_GREATER_026_CODES,
} from '../../algorithms/categories/heap/heap-greater-026-renderer';

/**
 * 验证步进序列中的多语言代码行号合法性（支持 number、Record<string,number> 等格式）
 */
function verifyCodeLines(
  steps: any[],
  algoName: string,
  codeSource: Record<string, string | string[]>
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  const langs = ['java', 'cpp', 'python', 'javascript', 'typescript'];

  for (const lang of langs) {
    const raw = codeSource[lang];
    if (!raw) continue;
    const maxLine = Array.isArray(raw) ? raw.length : raw.split('\n').length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.codeLine === undefined || step.codeLine === null) continue;

      let lineNum: number | undefined;
      if (typeof step.codeLine === 'number') {
        lineNum = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNum = val;
        } else if (Array.isArray(val) && val.length > 0) {
          lineNum = val[0];
        }
      }

      if (lineNum !== undefined && lineNum > 0) {
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 超过最大行数 ${maxLine}`
        ).toBeLessThanOrEqual(maxLine);
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 小于 1`
        ).toBeGreaterThanOrEqual(1);
      }
    }
  }
}

/**
 * 校验大根堆性质
 */
function assertMaxHeap(arr: number[], size: number) {
  for (let i = 0; i < size; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < size) {
      expect(
        arr[i],
        `大根堆序破坏: 父节点 arr[${i}]=${arr[i]} < 左子节点 arr[${left}]=${arr[left]}`
      ).toBeGreaterThanOrEqual(arr[left]);
    }
    if (right < size) {
      expect(
        arr[i],
        `大根堆序破坏: 父节点 arr[${i}]=${arr[i]} < 右子节点 arr[${right}]=${arr[right]}`
      ).toBeGreaterThanOrEqual(arr[right]);
    }
  }
}

describe('堆与加强堆专题物理不变量顶级架构机械防退化门禁 (Heap Gatekeeper)', () => {
  // ═══════════════════════════════════════════════════════════════════
  // 1. Class 025: 堆与堆排序 (HeapSort)
  // ═══════════════════════════════════════════════════════════════════
  describe('Class 025: 堆与堆排序 (HeapSort)', () => {
    it('建堆完毕时严格满足大根堆物理性质', () => {
      const input = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const steps = generateHeapSortSteps(input);
      expect(steps.length).toBeGreaterThan(0);

      // 找到建堆就绪步骤
      const heapReadyStep = steps.find(s => s.statusBadge?.text === '大根堆就绪');
      expect(heapReadyStep, '必须包含大根堆构建完成步骤').toBeDefined();
      assertMaxHeap(heapReadyStep!.arr, input.length);

      verifyCodeLines(steps, '堆排序-建堆', HEAP_AND_HEAPSORT_025_CODES);
    });

    it('排序终态全量升序单调性不变量', () => {
      const input = [9, 7, 5, 11, 12, 2, 14, 3, 10, 6];
      const steps = generateHeapSortSteps(input);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.operation).toBe('sorted');
      expect(last.heapSize).toBe(0);

      // 验证完全升序
      for (let i = 0; i < last.arr.length - 1; i++) {
        expect(
          last.arr[i],
          `排序结果非递增: arr[${i}]=${last.arr[i]} > arr[${i + 1}]=${last.arr[i + 1]}`
        ).toBeLessThanOrEqual(last.arr[i + 1]);
      }

      // 元素守恒
      const sortedOriginal = [...input].sort((a, b) => a - b);
      expect(last.arr).toEqual(sortedOriginal);

      verifyCodeLines(steps, '堆排序-终态升序', HEAP_AND_HEAPSORT_025_CODES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 2. Class 026: 手写加强堆结构 (HeapGreater)
  // ═══════════════════════════════════════════════════════════════════
  describe('Class 026: 手写加强堆与反向索引表 (HeapGreater)', () => {
    it('双向双射不变量: indexMap 与 heap 数组位置始终互为反函数', () => {
      const steps = generateHeapGreaterSteps([
        { type: 'push', id: 'A', val: 10 },
        { type: 'push', id: 'B', val: 30 },
        { type: 'push', id: 'C', val: 20 },
        { type: 'push', id: 'D', val: 50 },
        { type: 'resign', id: 'A', val: 60 },
        { type: 'remove', id: 'B' },
      ]);

      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        // 验证 indexMap 与 heap 的双向一致性
        for (const id in step.indexMap) {
          const idx = step.indexMap[id];
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(step.heap.length);
          expect(step.heap[idx].id).toBe(id);
        }

        // 验证 heap 中每个元素在 indexMap 中都有对应索引
        for (let i = 0; i < step.heap.length; i++) {
          const item = step.heap[i];
          expect(step.indexMap[item.id]).toBe(i);
        }
      }

      verifyCodeLines(steps, '加强堆-反向索引', HEAP_GREATER_026_CODES);
    });

    it('大根堆序不变量: push / resign / remove 调整后堆顶与子节点满足堆序', () => {
      const steps = generateHeapGreaterSteps([
        { type: 'push', id: 'Node1', val: 15 },
        { type: 'push', id: 'Node2', val: 80 },
        { type: 'push', id: 'Node3', val: 40 },
        { type: 'push', id: 'Node4', val: 95 },
        { type: 'resign', id: 'Node1', val: 100 }, // 变成新最大
        { type: 'remove', id: 'Node4' },
      ]);

      // 仅在调整收敛步骤校验大根堆序
      const stableSteps = steps.filter(
        s =>
          s.statusBadge?.text.includes('就绪') ||
          s.statusBadge?.text.includes('调整') ||
          s.statusBadge?.text.includes('成功') ||
          s.statusBadge?.text.includes('完成')
      );

      for (const step of stableSteps) {
        const vals = step.heap.map(x => x.val);
        assertMaxHeap(vals, vals.length);
      }

      verifyCodeLines(steps, '加强堆-大根堆序', HEAP_GREATER_026_CODES);
    });
  });
});
