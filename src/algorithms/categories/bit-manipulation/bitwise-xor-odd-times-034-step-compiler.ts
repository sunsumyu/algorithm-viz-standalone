/**
 * Class 034: 异或运算的奇妙用法与奇数次提取 (Bitwise XOR Odd Occurrences) - 步进编译器
 * 左程云算法通关课入门篇 Class 034 / LeetCode 136 & 260
 */

import { StepBase } from '../../../core/step-visualizer';

export interface XorStep extends StepBase {
  stepIndex?: number;
  mode: 'single' | 'double';
  nums: number[];
  currentIndex: number;
  eorAll: number;
  rightOne?: number;
  groupA?: number[]; // 第 k 位为 1 的元素
  groupB?: number[]; // 第 k 位为 0 的元素
  resultA?: number;
  resultB?: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BITWISE_XOR_CODES = {
  java: `public class BitwiseXorPractice {
    // 1. 只有一种数出现奇数次，其余出现偶数次 (LeetCode 136)
    public static int printOddTimesNum1(int[] arr) {
        int eor = 0;
        for (int num : arr) {
            eor ^= num; // 成对偶数异或自动抵消为 0
        }
        return eor;
    }

    // 2. 有两种数 (a 和 b) 出现奇数次，其余出现偶数次 (LeetCode 260)
    public static int[] printOddTimesNum2(int[] arr) {
        int eor = 0;
        for (int num : arr) eor ^= num; // eor = a ^ b
        // 提取最右侧的 1
        int rightOne = eor & (-eor);
        int onlyOne = 0;
        for (int num : arr) {
            if ((num & rightOne) != 0) {
                onlyOne ^= num; // 仅与该位为 1 的数异或，最终得到 a 或 b
            }
        }
        return new int[]{onlyOne, eor ^ onlyOne};
    }
}`,
  cpp: `class Solution {
public:
    // 1. 单个奇数次
    int singleNumber(vector<int>& nums) {
        int eor = 0;
        for (int x : nums) eor ^= x;
        return eor;
    }
    // 2. 两个奇数次
    vector<int> singleNumber2(vector<int>& nums) {
        int eor = 0;
        for (int x : nums) eor ^= x;
        int rightOne = eor & (-eor);
        int a = 0;
        for (int x : nums) {
            if (x & rightOne) a ^= x;
        }
        return {a, eor ^ a};
    }
};`,
  python: `class Solution:
    def single_number_1(self, nums: list[int]) -> int:
        eor = 0
        for x in nums:
            eor ^= x
        return eor

    def single_number_2(self, nums: list[int]) -> list[int]:
        eor = 0
        for x in nums:
            eor ^= x
        right_one = eor & (-eor)
        only_one = 0
        for x in nums:
            if x & right_one:
                only_one ^= x
        return [only_one, eor ^ only_one]`,
  typescript: `function singleNumber1(nums: number[]): number {
    let eor = 0;
    for (const x of nums) eor ^= x;
    return eor;
}

function singleNumber2(nums: number[]): number[] {
    let eor = 0;
    for (const x of nums) eor ^= x;
    const rightOne = eor & (-eor);
    let onlyOne = 0;
    for (const x of nums) {
        if ((x & rightOne) !== 0) onlyOne ^= x;
    }
    return [onlyOne, eor ^ onlyOne];
}`
};

export const BITWISE_XOR_CODE_LINES: Record<string, Record<string, number>> = {
  singleEntry: { java: 3, cpp: 4, python: 3, typescript: 1, javascript: 1 },
  singleLoop: { java: 5, cpp: 6, python: 5, typescript: 3, javascript: 3 },
  singleReturn: { java: 8, cpp: 7, python: 6, typescript: 4, javascript: 4 },
  doubleEntry: { java: 12, cpp: 11, python: 9, typescript: 8, javascript: 8 },
  doubleLoop1: { java: 14, cpp: 12, python: 11, typescript: 9, javascript: 9 },
  doubleRightOne: { java: 16, cpp: 13, python: 12, typescript: 10, javascript: 10 },
  doubleLoop2: { java: 19, cpp: 16, python: 15, typescript: 13, javascript: 13 },
  doubleReturn: { java: 23, cpp: 18, python: 17, typescript: 15, javascript: 15 },
};

export function generateXorSteps(mode: 'single' | 'double' = 'double'): XorStep[] {
  const steps: XorStep[] = [];
  const nums = mode === 'single'
    ? [4, 1, 2, 1, 2] // 4 出现 1 次，其余出现 2 次
    : [3, 5, 2, 3, 2, 7]; // 5 与 7 出现 1 次，其余出现 2 次

  const lines = BITWISE_XOR_CODE_LINES;

  if (mode === 'single') {
    // Step 0: 单奇数入口
    steps.push({
      mode,
      nums,
      currentIndex: -1,
      eorAll: 0,
      decision: '启动异或求奇数次：输入序列含有 1 种奇数次数字',
      message: '异或核心性质：自反性 A^A=0 与恒等律 A^0=A。所有成对偶数次自动抵消为 0',
      log: `Init single odd: [${nums.join(', ')}]`,
      codeLine: lines.singleEntry,
      statusBadge: { text: '算法启动', type: 'info' },
    });

    let eor = 0;
    for (let i = 0; i < nums.length; i++) {
      const prev = eor;
      eor ^= nums[i];
      steps.push({
        mode,
        nums,
        currentIndex: i,
        eorAll: eor,
        decision: `遍历到元素 [${i}] = ${nums[i]} ➔ eor = ${prev} ^ ${nums[i]} = ${eor}`,
        message: `当前累积异或和更新为 ${eor}`,
        log: `eor ^= ${nums[i]} -> ${eor}`,
        codeLine: lines.singleLoop,
        statusBadge: { text: `异或 ${nums[i]}`, type: 'info' },
      });
    }

    steps.push({
      mode,
      nums,
      currentIndex: nums.length - 1,
      eorAll: eor,
      resultA: eor,
      decision: `🎉 扫描完毕！唯一出现奇数次的数字是：${eor}`,
      message: '成对偶数次已被完全抵消，剩余值即为奇数次目标',
      log: `Single odd result = ${eor}`,
      codeLine: lines.singleReturn,
      statusBadge: { text: `答案: ${eor}`, type: 'success' },
    });
  } else {
    // 双奇数次
    steps.push({
      mode,
      nums,
      currentIndex: -1,
      eorAll: 0,
      decision: '启动双奇数次提取：输入序列含有 2 种奇数次数字 (a 与 b)',
      message: '第一阶段：全量异或得到 eor = a ^ b。由于 a != b，eor 必有至少某一位为 1！',
      log: `Init double odd: [${nums.join(', ')}]`,
      codeLine: lines.doubleEntry,
      statusBadge: { text: '算法启动', type: 'info' },
    });

    let eor = 0;
    for (let i = 0; i < nums.length; i++) {
      const prev = eor;
      eor ^= nums[i];
      steps.push({
        mode,
        nums,
        currentIndex: i,
        eorAll: eor,
        decision: `第一轮异或 [${i}] = ${nums[i]} ➔ eor 变为 ${eor}`,
        message: `全量异或推进中，成对数字已在二进制层级自消`,
        log: `Phase 1: eor ^= ${nums[i]} -> ${eor}`,
        codeLine: lines.doubleLoop1,
        statusBadge: { text: `累加异或: ${eor}`, type: 'info' },
      });
    }

    // 提取最右侧的 1
    const rightOne = eor & (-eor);
    steps.push({
      mode,
      nums,
      currentIndex: -1,
      eorAll: eor,
      rightOne,
      decision: `关键分水岭：提取 eor (${eor}) 最右侧为 1 的位 ➔ rightOne = ${rightOne} (二进制: ${rightOne.toString(2)})`,
      message: `公式 rightOne = eor & (-eor)。在这一 bit 位上，两目标数必定一个为 1，另一个为 0！`,
      log: `rightOne extracted: ${rightOne}`,
      codeLine: lines.doubleRightOne,
      statusBadge: { text: `最右 1: ${rightOne}`, type: 'warning' },
    });

    // 分组异或
    let onlyOne = 0;
    const groupA: number[] = [];
    const groupB: number[] = [];

    for (let i = 0; i < nums.length; i++) {
      const val = nums[i];
      const hasBit = (val & rightOne) !== 0;
      if (hasBit) {
        groupA.push(val);
        onlyOne ^= val;
      } else {
        groupB.push(val);
      }

      steps.push({
        mode,
        nums,
        currentIndex: i,
        eorAll: eor,
        rightOne,
        groupA: [...groupA],
        groupB: [...groupB],
        resultA: onlyOne,
        decision: `考察 [${i}] = ${val}：该 bit 位为 ${hasBit ? '1 (加入组 A 异或池)' : '0 (划分至组 B)'}`,
        message: hasBit ? `组 A 累积异或 onlyOne 更新为 ${onlyOne}` : '组 B 数字被自然隔离，互不干扰',
        log: `Phase 2: num=${val}, bit=${hasBit ? 1 : 0}, onlyOne=${onlyOne}`,
        codeLine: lines.doubleLoop2,
        statusBadge: { text: hasBit ? '组 A 吸收' : '划分组 B', type: hasBit ? 'success' : 'info' },
      });
    }

    const otherOne = eor ^ onlyOne;
    steps.push({
      mode,
      nums,
      currentIndex: nums.length - 1,
      eorAll: eor,
      rightOne,
      groupA,
      groupB,
      resultA: onlyOne,
      resultB: otherOne,
      decision: `🎉 成功解出两奇数次数字！分别是：${onlyOne} 与 ${otherOne}`,
      message: `第二个数由 eor ^ onlyOne = ${eor} ^ ${onlyOne} = ${otherOne} 瞬间反解`,
      log: `Final results: a=${onlyOne}, b=${otherOne}`,
      codeLine: lines.doubleReturn,
      statusBadge: { text: `解出 [${onlyOne}, ${otherOne}]`, type: 'success' },
    });
  }

  return steps;
}
