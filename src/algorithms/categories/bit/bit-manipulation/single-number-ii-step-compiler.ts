/**
 * 只出现一次的数字 II (Single Number II) - 步进编译器
 * 核心原理：
 * 其余元素出现 3 次，唯独一个出现 1 次。
 * 运用有限状态自动机维护每一位的模 3 状态：
 * 计数状态：00 -> 01 -> 10 -> 00
 * 状态方程：
 * ones = (ones ^ num) & ~twos;
 * twos = (twos ^ num) & ~ones;
 */

import { SINGLE_NUMBER_II_LINES } from './bit-stage-codes';
import { BitStep } from './bit-shared';

export interface SingleNumberIIStep extends BitStep {
  nums: number[];
}

export function buildSingleNumberIISteps(nums: number[]): SingleNumberIIStep[] {
  const steps: SingleNumberIIStep[] = [];
  const lines = SINGLE_NUMBER_II_LINES;
  const bitsCount = 16;

  let ones = 0;
  let twos = 0;

  // Step 0: 入口
  steps.push({
    nums,
    decision: `主函数入口：处理数组 [${nums.join(', ')}]，其余数出现 3 次，找出唯一出现 1 次的数`,
    message: '利用模 3 状态自动机，ones 与 twos 维护每一个二进制位出现 1 次与 2 次的状态',
    log: `enter singleNumber([${nums.join(', ')}])`,
    codeLine: lines.entry,
    metrics: { '数组长度': `${nums.length}`, '初始 ones': '0', '初始 twos': '0' },
    stateView: { ones, twos },
  });

  // Step 1: 初始化状态机
  steps.push({
    nums,
    decision: `初始化状态寄存器：ones = 0, twos = 0`,
    message: 'ones 记录出现 1 次的位，twos 记录出现 2 次的位。当某位累积满 3 次时两者同时清零',
    log: 'init ones=0, twos=0',
    codeLine: lines.initVars,
    metrics: { 'ones': '0', 'twos': '0' },
    stateView: { ones, twos },
  });

  // 遍历每个数字
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    // Loop Header
    steps.push({
      nums,
      decision: `循环第 ${i + 1}/${nums.length} 轮：读取当前数字 num = ${num}`,
      message: `准备利用状态转换方程更新计数状态`,
      log: `loop idx=${i}, num=${num}`,
      codeLine: lines.loopHeader,
      metrics: { '当前下标': `${i}`, '当前 num': `${num}`, '当前 ones': `${ones}`, '当前 twos': `${twos}` },
      stateView: { ones, twos, curNum: num, curIndex: i },
      bitView: { title: `当前元素 num = ${num} 的二进制`, num, bitsCount },
    });

    // Update state
    ones = (ones ^ num) & ~twos;
    twos = (twos ^ num) & ~ones;

    steps.push({
      nums,
      decision: `状态更新完毕：ones = ${ones} (0b${(ones >>> 0).toString(2)}), twos = ${twos} (0b${(twos >>> 0).toString(2)})`,
      message: `方程执行：ones = (ones ^ num) & ~twos; twos = (twos ^ num) & ~ones;`,
      log: `update: ones=${ones}, twos=${twos}`,
      codeLine: lines.updateState,
      metrics: { '当前 num': `${num}`, '新 ones': `${ones}`, '新 twos': `${twos}` },
      stateView: { ones, twos, curNum: num, curIndex: i },
    });
  }

  // Return Ans
  steps.push({
    nums,
    decision: `算法执行完毕：返回最终 ones = ${ones}`,
    message: `出现 3 次的数字其各位均被重置为 0，唯独只出现 1 次的数字保留在 ones 中！`,
    log: `return ones=${ones}`,
    codeLine: lines.returnAns,
    metrics: { '最终唯一数': `${ones}`, '状态': '已完成' },
    stateView: { ones, twos },
    bitView: { title: `最终识别答案: ${ones}`, num: ones, bitsCount, highlightMask: ones },
  });

  return steps;
}
