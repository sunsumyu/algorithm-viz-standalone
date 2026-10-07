/**
 * 最后一块石头的重量 II (LeetCode 1049 / 左程云 Class 073 Code04)
 * Step Compiler: 将石头粉碎相消转化为容量 <= sum/2 最接近值的 01 背包
 */

import type { HighlightTarget } from '../../code-panel';

export interface LastStoneStep {
  stoneIndex: number;
  stones: number[];
  sum: number;
  targetCapacity: number;
  j: number;
  dp: number[];
  near: number;
  remainWeight: number;
  status: 'init' | 'check' | 'update' | 'keep' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedStones: number[]; // 放入子集 A 的石头全局索引
  metrics?: Record<string, any>;
}

export function parseLastStoneInputs(inputs: Record<string, any>): { stones: number[] } {
  const stones = String(inputs['input-stones'] || '2, 7, 4, 1, 8, 1')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  return { stones };
}

export function buildLastStoneWeightIISteps(stones: number[]): LastStoneStep[] {
  const steps: LastStoneStep[] = [];
  const sum = stones.reduce((acc, x) => acc + x, 0);
  const t = Math.floor(sum / 2);
  const dp = new Array(t + 1).fill(0);
  let bestStonesForCapacity: number[][] = Array.from({ length: t + 1 }, () => []);

  const lines = {
    init: { java: 5, cpp: 7, python: 1, javascript: 2 },
    initDp: { java: 12, cpp: 10, python: 5, javascript: 5 },
    stoneLoop: { java: 13, cpp: 11, python: 6, javascript: 6 },
    capLoop: { java: 14, cpp: 12, python: 7, javascript: 7 },
    updateDp: { java: 15, cpp: 13, python: 8, javascript: 8 },
    returnAns: { java: 9, cpp: 17, python: 10, javascript: 12 },
  };

  function makeStep(data: Omit<LastStoneStep, 'metrics'>): LastStoneStep {
    const rem = sum - 2 * data.near;
    return {
      ...data,
      metrics: {
        'metric-total-sum': `${sum}`,
        'metric-half-cap': `${t}`,
        'metric-nearest-subset': `${data.near}`,
        'metric-min-diff': `${rem}`,
      },
    };
  }

  // 1. 初始化入口
  steps.push(
    makeStep({
      stoneIndex: -1,
      stones: [...stones],
      sum,
      targetCapacity: t,
      j: -1,
      dp: [...dp],
      near: 0,
      remainWeight: sum,
      selectedStones: [],
      status: 'init',
      message: `🪨 开启石头粉碎推演：原石头数组 [${stones.join(', ')}]，总重量 sum=${sum}，目标划分容量上限 t=floor(sum/2)=${t}。`,
      log: `init: stones=[${stones.join(', ')}], sum=${sum}, t=${t}`,
      codeLine: lines.init,
    })
  );

  if (t === 0) {
    steps.push(
      makeStep({
        stoneIndex: -1,
        stones: [...stones],
        sum,
        targetCapacity: t,
        j: 0,
        dp: [...dp],
        near: 0,
        remainWeight: sum,
        selectedStones: [],
        status: 'done',
        message: `🏁 无法划分有效正容量，最后留下的一块石头重量为 ${sum}。`,
        log: `done: remain=${sum}`,
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  // 2. 初始化 DP 空间
  steps.push(
    makeStep({
      stoneIndex: -1,
      stones: [...stones],
      sum,
      targetCapacity: t,
      j: -1,
      dp: [...dp],
      near: 0,
      remainWeight: sum,
      selectedStones: [],
      status: 'init',
      message: `📊 初始化 DP 数组，容量范围 0~${t}，dp[0..${t}] 初始为 0。`,
      log: `initDp: capacity=${t}`,
      codeLine: lines.initDp,
    })
  );

  for (let i = 0; i < stones.length; i++) {
    const num = stones[i];

    steps.push(
      makeStep({
        stoneIndex: i,
        stones: [...stones],
        sum,
        targetCapacity: t,
        j: -1,
        dp: [...dp],
        near: dp[t],
        remainWeight: sum - 2 * dp[t],
        selectedStones: [...(bestStonesForCapacity[t] || [])],
        status: 'check',
        message: `🔍 考察石头 #${i + 1} (重量=${num})：准备倒序枚举容量尝试放入子集 A。`,
        log: `stone #${i + 1}: weight=${num}`,
        codeLine: lines.stoneLoop,
      })
    );

    const nextBest = bestStonesForCapacity.map((list) => [...list]);

    for (let j = t; j >= num; j--) {
      steps.push(
        makeStep({
          stoneIndex: i,
          stones: [...stones],
          sum,
          targetCapacity: t,
          j,
          dp: [...dp],
          near: dp[t],
          remainWeight: sum - 2 * dp[t],
          selectedStones: [...(nextBest[t] || [])],
          status: 'check',
          message: `⏳ 容量倒序：当前容量 j=${j} >= 石头重量 ${num}。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      const candidate = dp[j - num] + num;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        nextBest[j] = [...bestStonesForCapacity[j - num], i];
      }

      steps.push(
        makeStep({
          stoneIndex: i,
          stones: [...stones],
          sum,
          targetCapacity: t,
          j,
          dp: [...dp],
          near: dp[t],
          remainWeight: sum - 2 * dp[t],
          selectedStones: [...(nextBest[t] || [])],
          status: updated ? 'update' : 'keep',
          message: updated
            ? `✨ 状态更新：放入石头 #${i + 1}，使容量 ${j} 下的子集和提升至 dp[${j}]=${dp[j]}（更加逼近半和 ${t}）！`
            : `⏸️ 状态保持：放入该石头收益 ${candidate} <= 原值 ${dp[j]}，保持原子集方案。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }

    bestStonesForCapacity = nextBest;
  }

  const finalNear = dp[t];
  const finalRemain = sum - 2 * finalNear;

  steps.push(
    makeStep({
      stoneIndex: -1,
      stones: [...stones],
      sum,
      targetCapacity: t,
      j: t,
      dp: [...dp],
      near: finalNear,
      remainWeight: finalRemain,
      selectedStones: [...(bestStonesForCapacity[t] || [])],
      status: 'done',
      message: `🎉 碰撞粉碎推演完毕！子集 A 累计重量 near=${finalNear}，子集 B 累计重量 ${sum - finalNear}。碰撞后剩余最小重量为 ${sum} - 2×${finalNear} = ${finalRemain}！`,
      log: `done: near=${finalNear}, ans=${finalRemain}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
