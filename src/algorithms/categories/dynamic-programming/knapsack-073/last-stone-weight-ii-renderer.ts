/**
 * 最后一块石头的重量 II (LeetCode 1049) - 声明式 4-Card 沙盘渲染器
 * 核心：石头碰撞相消 -> 两堆石头和差值最小化 -> 容量 <= sum/2 最接近值的 01 背包
 * 架构重构：引入四语言代码高亮、子集划分回溯与碰撞天平实时载荷舱
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  LAST_STONE_WEIGHT_II_PROBLEM_HTML,
  LAST_STONE_WEIGHT_II_ANALYSIS_HTML,
  LAST_STONE_WEIGHT_II_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';

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

export function buildLastStoneWeightIISteps(stones: number[]): LastStoneStep[] {
  const steps: LastStoneStep[] = [];
  const sum = stones.reduce((acc, x) => acc + x, 0);
  const t = Math.floor(sum / 2);
  const dp = new Array(t + 1).fill(0);
  let bestStonesForCapacity: number[][] = Array.from({ length: t + 1 }, () => []);

  const lines = {
    init: { java: 11, cpp: 10, python: 5, javascript: 5 },
    stoneLoop: { java: 12, cpp: 11, python: 6, javascript: 6 },
    capLoop: { java: 13, cpp: 12, python: 7, javascript: 7 },
    updateDp: { java: 14, cpp: 13, python: 8, javascript: 8 },
    returnAns: { java: 18, cpp: 17, python: 11, javascript: 12 },
  };

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

const { template, Visualizer } = createDeclarativeVisualizer<LastStoneStep>({
  id: 'last-stone-weight-ii-standard',
  name: '最后一块石头的重量 II',
  category: 'dynamic-programming',
  badge: {
    mode: '01背包 · 差值极小化',
    complexity: 'O(N · Sum) · O(Sum)',
  },
  card1Title: '待粉碎石头与实时碰撞天平仓',
  card2Title: '最接近子集和 DP 向量 dp[0..floor(sum/2)]',
  card2Desc: '展示将石头划分为两堆重量最接近的子集（子集 A 靠近 sum/2）的 01 背包填表过程',
  legend: [
    { label: '归入子集 B', color: '#38bdf8' },
    { label: '归入子集 A (靠近半和)', color: '#10b981' },
    { label: '当前考察石头', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-stones',
      label: '石头重量数组',
      type: 'text',
      defaultValue: '2, 7, 4, 1, 8, 1',
      width: '200px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 经典案例 ([2,7,4,1,8,1], Sum=23, Ans=1)',
      values: {
        'input-stones': '2, 7, 4, 1, 8, 1',
      },
    },
    {
      label: '完全对消案例 ([31,26,33,21,40], Sum=151, Ans=5)',
      values: {
        'input-stones': '31, 26, 33, 21, 40',
      },
    },
  ],
  metrics: [
    { id: 'metric-total-sum', label: '石头总重量 sum', color: '#94a3b8' },
    { id: 'metric-half-cap', label: '目标半和上限 t', color: '#8b5cf6' },
    { id: 'metric-near-val', label: '最接近半和 near', color: '#10b981' },
    { id: 'metric-remain-weight', label: '最终剩余最小重量', color: '#f59e0b' },
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
    const selectedA = step.selectedStones || [];
    const weightA = selectedA.reduce((sum, idx) => sum + (step.stones[idx] || 0), 0);
    const weightB = step.sum - weightA;
    const diff = Math.abs(weightB - weightA);
    const ratio = Math.min(100, Math.round((weightA / Math.max(1, step.targetCapacity)) * 100));

    const stoneEls = step.stones
      .map((s, idx) => {
        const isCur = step.stoneIndex === idx;
        const isInA = selectedA.includes(idx);

        let bg = 'rgba(15, 23, 42, 0.6)';
        let border = '#334155';
        let badge = '<span style="color:#38bdf8; font-size:9px;">子集 B</span>';

        if (isInA) {
          bg = 'rgba(6, 95, 70, 0.5)';
          border = '#10b981';
          badge = '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 4px; border-radius:3px; font-weight:bold;">✔ 子集 A</span>';
        } else if (isCur) {
          bg = 'rgba(30, 58, 138, 0.5)';
          border = '#f59e0b';
          badge = '<span style="background:#2563eb; color:#fff; font-size:9px; padding:1px 4px; border-radius:3px; font-weight:bold;">🔍 考察中</span>';
        }

        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:95px; text-align:center; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:10.5px; color:#cbd5e1; font-weight:700;">石头 #${idx + 1}</span>
              ${badge}
            </div>
            <div style="font-size:14px; font-weight:800; color:#f8fafc; margin-top:2px;">🪨 ${s} 磅</div>
          </div>
        `;
      })
      .join('');

    const chipsA = selectedA.map((idx) => `
      <span style="background:rgba(6, 95, 70, 0.5); border:1px solid #10b981; border-radius:4px; padding:2px 6px; font-size:10px; color:#a7f3d0;">
        #${idx + 1} (${step.stones[idx]}磅)
      </span>
    `).join(' ');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">待粉碎石头集合 (总重 sum=${step.sum}，目标半和上限 t=${step.targetCapacity})</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.targetCapacity}
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${stoneEls}
        </div>

        <!-- 底部实时碰撞天平仓 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">⚖️ 实时子集对称天平 (两堆对消)</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>子集 A (靠近半和): <b style="color:#10b981;">${weightA}</b> 磅</span>
              <span>子集 B (剩余): <b style="color:#38bdf8;">${weightB}</b> 磅</span>
              <span>碰撞残留差值: <b style="color:#f59e0b;">${diff}</b> 磅</span>
            </div>
          </div>

          <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); transition:width 0.25s ease;"></div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span style="color:#94a3b8; font-size:10.5px; min-width:80px;">子集 A 石头:</span>
            ${chipsA || '<span style="color:#64748b; font-size:10.5px;">(暂未选入石头)</span>'}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
      maxVal: step.near,
    }, `最接近子集和 DP 向量 dp[0..${step.dp.length - 1}]`);
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
