/**
 * 从栈中取出K个硬币的最大面值和 (LeetCode 2218) - 声明式 4-Card 沙盘渲染器
 * 核心：硬币栈自顶向下连续取 -> 前缀和预处理转分组背包互斥选择
 * 架构重构：增加实时硬币收集舱与栈内动态拿取追踪
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  COINS_FROM_PILES_PROBLEM_HTML,
  COINS_FROM_PILES_ANALYSIS_HTML,
  COINS_FROM_PILES_CODE_LANGUAGES,
  COINS_FROM_PILES_STAGE1_CODE_LANGUAGES,
  COINS_FROM_PILES_STAGE2_CODE_LANGUAGES,
  COINS_FROM_PILES_STAGE3_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import {
  buildCoinsFromPilesRecursionSteps,
  buildCoinsFromPilesMemoSteps,
  buildCoinsFromPiles2DSteps,
} from '../../../../core/renderers/knapsack-special-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../../../../core/renderers/special-stage-cards';


export interface CoinPileTake {
  pileIdx: number;
  takeCount: number;
  sumVal: number;
}

export interface CoinsFromPilesStep {
  pileIndex: number;
  j: number;
  c: number;
  piles: number[][];
  preSum: number[];
  dp: number[];
  maxVal: number;
  kTarget: number;
  status: 'init' | 'pile' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedTakes: CoinPileTake[];
  metrics?: Record<string, any>;
}

export function buildCoinsFromPilesSteps(
  piles: number[][],
  k: number
): CoinsFromPilesStep[] {
  const steps: CoinsFromPilesStep[] = [];
  const K = Math.max(0, k);
  const n = piles.length;
  const dp = new Array(K + 1).fill(0);
  let bestTakesForCapacity: CoinPileTake[][] = Array.from({ length: K + 1 }, () => []);

  const lines = {
    entry: { java: 7, cpp: 7, python: 1, javascript: 2 },
    initDp: { java: 8, cpp: 8, python: 3, javascript: 3 },
    pileLoop: { java: 9, cpp: 9, python: 4, javascript: 4 },
    calcLimit: { java: 10, cpp: 10, python: 5, javascript: 5 },
    initPreSum: { java: 11, cpp: 11, python: 6, javascript: 6 },
    preSumLoop: { java: 12, cpp: 12, python: 7, javascript: 7 },
    capLoop: { java: 16, cpp: 14, python: 9, javascript: 10 },
    coinLoop: { java: 17, cpp: 15, python: 10, javascript: 11 },
    updateDp: { java: 18, cpp: 16, python: 11, javascript: 12 },
    returnAns: { java: 22, cpp: 20, python: 12, javascript: 16 },
  };

  function makeStep(data: Omit<CoinsFromPilesStep, 'metrics'>): CoinsFromPilesStep {
    const pileStr = data.pileIndex >= 0 ? `栈 #${data.pileIndex + 1}` : '—';
    const cStr = data.c >= 0 ? `${data.c} 枚` : '—';
    const jStr = data.j >= 0 ? `${data.j}` : '—';
    return {
      ...data,
      metrics: {
        'metric-cur-pile': pileStr,
        'metric-take-coins': cStr,
        'metric-cur-capacity': jStr,
        'metric-max-val': `${data.maxVal}`,
      },
    };
  }

  // 1. 初始化入口
  steps.push(
    makeStep({
      pileIndex: -1,
      j: -1,
      c: -1,
      piles: [...piles],
      preSum: [],
      dp: [...dp],
      maxVal: 0,
      kTarget: K,
      selectedTakes: [],
      status: 'init',
      message: `🪙 初始化取硬币算法：进入 maxValueOfCoins 函数，目标抽取总次数 k=${K}，共有 ${n} 个硬币栈。`,
      log: `init: k=${K}, piles=${n}`,
      codeLine: lines.entry,
    })
  );

  // 2. 初始化 DP 数组
  steps.push(
    makeStep({
      pileIndex: -1,
      j: -1,
      c: -1,
      piles: [...piles],
      preSum: [],
      dp: [...dp],
      maxVal: 0,
      kTarget: K,
      selectedTakes: [],
      status: 'init',
      message: `📊 分配 dp[0..${K}] 空间，初值全置 0。准备开启分组背包决策。`,
      log: `initDp: dp[0..${K}] = 0`,
      codeLine: lines.initDp,
    })
  );

  if (n === 0 || K === 0) {
    steps.push(
      makeStep({
        pileIndex: -1,
        j: 0,
        c: 0,
        piles: [...piles],
        preSum: [],
        dp: [...dp],
        maxVal: 0,
        kTarget: K,
        selectedTakes: [],
        status: 'done',
        message: '🏁 抽取总次数为 0 或硬币栈为空，最大收益为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const pile = piles[i];

    // 2. 考察当前栈
    steps.push(
      makeStep({
        pileIndex: i,
        j: -1,
        c: -1,
        piles: [...piles],
        preSum: [],
        dp: [...dp],
        maxVal: dp[K],
        kTarget: K,
        selectedTakes: [...(bestTakesForCapacity[K] || [])],
        status: 'pile',
        message: `🔄 开始考察硬币栈 #${i + 1}：栈内共 ${pile.length} 枚硬币。`,
        log: `pile loop: i=${i}, size=${pile.length}`,
        codeLine: lines.pileLoop,
      })
    );

    // 3. 计算拿取上限
    const t = Math.min(pile.length, K);
    steps.push(
      makeStep({
        pileIndex: i,
        j: -1,
        c: -1,
        piles: [...piles],
        preSum: [],
        dp: [...dp],
        maxVal: dp[K],
        kTarget: K,
        selectedTakes: [...(bestTakesForCapacity[K] || [])],
        status: 'pile',
        message: `📏 确定拿取上限：最多从本栈拿取 t = min(${pile.length}, ${K}) = ${t} 枚硬币。`,
        log: `calcLimit: t=min(${pile.length}, ${K})=${t}`,
        codeLine: lines.calcLimit,
      })
    );

    // 4. 初始化前缀和
    const preSum = new Array(t + 1).fill(0);
    steps.push(
      makeStep({
        pileIndex: i,
        j: -1,
        c: -1,
        piles: [...piles],
        preSum: [...preSum],
        dp: [...dp],
        maxVal: dp[K],
        kTarget: K,
        selectedTakes: [...(bestTakesForCapacity[K] || [])],
        status: 'pile',
        message: `📊 初始化前缀和数组 preSum[0..${t}]，准备自顶向下累加硬币面值。`,
        log: `init preSum[0..${t}]`,
        codeLine: lines.initPreSum,
      })
    );

    // 5. 累加前缀和 (逐项步进)
    for (let idx = 0; idx < t; idx++) {
      preSum[idx + 1] = preSum[idx] + pile[idx];
      steps.push(
        makeStep({
          pileIndex: i,
          j: -1,
          c: idx + 1,
          piles: [...piles],
          preSum: [...preSum],
          dp: [...dp],
          maxVal: dp[K],
          kTarget: K,
          selectedTakes: [...(bestTakesForCapacity[K] || [])],
          status: 'pile',
          message: `📥 累加硬币前缀和：第 ${idx + 1} 枚面值 ${pile[idx]}，preSum[${idx + 1}] = preSum[${idx}] + ${pile[idx]} = ${preSum[idx + 1]}。`,
          log: `preSum[${idx + 1}] = ${preSum[idx + 1]}`,
          codeLine: lines.preSumLoop,
        })
      );
    }

    const nextBestTakes = bestTakesForCapacity.map((list) => [...list]);

    // 6. 分组背包容量倒序枚举
    for (let j = K; j > 0; j--) {
      steps.push(
        makeStep({
          pileIndex: i,
          j,
          c: -1,
          piles: [...piles],
          preSum: [...preSum],
          dp: [...dp],
          maxVal: dp[K],
          kTarget: K,
          selectedTakes: [...(nextBestTakes[K] || [])],
          status: 'check',
          message: `⏳ 容量循环：当前考察抽取次数容量 j=${j}（倒序防止同栈多选）。`,
          log: `capacity loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      for (let c = 1; c <= Math.min(t, j); c++) {
        steps.push(
          makeStep({
            pileIndex: i,
            j,
            c,
            piles: [...piles],
            preSum: [...preSum],
            dp: [...dp],
            maxVal: dp[K],
            kTarget: K,
            selectedTakes: [...(nextBestTakes[K] || [])],
            status: 'check',
            message: `🪙 枚举拿取枚数：从栈 #${i + 1} 拿取 c=${c} 枚硬币（面值 +${preSum[c]}）。`,
            log: `coin loop: c=${c}`,
            codeLine: lines.coinLoop,
          })
        );

        const candidate = dp[j - c] + preSum[c];
        const updated = candidate > dp[j];
        if (updated) {
          dp[j] = candidate;
          nextBestTakes[j] = [
            ...bestTakesForCapacity[j - c],
            { pileIdx: i + 1, takeCount: c, sumVal: preSum[c] },
          ];
        }

        steps.push(
          makeStep({
            pileIndex: i,
            j,
            c,
            piles: [...piles],
            preSum: [...preSum],
            dp: [...dp],
            maxVal: dp[K],
            kTarget: K,
            selectedTakes: [...(nextBestTakes[K] || [])],
            status: updated ? 'update' : 'check',
            message: updated
              ? `✨ 状态转移：dp[${j}] = Math.max(${dp[j]}, dp[${j - c}] + ${preSum[c]}) = ${candidate}，收益提高！`
              : `⏸️ 状态保持：拿取 ${c} 枚后收益 ${candidate} <= 原收益 ${dp[j]}，保持 dp[${j}]=${dp[j]}。`,
            log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
            codeLine: lines.updateDp,
          })
        );
      }
    }

    bestTakesForCapacity = nextBestTakes;
  }

  // 7. 返回最终答案
  steps.push(
    makeStep({
      pileIndex: -1,
      j: K,
      c: -1,
      piles: [...piles],
      preSum: [],
      dp: [...dp],
      maxVal: dp[K],
      kTarget: K,
      selectedTakes: [...(bestTakesForCapacity[K] || [])],
      status: 'done',
      message: `🎉 取硬币决策完毕！在总拿取 ${K} 枚硬币限制下，最大面值总和为 ${dp[K]}！`,
      log: `done: dp[${K}]=${dp[K]}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

function parseCoinsInputs(inputs: Record<string, any>) {
  const k = parseInt(inputs['input-k'] || '2', 10);
  let rawArr: number[][] = [];
  try {
    rawArr = JSON.parse(inputs['input-piles-json'] || '[[1,100,3],[7,8,9]]');
  } catch {
    rawArr = [
      [1, 100, 3],
      [7, 8, 9],
    ];
  }
  return { k, piles: rawArr };
}

function renderCoinsFromPilesSandbox(container: HTMLElement, step: CoinsFromPilesStep) {
  const selected = step.selectedTakes || [];
  const usedK = selected.reduce((s, it) => s + it.takeCount, 0);
  const totalCoinsVal = selected.reduce((s, it) => s + it.sumVal, 0);
  const ratio = Math.min(100, Math.round((usedK / Math.max(1, step.kTarget)) * 100));

  const pilesHtml = step.piles
    .map((pile, pIdx) => {
      const isCurPile = step.pileIndex === pIdx;
      const takenPlan = selected.find((it) => it.pileIdx === pIdx + 1);
      const finalTakeCount = takenPlan ? takenPlan.takeCount : 0;
      const bg = isCurPile ? 'rgba(30, 27, 75, 0.7)' : 'rgba(241, 245, 249, 0.9)';
      const border = isCurPile ? '#818cf8' : finalTakeCount > 0 ? '#10b981' : '#334155';

      const coinsHtml = pile
        .map((coin, cIdx) => {
          const isSelectedInFinal = cIdx < finalTakeCount;
          const isEvaluating = isCurPile && step.c > 0 && cIdx < step.c;

          let coinBg = '#1e293b';
          let coinBorder = '#334155';
          let tag = '';

          if (isSelectedInFinal) {
            coinBg = 'rgba(6, 95, 70, 0.6)';
            coinBorder = '#10b981';
            tag = ' <span style="font-size:9px; color:#34d399;">✔ 取出</span>';
          } else if (isEvaluating) {
            coinBg = 'rgba(30, 58, 138, 0.5)';
            coinBorder = '#38bdf8';
            tag = ' <span style="font-size:9px; color:#38bdf8;">🔍 考察中</span>';
          } else if (cIdx === 0) {
            coinBorder = '#64748b';
          }

          return `
            <div style="background:${coinBg}; border:1px solid ${coinBorder}; border-radius:4px; padding:4px 8px; margin:2px 0; font-size:11px; text-align:center; font-weight:700; color:#1e293b; display:flex; justify-content:space-between; align-items:center;">
              <span>🪙 ${coin}</span>
              <span>${tag}</span>
            </div>
          `;
        })
        .join('');

      let badge = '<span style="color:#64748b; font-size:9px;">未取币</span>';
      if (finalTakeCount > 0) {
        badge = `<span style="background:#059669; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">已取 ${finalTakeCount} 枚</span>`;
      } else if (isCurPile) {
        badge = `<span style="background:#f59e0b; color:#0f172a; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">考察中</span>`;
      }

      return `
        <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:8px 10px; min-width:115px; flex:1; max-width:180px; text-align:center; box-sizing:border-box;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; color:#374151; font-weight:700;">栈 #${pIdx + 1}</span>
            ${badge}
          </div>
          <div style="display:flex; flex-direction:column; gap:2px;">
            ${coinsHtml}
          </div>
        </div>
      `;
    })
    .join('');

  const chipsHtml = selected.length > 0
    ? selected.map((it) => `
        <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
          <span style="color:#a7f3d0; font-weight:700;">栈 #${it.pileIdx}</span>
          <span style="color:#374151;">连续拿取 ${it.takeCount} 枚</span>
          <span style="color:#34d399; font-weight:800;">面值:+${it.sumVal}</span>
        </div>
      `).join('')
    : `<span style="color:#64748b; font-size:11px;">(硬币袋目前空闲，等待决策抽取...)</span>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#64748b; font-weight:700;">🪙 硬币栈阵列 (自顶向下连续拿取，每栈互斥选一种拿法)</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          当前拿取限制: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.kTarget} 枚
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
        ${pilesHtml}
      </div>

      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#374151;">👛 实时硬币收集舱</span>
          <div style="display:flex; gap:16px; font-size:11px;">
            <span>已用抽取机会: <b style="color:#38bdf8;">${usedK}</b> / ${step.kTarget}</span>
            <span>累计面值: <b style="color:#10b981;">${totalCoinsVal}</b></span>
          </div>
        </div>

        <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
          <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #f59e0b, #10b981); transition:width 0.25s ease;"></div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
          <span style="color:#64748b; font-size:10.5px; min-width:60px;">已拾取组合:</span>
          ${chipsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderCoinsFromPilesVectorMatrix(container: HTMLElement, step: CoinsFromPilesStep) {
  const cells = step.dp.map((val, idx) => {
    const isCur = step.j === idx;
    const bg = isCur ? '#0284c7' : '#1e293b';
    const border = isCur ? '#38bdf8' : '#334155';
    const color = val > 0 ? '#10b981' : '#64748b';
    return `
      <div id="coins-pile-cell-${idx}" style="display:inline-flex; flex-direction:column; align-items:center; min-width:34px; padding:4px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
        <span style="font-size:8.5px; color:#64748b;">${idx}</span>
        <span style="font-size:11px; font-weight:700; color:${color};">${val}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
      <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">操作次数容量收益向量 dp[0..${step.dp.length - 1}]</div>
      <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:2px; background:#f1f5f9; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
        ${cells.join('')}
      </div>
    </div>
  `;

  if (step.j >= 0) {
    const activeCell = container.querySelector(`#coins-pile-cell-${step.j}`) as HTMLElement | null;
    if (activeCell && typeof activeCell.scrollIntoView === 'function') {
      activeCell.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }
}

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'coins-from-piles',
  name: '从栈中取出K个硬币的最大面值和',
  category: 'dynamic-programming',
  badge: {
    mode: '分组背包 · 前缀和预处理',
    complexity: 'O(N · K · min(len, K)) · O(K)',
  },
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(K^N)',
      theme: 'bg-blue',
      badge: {
        mode: '分组背包 · 递归暴力搜索',
        complexity: 'O(K^N) · O(N) 栈深',
      },
      card1Title: '🪙 硬币栈阵列与递归调用栈',
      card2Title: '📊 组内互斥分支尝试开销监控',
      codeLanguages: COINS_FROM_PILES_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { k, piles } = parseCoinsInputs(inputs);
        return buildCoinsFromPilesRecursionSteps(piles, k);
      },
      renderCanvas: (container, step) => {
        const pilesHtml = step.piles
          .map(
            (pile: number[], idx: number) => `
          <div style="background:${step.i === idx ? 'rgba(59, 130, 246, 0.3)' : 'rgba(241, 245, 249, 0.9)'}; border:1px solid ${step.i === idx ? '#3b82f6' : '#334155'}; border-radius:6px; padding:6px 10px; font-family:'JetBrains Mono', monospace; font-size:11px;">
            栈 #${idx + 1}: [${pile.join(', ')}]
          </div>
        `
          )
          .join('');
        renderSpecialRecursionCard1(container, {
          title: '硬币栈决策栈',
          callStack: step.callStack,
          customInfoHtml: `
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="font-size:11px; color:#64748b; font-weight:700;">硬币栈配置 (拿取总数 K=${step.k}):</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">${pilesHtml}</div>
          </div>
        `,
        });
      },
      renderCustomMetrics: (container, step) => {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
            <div style="background:rgba(30, 41, 59, 0.6); border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
              <div style="font-size:11px; color:#64748b;">当前执行决策</div>
              <div style="font-size:14px; font-weight:700; color:#1e293b; margin-top:2px;">${step.decision}</div>
              <div style="font-size:12px; color:#38bdf8; margin-top:4px;">${step.message}</div>
            </div>
            <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="font-size:11px; color:#64748b;">组内互斥特性解析</div>
              <div style="font-size:12px; color:#374151; line-height:1.6;">
                每个栈中只能选一种拿取策略（拿 0 枚、1 枚、2 枚……）。由于硬币必须从顶向下连续取出，所以前缀和预处理后，一个栈等价于一个“物品组”。
              </div>
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N·K)',
      theme: 'bg-blue',
      badge: {
        mode: '分组背包 · 记忆化搜索',
        complexity: 'O(N · K) · O(N · K) 备忘录',
      },
      card1Title: '💾 备忘录剪枝探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][remK]',
      codeLanguages: COINS_FROM_PILES_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { k, piles } = parseCoinsInputs(inputs);
        return buildCoinsFromPilesMemoSteps(piles, k);
      },
      renderCanvas: (container, step) => {
        renderSpecialMemoCard1(container, {
          stateStr: `dfsMemo(i=${step.i}, remK=${step.remK})`,
          cacheHit: step.cacheHit,
          decision: step.decision,
          message: step.message,
          hitCount: step.hitCount,
          missCount: step.missCount,
        });
      },
      renderCustomMetrics: (container, step) => {
        renderSpecialMemoCard2(container, {
          title: `备忘录矩阵 memo[${step.piles.length}][${step.k + 1}]`,
          memo: step.memo,
          curI: step.i,
          curJ: step.remK,
          isHit: step.cacheHit,
        });
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N·K·min(len,K))',
      theme: 'bg-emerald',
      badge: {
        mode: '分组背包 · 严格二维填表',
        complexity: 'O(N · K · min(len, K)) · O(N · K)',
      },
      card1Title: '🔗 前缀和与组内互斥转移依赖',
      card2Title: '📐 二维动态规划状态表 dp[i][j]',
      codeLanguages: COINS_FROM_PILES_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { k, piles } = parseCoinsInputs(inputs);
        return buildCoinsFromPiles2DSteps(piles, k);
      },
      renderCanvas: (container, step) => {
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.i >= 0 ? step.i : '—'}][${step.j >= 0 ? step.j : '—'}]`,
          cellValStr: step.i >= 0 && step.j >= 0 ? `${step.dp[step.i]?.[step.j]}` : '—',
          depCells: step.depCells,
          decision: step.decision,
          message: step.message,
        });
      },
      renderCustomMetrics: (container, step) => {
        renderSpecial2DCard2(container, {
          title: `二维 DP 状态表 dp[0..${step.piles.length}][0..${step.k}]`,
          dp: step.dp,
          curI: step.i,
          curJ: step.j,
          depCells: step.depCells,
        });
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 一维空间压缩',
      shortName: '一维优化',
      num: 4,
      timeBadge: 'O(K) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '分组背包 · 空间压缩',
        complexity: 'O(N · K · min(len, K)) · O(K)',
      },
      card1Title: '🪙 硬币栈阵列与实时拾取沙盘',
      card2Title: '📊 抽取次数容量收益向量 dp[j] 监视器',
      codeLanguages: COINS_FROM_PILES_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { k, piles } = parseCoinsInputs(inputs);
        return buildCoinsFromPilesSteps(piles, k);
      },
      renderCanvas: (container, step) => renderCoinsFromPilesSandbox(container, step),
      renderCustomMetrics: (container, step) => renderCoinsFromPilesVectorMatrix(container, step),
    },
  ],
  card1Title: '🪙 硬币栈阵列与实时拾取沙盘',
  card2Title: '📊 抽取次数容量收益向量 dp[j] 监视器',
  card2Desc: '展示利用前缀和将每个硬币栈转为互斥物品组（选1枚、2枚...至多选一种）的分组背包推演',
  legend: [
    { label: '未被抽取的硬币', color: '#334155' },
    { label: '已被当前最优解选中的硬币', color: '#10b981' },
    { label: '当前考察中的试算拿取', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-k',
      label: '拿取硬币总数 K',
      type: 'number',
      defaultValue: 2,
      width: '60px',
    },
    {
      id: 'input-piles-json',
      label: '硬币栈数组 JSON (从顶向下)',
      type: 'text',
      defaultValue: '[[1,100,3],[7,8,9]]',
      width: '240px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 样例 (K=2, 栈[[1,100,3],[7,8,9]], Ans=101)',
      values: {
        'input-k': 2,
        'input-piles-json': '[[1,100,3],[7,8,9]]',
      },
    },
    {
      label: '深度抉择用例 (K=4, 栈[[10,20],[1,1,100],[50]], Ans=151)',
      values: {
        'input-k': 4,
        'input-piles-json': '[[10,20],[1,1,100],[50]]',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-pile', label: '当前硬币栈', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前总步数 j', color: '#38bdf8' },
    { id: 'metric-cur-c', label: '当前拿取枚数 c', color: '#8b5cf6' },
    { id: 'metric-max-coins', label: '当前最大面值', color: '#10b981' },
  ],
  codeLanguages: COINS_FROM_PILES_CODE_LANGUAGES,
  problemHtml: COINS_FROM_PILES_PROBLEM_HTML,
  analysisHtml: COINS_FROM_PILES_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const { k, piles } = parseCoinsInputs(inputs);
    return buildCoinsFromPilesSteps(piles, k);
  },
  renderCanvas: (container, step) => renderCoinsFromPilesSandbox(container, step),
  renderCustomMetrics: (container, step) => renderCoinsFromPilesVectorMatrix(container, step),
});

export const CoinsFromPilesVisualizer = Visualizer;

registerAlgorithm({
  id: 'coins-from-piles',
  name: '从栈中取出K个硬币的最大面值和',
  viewId: 'algo-coins-from-piles-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code02：LeetCode 2218 取硬币，自顶向下连续拿取的前缀和预处理转分组背包互斥选择',
  icon: '🪙',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握硬币栈连续操作向互斥物品组的转化、前缀和预处理加速与步数容量分组背包',
});
