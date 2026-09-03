/**
 * 最后一块石头的重量 II (LeetCode 1049) - 声明式 4-Card 沙盘渲染器
 * 核心：石头碰撞相消 -> 两堆石头和差值最小化 -> 容量 <= sum/2 最接近值的 01 背包
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  LAST_STONE_WEIGHT_II_PROBLEM_HTML,
  LAST_STONE_WEIGHT_II_ANALYSIS_HTML,
  LAST_STONE_WEIGHT_II_CODE_LANGUAGES,
} from './knapsack-073-problem-content';

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
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildLastStoneWeightIISteps(stones: number[]): LastStoneStep[] {
  const steps: LastStoneStep[] = [];
  const sum = stones.reduce((acc, x) => acc + x, 0);
  const t = Math.floor(sum / 2);
  const dp = new Array(t + 1).fill(0);

  function makeStep(data: Omit<LastStoneStep, 'metrics'>): LastStoneStep {
    const rem = sum - 2 * data.near;
    return {
      ...data,
      metrics: {
        'metric-total-sum': `${sum}`,
        'metric-half-cap': `${t}`,
        'metric-near-val': `${data.near}`,
        'metric-remain-weight': `${rem}`,
      },
    };
  }

  // 1. 初始化
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
      status: 'init',
      message: `🪨 开启石头粉碎推演：原石头数组 [${stones.join(', ')}]，总重量 sum=${sum}，目标划分容量上限 t=floor(sum/2)=${t}。`,
      log: `init: stones=[${stones.join(', ')}], sum=${sum}, t=${t}`,
      codeLine: 8,
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
        status: 'done',
        message: `🏁 无法划分有效正容量，最后留下的一块石头重量为 ${sum}。`,
        log: `done: remain=${sum}`,
        codeLine: 11,
      })
    );
    return steps;
  }

  // 2. 01背包寻找最接近 t 的和
  for (let i = 0; i < stones.length; i++) {
    const stone = stones[i];
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
        status: 'check',
        message: `🔍 考察第 ${i + 1} 块石头 (重量=${stone})。`,
        log: `stone #${i + 1}: weight=${stone}`,
        codeLine: 18,
      })
    );

    for (let j = t; j >= stone; j--) {
      const candidate = dp[j - stone] + stone;
      if (candidate > dp[j]) {
        dp[j] = candidate;
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
            status: 'update',
            message: `✨ 容量 j=${j}：选入石头 ${stone}，累加和刷新为 dp[${j}]=${dp[j]}。`,
            log: `update: dp[${j}] = ${dp[j]}`,
            codeLine: 20,
          })
        );
      }
    }
  }

  const near = dp[t];
  const finalRemain = sum - 2 * near;

  // 3. 完成
  steps.push(
    makeStep({
      stoneIndex: stones.length - 1,
      stones: [...stones],
      sum,
      targetCapacity: t,
      j: t,
      dp: [...dp],
      near,
      remainWeight: finalRemain,
      status: 'done',
      message: `🎉 碰撞计算完成！在上限 ${t} 下能凑出的最大重量为 near=${near}。另一堆为 ${sum - near}，对消后最小剩余重量为 ${sum} - 2 &times; ${near} = ${finalRemain}！`,
      log: `done: near=${near}, remain=${finalRemain}`,
      codeLine: 11,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<LastStoneStep>({
  id: 'last-stone-weight-ii-standard',
  name: '最后一块石头的重量 II',
  category: 'dynamic-programming',
  badge: {
    mode: '差值极小化 · 01背包',
    complexity: 'O(N · Sum) · O(Sum)',
  },
  card1Title: '🪨 石头对撞粉碎与两堆划分沙盘',
  card2Title: '⚖️ 接近半数累加和向量 dp[j] 监视器',
  card2Desc: '展示寻找累加和 <= sum/2 最接近值的背包填表历程',
  legend: [
    { label: '未处理石头', color: '#475569' },
    { label: '当前考察石头', color: '#f59e0b' },
    { label: '最接近目标半和 near', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-stones',
      label: '石头重量数组 (逗号分隔)',
      type: 'text',
      defaultValue: '2, 7, 4, 1, 8, 1',
      width: '180px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 官方典例 (stones=[2,7,4,1,8,1], Ans=1)',
      values: {
        'input-stones': '2, 7, 4, 1, 8, 1',
      },
    },
    {
      label: '完全粉碎平衡用例 (stones=[31, 26, 33, 21, 40], Ans=1)',
      values: {
        'input-stones': '31, 26, 33, 21, 40',
      },
    },
  ],
  metrics: [
    { id: 'metric-total-sum', label: '所有石头总重量', color: '#38bdf8' },
    { id: 'metric-half-cap', label: '背包容量上限 sum/2', color: '#f59e0b' },
    { id: 'metric-near-val', label: '最接近半和 near', color: '#10b981' },
    { id: 'metric-remain-weight', label: '最终剩余最小重量', color: '#a855f7' },
  ],
  codeLanguages: LAST_STONE_WEIGHT_II_CODE_LANGUAGES,
  problemHtml: LAST_STONE_WEIGHT_II_PROBLEM_HTML,
  analysisHtml: LAST_STONE_WEIGHT_II_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const stones = (inputs['input-stones'] || '2, 7, 4, 1, 8, 1')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildLastStoneWeightIISteps(stones);
  },
  renderCanvas: (container, step) => {
    const stoneEls = step.stones
      .map((s, idx) => {
        const isCur = step.stoneIndex === idx;
        const bg = isCur ? '#78350f' : '#1e293b';
        const border = isCur ? '#f59e0b' : '#334155';
        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:50%; width:44px; height:44px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.3);">
            <span style="font-size:10px; color:#94a3b8;">#${idx + 1}</span>
            <span style="font-size:13px; font-weight:800; color:#f8fafc;">${s}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:center; align-items:center; background:#0f172a; padding:16px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">待粉碎石头集合 (Stones Collection)</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${stoneEls}
        </div>
        <div style="display:flex; gap:14px; margin-top:8px;">
          <div style="padding:6px 14px; background:#1e293b; border:1px solid #10b981; border-radius:6px; font-size:12px; color:#e2e8f0;">
            子集 A (接近半和): <span style="color:#10b981; font-weight:800;">${step.near}</span>
          </div>
          <div style="padding:6px 14px; background:#1e293b; border:1px solid #38bdf8; border-radius:6px; font-size:12px; color:#e2e8f0;">
            子集 B (剩余): <span style="color:#38bdf8; font-weight:800;">${step.sum - step.near}</span>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const cells = step.dp.map((val, idx) => {
      const isCur = step.j === idx;
      const bg = isCur ? '#0284c7' : '#1e293b';
      const border = isCur ? '#38bdf8' : '#334155';
      const color = val > 0 ? '#10b981' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:34px; padding:4px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:9px; color:#94a3b8;">${idx}</span>
          <span style="font-size:12px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">最接近子集和 DP 向量 dp[0..${step.dp.length - 1}]</div>
        <div style="display:flex; flex-wrap:wrap; max-height:110px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

export const LastStoneWeightIIVisualizer = Visualizer;

registerAlgorithm({
  id: 'last-stone-weight-ii-standard',
  name: '最后一块石头的重量 II',
  viewId: 'algo-last-stone-weight-ii-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code04：LeetCode 1049 最后一块石头，两两粉碎对消等价于两堆差值极小化，归约为 <= sum/2 01 背包',
  icon: '🪨',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 80,
  learningGoal: '掌握碰撞粉碎过程的代数符号转化、最接近半和 near 的求解以及最终结果 sum-2*near 的推导',
});

