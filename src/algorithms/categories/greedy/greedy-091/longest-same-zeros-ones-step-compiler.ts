import { LONGEST_SAME_ZEROS_ONES_LINES } from './greedy-091-stage-codes';
import { Greedy091Step } from './greedy-091-shared';

export interface IntervalDef {
  name: string;
  l: number;
  r: number;
  zeros: number;
  ones: number;
  len: number;
}

export interface LongestSameZerosOnesStep extends Greedy091Step {
  line?: number;
  arr: number[];
  intervalA?: IntervalDef;
  intervalB?: IntervalDef;
  maxLen: number;
  reasonText: string;
}

export function buildLongestSameZerosOnesSteps(arr: number[]): LongestSameZerosOnesStep[] {
  const steps: LongestSameZerosOnesStep[] = [];
  const lines = LONGEST_SAME_ZEROS_ONES_LINES;
  const n = arr.length;

  // Step 0: 入口
  steps.push({
    line: (lines.entry as any).java ?? 1,
    arr: [...arr],
    maxLen: 0,
    reasonText: '准备校验边界与长度特判',
    decision: `主函数入口：接收 01 数组 arr=[${arr.join(', ')}]，长度 n=${n}`,
    message: '目标：找出两个不完全重叠且 0 和 1 数量分别相等的最大区间',
    log: `enter maxEqualIntervalLength(n=${n})`,
    codeLine: lines.entry,
  });

  // 特判 n <= 2
  if (n <= 1) {
    steps.push({
      line: (lines.guardSmall as any).java ?? 3,
      arr: [...arr],
      maxLen: 0,
      reasonText: '长度 n <= 1 无法构造两个不完全重叠的区间',
      decision: `特判：n=${n} <= 1，无法选出两个非完全重合区间，返回 0`,
      message: '特判分支结束',
      log: 'guard n<=1 -> 0',
      codeLine: lines.guardSmall,
    });
    return steps;
  }

  if (n === 2) {
    const isSame = arr[0] === arr[1];
    const ans = isSame ? 1 : 0;
    steps.push({
      line: (lines.guardSmall as any).java ?? 3,
      arr: [...arr],
      maxLen: ans,
      reasonText: isSame ? '两个元素相同，可取区间 [0,0] 与 [1,1]' : '两元素不同，不存在统计相同的两个区间',
      decision: `特判：n=2，arr[0]=${arr[0]}, arr[1]=${arr[1]} ➔ ${isSame ? '相同，返回长度 1' : '不同，返回 0'}`,
      message: '特判分支结束',
      log: `guard n==2 -> ${ans}`,
      codeLine: lines.guardSmall,
    });
    return steps;
  }

  // 考察长度为 n-1 的两个区间
  const isEndsEqual = arr[0] === arr[n - 1];

  // 区间 A: [0, n-2] (去掉 arr[n-1])
  const aZeros = arr.slice(0, n - 1).filter(x => x === 0).length;
  const aOnes = arr.slice(0, n - 1).filter(x => x === 1).length;
  const intA: IntervalDef = { name: '区间 A (排除末尾)', l: 0, r: n - 2, zeros: aZeros, ones: aOnes, len: n - 1 };

  // 区间 B: [1, n-1] (去掉 arr[0])
  const bZeros = arr.slice(1, n).filter(x => x === 0).length;
  const bOnes = arr.slice(1, n).filter(x => x === 1).length;
  const intB: IntervalDef = { name: '区间 B (排除首位)', l: 1, r: n - 1, zeros: bZeros, ones: bOnes, len: n - 1 };

  steps.push({
    line: (lines.checkEnds as any).java ?? 5,
    arr: [...arr],
    intervalA: intA,
    intervalB: intB,
    maxLen: isEndsEqual ? n - 1 : n - 2,
    reasonText: `比对首尾端点 arr[0]=${arr[0]} 与 arr[${n - 1}]=${arr[n - 1]}`,
    decision: `考察首尾字符：arr[0]=${arr[0]}，arr[${n - 1}]=${arr[n - 1]} ➔ ${isEndsEqual ? '首尾相同！' : '首尾不同！'}`,
    message: `若首尾相同，则区间 [0, ${n - 2}] 与 [1, ${n - 1}] 去除的元素相同，其 0/1 统计必然相等`,
    log: `check ends: arr[0]=${arr[0]} arr[${n - 1}]=${arr[n - 1]}`,
    codeLine: lines.checkEnds,
  });

  if (isEndsEqual) {
    steps.push({
      line: (lines.returnNMinus1 as any).java ?? 6,
      arr: [...arr],
      intervalA: intA,
      intervalB: intB,
      maxLen: n - 1,
      reasonText: `首尾一致，区间 [0, ${n - 2}] 和 [1, ${n - 1}] 的 0 数量均为 ${aZeros}，1 数量均为 ${aOnes}`,
      decision: `🎉 首尾字符相同：区间 [0, ${n - 2}] 与 [1, ${n - 1}] 完美匹配，返回最大长度 n - 1 = ${n - 1}`,
      message: '达成理论最大可能长度',
      log: `done ans=${n - 1}`,
      codeLine: lines.returnNMinus1,
    });
  } else {
    // 首尾不同，抽屉原理必在 n-2 处找到解
    const subA: IntervalDef = { name: '区间 A [0, n-3]', l: 0, r: n - 3, zeros: arr.slice(0, n - 2).filter(x => x === 0).length, ones: arr.slice(0, n - 2).filter(x => x === 1).length, len: n - 2 };
    const subB: IntervalDef = { name: '区间 B [2, n-1]', l: 2, r: n - 1, zeros: arr.slice(2, n).filter(x => x === 0).length, ones: arr.slice(2, n).filter(x => x === 1).length, len: n - 2 };

    steps.push({
      line: (lines.returnNMinus2 as any).java ?? 8,
      arr: [...arr],
      intervalA: subA,
      intervalB: subB,
      maxLen: n - 2,
      reasonText: `首尾不同，抽屉原理保证在长度为 ${n - 2} 的 3 个区间中必有 2 个区间 0/1 统计相同`,
      decision: `🎉 首尾字符不同：由抽屉原理保证最大区间长度为 n - 2 = ${n - 2}`,
      message: '达成全局最优解',
      log: `done ans=${n - 2}`,
      codeLine: lines.returnNMinus2,
    });
  }

  return steps;
}
