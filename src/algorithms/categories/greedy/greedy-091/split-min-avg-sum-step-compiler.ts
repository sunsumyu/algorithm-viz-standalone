import { SPLIT_MIN_AVG_SUM_LINES } from './greedy-091-stage-codes';
import { Greedy091Step } from './greedy-091-shared';

export interface SetGroup {
  id: number;
  elements: number[];
  sum: number;
  count: number;
  avg: number;
}

export interface SplitMinAvgSumStep extends Greedy091Step {
  line?: number;
  originalArr: number[];
  sortedArr: number[];
  k: number;
  groups: SetGroup[];
  totalAvgSum: number;
}

export function buildSplitMinAvgSumSteps(arr: number[], k: number): SplitMinAvgSumStep[] {
  const steps: SplitMinAvgSumStep[] = [];
  const lines = SPLIT_MIN_AVG_SUM_LINES;

  // Step 0: 入口
  steps.push({
    line: (lines.entry as any).java ?? 1,
    originalArr: [...arr],
    sortedArr: [...arr],
    k,
    groups: [],
    totalAvgSum: 0,
    decision: `主函数入口：接收数组 arr=[${arr.join(', ')}]，划分组数 k=${k}`,
    message: '为了使总平均值最小，需要尽可能减少大数值对平均值的贡献权重',
    log: `enter minAverageSum(arr=[${arr.join(',')}], k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 升序排序
  const sorted = [...arr].sort((a, b) => a - b);
  steps.push({
    line: (lines.sortArr as any).java ?? 2,
    originalArr: [...arr],
    sortedArr: [...sorted],
    k,
    groups: [],
    totalAvgSum: 0,
    decision: `贪心预处理：将数组按升序排序 ➔ [${sorted.join(', ')}]`,
    message: '最小的 k-1 个数放入独立集合（大小为1），剩余元素并入大集合稀释',
    log: `sorted arr: [${sorted.join(',')}]`,
    codeLine: lines.sortArr,
  });

  // Step 2: 分配前 k-1 个单元素集合
  const groups: SetGroup[] = [];
  let totalAvgSum = 0;

  for (let i = 0; i < k - 1; i++) {
    const val = sorted[i];
    groups.push({
      id: i + 1,
      elements: [val],
      sum: val,
      count: 1,
      avg: val,
    });
    totalAvgSum += val;

    steps.push({
      line: (lines.singleSets as any).java ?? 5,
      originalArr: [...arr],
      sortedArr: [...sorted],
      k,
      groups: groups.map(g => ({ ...g, elements: [...g.elements] })),
      totalAvgSum,
      decision: `构造集合 #${i + 1}：独占分配单元素 [${val}]，平均值 = ${val}/1 = ${val}，累计平均和 = ${totalAvgSum}`,
      message: `小元素自身平均值低，单元素独占不会造成浪费`,
      log: `group #${i + 1} = [${val}] avg=${val}`,
      codeLine: lines.singleSets,
    });
  }

  // Step 3: 剩余元素全部并入第 k 个集合
  const lastElements = sorted.slice(k - 1);
  const lastSum = lastElements.reduce((a, b) => a + b, 0);
  const lastCount = lastElements.length;
  const lastAvg = Math.floor(lastSum / lastCount);
  totalAvgSum += lastAvg;

  groups.push({
    id: k,
    elements: [...lastElements],
    sum: lastSum,
    count: lastCount,
    avg: lastAvg,
  });

  steps.push({
    line: (lines.diluteSet as any).java ?? 11,
    originalArr: [...arr],
    sortedArr: [...sorted],
    k,
    groups: groups.map(g => ({ ...g, elements: [...g.elements] })),
    totalAvgSum,
    decision: `构造最后一个集合 #${k}：合并剩余 ${lastCount} 个较大元素 [${lastElements.join(', ')}]，总和 sum=${lastSum}，平均值 = ⌊${lastSum}/${lastCount}⌋ = ${lastAvg}`,
    message: `大数值被 ${lastCount} 的大分母充分稀释！`,
    log: `group #${k} = [${lastElements.join(',')}] avg=${lastAvg}`,
    codeLine: lines.diluteSet,
  });

  // Step 4: 最终收敛
  steps.push({
    line: (lines.done as any).java ?? 12,
    originalArr: [...arr],
    sortedArr: [...sorted],
    k,
    groups: groups.map(g => ({ ...g, elements: [...g.elements] })),
    totalAvgSum,
    decision: `🎉 计算完毕！划分成 ${k} 个集合的最小平均值累加和为 ${totalAvgSum}`,
    message: '贪心划分策略全局最优',
    log: `done totalAvgSum=${totalAvgSum}`,
    codeLine: lines.done,
  });

  return steps;
}
