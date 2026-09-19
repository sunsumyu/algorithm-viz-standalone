/**
 * 高级树结构、堆与树形算法门禁矩阵 (Tree Advanced Stage Invariants Gatekeeper)
 *
 * 覆盖算法清单:
 *  1. 左神 Class 039: 比较器与自定义优先级队列 (Comparator & Priority Queue)
 *  2. 左神 Class 040: 大根堆构建与堆排序 (Heap Sort)
 *  3. 左神 Class 041: 手动实现反向索引加强堆 (Heap Greater)
 *  4. 左神 Class 042: 双堆对顶与数据流中位数 (Median Stream)
 *  5. LeetCode 652: 寻找重复子树 (Find Duplicate Subtrees)
 *  6. LeetCode 1373 / 333: 二叉搜索子树的最大键值和 (Max Sum BST Subtree)
 *  7. 左神 Class 040: 折纸凹凸折痕中序推演 (Paper Folding)
 *
 * 核心黄金规约:
 *  1. Step 0 入口语义守恒与初始状态完备契约
 *  2. 堆与树形 DP 状态转换、信息收集与单调性不变量
 *  3. 多语种代码高亮物理行号 [1, totalLines] 强类型边界不变量
 */

import { describe, it, expect } from 'vitest';
import { buildComparator039Steps } from '../../algorithms/categories/tree/heap-039-042/comparator-priority-queue-039-renderer';
import { buildHeapSort040Steps } from '../../algorithms/categories/tree/heap-039-042/heap-sort-040-renderer';
import { buildHeapGreater041Steps } from '../../algorithms/categories/tree/heap-039-042/heap-greater-041-renderer';
import { buildMedianStream042Steps } from '../../algorithms/categories/tree/heap-039-042/heap-median-stream-042-renderer';
import {
  COMPARATOR_PRIORITY_QUEUE_039_CODES,
  HEAP_SORT_040_CODES,
  HEAP_GREATER_041_CODES,
  HEAP_MEDIAN_STREAM_042_CODES,
} from '../../algorithms/categories/tree/heap-039-042/heap-039-042-stage-codes';
import {
  buildDuplicateSubtreesSteps,
  FIND_DUPLICATE_SUBTREES_CODES,
} from '../../algorithms/categories/tree/find-duplicate-subtrees-renderer';
import {
  buildMaxSumBstSteps,
  MAX_SUM_BST_CODES,
} from '../../algorithms/categories/tree/max-sum-bst-036-renderer';
import {
  buildPaperFoldingSteps,
  PAPER_FOLDING_CODES,
} from '../../algorithms/categories/tree/paper-folding-040-renderer';

function assertCodeLineWithinBounds(
  codeLine: any,
  codes: Record<string, string[] | string>,
  stepDesc: string
) {
  if (!codeLine) return;

  for (const [lang, rawCode] of Object.entries(codes)) {
    const lines = Array.isArray(rawCode)
      ? rawCode
      : typeof rawCode === 'string'
      ? rawCode.split('\n')
      : [];
    const lineCount = lines.length;
    if (lineCount === 0) continue;

    if (typeof codeLine === 'number') {
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} exceeds ${lang} line count ${lineCount}`
      ).toBeLessThanOrEqual(lineCount);
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} must be >= 1 for ${lang}`
      ).toBeGreaterThanOrEqual(1);
    } else if (Array.isArray(codeLine)) {
      for (const line of codeLine) {
        expect(
          line,
          `${stepDesc}: array codeLine ${line} exceeds ${lang} line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          line,
          `${stepDesc}: array codeLine ${line} must be >= 1 for ${lang}`
        ).toBeGreaterThanOrEqual(1);
      }
    } else if (typeof codeLine === 'object' && codeLine !== null) {
      const target = codeLine[lang];
      if (target != null) {
        if (typeof target === 'number') {
          expect(
            target,
            `${stepDesc}: dict codeLine[${lang}]=${target} exceeds line count ${lineCount}`
          ).toBeLessThanOrEqual(lineCount);
          expect(
            target,
            `${stepDesc}: dict codeLine[${lang}]=${target} must be >= 1`
          ).toBeGreaterThanOrEqual(1);
        } else if (Array.isArray(target)) {
          for (const t of target) {
            expect(
              t,
              `${stepDesc}: dict codeLine[${lang}] array item ${t} exceeds line count ${lineCount}`
            ).toBeLessThanOrEqual(lineCount);
            expect(
              t,
              `${stepDesc}: dict codeLine[${lang}] array item ${t} must be >= 1`
            ).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }
  }
}

describe('Tree Advanced Stage Invariants Gatekeeper (高级树结构、堆与树形算法门禁矩阵)', () => {
  // 1. Class 039: 比较器与自定义优先级队列
  describe('1. Class 039: 比较器与自定义优先级队列', () => {
    it('按优先级降序、ID升序稳定排序，行号严格在多语种模板范围内', () => {
      const steps = buildComparator039Steps();
      expect(steps.length).toBeGreaterThanOrEqual(2);

      const step0 = steps[0];
      expect(step0.tasks).toBeDefined();

      const last = steps[steps.length - 1];
      expect(last.tasks[0].id).toBe(102);
      expect(last.tasks[1].id).toBe(103);
      expect(last.tasks[2].id).toBe(101);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(s.codeLine, COMPARATOR_PRIORITY_QUEUE_039_CODES, `Comparator039 Step ${idx}`);
      });
    });
  });

  // 2. Class 040: 堆排序
  describe('2. Class 040: 堆排序 (Heap Sort)', () => {
    it('就地建立大根堆并最终收敛为完整升序序列', () => {
      const steps = buildHeapSort040Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.sortedArray).toEqual([1, 3, 4, 5, 10]);
      expect(last.heapSize).toBe(0);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(s.codeLine, HEAP_SORT_040_CODES, `HeapSort040 Step ${idx}`);
      });
    });
  });

  // 3. Class 041: 加强堆
  describe('3. Class 041: 手动实现加强堆 (Heap Greater)', () => {
    it('反向索引表正确维护动态位置，resign与remove操作正常收敛', () => {
      const steps = buildHeapGreater041Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.heapArray.length).toBe(2);
      expect(last.indexMap['User_C']).toBe(0);
      expect(last.indexMap['User_B']).toBeUndefined();

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(s.codeLine, HEAP_GREATER_041_CODES, `HeapGreater041 Step ${idx}`);
      });
    });
  });

  // 4. Class 042: 对顶堆数据流中位数
  describe('4. Class 042: 对顶堆与数据流中位数 (Median Stream)', () => {
    it('双堆大小差严格 <= 1，正确平衡并提取动态中位数', () => {
      const steps = buildMedianStream042Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.median).toBe(4);
      expect(Math.abs(last.maxHeap.length - last.minHeap.length)).toBeLessThanOrEqual(1);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(s.codeLine, HEAP_MEDIAN_STREAM_042_CODES, `MedianStream042 Step ${idx}`);
      });
    });
  });

  // 5. LeetCode 652: 寻找重复子树
  describe('5. LeetCode 652: 寻找重复子树 (Find Duplicate Subtrees)', () => {
    it('后序序列化正确捕获结构相同子树，并在二次出现时去重加入结果', () => {
      const steps = buildDuplicateSubtreesSteps();
      expect(steps.length).toBeGreaterThan(0);

      const step0 = steps[0];
      expect(step0.currentNodeId).toBeNull();
      expect(step0.duplicateRoots).toEqual([]);

      const last = steps[steps.length - 1];
      // 拥有重复子树：根为 2 (左 4，右 null) [ID 5 与 2]，以及单独的叶子 4 [ID 7 与 4]
      expect(last.duplicateRoots.length).toBeGreaterThanOrEqual(2);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(s.codeLine, FIND_DUPLICATE_SUBTREES_CODES, `FindDuplicateSubtrees Step ${idx}`);
      });
    });
  });

  // 6. LeetCode 1373: 二叉搜索子树的最大键值和
  describe('6. LeetCode 1373 / 333: 二叉搜索子树的最大键值和 (Max Sum BST Subtree)', () => {
    it('自底向上收集 Info(isBST, min, max, sum)，正确识别局部BST并刷新全局最大和', () => {
      const steps = buildMaxSumBstSteps('classic_lc1373');
      expect(steps.length).toBeGreaterThan(0);

      const step0 = steps[0];
      expect(step0.phase).toBe('enter');
      expect(step0.maxSumGlobal).toBe(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      // 经典用例最大键值和应为 20 (节点 2, 4, 5, 4, 6 构成的 BST)
      expect(last.maxSumGlobal).toBe(20);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(s.codeLine, MAX_SUM_BST_CODES, `MaxSumBST Step ${idx}`);
      });
    });
  });

  // 7. Class 040: 折纸凹凸折痕中序推演
  describe('7. Class 040: 折纸凹凸折痕中序推演 (Paper Folding)', () => {
    it('对折 3 次生成 7 条折痕，中序遍历凹凸序列与 2^n - 1 节点完全守恒', () => {
      const n = 3;
      const steps = buildPaperFoldingSteps(n);
      expect(steps.length).toBeGreaterThan(0);

      const step0 = steps[0];
      expect(step0.creaseList).toEqual([]);
      expect(step0.currentLevel).toBe(1);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('finish');
      expect(last.creaseList.length).toBe(Math.pow(2, n) - 1); // 7

      // 对折3次标准折痕: 凹, 凹, 凸, 凹, 凹, 凸, 凸
      const texts = last.creaseList.map((c) => c.text);
      expect(texts).toEqual(['凹', '凹', '凸', '凹', '凹', '凸', '凸']);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(s.codeLine, PAPER_FOLDING_CODES, `PaperFolding Step ${idx}`);
      });
    });
  });
});
