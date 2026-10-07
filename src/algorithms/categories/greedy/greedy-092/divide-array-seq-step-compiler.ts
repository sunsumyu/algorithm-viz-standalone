/**
 * 将数组分成几个递增序列 (LeetCode 1121) - 步进推演编译器
 * 核心贪心：最高众数瓶颈判定 nums.length >= maxFreq * k
 */

import { DIVIDE_ARRAY_SEQ_LINES } from './greedy-092-stage-codes';
import { Greedy092Step } from './greedy-092-shared';

export interface DivideArraySeqStep extends Greedy092Step {
  line?: number;
  nums: number[];
  k: number;
  curFreq: number;
  maxFreq: number;
  maxFreqVal?: number;
  curIdx: number;
  canDivide: boolean;
}

export function parseDivideArraySeqInputs(inputs: Record<string, any>): { nums: number[]; k: number } {
  const rawNums = String(inputs?.['input-nums'] || '1, 2, 2, 3, 3, 4, 4');
  const nums = rawNums.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const k = parseInt(String(inputs?.['input-k'] ?? 3), 10);
  return { nums, k: isNaN(k) ? 3 : k };
}

export function buildDivideArraySeqSteps(nums: number[], k: number): DivideArraySeqStep[] {
  const steps: DivideArraySeqStep[] = [];
  const lines = DIVIDE_ARRAY_SEQ_LINES;
  const n = nums.length;

  // Step 0: 入口
  steps.push({
    line: lines.entry.java ?? 1,
    nums: [...nums],
    k,
    curFreq: 1,
    maxFreq: 1,
    curIdx: -1,
    canDivide: false,
    decision: `主函数入口：接收非递减数组 nums=[${nums.join(', ')}]，要求子序列最小长度 k=${k}`,
    message: '由于每个子序列必须严格递增，相同数字绝不能在同一子序列中，最高频次的数字决定了子序列数量的硬性下限',
    log: `enter canDivideIntoSubsequences(n=${n}, k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 扫描统计众数最高频次
  let maxFreq = 1;
  let curFreq = 1;
  let maxFreqVal = nums[0];

  for (let i = 1; i < n; i++) {
    if (nums[i] === nums[i - 1]) {
      curFreq++;
      if (curFreq > maxFreq) {
        maxFreq = curFreq;
        maxFreqVal = nums[i];
      }
    } else {
      curFreq = 1;
    }

    steps.push({
      line: lines.scanFreq.java ?? 2,
      nums: [...nums],
      k,
      curFreq,
      maxFreq,
      maxFreqVal,
      curIdx: i,
      canDivide: n >= maxFreq * k,
      decision: nums[i] === nums[i - 1]
        ? `考察 nums[${i}]=${nums[i]} == nums[${i - 1}] ➔ 相同数字连续出现，当前数字频次增至 ${curFreq}，历史最高频次 maxFreq=${maxFreq} (数值 ${maxFreqVal})`
        : `考察 nums[${i}]=${nums[i]} != nums[${i - 1}] ➔ 遇到新数值，重置当前频次 curFreq=1`,
      message: `至少需要划分为 ${maxFreq} 个互不相交的严格递增子序列`,
      log: `scan i=${i} val=${nums[i]} curFreq=${curFreq} maxFreq=${maxFreq}`,
      codeLine: lines.scanFreq,
    });
  }

  // Step 2: 瓶颈条件校验
  const requiredLen = maxFreq * k;
  const canDivide = n >= requiredLen;

  steps.push({
    line: lines.checkBottleneck.java ?? 3,
    nums: [...nums],
    k,
    curFreq,
    maxFreq,
    maxFreqVal,
    curIdx: -1,
    canDivide,
    decision: canDivide
      ? `🎉 判定成功！数组总长度 n=${n} >= 众数瓶颈需求 (maxFreq * k = ${maxFreq} * ${k} = ${requiredLen}) ➔ 可以成功划分！`
      : `❌ 判定失败！数组总长度 n=${n} < 众数瓶颈需求 (maxFreq * k = ${maxFreq} * ${k} = ${requiredLen}) ➔ 元素不足以填满 ${maxFreq} 个长度至少为 ${k} 的严格递增子序列！`,
    message: canDivide ? '可以通过轮询分配法构造出合法划分' : '由鸽巢原理证明无解',
    log: `done canDivide=${canDivide}`,
    codeLine: lines.checkBottleneck,
  });

  return steps;
}
