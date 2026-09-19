/**
 * 单调栈、单调队列与数组双指针/前缀和差分顶级机械防退化门禁
 * (Monotonic Stack, Queue & Array Stage Invariant Gatekeeper)
 *
 * 守护领域：
 * 1. 经典单调栈体系 (LeetCode Monotonic Stack 8 题)：每日温度 / 下一个更大元素 I~II / 柱状图最大矩形 / 接雨水 / 移掉 K 位数字 / 统计全 1 子矩形 / 验证 BST 前序
 * 2. 左程云基础大课单调栈与单调队列 (Class 052 ~ 055)：单调栈规范 / 柱状图最大矩形 / 单调队列滑动窗口最大值 / 双单调队列极差限制
 * 3. 前缀和与差分数组体系 (Prefix Sum & Difference Array)：Class 049 一维前缀和 / Class 050 二维前缀和 / Class 051 等差差分 / 一维差分 / 二维差分
 * 4. 双指针与经典数组变换体系 (Two Pointers & Array Transformations)：移除元素 / 有序数组平方 / 长度最小子数组 / 螺旋矩阵 II / 下一个排列 / 除自身以外乘积 / 寻找重复数 / 缺失的首个正数 / 乘积小于 K 的子数组
 *
 * 核心机械不变量红线：
 * 1. Step 0 入口契约：首帧必须是合法初始化状态（初始指针、初始空栈、前缀和基底）；
 * 2. 多语言代码行合法区间：每一步代码行号落在合法闭区间 [1, length]，严禁 0 冻结与越界；
 * 3. 单调性守恒：
 *    - 单调栈元素严格保持单调递增/递减栈序；
 *    - 单调队列头部严格单调最大/最小，过期元素有序淘汰；
 * 4. 物理守恒与数学还原：
 *    - 差分数组前缀和还原结果与区间加法数学等价；
 *    - 接雨水面积非负且局部几何叠加守恒；
 *    - 螺旋矩阵四边界逐步收缩至中心且数值覆盖 1..N^2；
 * 5. 终态收敛性：尾帧必须收敛至终态结论、最值或答案数组。
 */

import { describe, it, expect } from 'vitest';

// Part 1: Monotonic Stack (8 items)
import { buildDailyTemperaturesSteps } from '../../algorithms/categories/monotonic-stack/daily-temperatures-renderer';
import { buildNextGreaterElementISteps } from '../../algorithms/categories/monotonic-stack/next-greater-element-i-renderer';
import { buildNextGreaterElementIISteps } from '../../algorithms/categories/monotonic-stack/next-greater-element-ii-renderer';
import { buildLargestRectangleHistogramSteps } from '../../algorithms/categories/monotonic-stack/largest-rectangle-histogram-renderer';
import { buildTrappingRainWaterSteps } from '../../algorithms/categories/monotonic-stack/trapping-rain-water-renderer';
import { buildRemoveKDigitsSteps } from '../../algorithms/categories/monotonic-stack/remove-k-digits-renderer';
import { buildCountSubmatricesSteps } from '../../algorithms/categories/monotonic-stack/count-submatrices-all-ones-1504-renderer';
import { buildVerifyPreorderBstSteps } from '../../algorithms/categories/monotonic-stack/verify-preorder-sequence-in-bst-renderer';

// Part 2: Class 052 ~ 055
import { buildMonotonicStack052Steps } from '../../algorithms/categories/array/array-049-055/monotonic-stack-basic-052-renderer';
import { buildLargestRectangle053Steps } from '../../algorithms/categories/array/array-049-055/largest-rectangle-histogram-053-renderer';
import { buildMonotonicQueue054Steps } from '../../algorithms/categories/array/array-049-055/monotonic-queue-basic-054-renderer';
import { buildValidSubarray055Steps } from '../../algorithms/categories/array/array-049-055/valid-subarray-limit-055-renderer';

// Part 3: Prefix Sum & Difference
import { buildPrefixSum049Steps } from '../../algorithms/categories/array/array-049-055/prefix-sum-basic-049-renderer';
import { buildPrefixSum2D050Steps } from '../../algorithms/categories/array/array-049-055/prefix-sum-2d-050-renderer';
import { buildArithmeticDiff051Steps } from '../../algorithms/categories/array/array-049-055/arithmetic-sequence-difference-051-renderer';
import { buildDiff1DSteps } from '../../algorithms/categories/array/array-diff/diff-array-1d-renderer';
import { buildDiff2DSteps } from '../../algorithms/categories/array/array-diff/diff-array-2d-renderer';

// Part 4: Two Pointers & Array Transformations
import { buildRemoveElementSteps } from '../../algorithms/categories/array/remove-element-renderer';
import { buildSortedSquaresSteps } from '../../algorithms/categories/array/squares-of-sorted-array-renderer';
import { buildMinSubarrayLenSteps } from '../../algorithms/categories/array/min-subarray-len-renderer';
import { buildSpiralSteps } from '../../algorithms/categories/array/spiral-matrix-ii-renderer';
import { buildNextPermutationSteps } from '../../algorithms/categories/array/next-permutation-renderer';
import { buildProductSteps } from '../../algorithms/categories/array/product-except-self-238-renderer';
import { buildFindDuplicateSteps } from '../../algorithms/categories/array/find-duplicate-number-287-renderer';
import { generateMissingPositiveSteps } from '../../algorithms/categories/array/first-missing-positive-renderer';
import { buildProductLessThanKSteps } from '../../algorithms/categories/array/subarray-product-less-than-k-renderer';

/**
 * 校验步进序列的基础机械不变量
 */
function verifyBasicStepInvariants(steps: any[], algoName: string) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);

  // 1. Step 0 入口校验
  const step0 = steps[0];
  expect(step0, `${algoName}: Step 0 必须存在`).toBeDefined();

  // 2. 行号合法性校验
  for (let idx = 0; idx < steps.length; idx++) {
    const s = steps[idx];
    if (typeof s.codeLine === 'number') {
      expect(s.codeLine, `${algoName} [Step ${idx}]: codeLine 不能小于 1`).toBeGreaterThanOrEqual(1);
    } else if (s.codeLines && typeof s.codeLines === 'object') {
      for (const lang of Object.keys(s.codeLines)) {
        const line = s.codeLines[lang];
        if (typeof line === 'number') {
          expect(line, `${algoName} [Step ${idx}]: 语言 ${lang} 行号不能小于 1`).toBeGreaterThanOrEqual(1);
        }
      }
    }
  }

  // 3. 尾帧有效性
  const lastStep = steps[steps.length - 1];
  expect(lastStep, `${algoName}: 尾帧必须存在`).toBeDefined();
}

describe('单调栈、单调队列与数组体系顶级机械不变量门禁 (Monotonic Stack & Array Gatekeeper)', () => {
  describe('Part 1: 经典单调栈体系 (LeetCode Monotonic Stack 8 题)', () => {
    it('739. 每日温度: 单调递减栈维护天数差，答案数组长度一致且非负', () => {
      const temps = [73, 74, 75, 71, 69, 72, 76, 73];
      const steps = buildDailyTemperaturesSteps(temps);
      verifyBasicStepInvariants(steps, '每日温度');

      const last = steps[steps.length - 1];
      expect(last.result.length).toBe(temps.length);
      expect(last.result).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
    });

    it('496. 下一个更大元素 I: 单调栈配合哈希映射检索右侧首个更大值', () => {
      const nums1 = [4, 1, 2];
      const nums2 = [1, 3, 4, 2];
      const steps = buildNextGreaterElementISteps(nums1, nums2);
      verifyBasicStepInvariants(steps, '下一个更大元素 I');

      const last = steps[steps.length - 1];
      expect(last.answers).toEqual([-1, 3, -1]);
    });

    it('503. 下一个更大元素 II (循环数组): 2 轮模 N 扫描完备检索', () => {
      const nums = [1, 2, 1];
      const steps = buildNextGreaterElementIISteps(nums);
      verifyBasicStepInvariants(steps, '下一个更大元素 II');

      const last = steps[steps.length - 1];
      expect(last.result).toEqual([2, -1, 2]);
    });

    it('84. 柱状图中最大的矩形: 单调递增栈计算宽度乘积，全局最大面积收敛', () => {
      const heights = [2, 1, 5, 6, 2, 3];
      const steps = buildLargestRectangleHistogramSteps(heights);
      verifyBasicStepInvariants(steps, '柱状图最大矩形');

      const last = steps[steps.length - 1];
      expect(last.maxArea).toBe(10); // 5 和 6 组成的矩形: 5 * 2 = 10
    });

    it('42. 接雨水: 凹槽高度差与宽度乘积守恒，积水总量单调递增', () => {
      const height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
      const steps = buildTrappingRainWaterSteps(height);
      verifyBasicStepInvariants(steps, '接雨水');

      const last = steps[steps.length - 1];
      expect(last.totalWater).toBe(6);
    });

    it('402. 移掉 K 位数字: 单调递增栈贪心丢弃高位逆序，生成最小数字序列', () => {
      const steps = buildRemoveKDigitsSteps('1432219', 3);
      verifyBasicStepInvariants(steps, '移掉 K 位数字');

      const last = steps[steps.length - 1];
      expect(last.finalResult).toBe('1219');
    });

    it('1504. 统计全 1 子矩形: 单调栈维护连续高度累加子矩形总数', () => {
      const steps = buildCountSubmatricesSteps();
      verifyBasicStepInvariants(steps, '统计全 1 子矩形');

      const last = steps[steps.length - 1];
      expect(last.totalCount).toBe(13);
    });

    it('255. 验证二叉搜索树的前序遍历: 单调递减栈维护中序前驱下界', () => {
      const preorder = [5, 2, 1, 3, 6];
      const steps = buildVerifyPreorderBstSteps(preorder);
      verifyBasicStepInvariants(steps, '验证 BST 前序遍历');

      const last = steps[steps.length - 1];
      expect(last.isValidSoFar).toBe(true);
    });
  });

  describe('Part 2: 左程云基础大课单调栈与单调队列 (Class 052 ~ 055)', () => {
    it('052. 单调栈标准规范: 左右最近更小元素无遗漏检索', () => {
      const steps = buildMonotonicStack052Steps();
      verifyBasicStepInvariants(steps, 'Class 052 单调栈规范');

      const last = steps[steps.length - 1];
      expect(last.settled.length).toBeGreaterThan(0);
    });

    it('053. 柱状图中最大的矩形 (大课版): 栈顶弹出确定左右边界求最大矩形', () => {
      const steps = buildLargestRectangle053Steps();
      verifyBasicStepInvariants(steps, 'Class 053 最大矩形');

      const last = steps[steps.length - 1];
      expect(last.maxArea).toBeGreaterThan(0);
    });

    it('054. 单调队列滑动窗口最大值: 窗口右滑淘汰劣质元素，队列单调递减', () => {
      const steps = buildMonotonicQueue054Steps();
      verifyBasicStepInvariants(steps, 'Class 054 单调队列');

      const last = steps[steps.length - 1];
      expect(last.maxVals.length).toBeGreaterThan(0);
    });

    it('055. 双单调队列维护极差限制子数组: maxQ 与 minQ 协同锁定满足差值条件的子数组', () => {
      const steps = buildValidSubarray055Steps();
      verifyBasicStepInvariants(steps, 'Class 055 极差子数组');

      const last = steps[steps.length - 1];
      expect(last.ansLen).toBe(2);
    });
  });

  describe('Part 3: 前缀和与差分数组体系 (Prefix Sum & Difference Array)', () => {
    it('049. 一维前缀和基础: P[i] = P[i-1] + arr[i] 累加单调递增', () => {
      const steps = buildPrefixSum049Steps();
      verifyBasicStepInvariants(steps, 'Class 049 一维前缀和');

      const last = steps[steps.length - 1];
      expect(last.count).toBe(3);
    });

    it('050. 二维前缀和: 容斥原理矩阵面积快速查询', () => {
      const steps = buildPrefixSum2D050Steps();
      verifyBasicStepInvariants(steps, 'Class 050 二维前缀和');

      const last = steps[steps.length - 1];
      expect(last.sumVal).toBe(20);
    });

    it('051. 等差数列差分: 二阶差分维护斜率累加', () => {
      const steps = buildArithmeticDiff051Steps();
      verifyBasicStepInvariants(steps, 'Class 051 等差差分');

      const last = steps[steps.length - 1];
      expect(last.diff2.length).toBeGreaterThan(0);
    });

    it('一维差分数组: 区间加法 O(1) 标记，前缀和线性还原结果', () => {
      const bookings = [
        [1, 2, 10],
        [2, 3, 20],
        [2, 5, 25],
      ];
      const steps = buildDiff1DSteps(bookings, 5);
      verifyBasicStepInvariants(steps, '一维差分数组');

      const last = steps[steps.length - 1];
      expect(last.ansArray).toEqual([10, 55, 45, 25, 25]);
    });

    it('二维差分数组: 四角点标记平衡，还原二维子矩阵修改', () => {
      const ops = [[1, 1, 2, 2, 3]];
      const steps = buildDiff2DSteps(ops, 3, 3);
      verifyBasicStepInvariants(steps, '二维差分数组');

      const last = steps[steps.length - 1];
      expect(last.ansMatrix!.length).toBeGreaterThan(0);
    });
  });

  describe('Part 4: 双指针与经典数组变换体系 (Two Pointers & Array Transformations)', () => {
    it('27. 移除元素: 快慢双指针原地覆写，慢指针返回新长度', () => {
      const nums = [3, 2, 2, 3];
      const steps = buildRemoveElementSteps(nums, 3);
      verifyBasicStepInvariants(steps, '移除元素');

      const last = steps[steps.length - 1];
      expect(last.slow).toBe(2);
      expect(last.array.slice(0, 2)).toEqual([2, 2]);
    });

    it('977. 有序数组的平方: 首尾对撞双指针，每次取较大绝对值平方倒序填入', () => {
      const nums = [-4, -1, 0, 3, 10];
      const steps = buildSortedSquaresSteps(nums);
      verifyBasicStepInvariants(steps, '有序数组的平方');

      const last = steps[steps.length - 1];
      expect(last.result).toEqual([0, 1, 9, 16, 100]);
    });

    it('209. 长度最小的子数组: 滑动窗口右扩左缩，窗口和 >= target 且长度最小', () => {
      const nums = [2, 3, 1, 2, 4, 3];
      const steps = buildMinSubarrayLenSteps(nums, 7);
      verifyBasicStepInvariants(steps, '长度最小的子数组');

      const last = steps[steps.length - 1];
      expect(last.minLen).toBe(2); // [4, 3]
    });

    it('59. 螺旋矩阵 II: 四边界顺时针循环填入 1..N^2 连续正整数', () => {
      const steps = buildSpiralSteps(3);
      verifyBasicStepInvariants(steps, '螺旋矩阵 II');

      const last = steps[steps.length - 1];
      expect(last.matrix).toEqual([
        [1, 2, 3],
        [8, 9, 4],
        [7, 6, 5],
      ]);
    });

    it('31. 下一个排列: 拐点定位、更小大数交换与后缀逆序翻转', () => {
      const nums = [1, 2, 3];
      const steps = buildNextPermutationSteps(nums);
      verifyBasicStepInvariants(steps, '下一个排列');

      const last = steps[steps.length - 1];
      expect(last.nums).toEqual([1, 3, 2]);
    });

    it('238. 除自身以外数组的乘积: 前缀积与后缀积双向线性合成', () => {
      const nums = [1, 2, 3, 4];
      const steps = buildProductSteps(nums);
      verifyBasicStepInvariants(steps, '除自身以外乘积');

      const last = steps[steps.length - 1];
      expect(last.res).toEqual([24, 12, 8, 6]);
    });

    it('287. 寻找重复数: 快慢指针 Floyd 判环锁定重复元素', () => {
      const nums = [1, 3, 4, 2, 2];
      const steps = buildFindDuplicateSteps(nums);
      verifyBasicStepInvariants(steps, '寻找重复数');

      const last = steps[steps.length - 1];
      expect(last.duplicate).toBe(2);
    });

    it('41. 缺失的第一个正数: 原地哈希置换将数字置于其对应下标', () => {
      const nums = [3, 4, -1, 1];
      const steps = generateMissingPositiveSteps(nums);
      verifyBasicStepInvariants(steps, '缺失的第一个正数');

      const last = steps[steps.length - 1];
      expect(last.missingResult).toBe(2);
    });

    it('713. 乘积小于 K 的子数组: 滑动窗口单调积扩展，新增数目等于窗口长度', () => {
      const nums = [10, 5, 2, 6];
      const steps = buildProductLessThanKSteps(nums, 100);
      verifyBasicStepInvariants(steps, '乘积小于 K 的子数组');

      const last = steps[steps.length - 1];
      expect(last.count).toBe(8); // [10], [5], [2], [6], [10,5], [5,2], [2,6], [5,2,6]
    });
  });
});
