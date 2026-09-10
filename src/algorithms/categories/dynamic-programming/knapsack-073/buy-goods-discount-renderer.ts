/**
 * 夏季特惠 (LeetCode LCP 51 / tJau2o) - 声明式 4-Card 沙盘渲染器
 * 核心：心理不吃亏判别式 -> 贪心白嫖必选 (well >= 0) + 剩余游戏 01 背包转化
 * 架构重构：引入四语言代码联动、白嫖与背包双阶段沙盘及实时购物车载荷舱
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  BUY_GOODS_DISCOUNT_PROBLEM_HTML,
  BUY_GOODS_DISCOUNT_ANALYSIS_HTML,
  BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';
import {
  BUY_GOODS_STAGE1_CODE_LANGUAGES,
  BUY_GOODS_STAGE2_CODE_LANGUAGES,
  BUY_GOODS_STAGE3_CODE_LANGUAGES,
} from './knapsack-073-templates';
import {
  buildBuyGoodsRecursionSteps,
  buildBuyGoodsMemoSteps,
  buildBuyGoods2DSteps,
} from './buy-goods-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../../../../core/renderers/bounded-knapsack-stage-evolution';

export interface BuyGoodsStep {
  phase: 'init' | 'greedy-free' | 'knapsack-dp' | 'done';
  gameIndex: number;
  effectiveBudget: number;
  greedyHappy: number;
  dpHappy: number;
  totalHappy: number;
  games: { a: number; b: number; w: number; well: number; isFree: boolean }[];
  normalGames: { id: number; cost: number; val: number }[];
  dp: number[];
  j: number;
  status: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedNormalGames: number[]; // 01 背包中选中的 normalGames 索引
  metrics?: Record<string, any>;
}

export function buildBuyGoodsDiscountSteps(
  initialBudget: number,
  a: number[],
  b: number[],
  w: number[]
): BuyGoodsStep[] {
  const steps: BuyGoodsStep[] = [];
  const n = a.length;
  let currentBudget = initialBudget;
  let greedyHappy = 0;

  const games = a.map((orig, i) => {
    const disc = b[i];
    const happy = w[i];
    const well = orig - 2 * disc;
    return { a: orig, b: disc, w: happy, well, isFree: well >= 0 };
  });

  const normalGames: { id: number; cost: number; val: number }[] = [];

  const lines = {
    init: { java: 7, cpp: 7, python: 1, javascript: 2 },
    greedyLoop: { java: 12, cpp: 10, python: 5, javascript: 5 },
    greedyFreePick: { java: 14, cpp: 13, python: 8, javascript: 8 },
    initDp: { java: 22, cpp: 20, python: 13, javascript: 15 },
    dpOuterLoop: { java: 23, cpp: 21, python: 14, javascript: 16 },
    dpCapLoop: { java: 24, cpp: 22, python: 15, javascript: 18 },
    dpUpdate: { java: 25, cpp: 23, python: 16, javascript: 19 },
    returnAns: { java: 28, cpp: 26, python: 17, javascript: 22 },
  };

  function makeStep(data: Omit<BuyGoodsStep, 'metrics'>): BuyGoodsStep {
    return {
      ...data,
      metrics: {
        'metric-eff-budget': `${data.effectiveBudget} 元`,
        'metric-greedy-happy': `${data.greedyHappy}`,
        'metric-dp-happy': `${data.dpHappy}`,
        'metric-total-happy': `${data.totalHappy}`,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      phase: 'init',
      gameIndex: -1,
      effectiveBudget: currentBudget,
      greedyHappy: 0,
      dpHappy: 0,
      totalHappy: 0,
      games: [...games],
      normalGames: [],
      dp: [0],
      j: -1,
      selectedNormalGames: [],
      status: 'INIT',
      message: `🎮 开启夏季特惠决策：初始预算 X=${initialBudget}，平台共有 ${n} 款折扣游戏。`,
      log: `init: budget=${initialBudget}, games=${n}`,
      codeLine: lines.init,
    })
  );

  // 2. 第一阶段：贪心辨别白嫖游戏 (well >= 0)
  for (let i = 0; i < n; i++) {
    const g = games[i];
    if (g.well >= 0) {
      currentBudget += g.well;
      greedyHappy += g.w;
      steps.push(
        makeStep({
          phase: 'greedy-free',
          gameIndex: i,
          effectiveBudget: currentBudget,
          greedyHappy,
          dpHappy: 0,
          totalHappy: greedyHappy,
          games: [...games],
          normalGames: [...normalGames],
          dp: [0],
          j: -1,
          selectedNormalGames: [],
          status: 'FREE_PICK',
          message: `🎁 发现倒贴白嫖游戏 #${i + 1}：原价 ${g.a}，折后 ${g.b}，心理吃亏度 well=${g.well} >= 0！果断购入，白嫖获得快乐 +${g.w}，预算反增至 ${currentBudget} 元！`,
          log: `free game #${i + 1}: happy+=${g.w}, budget+=${g.well}`,
          codeLine: lines.greedyFreePick,
        })
      );
    } else {
      normalGames.push({ id: i + 1, cost: -g.well, val: g.w });
      steps.push(
        makeStep({
          phase: 'greedy-free',
          gameIndex: i,
          effectiveBudget: currentBudget,
          greedyHappy,
          dpHappy: 0,
          totalHappy: greedyHappy,
          games: [...games],
          normalGames: [...normalGames],
          dp: [0],
          j: -1,
          selectedNormalGames: [],
          status: 'NORMAL_COLLECT',
          message: `🛍️ 普通折扣游戏 #${i + 1}：原价 ${g.a}，折后 ${g.b}，心理吃亏度 well=${g.well} < 0。转化为 01 背包物品 (消耗资金=${-g.well}，获得快乐=${g.w})。`,
          log: `normal game #${i + 1}: cost=${-g.well}, val=${g.w}`,
          codeLine: lines.greedyLoop,
        })
      );
    }
  }

  // 3. 第二阶段：01 背包动态规划
  const m = normalGames.length;
  const x = currentBudget;
  const dp = new Array(x + 1).fill(0);
  let bestSelection: number[][] = Array.from({ length: x + 1 }, () => []);

  steps.push(
    makeStep({
      phase: 'knapsack-dp',
      gameIndex: -1,
      effectiveBudget: x,
      greedyHappy,
      dpHappy: 0,
      totalHappy: greedyHappy,
      games: [...games],
      normalGames: [...normalGames],
      dp: [...dp],
      j: -1,
      selectedNormalGames: [],
      status: 'DP_INIT',
      message: `📊 01 背包启动：白嫖完毕后可用总预算为 ${x} 元，需在 ${m} 款普通折扣游戏中做出最优选择。`,
      log: `dp init: budget=${x}, items=${m}`,
      codeLine: lines.initDp,
    })
  );

  for (let i = 0; i < m; i++) {
    const item = normalGames[i];

    steps.push(
      makeStep({
        phase: 'knapsack-dp',
        gameIndex: item.id - 1,
        effectiveBudget: x,
        greedyHappy,
        dpHappy: dp[x],
        totalHappy: greedyHappy + dp[x],
        games: [...games],
        normalGames: [...normalGames],
        dp: [...dp],
        j: -1,
        selectedNormalGames: [...(bestSelection[x] || [])],
        status: 'DP_ITEM',
        message: `🔍 考察普通游戏 #${item.id}：需真实消耗心理预算 ${item.cost} 元，可得快乐值 +${item.val}。`,
        log: `dp item #${item.id}: cost=${item.cost}, val=${item.val}`,
        codeLine: lines.dpOuterLoop,
      })
    );

    const nextBest = bestSelection.map((list) => [...list]);

    for (let j = x; j >= item.cost; j--) {
      steps.push(
        makeStep({
          phase: 'knapsack-dp',
          gameIndex: item.id - 1,
          effectiveBudget: x,
          greedyHappy,
          dpHappy: dp[x],
          totalHappy: greedyHappy + dp[x],
          games: [...games],
          normalGames: [...normalGames],
          dp: [...dp],
          j,
          selectedNormalGames: [...(nextBest[x] || [])],
          status: 'CHECK',
          message: `⏳ 倒序枚举预算：当前预算 j=${j} >= 耗资 ${item.cost}。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.dpCapLoop,
        })
      );

      const candidate = dp[j - item.cost] + item.val;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        nextBest[j] = [...bestSelection[j - item.cost], i];
      }

      steps.push(
        makeStep({
          phase: 'knapsack-dp',
          gameIndex: item.id - 1,
          effectiveBudget: x,
          greedyHappy,
          dpHappy: dp[x],
          totalHappy: greedyHappy + dp[x],
          games: [...games],
          normalGames: [...normalGames],
          dp: [...dp],
          j,
          selectedNormalGames: [...(nextBest[x] || [])],
          status: updated ? 'UPDATE' : 'KEEP',
          message: updated
            ? `✨ 状态更新：购入游戏 #${item.id}，将预算 ${j} 下的快乐值提升至 dp[${j}]=${dp[j]}！`
            : `⏸️ 状态保持：购入该游戏收益 ${candidate} <= 原值 ${dp[j]}，保持原选择。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.dpUpdate,
        })
      );
    }

    bestSelection = nextBest;
  }

  const finalDpHappy = dp[x];
  const finalTotalHappy = greedyHappy + finalDpHappy;

  steps.push(
    makeStep({
      phase: 'done',
      gameIndex: -1,
      effectiveBudget: x,
      greedyHappy,
      dpHappy: finalDpHappy,
      totalHappy: finalTotalHappy,
      games: [...games],
      normalGames: [...normalGames],
      dp: [...dp],
      j: x,
      selectedNormalGames: [...(bestSelection[x] || [])],
      status: 'done',
      message: `🎉 特惠狂欢决策完毕！白嫖必选游戏收获快乐 ${greedyHappy}，01 背包选购收获快乐 ${finalDpHappy}，最终总快乐值为 ${finalTotalHappy}！`,
      log: `done: totalHappy=${finalTotalHappy}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

function parseBuyGoodsInputs(inputs: Record<string, any>) {
  const initialBudget = parseInt(inputs['input-budget'] || '10', 10);
  const a = String(inputs['input-a'] || '10, 10')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const b = String(inputs['input-b'] || '3, 8')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const w = String(inputs['input-w'] || '5, 10')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  return { initialBudget, a, b, w };
}

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'buy-goods-discount',
  name: '夏季特惠 (贪心白嫖+01背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '贪心白嫖 · 01背包转化',
    complexity: 'O(N · X) · O(X)',
  },
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^M)',
      theme: 'bg-blue',
      badge: {
        mode: '普通折扣游戏 · 暴力递归',
        complexity: 'O(2^M) · O(M) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '📊 递归调用深度与预算结余监控',
      codeLanguages: BUY_GOODS_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
        return buildBuyGoodsRecursionSteps(initialBudget, a, b, w);
      },
      renderCanvas: (container, step) => {
        const infoHtml = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
            <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">${step.decision}</div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(
          container,
          step.i < step.n
            ? `正在决策普通游戏 #${step.normalGames?.[step.i]?.id ?? '—'} (花费:${step.normalGames?.[step.i]?.cost ?? '—'}, 快乐:${step.normalGames?.[step.i]?.val ?? '—'})`
            : '所有普通游戏决策完成',
          step.callStack || [],
          infoHtml
        );
      },
      renderCustomMetrics: (container, step) => {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:10px; height:100%; width:100%; justify-content:center; align-items:center; background:rgba(241, 245, 249, 0.9); border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-sizing:border-box;">
            <div style="font-size:13px; font-weight:700; color:#38bdf8;">📊 普通游戏暴力递归调用监控</div>
            <div style="display:flex; gap:16px; margin-top:8px;">
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">当前调用深度</div>
                <div style="font-size:20px; font-weight:800; color:#fbbf24;">${step.callStack?.length ?? 0}</div>
              </div>
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">普通游戏数 M</div>
                <div style="font-size:20px; font-weight:800; color:#34d399;">${step.n ?? 0}</div>
              </div>
            </div>
            <div style="font-size:11px; color:#64748b; text-align:center; max-width:320px; margin-top:6px;">
              白嫖游戏（well>=0）已被贪心必选收割，对剩余普通游戏开展 01 递归分治。
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
      timeBadge: 'O(M · X)',
      theme: 'bg-blue',
      badge: {
        mode: '普通游戏 · 备忘录缓存',
        complexity: 'O(M · X) · O(M · X) 备忘录',
      },
      card1Title: '💾 备忘录探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录快乐值矩阵 memo[i][rem]',
      codeLanguages: BUY_GOODS_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
        return buildBuyGoodsMemoSteps(initialBudget, a, b, w);
      },
      renderCanvas: (container, step) =>
        renderSpecialMemoCard1(
          container,
          `dfs(i=${step.i}, rem=${step.remCap})`,
          step.memoHit,
          step.hitCount,
          step.missCount,
          step.decision,
          step.message,
          step.cachedVal
        ),
      renderCustomMetrics: (container, step) =>
        renderSpecialMemoCard2(
          container,
          '备忘录快乐值表 memo[i][rem]',
          step.memoGrid,
          step.i,
          step.remCap
        ),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(M · X)',
      theme: 'bg-emerald',
      badge: {
        mode: '普通游戏 · 严格二维表递推',
        complexity: 'O(M · X) · O(M · X)',
      },
      card1Title: '📐 状态转移决策推导',
      card2Title: '📊 严格二维位置依赖状态表 dp[i][j]',
      codeLanguages: BUY_GOODS_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
        return buildBuyGoods2DSteps(initialBudget, a, b, w);
      },
      renderCanvas: (container, step) =>
        renderSpecial2DCard1(
          container,
          `dp[${step.curI}][${step.curJ}]`,
          `${step.dpTable?.[step.curI]?.[step.curJ] ?? 0}`,
          step.depCells || [],
          step.decision,
          step.message
        ),
      renderCustomMetrics: (container, step) =>
        renderSpecial2DCard2(
          container,
          '严格二维状态表 dp[i][j]',
          step.dpTable,
          step.curI,
          step.curJ,
          (step.depCells || []).map((d: any) => ({ r: d.r, c: d.c }))
        ),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(X) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '贪心白嫖 · 01背包空间压缩',
        complexity: 'O(N · X) · O(X)',
      },
      card1Title: 'Steam 折扣游戏库与实时购物车载荷舱',
      card2Title: '普通折扣游戏 01 背包 DP 向量 dp[0..X]',
      codeLanguages: BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
        return buildBuyGoodsDiscountSteps(initialBudget, a, b, w);
      },
      renderCanvas: (container, step) => {
        const gamesCards = step.games
          .map((g: any, idx: number) => {
            const isCur = step.gameIndex === idx;
            const isNormalChosen = (step.selectedNormalGames || []).includes(idx);
            let bg = 'rgba(241, 245, 249, 0.9)';
            let border = '#334155';
            let badge = '<span style="color:#64748b; font-size:9.5px;">普通折扣</span>';

            if (g.isFree) {
              bg = 'rgba(209, 250, 229, 0.9)';
              border = '#10b981';
              badge = `<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🎁 白赚 +${g.well}</span>`;
            } else if (isNormalChosen) {
              bg = 'rgba(88, 28, 135, 0.5)';
              border = '#a855f7';
              badge = `<span style="background:#7c3aed; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🛍️ 背包装入</span>`;
            } else if (isCur) {
              bg = 'rgba(30, 58, 138, 0.5)';
              border = '#38bdf8';
              badge = `<span style="background:#2563eb; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 决策中</span>`;
            }

            return `
              <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:135px; flex:1; max-width:210px; display:flex; flex-direction:column; gap:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:11.5px; font-weight:700; color:#374151;">游戏 #${idx + 1}</span>
                  ${badge}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
                  <span style="color:#64748b;">折后: <b style="color:#38bdf8;">${g.b}</b> <s style="font-size:9px; color:#64748b;">${g.a}</s></span>
                  <span style="color:#64748b;">快乐: <b style="color:#f59e0b;">+${g.w}</b></span>
                </div>
                <div style="font-size:10px; color:${g.well >= 0 ? '#34d399' : '#94a3b8'};">
                  心理收益 a-2b: <b>${g.well >= 0 ? '+' : ''}${g.well}</b>
                </div>
              </div>
            `;
          })
          .join('');

        const normalList = step.normalGames || [];
        const normalChips = normalList
          .map((ng: any) => {
            const isChosen = (step.selectedNormalGames || []).includes(ng.id - 1);
            const isCur = step.gameIndex === ng.id - 1;
            const bg = isChosen
              ? 'rgba(88, 28, 135, 0.6)'
              : isCur
              ? 'rgba(30, 58, 138, 0.6)'
              : 'rgba(30, 41, 59, 0.6)';
            const border = isChosen ? '#a855f7' : isCur ? '#38bdf8' : '#475569';
            return `
              <span style="background:${bg}; border:1px solid ${border}; border-radius:4px; padding:3px 8px; font-size:10.5px; color:#374151; display:inline-flex; align-items:center; gap:6px;">
                <b>#${ng.id}</b>
                <span style="color:#64748b;">花:${ng.cost}</span>
                <span style="color:#38bdf8; font-weight:700;">乐:+${ng.val}</span>
              </span>
            `;
          })
          .join(' ');

        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
              <div style="font-size:12px; color:#64748b; font-weight:700;">🎮 Steam 特惠游戏货架与判定机制</div>
              <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
                结余可用预算: <b style="color:#38bdf8;">${step.effectiveBudget}</b> 元
              </div>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
              ${gamesCards}
            </div>

            <!-- 底部实时购物车载荷舱 -->
            <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11.5px; font-weight:800; color:#374151;">🛒 实时购物车载荷舱</span>
                <div style="display:flex; gap:16px; font-size:11px;">
                  <span>白嫖快乐: <b style="color:#10b981;">${step.greedyHappy}</b></span>
                  <span>01背包快乐: <b style="color:#8b5cf6;">${step.dpHappy}</b></span>
                  <span>最终总快乐: <b style="color:#f59e0b;">${step.totalHappy}</b></span>
                </div>
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
                <span style="color:#64748b; font-size:10.5px; min-width:80px;">普通 01 候选:</span>
                ${normalChips || '<span style="color:#64748b; font-size:10px;">(全部白嫖，无需背包)</span>'}
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
          maxVal: step.dpHappy,
          totalCapacity: step.effectiveBudget,
        }, `普通折扣游戏 01 背包向量 dp[0..${step.effectiveBudget}]`);
      },
    },
  ],
  card1Title: 'Steam 折扣游戏库与实时购物车载荷舱',
  card2Title: '普通折扣游戏 01 背包 DP 向量 dp[0..X]',
  card2Desc: '展示倒贴白嫖游戏直接收割、普通折扣游戏转化为 01 背包消耗资金的倒序填表过程',
  legend: [
    { label: '未选普通游戏', color: '#475569' },
    { label: '🎁 倒贴白嫖必选', color: '#10b981' },
    { label: '🛍️ 01背包购入', color: '#8b5cf6' },
    { label: '当前考察游戏', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-budget',
      label: '初始预算 X',
      type: 'number',
      defaultValue: 10,
      width: '60px',
    },
    {
      id: 'input-a',
      label: '原价 a (逗号分隔)',
      type: 'text',
      defaultValue: '10, 10',
      width: '100px',
    },
    {
      id: 'input-b',
      label: '折后价 b (逗号分隔)',
      type: 'text',
      defaultValue: '3, 8',
      width: '100px',
    },
    {
      id: 'input-w',
      label: '快乐值 w (逗号分隔)',
      type: 'text',
      defaultValue: '5, 10',
      width: '100px',
    },
  ],
  presets: [
    {
      label: '经典白嫖案例 (X=10, 游戏1倒贴4元+快乐5, Ans=15)',
      values: {
        'input-budget': 10,
        'input-a': '10, 10',
        'input-b': '3, 8',
        'input-w': '5, 10',
      },
    },
    {
      label: '全转化背包用例 (X=15, 3款普通折扣游戏, Ans=18)',
      values: {
        'input-budget': 15,
        'input-a': '12, 16, 20',
        'input-b': '8, 11, 14',
        'input-w': '6, 8, 12',
      },
    },
  ],
  metrics: [
    { id: 'metric-eff-budget', label: '实际可用预算', color: '#38bdf8' },
    { id: 'metric-greedy-happy', label: '白嫖快乐值', color: '#10b981' },
    { id: 'metric-dp-happy', label: '背包选购快乐值', color: '#8b5cf6' },
    { id: 'metric-total-happy', label: '最终总快乐值', color: '#f59e0b' },
  ],
  codeLanguages: BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
  problemHtml: BUY_GOODS_DISCOUNT_PROBLEM_HTML,
  analysisHtml: BUY_GOODS_DISCOUNT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const x = parseInt(inputs['input-budget'] || '10', 10);
    const parse = (s: string) =>
      (s || '')
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n));
    return buildBuyGoodsDiscountSteps(x, parse(inputs['input-a']), parse(inputs['input-b']), parse(inputs['input-w']));
  },
  renderCanvas: (container, step) => {
    const selectedNormal = step.selectedNormalGames || [];

    const cardsHtml = step.games
      .map((g: any, idx: number) => {
        const isCur = step.gameIndex === idx;
        const isFree = g.isFree;
        const normalIdx = step.normalGames.findIndex((ng: any) => ng.id === idx + 1);
        const isChosenInDp = normalIdx >= 0 && selectedNormal.includes(normalIdx);

        let bg = 'rgba(241, 245, 249, 0.9)';
        let border = '#334155';
        let badge = '<span style="color:#64748b; font-size:9px;">备选</span>';

        if (isFree) {
          bg = 'rgba(6, 95, 70, 0.4)';
          border = '#10b981';
          badge = '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🎁 倒贴白嫖</span>';
        } else if (isChosenInDp) {
          bg = 'rgba(88, 28, 135, 0.4)';
          border = '#a855f7';
          badge = '<span style="background:#7e22ce; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🛍️ 背包购入</span>';
        } else if (isCur) {
          bg = 'rgba(30, 58, 138, 0.5)';
          border = '#f59e0b';
          badge = '<span style="background:#2563eb; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>';
        }

        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:120px; flex:1; max-width:180px; display:flex; flex-direction:column; gap:3px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; font-weight:700; color:#374151;">游戏 #${idx + 1}</span>
              ${badge}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-top:2px;">
              <span style="color:#64748b;">原价: <s style="color:#ef4444;">${g.a}</s></span>
              <span style="color:#38bdf8;">折后: <b>${g.b}</b></span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10.5px;">
              <span style="color:#64748b;">心理吃亏: <b style="color:${g.well >= 0 ? '#10b981' : '#f59e0b'};">${g.well}</b></span>
              <span style="color:#10b981;">快乐: <b>+${g.w}</b></span>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
          <div style="font-size:12px; color:#64748b; font-weight:700;">Steam 平台游戏折扣库 (原价 a - 2*现价 b >= 0 即可直接倒贴白嫖)</div>
          <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
            可用预算: <b style="color:#38bdf8;">${step.effectiveBudget}</b> 元
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${cardsHtml}
        </div>

        <!-- 底部实时购物车载荷舱 -->
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#374151;">🛒 实时购物车载荷舱</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>白嫖快乐: <b style="color:#10b981;">+${step.greedyHappy}</b></span>
              <span>背包选购快乐: <b style="color:#8b5cf6;">+${step.dpHappy}</b></span>
              <span>总快乐值: <b style="color:#f59e0b;">${step.totalHappy}</b></span>
            </div>
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
      maxVal: step.dpHappy,
    }, `普通折扣游戏 01 背包 DP 向量 dp[0..${step.dp.length - 1}]`);
  },
});

export const BuyGoodsDiscountVisualizer = Visualizer;

registerAlgorithm({
  id: 'buy-goods-discount',
  name: '夏季特惠 (贪心白嫖+01背包)',
  viewId: 'algo-buy-goods-discount-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code02：LeetCode LCP 51 夏季特惠，心理不吃亏判别式 -> 贪心白嫖必选 + 剩余游戏 01 背包转化',
  icon: '🎮',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 78,
  learningGoal: '掌握打折促销代数判别式的建立、倒贴预算的贪心收割与背包容量自适应扩增技巧',
});
