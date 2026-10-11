/**
 * Hard 22: 缺失的第一个正数 — 步进推演编译器
 * LeetCode 41 (Hard) / 原地哈希置换
 */

import { HighlightTarget, StepBase } from '../../../core/step-visualizer';

export interface MissingPositiveStep extends StepBase {
  stepIndex?: number;
  nums: number[];
  currentIndex: number;
  swappedPair?: [number, number]; // [i, targetIdx]
  inPlaceStatus: boolean[]; // 每个槽位 nums[i] === i + 1 是否成立
  missingResult: number | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics: Record<string, string | number>;
  ans?: string;
}

export const MISSING_POSITIVE_CODES = {
  java: `public class FirstMissingPositive {
    public int firstMissingPositive(int[] nums) {
        int n = nums.length;
        // 1. 原地哈希置换：将数值 x 归位至下标 x - 1
        for (int i = 0; i < n; i++) {
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                swap(nums, i, nums[i] - 1);
            }
        }

        // 2. 遍历找出第一个未匹配槽位
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1; // 1~n 全满，缺失 n + 1
    }

    private void swap(int[] arr, int i, int j) {
        int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
}`,
  cpp: `class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; ++i) {
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }
        for (int i = 0; i < n; ++i) {
            if (nums[i] != i + 1) return i + 1;
        }
        return n + 1;
    }
};`,
  python: `class Solution:
    def firstMissingPositive(self, nums: list[int]) -> int:
        n = len(nums)
        for i in range(n):
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                target = nums[i] - 1
                nums[i], nums[target] = nums[target], nums[i]

        for i in range(n):
            if nums[i] != i + 1:
                return i + 1
        return n + 1`,
  typescript: `function firstMissingPositive(nums: number[]): number {
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
            const target = nums[i] - 1;
            const temp = nums[i];
            nums[i] = nums[target];
            nums[target] = temp;
        }
    }
    for (let i = 0; i < n; i++) {
        if (nums[i] !== i + 1) return i + 1;
    }
    return n + 1;
}`
};

export const FIRST_MISSING_POSITIVE_CODE_LINES: Record<string, Record<string, number>> = {
  entry: { java: 3, cpp: 4, python: 3, typescript: 2 },
  loop1: { java: 5, cpp: 5, python: 4, typescript: 3 },
  whileSwap: { java: 6, cpp: 6, python: 5, typescript: 4 },
  loop2: { java: 12, cpp: 10, python: 9, typescript: 11 },
  foundMismatch: { java: 14, cpp: 11, python: 11, typescript: 12 },
  returnAllFit: { java: 17, cpp: 13, python: 12, typescript: 14 },
};

export function generateMissingPositiveSteps(inputNums: number[] = [3, 4, -1, 1]): MissingPositiveStep[] {
  const steps: MissingPositiveStep[] = [];
  const nums = [...inputNums];
  const n = nums.length;

  const lines = FIRST_MISSING_POSITIVE_CODE_LINES;

  const getStatus = () => nums.map((v, i) => v === i + 1);

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    currentIndex: 0,
    inPlaceStatus: getStatus(),
    missingResult: null,
    decision: `启动缺失正数检测：数组规模 N = ${n}，目标答案必在 [1, ${n + 1}] 范围内`,
    message: '鸽巢原理：若 1~N 均出现，则缺失 N+1；否则必在 [1, N] 内存在空缺槽位',
    log: `Init firstMissingPositive with nums=[${nums.join(', ')}]`,
    codeLine: lines.entry,
    metrics: {
      'min-missing': '置换扫描中...',
      'cur-index': `下标 [ 0 ] (预期 1)`,
      'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
      'array-scale': `N = ${n}`,
    },
  });

  // 第一阶段：原地置换归位
  for (let i = 0; i < n; i++) {
    steps.push({
      nums: [...nums],
      currentIndex: i,
      inPlaceStatus: getStatus(),
      missingResult: null,
      decision: `考查槽位 i = ${i}，当前数值为 ${nums[i]} (目标归位槽位下标应为 ${nums[i] - 1})`,
      message: `进入外层循环：检查 nums[${i}] 是否满足 1 <= x <= ${n} 且尚未归位`,
      log: `Outer loop check i=${i}, val=${nums[i]}`,
      codeLine: lines.loop1,
      metrics: {
        'min-missing': '置换扫描中...',
        'cur-index': `下标 [ ${i} ] (值 ${nums[i]})`,
        'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
        'array-scale': `N = ${n}`,
      },
    });

    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const targetIdx = nums[i] - 1;
      const valI = nums[i];
      const valTarget = nums[targetIdx];

      steps.push({
        nums: [...nums],
        currentIndex: i,
        swappedPair: [i, targetIdx],
        inPlaceStatus: getStatus(),
        missingResult: null,
        decision: `⚡ 满足置换条件：将 nums[${i}]=${valI} 交换至正确槽位下标 ${targetIdx} (当前槽值 ${valTarget})`,
        message: `置换中：把 ${valI} 放置到 nums[${targetIdx}]，将原占据该位置的 ${valTarget} 换回当前槽位重新裁决`,
        log: `Swap nums[${i}]=${valI} <-> nums[${targetIdx}]=${valTarget}`,
        codeLine: lines.whileSwap,
        statusBadge: { text: `交换 ${valI} ↔ ${valTarget}`, type: 'warning' },
        metrics: {
          'min-missing': '置换扫描中...',
          'cur-index': `置换 ${i} ↔ ${targetIdx}`,
          'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
          'array-scale': `N = ${n}`,
        },
      });

      // 实际交换
      const temp = nums[i];
      nums[i] = nums[targetIdx];
      nums[targetIdx] = temp;

      steps.push({
        nums: [...nums],
        currentIndex: i,
        swappedPair: [i, targetIdx],
        inPlaceStatus: getStatus(),
        missingResult: null,
        decision: `交换完成：数字 ${temp} 已成功归位至下标 ${targetIdx}！当前槽位换入新数值 ${nums[i]}，继续循环判定`,
        message: `持续原地置换：直到当前槽位的数字无法归位（超出 [1, N] 或已重复）`,
        log: `After swap: nums[${targetIdx}]=${temp}, current nums[${i}]=${nums[i]}`,
        codeLine: lines.whileSwap,
        metrics: {
          'min-missing': '置换扫描中...',
          'cur-index': `已置换 ${temp}➔#${targetIdx}`,
          'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
          'array-scale': `N = ${n}`,
        },
      });
    }
  }

  // 第二阶段：线性扫描寻找首个失配槽位
  let found = false;
  for (let i = 0; i < n; i++) {
    const expected = i + 1;
    const actual = nums[i];
    const isMismatch = actual !== expected;

    steps.push({
      nums: [...nums],
      currentIndex: i,
      inPlaceStatus: getStatus(),
      missingResult: isMismatch ? expected : null,
      decision: isMismatch
        ? `🚨 发现首个失配槽位！下标 i = ${i} 处数值为 ${actual}，缺失预期正数 ${expected}`
        : `槽位 i = ${i} 匹配成功：数值为 ${actual}，符合预期`,
      message: `核对槽位下标 i = ${i} 与数值 ${actual}`,
      log: `Scan slot i=${i}: actual=${actual}, expected=${expected} (${isMismatch ? 'MISMATCH' : 'MATCH'})`,
      codeLine: isMismatch ? lines.foundMismatch : lines.loop2,
      statusBadge: isMismatch
        ? { text: `首个缺失正数: ${expected}`, type: 'danger' }
        : { text: `槽位 ${i} 正常`, type: 'info' },
      metrics: {
        'min-missing': isMismatch ? expected : '扫描核对中...',
        'cur-index': `检查槽位 #${i}`,
        'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
        'array-scale': `N = ${n}`,
      },
    });

    if (isMismatch) {
      found = true;
      const ans = expected;
      steps.push({
        nums: [...nums],
        currentIndex: i,
        inPlaceStatus: getStatus(),
        missingResult: ans,
        decision: `🎉 算法求解完成！首个缺失的正整数即为 ${ans}`,
        message: `根据鸽巢原理，最小正整数为 ${ans}`,
        log: `Return first missing positive: ${ans}`,
        codeLine: lines.foundMismatch,
        statusBadge: { text: `最终结果: ${ans}`, type: 'success' },
        ans: String(ans),
        metrics: {
          'min-missing': ans,
          'cur-index': `首个失配 #${i}`,
          'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
          'array-scale': `N = ${n}`,
          'metric-ans': ans,
        },
      });
      break;
    }
  }

  if (!found) {
    const ans = n + 1;
    steps.push({
      nums: [...nums],
      currentIndex: n - 1,
      inPlaceStatus: getStatus(),
      missingResult: ans,
      decision: `🎉 1~${n} 全部完美归位！最小缺失正数为 N + 1 = ${ans}`,
      message: '全序列密集连续无断层',
      log: `All 1..${n} fit -> answer=${ans}`,
      codeLine: lines.returnAllFit,
      statusBadge: { text: `答案: ${ans}`, type: 'success' },
      ans: String(ans),
      metrics: {
        'min-missing': ans,
        'cur-index': '全序列连续',
        'in-place-count': `${n} / ${n} 槽`,
        'array-scale': `N = ${n}`,
        'metric-ans': ans,
      },
    });
  }

  return steps;
}
