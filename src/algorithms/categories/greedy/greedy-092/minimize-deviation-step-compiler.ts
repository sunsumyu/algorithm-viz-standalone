/**
 * 数组的最小偏移量 (LeetCode 1675) - 步进推演编译器
 * 核心贪心：奇数乘2单调归一化 + 大顶堆贪心除2缩小极差
 */

import { MINIMIZE_DEVIATION_LINES } from './greedy-092-stage-codes';
import { Greedy092Step } from './greedy-092-shared';

export interface MinimizeDeviationStep extends Greedy092Step {
  line?: number;
  originalNums: number[];
  heap: number[];
  minVal: number;
  maxVal: number;
  ans: number;
  poppedVal?: number;
  pushedVal?: number;
}

export function parseMinimizeDeviationInputs(inputs: Record<string, any>): number[] {
  const raw = String(inputs?.['input-nums'] || '4, 1, 5, 20, 3');
  return raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
}

export function buildMinimizeDeviationSteps(nums: number[]): MinimizeDeviationStep[] {
  const steps: MinimizeDeviationStep[] = [];
  const lines = MINIMIZE_DEVIATION_LINES;
  const n = nums.length;

  // Step 0: 入口
  steps.push({
    line: lines.entry.java ?? 1,
    originalNums: [...nums],
    heap: [],
    minVal: 0,
    maxVal: 0,
    ans: Infinity,
    decision: `主函数入口：接收输入数组 nums=[${nums.join(', ')}]，长度 n=${n}`,
    message: '为了消除双向操作（奇数乘2与偶数除2）的混乱，第一步将所有奇数乘以2，全部归一为偶数上限',
    log: `enter minimumDeviation(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 归一化入堆
  const heap = nums.map((x) => (x % 2 === 1 ? x * 2 : x));
  heap.sort((a, b) => b - a);
  let minVal = Math.min(...heap);
  let maxVal = heap[0];
  let ans = maxVal - minVal;

  steps.push({
    line: lines.initHeap.java ?? 2,
    originalNums: [...nums],
    heap: [...heap],
    minVal,
    maxVal,
    ans,
    decision: `奇数翻倍归一化：将奇数扩大为偶数 ➔ [${heap.join(', ')}]，当前最小值 minVal=${minVal}，最大值 maxVal=${maxVal}，初始偏移量 ans = ${maxVal} - ${minVal} = ${ans}`,
    message: '所有元素达到各自理论最大值，后续只需考虑大数除以2以缩小极差',
    log: `init heap [${heap.join(',')}] ans=${ans}`,
    codeLine: lines.initHeap,
  });

  // Step 2: 核心贪心除以 2
  let iter = 0;
  while (iter < 30) {
    iter++;
    heap.sort((a, b) => b - a);
    maxVal = heap[0];
    const curDiff = maxVal - minVal;
    if (curDiff < ans) ans = curDiff;

    if (maxVal % 2 !== 0) {
      steps.push({
        line: lines.done.java ?? 4,
        originalNums: [...nums],
        heap: [...heap],
        minVal,
        maxVal,
        ans,
        decision: `当前堆顶最大值 ${maxVal} 是奇数！无法再继续除以 2 缩小，贪心收敛终止`,
        message: `最终锁定全局最小偏移量: ${ans}`,
        log: `top ${maxVal} is odd, terminate`,
        codeLine: lines.done,
      });
      break;
    }

    const popped = heap.shift()!;
    const half = popped / 2;
    heap.push(half);
    minVal = Math.min(minVal, half);
    heap.sort((a, b) => b - a);
    const newDiff = heap[0] - minVal;
    const isBetter = newDiff < ans;
    if (isBetter) ans = newDiff;

    steps.push({
      line: lines.reduceEven.java ?? 3,
      originalNums: [...nums],
      heap: [...heap],
      minVal,
      maxVal: heap[0],
      ans,
      poppedVal: popped,
      pushedVal: half,
      decision: `弹出当前堆顶最大偶数 ${popped}，除以 2 变为 ${half} 并压回堆中，更新 minVal=${minVal}，当前极差 = ${heap[0]} - ${minVal} = ${newDiff} ➔ ${isBetter ? '刷新最小偏移量！' : '保持历史最优'}`,
      message: `全局最小偏移量 ans=${ans}`,
      log: `popped ${popped} -> ${half}, newDiff=${newDiff}, ans=${ans}`,
      codeLine: lines.reduceEven,
    });
  }

  // 收敛
  steps.push({
    line: lines.done.java ?? 4,
    originalNums: [...nums],
    heap: [...heap],
    minVal,
    maxVal: heap[0],
    ans,
    decision: `🎉 计算完毕！数组可达到的全局最小偏移量为 ${ans}`,
    message: '单向贪心收敛证明全局最优',
    log: `done ans=${ans}`,
    codeLine: lines.done,
  });

  return steps;
}
