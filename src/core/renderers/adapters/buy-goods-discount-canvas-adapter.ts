/**
 * 夏季特惠 (LeetCode LCP 51 / tJau2o / 左程云 Class 073 Code02)
 * Canvas Adapter: 游戏折扣卡片流与实时购物车载荷舱
 */

import { renderSpecialRecursionCard1, renderSpecialMemoCard1, renderSpecialMemoCard2, renderSpecial2DCard2 } from '../special-stage-cards';
import { renderKnapsackDpMatrix } from '../knapsack-sandbox-stage';
import {
  type BuyGoodsStep,
  parseBuyGoodsInputs,
  buildBuyGoodsDiscountSteps,
} from './buy-goods-discount-step-compiler';
import {
  buildBuyGoodsRecursionSteps,
  buildBuyGoodsMemoSteps,
  buildBuyGoods2DSteps,
} from '../../../algorithms/categories/dynamic-programming/knapsack-073/buy-goods-stage-evolution';
import {
  BUY_GOODS_STAGE1_CODE_LANGUAGES,
  BUY_GOODS_STAGE2_CODE_LANGUAGES,
  BUY_GOODS_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-073-templates';
import { BUY_GOODS_DISCOUNT_CODE_LANGUAGES } from '../../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-073-problem-content';

export function renderBuyGoodsBoard(container: HTMLElement, step: BuyGoodsStep): void {
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
        badge =
          '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🎁 倒贴白嫖</span>';
      } else if (isChosenInDp) {
        bg = 'rgba(88, 28, 135, 0.4)';
        border = '#a855f7';
        badge =
          '<span style="background:#7e22ce; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🛍️ 背包购入</span>';
      } else if (isCur) {
        bg = 'rgba(30, 58, 138, 0.5)';
        border = '#f59e0b';
        badge =
          '<span style="background:#2563eb; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>';
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
}

export function renderBuyGoodsStage1Canvas(container: HTMLElement, step: any): void {
  const infoHtml = `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
      <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">${step.decision}</div>
      <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
    </div>
  `;
  renderSpecialRecursionCard1(container, {
    title:
      step.i < step.n
        ? `正在决策普通游戏 #${step.normalGames?.[step.i]?.id ?? '—'} (花费:${step.normalGames?.[step.i]?.cost ?? '—'}, 快乐:${step.normalGames?.[step.i]?.val ?? '—'})`
        : '所有普通游戏决策完成',
    callStack: step.callStack || [],
    customInfoHtml: infoHtml,
  });
}

export function renderBuyGoodsStage1Metrics(container: HTMLElement, step: any): void {
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
}

export function renderBuyGoodsStage4Metrics(container: HTMLElement, step: BuyGoodsStep): void {
  renderKnapsackDpMatrix(
    container,
    {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
      maxVal: step.dpHappy,
    },
    `普通折扣游戏 01 背包 DP 向量 dp[0..${step.dp.length - 1}]`
  );
}

export function createBuyGoodsStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^M)',
      theme: 'bg-blue',
      badge: {
        mode: '普通游戏 · 递归搜索',
        complexity: 'O(2^M) · O(M) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '📊 递归调用深度与剩余预算监控',
      codeLanguages: BUY_GOODS_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
        return buildBuyGoodsRecursionSteps(initialBudget, a, b, w);
      },
      renderCanvas: renderBuyGoodsStage1Canvas,
      renderCustomMetrics: renderBuyGoodsStage1Metrics,
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
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfs(i=${step.i}, rem=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard2(container, {
          title: '2D 备忘录快乐值矩阵 memo[i][rem]',
          memo: step.memoGrid,
          curI: step.i,
          curJ: step.remCap,
        }),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(M · X)',
      theme: 'bg-emerald',
      badge: {
        mode: '普通游戏 · 二维状态表推导',
        complexity: 'O(M · X) · O(M · X)',
      },
      card1Title: '📐 二维状态转移决策与白嫖基线',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      codeLanguages: BUY_GOODS_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
        return buildBuyGoods2DSteps(initialBudget, a, b, w);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderBuyGoodsBoard(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecial2DCard2(container, {
          title: '二维状态表 dp[i][j]',
          dp: step.dpTable,
          curI: step.curI,
          curJ: step.curJ,
          depCells: (step.depCells || []).map((d: any) => ({ r: d.r, c: d.c })),
        }),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(X) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '普通游戏 · 一维滚动数组逆序更新',
        complexity: 'O(M · X) · O(X)',
      },
      card1Title: 'Steam 游戏折扣与实时购物车载荷',
      card2Title: '普通折扣游戏 01 背包 DP 向量 dp[0..X]',
      codeLanguages: BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
        return buildBuyGoodsDiscountSteps(initialBudget, a, b, w);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderBuyGoodsBoard(container, step),
      renderCustomMetrics: renderBuyGoodsStage4Metrics,
    },
  ];
}

