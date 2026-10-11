/**
 * 只出现一次的数字 III (Single Number III) - 步进编译器
 * 核心原理：
 * 数组中只有两个数字 a 和 b 出现 1 次，其余数字出现 2 次。
 * 1. 全员异或得 xor = a ^ b
 * 2. 提取最右侧的 1: diff = xor & (-xor)
 * 3. 按照该位是否为 1 将所有数字划分为两组，分别异或得到 a 和 b
 */

import { SINGLE_NUMBER_III_LINES } from './bit-stage-codes';
import { BitStep } from './bit-shared';

export interface SingleNumberIIIStep extends BitStep {
  nums: number[];
}

export function buildSingleNumberIIISteps(nums: number[]): SingleNumberIIIStep[] {
  const steps: SingleNumberIIIStep[] = [];
  const lines = SINGLE_NUMBER_III_LINES;
  const bitsCount = 16;

  // Step 0: 入口
  steps.push({
    nums,
    decision: `主函数入口：分析数组 [${nums.join(', ')}]，找出两个唯一只出现 1 次的数字`,
    message: '全员异或消除所有成对元素，最终得到两孤立数的异或结果 xor = a ^ b',
    log: `enter singleNumberIII([${nums.join(', ')}])`,
    codeLine: lines.entry,
    metrics: { '数组长度': `${nums.length}`, '阶段': '准备全员异或' },
  });

  // Step 1: 全员异或
  let xorVal = 0;
  for (let i = 0; i < nums.length; i++) {
    xorVal ^= nums[i];
  }

  steps.push({
    nums,
    decision: `第一轮异或扫描完毕：得到 a ^ b = ${xorVal} (0b${(xorVal >>> 0).toString(2)})`,
    message: '相同数字异或为 0，消去所有两两出现的数，仅剩下 a 与 b 的异或结果',
    log: `total XOR result = ${xorVal}`,
    codeLine: lines.totalXor,
    metrics: { 'xor 结果': `${xorVal}`, '二进制': `0b${(xorVal >>> 0).toString(2)}` },
    bitView: { title: `全员异或结果 a ^ b = ${xorVal}`, num: xorVal, bitsCount },
  });

  // Step 2: 提取 lowest 1 bit
  const diff = xorVal & (-xorVal);
  const diffPos = Math.floor(Math.log2(diff));

  steps.push({
    nums,
    decision: `提取分流基准位：diff = xor & (-xor) = ${diff} (第 ${diffPos} 位)`,
    message: `第 ${diffPos} 位为 1 说明 a 和 b 在该二进制位上必然一个为 1、另一个为 0！可以作为天然的分流依据！`,
    log: `diff bit extracted: ${diff} at bit ${diffPos}`,
    codeLine: lines.findDiff,
    metrics: { 'diff 掩码': `${diff}`, '分流位': `第 ${diffPos} 位` },
    bitView: { title: `分流掩码 diff = ${diff}`, num: diff, bitsCount, highlightMask: diff },
    groupView: { diff, diffBitPos: diffPos, groupA: [], groupB: [] },
  });

  // Step 3: 分流异或
  let a = 0;
  let b = 0;
  const groupA: number[] = [];
  const groupB: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const isGroupA = (num & diff) !== 0;
    if (isGroupA) {
      a ^= num;
      groupA.push(num);
    } else {
      b ^= num;
      groupB.push(num);
    }

    steps.push({
      nums,
      decision: `分流第 ${i + 1}/${nums.length} 个数 ${num}：(num & diff) ${isGroupA ? '!= 0' : '== 0'}，分流到组 ${isGroupA ? 'A' : 'B'}`,
      message: `组 ${isGroupA ? 'A' : 'B'} 当前累积异或结果: ${isGroupA ? a : b}`,
      log: `num ${num} -> group ${isGroupA ? 'A' : 'B'}, acc xor=${isGroupA ? a : b}`,
      codeLine: lines.groupSplit,
      metrics: { '当前数字': `${num}`, '组 A 异或结果': `${a}`, '组 B 异或结果': `${b}` },
      groupView: { diff, diffBitPos: diffPos, groupA: [...groupA], groupB: [...groupB], curNum: num, xorA: a, xorB: b },
    });
  }

  // Step 4: 返回结果 [a, b]
  steps.push({
    nums,
    decision: `分流异或完成！成功剥离两个唯一出现的数：[${a}, ${b}]`,
    message: '组 A 内部成对数字互相抵消只留下 a；组 B 内部成对数字抵消只留下 b！',
    log: `return [${a}, ${b}]`,
    codeLine: lines.returnAns,
    metrics: { '结果 a': `${a}`, '结果 b': `${b}`, '状态': '已完成' },
    groupView: { diff, diffBitPos: diffPos, groupA, groupB, xorA: a, xorB: b },
  });

  return steps;
}
