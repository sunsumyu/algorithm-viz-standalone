/**
 * 下一个排列 — 步进推演编译器
 * LeetCode 31
 */

import { StepBase } from '../../../core/step-visualizer';

export interface NextPermutationStep extends StepBase {
  nums: number[];
  i: number;
  j: number;
  phase: 'init' | 'find-i' | 'find-j' | 'swap' | 'reverse' | 'finish';
  message: string;
  log: string;
  decision?: string;
  codeLine?: number | Record<string, number>;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' };
  ans?: string;
  isAccepted?: boolean;
}

export const NEXT_PERMUTATION_CODES = {
  java: `public class Solution {
    public void nextPermutation(int[] nums) {
        int i = nums.length - 2;
        // 1. 从后向前找第一个降序相邻对
        while (i >= 0 && nums[i] >= nums[i + 1]) {
            i--;
        }
        // 2. 在右侧降序区找到刚好大于 nums[i] 的元素交换
        if (i >= 0) {
            int j = nums.length - 1;
            while (j >= 0 && nums[j] <= nums[i]) {
                j--;
            }
            swap(nums, i, j);
        }
        // 3. 将 [i + 1 .. end] 原地反转为升序
        reverse(nums, i + 1, nums.length - 1);
    }
    private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    private void reverse(int[] a, int l, int r) {
        while (l < r) swap(a, l++, r--);
    }
}`,
  cpp: `class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int i = (int)nums.size() - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;
        if (i >= 0) {
            int j = (int)nums.size() - 1;
            while (j >= 0 && nums[j] <= nums[i]) j--;
            swap(nums[i], nums[j]);
        }
        reverse(nums.begin() + i + 1, nums.end());
    }
};`,
  python: `class Solution:
    def nextPermutation(self, nums: list[int]) -> None:
        i = len(nums) - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        if i >= 0:
            j = len(nums) - 1
            while j >= 0 and nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        nums[i + 1:] = reversed(nums[i + 1:])`,
};

export const NEXT_PERMUTATION_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 3, python: 3 },
  findI: { java: 5, cpp: 4, python: 4 },
  findJ: { java: 10, cpp: 7, python: 7 },
  swap: { java: 14, cpp: 9, python: 9 },
  reverse: { java: 17, cpp: 11, python: 10 },
  finish: { java: 20, cpp: 12, python: 11 },
};

function formatMetrics(
  i: number,
  j: number,
  phase: string,
  nums: number[]
): Record<string, string | number> {
  const iDesc = i >= 0 ? `${i} (值 ${nums[i]})` : '无 (全降序)';
  const jDesc = j >= 0 ? `${j} (值 ${nums[j]})` : '—';
  const statusDesc = phase === 'finish' ? '已收敛完成' : '变换中';
  return {
    '拐点下标 i': iDesc,
    '交换下标 j': jDesc,
    '当前推演阶段': phase,
    '重排状态': statusDesc,
  };
}

export function buildNextPermutationSteps(nums: number[] = [1, 2, 7, 4, 3, 1]): NextPermutationStep[] {
  const steps: NextPermutationStep[] = [];
  const arr = [...nums];
  const n = arr.length;

  // Step 0: Init
  steps.push({
    nums: [...arr],
    i: -1,
    j: -1,
    phase: 'init',
    message: `算法启动：原排列 [${arr.join(', ')}]。准备寻找下一个更大字典序排列。`,
    decision: `原排列 [${arr.join(', ')}]，准备自右向左寻找首个升序拐点。`,
    log: `初始化排列: [${arr.join(', ')}]`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.init,
    metrics: formatMetrics(-1, -1, 'init', arr),
    statusBadge: { text: '初始化', type: 'info' },
  });

  let i = n - 2;
  while (i >= 0 && arr[i] >= arr[i + 1]) {
    i--;
  }

  const findIMsg =
    i >= 0
      ? `步骤 1：从后向前找到第一个相邻升序对，在索引 i = ${i} 处：arr[${i}] = ${arr[i]} < arr[${i + 1}] = ${arr[i + 1]}。`
      : `步骤 1：全数组严格降序，当前已是最大字典序，i = -1！无需交换，直接反转全数组回到最小升序排列。`;

  steps.push({
    nums: [...arr],
    i,
    j: -1,
    phase: 'find-i',
    message: findIMsg,
    decision: i >= 0 ? `锁定升序拐点 i = ${i} (值 ${arr[i]})，降序后缀为 [${i + 1} .. ${n - 1}]` : `无升序对 (i = -1)，即将全数组原地翻转回初始升序`,
    log: `定位拐点 i=${i}`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.findI,
    metrics: formatMetrics(i, -1, 'find-i', arr),
    statusBadge: { text: i >= 0 ? `拐点 i=${i}` : '全降序', type: i >= 0 ? 'info' : 'warning' },
  });

  if (i >= 0) {
    let j = n - 1;
    while (j >= 0 && arr[j] <= arr[i]) {
      j--;
    }

    steps.push({
      nums: [...arr],
      i,
      j,
      phase: 'find-j',
      message: `步骤 2：在 [${i + 1} .. ${n - 1}] 中从后向前寻找第一个 > arr[${i}] (${arr[i]}) 的数：找到 j = ${j} (arr[${j}] = ${arr[j]})。`,
      decision: `在降序后缀中从右向左寻得刚好大于 arr[${i}] 的元素：arr[${j}] = ${arr[j]}`,
      log: `定位交换项 j=${j}`,
      codeLine: NEXT_PERMUTATION_CODE_LINES.findJ,
      metrics: formatMetrics(i, j, 'find-j', arr),
      statusBadge: { text: `交换项 j=${j}`, type: 'info' },
    });

    // 交换
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;

    steps.push({
      nums: [...arr],
      i,
      j,
      phase: 'swap',
      message: `执行交换：swap(arr[${i}], arr[${j}])。数组变为 [${arr.join(', ')}]。`,
      decision: `完成 arr[${i}] 与 arr[${j}] 交换，当前排列为 [${arr.join(', ')}]`,
      log: `交换元素 arr[${i}] 与 arr[${j}]`,
      codeLine: NEXT_PERMUTATION_CODE_LINES.swap,
      metrics: formatMetrics(i, j, 'swap', arr),
      statusBadge: { text: '完成交换', type: 'warning' },
    });
  }

  // 反转
  let l = i + 1;
  let r = n - 1;
  while (l < r) {
    const t = arr[l];
    arr[l] = arr[r];
    arr[r] = t;
    l++;
    r--;
  }

  steps.push({
    nums: [...arr],
    i,
    j: -1,
    phase: 'reverse',
    message: `步骤 3：反转后缀区间 [${i + 1} .. ${n - 1}]，使其由降序变为升序，保证增幅最小。`,
    decision: `原地反转降序后缀 [${i + 1} .. ${n - 1}]，使增量达到最小步长`,
    log: `反转后缀区间 [${i + 1} .. ${n - 1}]`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.reverse,
    metrics: formatMetrics(i, -1, 'reverse', arr),
    statusBadge: { text: '后缀翻转', type: 'info' },
  });

  // Finish
  const finalAns = `[${arr.join(', ')}]`;
  steps.push({
    nums: [...arr],
    i: -1,
    j: -1,
    phase: 'finish',
    message: `算法完成！下一个字典序排列为 ${finalAns}。`,
    decision: `🎉 字典序下一个排列构造完成：${finalAns}`,
    log: `算法收敛，得到下一个排列: ${finalAns}`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.finish,
    metrics: formatMetrics(-1, -1, 'finish', arr),
    statusBadge: { text: '求解成功', type: 'success' },
    ans: finalAns,
    isAccepted: true,
  });

  return steps;
}
