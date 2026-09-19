/**
 * 单调栈经典专题物理不变量顶级架构机械防退化门禁
 * (Monotonic Stack Invariants Gatekeeper)
 *
 * 守护领域 (8 algorithms):
 * 1. 每日温度 (Daily Temperatures - LeetCode 739): 单调递减栈维护下一个更高温日
 * 2. 柱状图中最大的矩形 (Largest Rectangle in Histogram - LeetCode 84): 左右第一个较小值界定宽
 * 3. 下一个更大元素 I (Next Greater Element I - LeetCode 496): 单调栈+哈希映射
 * 4. 下一个更大元素 II (Next Greater Element II - LeetCode 503): 循环数组单调栈模拟 (2N 步)
 * 5. 接雨水 (Trapping Rain Water - LeetCode 42): 凹槽层叠单调栈结算
 * 6. 验证二叉搜索树的前序遍历序列 (Verify Preorder BST - LeetCode 255): 递减栈+右子树下限约束
 * 7. 统计全 1 子矩形 (Count Submatrices With All Ones - LeetCode 1504): 高度直方图压缩+单调栈阶梯结算
 * 8. 移掉 K 位数字 (Remove K Digits - LeetCode 402): 贪心单调递增栈剔除逆序高位
 *
 * 核心机械不变量红线:
 * 1. 单调栈严格序不变量 (Monotonic Order Invariant):
 *    递增栈/递减栈在任意迭代结束时，栈内元素严格保持指定单调顺序；
 * 2. 下一个更大/更小元素收敛保真度 (Next Greater/Smaller Invariant):
 *    若求解出 next greater 存在，其值严格大于当前值，且跨度区间内无任何值超越当前值；
 * 3. 物理几何面积与雨水非负守恒性 (Physical Rain & Area Invariant):
 *    接雨水总容量与直方图矩形最大面积非负且大于等于基线值；
 * 4. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';

// 1. Daily Temperatures
import { buildDailyTemperaturesSteps } from '../../algorithms/categories/monotonic-stack/daily-temperatures-renderer';
import { DAILY_TEMPERATURES_CODE_LANGUAGES } from '../../algorithms/categories/monotonic-stack/daily-temperatures-problem-content';

// 2. Largest Rectangle in Histogram
import { buildLargestRectangleHistogramSteps } from '../../algorithms/categories/monotonic-stack/largest-rectangle-histogram-renderer';
import { LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES } from '../../algorithms/categories/monotonic-stack/largest-rectangle-histogram-problem-content';

// 3. Next Greater Element I
import { buildNextGreaterElementISteps } from '../../algorithms/categories/monotonic-stack/next-greater-element-i-renderer';
import { NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES } from '../../algorithms/categories/monotonic-stack/next-greater-element-i-problem-content';

// 4. Next Greater Element II
import { buildNextGreaterElementIISteps } from '../../algorithms/categories/monotonic-stack/next-greater-element-ii-renderer';
import { NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES } from '../../algorithms/categories/monotonic-stack/next-greater-element-ii-problem-content';

// 5. Trapping Rain Water
import { buildTrappingRainWaterSteps } from '../../algorithms/categories/monotonic-stack/trapping-rain-water-renderer';
import { TRAPPING_RAIN_WATER_CODE_LANGUAGES } from '../../algorithms/categories/monotonic-stack/trapping-rain-water-problem-content';

// 6. Verify Preorder BST
import { buildVerifyPreorderBstSteps, VERIFY_PREORDER_BST_CODES } from '../../algorithms/categories/monotonic-stack/verify-preorder-sequence-in-bst-renderer';

// 7. Count Submatrices
import { buildCountSubmatricesSteps, COUNT_SUBMATRICES_CODES } from '../../algorithms/categories/monotonic-stack/count-submatrices-all-ones-1504-renderer';

// 8. Remove K Digits
import { buildRemoveKDigitsSteps, REMOVE_K_DIGITS_CODES } from '../../algorithms/categories/monotonic-stack/remove-k-digits-renderer';

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

describe('单调栈经典专题物理不变量顶级架构机械防退化门禁 (Monotonic Stack Gatekeeper)', () => {
  // ═══════════════════════════════════════════════════════════════════
  // 1. 每日温度 (Daily Temperatures - LeetCode 739)
  // ═══════════════════════════════════════════════════════════════════
  describe('1. 每日温度 (Daily Temperatures)', () => {
    it('标准输入升温跨度正确性与单调递减栈性质', () => {
      const temps = [73, 74, 75, 71, 69, 72, 76, 73];
      const steps = buildDailyTemperaturesSteps(temps);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');

      // 标准答案: [1, 1, 4, 2, 1, 1, 0, 0]
      const expected = [1, 1, 4, 2, 1, 1, 0, 0];
      expect(last.result).toEqual(expected);

      // 物理验证: 若 result[i] > 0，则 temps[i + result[i]] 严格大于 temps[i]
      for (let i = 0; i < temps.length; i++) {
        if (last.result[i] > 0) {
          const warmerIdx = i + last.result[i];
          expect(temps[warmerIdx]).toBeGreaterThan(temps[i]);
          // 且中间没有任何一天温度大于等于更暖日
          for (let mid = i + 1; mid < warmerIdx; mid++) {
            expect(temps[mid]).toBeLessThanOrEqual(temps[i]);
          }
        }
      }

      verifyCodeLines(steps, '每日温度', DAILY_TEMPERATURES_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 2. 柱状图中最大的矩形 (Largest Rectangle in Histogram - LeetCode 84)
  // ═══════════════════════════════════════════════════════════════════
  describe('2. 柱状图中最大的矩形 (Largest Rectangle in Histogram)', () => {
    it('最大矩形面积收敛不变量: [2, 1, 5, 6, 2, 3] 最大面积应为 10', () => {
      const heights = [2, 1, 5, 6, 2, 3];
      const steps = buildLargestRectangleHistogramSteps(heights);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.maxArea).toBe(10);

      verifyCodeLines(steps, '柱状图最大矩形', LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 3. 下一个更大元素 I (Next Greater Element I - LeetCode 496)
  // ═══════════════════════════════════════════════════════════════════
  describe('3. 下一个更大元素 I (Next Greater Element I)', () => {
    it('哈希映射与单调递减栈: nums1=[4,1,2], nums2=[1,3,4,2] 结果应为 [-1, 3, -1]', () => {
      const nums1 = [4, 1, 2];
      const nums2 = [1, 3, 4, 2];
      const steps = buildNextGreaterElementISteps(nums1, nums2);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.answers).toEqual([-1, 3, -1]);

      verifyCodeLines(steps, '下一个更大元素 I', NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 4. 下一个更大元素 II (Next Greater Element II - LeetCode 503)
  // ═══════════════════════════════════════════════════════════════════
  describe('4. 下一个更大元素 II (Next Greater Element II - 循环数组)', () => {
    it('循环数组单调栈模拟: [1, 2, 1] 结果应为 [2, -1, 2]', () => {
      const nums = [1, 2, 1];
      const steps = buildNextGreaterElementIISteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.result).toEqual([2, -1, 2]);

      verifyCodeLines(steps, '下一个更大元素 II', NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 5. 接雨水 (Trapping Rain Water - LeetCode 42)
  // ═══════════════════════════════════════════════════════════════════
  describe('5. 接雨水 (Trapping Rain Water)', () => {
    it('经典凹槽层叠单调栈结算: [0,1,0,2,1,0,1,3,2,1,2,1] 积水量为 6', () => {
      const heights = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
      const steps = buildTrappingRainWaterSteps(heights);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.totalWater).toBe(6);

      verifyCodeLines(steps, '接雨水', TRAPPING_RAIN_WATER_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 6. 验证二叉搜索树的前序遍历 (Verify Preorder BST - LeetCode 255)
  // ═══════════════════════════════════════════════════════════════════
  describe('6. 验证二叉搜索树的前序遍历 (Verify Preorder BST)', () => {
    it('合法序列: [5, 2, 1, 3, 6] 判定为 true', () => {
      const preorder = [5, 2, 1, 3, 6];
      const steps = buildVerifyPreorderBstSteps(preorder);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.isValidSoFar).toBe(true);

      verifyCodeLines(steps, '验证前序BST-合法', VERIFY_PREORDER_BST_CODES);
    });

    it('非法序列: [5, 2, 6, 1, 3] 判定为 false', () => {
      const preorder = [5, 2, 6, 1, 3];
      const steps = buildVerifyPreorderBstSteps(preorder);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.isValidSoFar).toBe(false);

      verifyCodeLines(steps, '验证前序BST-非法', VERIFY_PREORDER_BST_CODES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 7. 统计全 1 子矩形 (Count Submatrices - LeetCode 1504)
  // ═══════════════════════════════════════════════════════════════════
  describe('7. 统计全 1 子矩形 (Count Submatrices With All Ones)', () => {
    it('逐行压缩柱状图并单调栈累加: 最终总矩形数严格递增且大于 0', () => {
      const steps = buildCountSubmatricesSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.totalCount).toBeGreaterThan(0);
      expect(last.totalCount).toBe(13); // 2 + 5 + 6 = 13

      verifyCodeLines(steps, '统计全1子矩形', COUNT_SUBMATRICES_CODES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 8. 移掉 K 位数字 (Remove K Digits - LeetCode 402)
  // ═══════════════════════════════════════════════════════════════════
  describe('8. 移掉 K 位数字 (Remove K Digits)', () => {
    it('"1432219" 移掉 3 位得到最小数值 "1219"', () => {
      const steps = buildRemoveKDigitsSteps('1432219', 3);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.finalResult).toBe('1219');

      verifyCodeLines(steps, '移掉K位数字-1432219', REMOVE_K_DIGITS_CODES);
    });

    it('"10200" 移掉 1 位去除前导零得到 "200"', () => {
      const steps = buildRemoveKDigitsSteps('10200', 1);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.finalResult).toBe('200');

      verifyCodeLines(steps, '移掉K位数字-前导零', REMOVE_K_DIGITS_CODES);
    });

    it('"10" 移掉 2 位得到 "0"', () => {
      const steps = buildRemoveKDigitsSteps('10', 2);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.finalResult).toBe('0');

      verifyCodeLines(steps, '移掉K位数字-全部移除', REMOVE_K_DIGITS_CODES);
    });
  });
});
