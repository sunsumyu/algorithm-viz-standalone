/**
 * 经典过河问题 (Cross River) StepCompiler
 * 核心贪心：每次运送最慢两人，比较策略 1 (最快者当船夫) 与策略 2 (双快护航，慢者同行)
 */

import { CROSS_RIVER_LINES } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';
import { Greedy093Step } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-shared';

export interface RoundCrossingDef {
  slow1: number;
  slow2: number;
  cost1: number; // T[i] + T[0] + T[i-1] + T[0]
  cost2: number; // T[1] + T[0] + T[i] + T[1]
  winner: 'strategy1' | 'strategy2';
  chosenCost: number;
}

export interface CrossRiverStep extends Greedy093Step {
  times: number[];
  leftBank: number[];
  rightBank: number[];
  rounds: RoundCrossingDef[];
  totalTime: number;
  curRound?: RoundCrossingDef;
}

export function buildCrossRiverSteps(rawTimes: number[]): CrossRiverStep[] {
  const steps: CrossRiverStep[] = [];
  const lines = CROSS_RIVER_LINES;
  const times = [...rawTimes].sort((a, b) => a - b);
  const n = times.length;

  // Step 0: 入口
  steps.push({
    times: [...times],
    leftBank: [...times],
    rightBank: [],
    rounds: [],
    totalTime: 0,
    decision: `主函数入口：共有 n=${n} 个人在夜间等待过河，耗时数组为 [${times.join(', ')}]`,
    message: '核心目标：用最少时间将所有人运送到对岸，每次运送最慢的两个人',
    log: `enter minCrossingTime(times=[${times.join(',')}])`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
  });

  // Step 1: 升序排序
  steps.push({
    times: [...times],
    leftBank: [...times],
    rightBank: [],
    rounds: [],
    totalTime: 0,
    decision: `贪心排序：按过河耗时升序排序 ➔ [${times.join(', ')}]，最快者 T[0]=${times[0]}，次快者 T[1]=${n > 1 ? times[1] : times[0]}`,
    message: '由最快的一两个人负责将手电筒划回',
    log: `sorted times=[${times.join(',')}]`,
    line: lines.sortTimes.javascript,
    codeLine: lines.sortTimes,
  });

  let totalTime = 0;
  const leftBank = [...times];
  const rightBank: number[] = [];
  const rounds: RoundCrossingDef[] = [];

  let i = n - 1;
  while (i >= 3) {
    const s1 = times[i] + times[0] + times[i - 1] + times[0];
    const s2 = times[1] + times[0] + times[i] + times[1];
    const isS1Better = s1 < s2;
    const chosenCost = Math.min(s1, s2);
    totalTime += chosenCost;

    const roundDef: RoundCrossingDef = {
      slow1: times[i - 1],
      slow2: times[i],
      cost1: s1,
      cost2: s2,
      winner: isS1Better ? 'strategy1' : 'strategy2',
      chosenCost,
    };
    rounds.push(roundDef);

    // 移出最慢两人
    const moved1 = leftBank.pop()!;
    const moved2 = leftBank.pop()!;
    rightBank.push(moved2, moved1);

    steps.push({
      times: [...times],
      leftBank: [...leftBank],
      rightBank: [...rightBank],
      rounds: [...rounds],
      curRound: roundDef,
      totalTime,
      decision: `运送最慢两人 (${times[i - 1]}, ${times[i]})：\n• 策略1 (快者护送): ${times[i]} + ${times[0]} + ${times[i - 1]} + ${times[0]} = ${s1} 分钟\n• 策略2 (双快护航): ${times[1]} + ${times[0]} + ${times[i]} + ${times[1]} = ${s2} 分钟\n➔ 贪心选择【${isS1Better ? '策略1 (快者护送)' : '策略2 (双快护航)'}】，增加耗时 ${chosenCost} 分钟，累计耗时 ${totalTime} 分钟`,
      message: `左岸剩余人数: ${leftBank.length}，右岸已达人数: ${rightBank.length}`,
      log: `round slow=(${times[i - 1]},${times[i]}), s1=${s1}, s2=${s2}, chose=${chosenCost}`,
      line: lines.compareS1S2.javascript,
      codeLine: lines.compareS1S2,
    });

    i -= 2;
  }

  // 基底边界处理
  if (i === 2) {
    const baseCost = times[0] + times[1] + times[2];
    totalTime += baseCost;
    rightBank.push(...leftBank);
    leftBank.length = 0;

    steps.push({
      times: [...times],
      leftBank: [],
      rightBank: [...rightBank],
      rounds: [...rounds],
      totalTime,
      decision: `基底情况：左岸剩余 3 人 [${times[0]}, ${times[1]}, ${times[2]}] ➔ 耗时 T[0]+T[1]+T[2] = ${times[0]}+${times[1]}+${times[2]} = ${baseCost} 分钟，全部人员抵达对岸`,
      message: '基底计算完成',
      log: `base case 3 persons cost=${baseCost}`,
      line: lines.baseCase.javascript,
      codeLine: lines.baseCase,
    });
  } else if (i === 1) {
    const baseCost = times[1];
    totalTime += baseCost;
    rightBank.push(...leftBank);
    leftBank.length = 0;

    steps.push({
      times: [...times],
      leftBank: [],
      rightBank: [...rightBank],
      rounds: [...rounds],
      totalTime,
      decision: `基底情况：左岸剩余 2 人 [${times[0]}, ${times[1]}] ➔ 两人一同划过耗时 T[1] = ${baseCost} 分钟，全部人员抵达对岸`,
      message: '基底计算完成',
      log: `base case 2 persons cost=${baseCost}`,
      line: lines.baseCase.javascript,
      codeLine: lines.baseCase,
    });
  } else if (i === 0) {
    const baseCost = times[0];
    totalTime += baseCost;
    rightBank.push(...leftBank);
    leftBank.length = 0;

    steps.push({
      times: [...times],
      leftBank: [],
      rightBank: [...rightBank],
      rounds: [...rounds],
      totalTime,
      decision: `基底情况：左岸仅剩 1 人 [${times[0]}] ➔ 单独划过耗时 T[0] = ${baseCost} 分钟`,
      message: '基底计算完成',
      log: `base case 1 person cost=${baseCost}`,
      line: lines.baseCase.javascript,
      codeLine: lines.baseCase,
    });
  }

  // 收敛
  steps.push({
    times: [...times],
    leftBank: [],
    rightBank: [...times],
    rounds: [...rounds],
    totalTime,
    decision: `🎉 全员安全过河完毕！最少总耗时为 ${totalTime} 分钟`,
    message: '双策略贪心消减证明全局最优',
    log: `done totalTime=${totalTime}`,
    line: lines.done.javascript,
    codeLine: lines.done,
  });

  return steps;
}
