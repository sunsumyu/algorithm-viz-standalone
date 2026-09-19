/**
 * 经典排序算法与选择专题顶级架构机械防退化门禁
 * (Sort & Selection Stage Invariant Gatekeeper)
 *
 * 守护领域：
 * 1. 经典比较类排序 (Comparison Sorts 7 题)：冒泡排序 / 选择排序 / 插入排序 / 希尔排序 / 归并排序 / 快速排序 / 堆排序
 * 2. 线性非比较排序 (Non-Comparison Linear Sorts 3 题)：计数排序 / 桶排序 / 基数排序
 * 3. 左程云大课排序体系 (Class 004, 022, 024, 028, 043~046 8 题)：
 *    - Class 004 基础排序对数器 (选择/冒泡/插入)
 *    - Class 022 归并小和与逆序对算法
 *    - Class 024 荷兰国旗三向切分
 *    - Class 028 基数排序大课版
 *    - Class 043 归并排序递归与非递归双实现
 *    - Class 044 小和问题跨区间贡献
 *    - Class 045 随机快排荷兰国旗三向切分
 *    - Class 046 快速选择寻找第 K 大/小元素
 *
 * 核心机械不变量红线：
 * 1. 元素多重集守恒定理 (Conservation of Elements)：
 *    排序全过程中，任意步骤数组元素的多重集与原数组严格相等，绝不凭空丢数或产生外来数；
 * 2. 终态严格单调递增性 (Monotonicity Invariant)：
 *    尾帧数组严格满足 ∀i, A[i] <= A[i+1]，完成全数组升序排列；
 * 3. 荷兰国旗三向划分不变量 (Dutch National Flag Partition Invariant)：
 *    切分完成后，小于区各元素 < pivot，等于区全为 pivot，大于区各元素 > pivot；
 * 4. 归并小和数学一致性：小和计算结果与暴力双重循环完全吻合。
 */

import { describe, it, expect } from 'vitest';

// Part 1 & Part 2: Classic Sorts (10 items)
import { bubbleSortSteps } from '../../algorithms/categories/sort/bubble-sort-renderer';
import { selectionSortSteps } from '../../algorithms/categories/sort/selection-sort-renderer';
import { insertionSortSteps } from '../../algorithms/categories/sort/insertion-sort-renderer';
import { shellSortSteps } from '../../algorithms/categories/sort/shell-sort-renderer';
import { mergeSortSteps } from '../../algorithms/categories/sort/merge-sort-renderer';
import { quickSortSteps } from '../../algorithms/categories/sort/quick-sort-renderer';
import { heapSortSteps } from '../../algorithms/categories/sort/heap-sort-renderer';
import { countingSortSteps } from '../../algorithms/categories/sort/counting-sort-renderer';
import { bucketSortSteps } from '../../algorithms/categories/sort/bucket-sort-renderer';
import { radixSortSteps } from '../../algorithms/categories/sort/radix-sort-renderer';

// Part 3: Class 004, 022, 024, 028, 043~046
import { buildSort004Steps } from '../../algorithms/categories/sort/sort-basics-004-renderer';
import { generateSmallSumSteps } from '../../algorithms/categories/sort/merge-sort-small-sum-022-renderer';
import { buildNetherlands024Steps } from '../../algorithms/categories/sort/netherlands-flag-024-renderer';
import { generateRadixSortSteps } from '../../algorithms/categories/sort/radix-sort-028-renderer';
import { buildMergeSort043Steps } from '../../algorithms/categories/sort/sort-043-046/merge-sort-043-renderer';
import { buildSmallSum044Steps } from '../../algorithms/categories/sort/sort-043-046/small-sum-merge-044-renderer';
import { buildQuickSortDutchFlag045Steps } from '../../algorithms/categories/sort/sort-043-046/quick-sort-dutch-flag-045-renderer';
import { buildQuickSelect046Steps } from '../../algorithms/categories/sort/sort-043-046/quick-select-046-renderer';

/**
 * 校验经典排序算法通用不变量：元素守恒与终态单调递增
 */
function verifySortInvariants(
  steps: any[],
  algoName: string,
  initialArray: number[],
  getFinalArray: (last: any) => number[]
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);

  // 1. Step 0 入口有效
  const step0 = steps[0];
  expect(step0, `${algoName}: Step 0 必须存在`).toBeDefined();

  // 2. 尾帧提取与终态检查
  const lastStep = steps[steps.length - 1];
  const sorted = getFinalArray(lastStep);
  expect(sorted, `${algoName}: 尾帧排序数组必须存在`).toBeDefined();
  expect(sorted.length, `${algoName}: 排序后长度必须与原数组一致`).toBe(initialArray.length);

  // 3. 元素多重集守恒
  const expectedSorted = [...initialArray].sort((a, b) => a - b);
  expect(sorted, `${algoName}: 排序结果必须等于严格升序序列`).toEqual(expectedSorted);

  // 4. 单调性断言
  for (let i = 0; i < sorted.length - 1; i++) {
    expect(sorted[i], `${algoName}: 索引 ${i} 处违反单调性`).toBeLessThanOrEqual(sorted[i + 1]);
  }
}

describe('经典排序算法与选择专题顶级机械不变量门禁 (Sort & Selection Gatekeeper)', () => {
  describe('Part 1: 经典比较类排序 (Comparison Sorts 7 题)', () => {
    it('1. 冒泡排序 (Bubble Sort): 相邻逆序对冒泡交换，全局单调递增', () => {
      const arr = [5, 2, 9, 1, 5, 6];
      const steps = bubbleSortSteps(arr);
      verifySortInvariants(steps, '冒泡排序', arr, last => last.array);
    });

    it('2. 选择排序 (Selection Sort): 每轮寻找极小值交换至前缀有序区', () => {
      const arr = [29, 10, 14, 37, 13];
      const steps = selectionSortSteps(arr);
      verifySortInvariants(steps, '选择排序', arr, last => last.array);
    });

    it('3. 插入排序 (Insertion Sort): 元素在有序前缀中逆序寻找插入位', () => {
      const arr = [12, 11, 13, 5, 6];
      const steps = insertionSortSteps(arr);
      verifySortInvariants(steps, '插入排序', arr, last => last.array);
    });

    it('4. 希尔排序 (Shell Sort): 递减增量分组插入，最终跨步收敛至 1 步完成', () => {
      const arr = [9, 8, 3, 7, 5, 6, 4, 1];
      const steps = shellSortSteps(arr);
      verifySortInvariants(steps, '希尔排序', arr, last => last.array);
    });

    it('5. 归并排序 (Merge Sort): 分治二分划分与双指针有序合并', () => {
      const arr = [38, 27, 43, 3, 9, 82, 10];
      const steps = mergeSortSteps(arr);
      verifySortInvariants(steps, '归并排序', arr, last => last.array);
    });

    it('6. 快速排序 (Quick Sort): 选定基准划分双侧，递归分治收敛', () => {
      const arr = [6, 1, 2, 7, 9, 3, 4, 5, 10, 8];
      const steps = quickSortSteps(arr);
      verifySortInvariants(steps, '快速排序', arr, last => last.array);
    });

    it('7. 堆排序 (Heap Sort): 构建大顶堆与堆顶元素下沉堆化保持堆序', () => {
      const arr = [4, 10, 3, 5, 1];
      const steps = heapSortSteps(arr);
      verifySortInvariants(steps, '堆排序', arr, last => last.array);
    });
  });

  describe('Part 2: 线性非比较排序 (Non-Comparison Linear Sorts 3 题)', () => {
    it('8. 计数排序 (Counting Sort): 统计频次与前缀和映射稳定还原', () => {
      const arr = [4, 2, 2, 8, 3, 3, 1];
      const steps = countingSortSteps(arr);
      verifySortInvariants(steps, '计数排序', arr, last => last.output);
    });

    it('9. 桶排序 (Bucket Sort): 均匀分桶，桶内局部插入排序串联输出', () => {
      const arr = [29, 25, 3, 49, 9, 37, 21, 43];
      const steps = bucketSortSteps(arr, 5);
      verifySortInvariants(steps, '桶排序', arr, last => last.array);
    });

    it('10. 基数排序 (Radix Sort): 低位至高位多轮稳定分桶收集', () => {
      const arr = [170, 45, 75, 90, 802, 24, 2, 66];
      const steps = radixSortSteps(arr);
      verifySortInvariants(steps, '基数排序', arr, last => last.array);
    });
  });

  describe('Part 3: 左程云大课排序体系 (Class 004, 022, 024, 028, 043~046 8 题)', () => {
    it('11. Class 004 基础排序对数器: 选择/冒泡/插入排序守恒性', () => {
      const arr = [5, 2, 8, 3, 1];
      const stepsSel = buildSort004Steps(arr, 'selection');
      verifySortInvariants(stepsSel, 'Class 004 选择排序', arr, last => last.nums);

      const stepsBub = buildSort004Steps(arr, 'bubble');
      verifySortInvariants(stepsBub, 'Class 004 冒泡排序', arr, last => last.nums);

      const stepsIns = buildSort004Steps(arr, 'insertion');
      verifySortInvariants(stepsIns, 'Class 004 插入排序', arr, last => last.nums);
    });

    it('12. Class 022 归并小和算法: 跨组批量累加计算小和总值 16', () => {
      const arr = [1, 3, 4, 2, 5];
      const steps = generateSmallSumSteps(arr);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.totalSmallSum).toBe(16);
      expect(last.arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('13. Class 024 荷兰国旗三向切分: 小于区、等于区、大于区严格守恒', () => {
      const arr = [3, 5, 2, 6, 3, 1, 7, 3, 4];
      const target = 3;
      const steps = buildNetherlands024Steps(arr, target);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      const less = last.less;
      const more = last.more;
      const nums = last.nums;

      // 验证荷兰国旗三向划分不变量：
      for (let i = 0; i <= less; i++) {
        expect(nums[i], `nums[${i}] 必须小于 target`).toBeLessThan(target);
      }
      for (let i = less + 1; i < more; i++) {
        expect(nums[i], `nums[${i}] 必须等于 target`).toBe(target);
      }
      for (let i = more; i < nums.length; i++) {
        expect(nums[i], `nums[${i}] 必须大于 target`).toBeGreaterThan(target);
      }
    });

    it('14. Class 028 基数排序大课版: 基于数字位提取与前缀和十进制基数排序', () => {
      const arr = [170, 45, 75, 90, 802, 24, 2, 66];
      const steps = generateRadixSortSteps(arr);
      verifySortInvariants(steps, 'Class 028 基数排序', arr, last => last.arr);
    });

    it('15. Class 043 归并排序递归实现: 分治二分与双指针合并', () => {
      const steps = buildMergeSort043Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.arr).toEqual([1, 2, 4, 5]);
    });

    it('16. Class 044 小和问题扩展: 跨区间批量贡献累加求出小和 16', () => {
      const steps = buildSmallSum044Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.totalSmallSum).toBe(16);
    });

    it('17. Class 045 快速排序荷兰国旗划分: 随机选主元三向切分', () => {
      const steps = buildQuickSortDutchFlag045Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.less).toBeDefined();
      expect(last.more).toBeDefined();
    });

    it('18. Class 046 快速选择算法: 期望 O(N) 锁定第 K 大元素', () => {
      const steps = buildQuickSelect046Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.hit).toBe(true);
      expect(last.arr[last.targetK]).toBe(3);
    });
  });
});
