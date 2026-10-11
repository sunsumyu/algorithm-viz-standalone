/**
 * 除自身以外数组的乘积 — 步进推演编译器
 * LeetCode 238
 */

import { StepBase } from '../../../core/step-visualizer';

export interface ProductStep extends StepBase {
  nums: number[];
  res: number[];
  currentIndex: number;
  rightProduct: number;
  phase: 'init' | 'prefix_pass' | 'suffix_pass' | 'finish';
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  metrics?: Record<string, string | number>;
  decision?: string;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' };
  ans?: string;
  isAccepted?: boolean;
}

export const PRODUCT_EXCEPT_SELF_CODES = {
  java: `public class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];

        // 1. 从左向右计算前缀积：res[i] 表示 i 左侧所有元素的乘积
        res[0] = 1;
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1];
        }

        // 2. 从右向左计算后缀积：用常数 R 动态累乘
        int R = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] = res[i] * R;
            R *= nums[i];
        }

        return res;
    }
}`,
  cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n, 1);
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1];
        }
        int R = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] = res[i] * R;
            R *= nums[i];
        }
        return res;
    }
};`,
  python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        res = [1] * n
        for i in range(1, n):
            res[i] = res[i - 1] * nums[i - 1]
        R = 1
        for i in range(n - 1, -1, -1):
            res[i] = res[i] * R
            R *= nums[i]
        return res`,
};

export const PRODUCT_EXCEPT_SELF_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 4, python: 3 },
  prefixPass: { java: 8, cpp: 7, python: 5 },
  suffixPass: { java: 13, cpp: 12, python: 8 },
  finish: { java: 17, cpp: 15, python: 10 },
};

function formatProductMetrics(i: number, R: number, phase: string, n: number): Record<string, string | number> {
  let phaseText = '初始化';
  if (phase === 'prefix_pass') phaseText = '正向扫描 (前缀积)';
  else if (phase === 'suffix_pass') phaseText = '逆向扫描 (后缀积)';
  else if (phase === 'finish') phaseText = '求解完成';

  return {
    '当前扫描索引 i': i >= 0 ? `下标 [ ${i} ]` : '扫描完毕',
    '右侧累乘积 R': `R = ${R}`,
    '当前推演阶段': phaseText,
    '数组物理规模 N': `N = ${n}`,
  };
}

export function buildProductSteps(nums: number[] = [1, 2, 3, 4]): ProductStep[] {
  const steps: ProductStep[] = [];
  const n = nums.length;
  const res = new Array(n).fill(1);

  // Step 0: Init
  steps.push({
    nums: [...nums],
    res: [...res],
    currentIndex: 0,
    rightProduct: 1,
    phase: 'init',
    message: `算法启动：输入数组 nums = [${nums.join(', ')}]，初始化结果数组 res 均为 1。准备开始两遍扫描。`,
    decision: `初始化完成：准备第一遍正向扫描，将 i 左侧所有数的乘积就地填入 res[i]`,
    log: `初始化双向扫描: 数组长度 N = ${n}`,
    codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.init,
    metrics: formatProductMetrics(0, 1, 'init', n),
    statusBadge: { text: '初始化', type: 'info' },
  });

  // Pass 1: Prefix
  res[0] = 1;
  for (let i = 1; i < n; i++) {
    res[i] = res[i - 1] * nums[i - 1];
    steps.push({
      nums: [...nums],
      res: [...res],
      currentIndex: i,
      rightProduct: 1,
      phase: 'prefix_pass',
      message: `前缀积推进 [i = ${i}]：res[${i}] = res[${i - 1}] * nums[${i - 1}] = ${res[i]}（即下标 ${i} 左侧所有元素的乘积）。`,
      decision: `前缀扫描：res[${i}] = res[${i - 1}](${res[i - 1]}) × nums[${i - 1}](${nums[i - 1]}) = ${res[i]}`,
      log: `前缀扫描 i=${i}: res[${i}] = ${res[i]}`,
      codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.prefixPass,
      metrics: formatProductMetrics(i, 1, 'prefix_pass', n),
      statusBadge: { text: `正向前缀积 i=${i}`, type: 'info' },
    });
  }

  // Pass 2: Suffix
  let R = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] = res[i] * R;
    steps.push({
      nums: [...nums],
      res: [...res],
      currentIndex: i,
      rightProduct: R,
      phase: 'suffix_pass',
      message: `后缀积逆向合成 [i = ${i}]：当前右侧累计积 R = ${R}。res[${i}] = (左侧积 ${res[i] / R}) * (右侧积 ${R}) = ${res[i]}。`,
      decision: `后缀合成：res[${i}] 原有左积(${res[i] / R}) × 右累乘积 R(${R}) = ${res[i]}，随后 R 累乘 nums[${i}](${nums[i]})`,
      log: `后缀合成 i=${i}: res[${i}] = ${res[i]}, 随后 R *= nums[${i}]`,
      codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.suffixPass,
      metrics: formatProductMetrics(i, R, 'suffix_pass', n),
      statusBadge: { text: `逆向后缀积 i=${i}`, type: 'warning' },
    });
    R *= nums[i];
  }

  // Finish
  const finalAns = `[ ${res.join(', ')} ]`;
  steps.push({
    nums: [...nums],
    res: [...res],
    currentIndex: -1,
    rightProduct: R,
    phase: 'finish',
    message: `🎉 运算完毕！在不使用除法且仅用 O(1) 辅助空间下，求得最终乘积数组：${finalAns}。`,
    decision: `双向扫描完全收敛！求得除自身以外乘积结果：${finalAns}`,
    log: `计算结束: 结果=[${res.join(', ')}]`,
    codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.finish,
    metrics: formatProductMetrics(-1, R, 'finish', n),
    statusBadge: { text: '求解成功', type: 'success' },
    ans: finalAns,
    isAccepted: true,
  });

  return steps;
}
