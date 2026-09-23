/**
 * 超级洗衣机 (LeetCode 517) - 声明式教学级沙盘渲染器
 * 核心贪心：左右净需求量与单机同时流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|))
 */

import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  SUPER_WASHING_MACHINES_CODES,
  SUPER_WASHING_MACHINES_LINES,
} from './greedy-093-stage-codes';
import { Greedy093Step } from './greedy-093-shared';

export interface MachineBottleneck {
  idx: number;
  clothes: number;
  leftNeed: number;
  rightNeed: number;
  bottleneck: number;
  isDualOutput: boolean;
}

export interface SuperWashingMachinesStep extends Greedy093Step {
  machines: number[];
  curIdx: number;
  avg: number;
  totalSum: number;
  maxMoves: number;
  bottlenecks: MachineBottleneck[];
  isImpossible?: boolean;
}

export function buildSuperWashingMachinesSteps(machines: number[]): SuperWashingMachinesStep[] {
  const steps: SuperWashingMachinesStep[] = [];
  const lines = SUPER_WASHING_MACHINES_LINES;
  const n = machines.length;
  const totalSum = machines.reduce((a, b) => a + b, 0);

  // Step 0: 入口
  steps.push({
    machines: [...machines],
    curIdx: -1,
    avg: 0,
    totalSum,
    maxMoves: 0,
    bottlenecks: [],
    decision: `主函数入口：洗衣机数量 n=${n}，当前衣物总量 totalSum=${totalSum}`,
    message: '核心目标：求使所有洗衣机内衣物数量相等的最少步数（每步每台机器最多移出1件）',
    log: `enter findMinMoves(machines=[${machines.join(',')}])`,
    codeLine: lines.entry,
  });

  // 整除性特判
  if (totalSum % n !== 0) {
    steps.push({
      machines: [...machines],
      curIdx: -1,
      avg: 0,
      totalSum,
      maxMoves: -1,
      bottlenecks: [],
      isImpossible: true,
      decision: `❌ 无法平均分配！衣物总数 ${totalSum} 无法被洗衣机台数 ${n} 整除 (余数 ${totalSum % n})，直接返回 -1`,
      message: '特判无法均分，返回 -1',
      log: `cannot divide evenly, totalSum=${totalSum}, n=${n}`,
      codeLine: lines.guardDiv,
    });
    return steps;
  }

  const avg = totalSum / n;
  let leftSum = 0;
  let maxMoves = 0;
  const bottlenecks: MachineBottleneck[] = [];

  for (let i = 0; i < n; i++) {
    const num = machines[i];
    const leftNeed = i * avg - leftSum;
    const rightNeed = (n - 1 - i) * avg - (totalSum - leftSum - num);

    let curBottleneck = 0;
    const isDualOutput = leftNeed > 0 && rightNeed > 0;
    if (isDualOutput) {
      curBottleneck = leftNeed + rightNeed;
    } else {
      curBottleneck = Math.max(Math.abs(leftNeed), Math.abs(rightNeed));
    }

    maxMoves = Math.max(maxMoves, curBottleneck);
    leftSum += num;

    const bItem: MachineBottleneck = {
      idx: i,
      clothes: num,
      leftNeed,
      rightNeed,
      bottleneck: curBottleneck,
      isDualOutput,
    };
    bottlenecks.push(bItem);

    steps.push({
      machines: [...machines],
      curIdx: i,
      avg,
      totalSum,
      maxMoves,
      bottlenecks: [...bottlenecks],
      decision: isDualOutput
        ? `考察洗衣机 #${i} (${num}件)：左侧净缺 ${leftNeed} 件，右侧净缺 ${rightNeed} 件 ➔ 机器 #${i} 必须【同时向左右两侧流出】！因每秒仅能移出一件，瓶颈为两端之和 ${leftNeed} + ${rightNeed} = ${curBottleneck} 步，全局最大步数更新为 ${maxMoves}`
        : `考察洗衣机 #${i} (${num}件)：左侧净需求 ${leftNeed}，右侧净需求 ${rightNeed} ➔ 单向穿透瓶颈 max(|${leftNeed}|, |${rightNeed}|) = ${curBottleneck} 步，全局最大步数更新为 ${maxMoves}`,
      message: `目标平均衣物数 avg = ${avg} 件，当前累计全局瓶颈 maxMoves = ${maxMoves}`,
      log: `machine #${i}: leftNeed=${leftNeed}, rightNeed=${rightNeed}, bottleneck=${curBottleneck}`,
      codeLine: lines.bottleneck,
    });
  }

  // 收敛
  steps.push({
    machines: [...machines],
    curIdx: -1,
    avg,
    totalSum,
    maxMoves,
    bottlenecks: [...bottlenecks],
    decision: `🎉 计算完毕！使所有洗衣机达到均分 (${avg} 件) 的最少移动步数为 ${maxMoves} 步`,
    message: '最大局部流量瓶颈决定全局最小操作步数',
    log: `done maxMoves=${maxMoves}`,
    codeLine: lines.done,
  });

  return steps;
}

const template = `<div id="algo-super-washing-machines-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const superWashingMachinesRenderer = UniversalStageVisualizer;
export const superWashingMachinesVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'super-washing-machines',
  name: '超级洗衣机 (Super Washing Machines)',
  viewId: 'algo-super-washing-machines-view',
  category: 'greedy',
  description: 'LeetCode 517：前缀和与单机同时双向流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|))',
  icon: '🧺',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 935,
  learningGoal: '掌握前缀和与单机同时双向流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|)) 的贪心证明',
});

export function registerSuperWashingMachines(): void {
  // 保持向前兼容导出
}
