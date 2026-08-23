/**
 * Dynamic Programming Physical Stage Renderers (物理实景动画渲染器调度器与聚合导出)
 */

export * from './types';
export * from './svg-helpers';
export * from './knapsack-renderer';
export * from './coin-renderer';
export * from './grid-renderer';
export * from './robber-renderer';
export * from './stock-renderer';
export * from './math-cut-renderer';

import { renderKnapsackStageSVG } from './knapsack-renderer';
import { renderCoinChangeStageSVG } from './coin-renderer';
import { renderGridExplorerStageSVG } from './grid-renderer';
import { renderHouseRobberStageSVG } from './robber-renderer';
import { renderStockTradingStageSVG } from './stock-renderer';
import { renderMathCutStageSVG } from './math-cut-renderer';

/**
 * 统一调度实景渲染器 (Thematic Stage Dispatcher)
 */
export function renderThematicStage(
  container: HTMLElement | null,
  algorithmId: string,
  step: any
): void {
  if (!container) return;

  const id = algorithmId.toLowerCase();

  if (id.includes('bag') || id.includes('knapsack') || id.includes('partition') || id.includes('stone') || id.includes('target-sum') || id.includes('ones-and-zeroes')) {
    const meta = step.thematicMeta?.knapsack || {
      capacity: 8,
      currentCapacity: step.current?.j ?? 0,
      items: [
        { id: 1, name: '水晶石', weight: 2, value: 3 },
        { id: 2, name: '金矿石', weight: 3, value: 4 },
        { id: 3, name: '能量核', weight: 4, value: 5 },
      ],
      currentItemIndex: step.current?.i ? Math.max(0, step.current.i - 1) : 0,
      action: step.actionMeta?.type === 'match' ? 'include' : 'evaluate',
      totalWeight: step.current?.j ?? 0,
      totalValue: Number(step.vars?.find((v: any) => v.name.includes('dp') || v.name.includes('价值'))?.value || step.metrics?.['总价值'] || step.metrics?.['answer'] || 0),
    };
    renderKnapsackStageSVG(container, meta);
  } else if (id.includes('coin') || id.includes('combination-sum') || id.includes('perfect-square')) {
    const meta = step.thematicMeta?.coin || {
      targetAmount: 7,
      currentAmount: step.current?.index ?? step.current?.j ?? 0,
      coins: [1, 2, 5],
      currentCoin: 1,
      action: 'drop',
      usedCoins: [],
    };
    renderCoinChangeStageSVG(container, meta);
  } else if (id.includes('unique-paths') || id.includes('min-path-sum') || id.includes('triangle')) {
    const rows = step.thematicMeta?.grid?.rows || step.dp2d?.length || 3;
    const cols = step.thematicMeta?.grid?.cols || step.dp2d?.[0]?.length || 4;
    let obstacles = step.thematicMeta?.grid?.obstacles;
    if (!obstacles && (id.includes('unique-paths-ii') || id.includes('obstacle'))) {
      obstacles = [[1, 1], [rows - 1, Math.max(0, cols - 2)]];
    }
    const rawCount = step.thematicMeta?.grid?.pathCount ?? Number(step.vars?.find((v: any) => v.name.includes('dp') || v.name.includes('路径') || v.name.includes('总数'))?.value || step.metrics?.['路径数'] || step.metrics?.['当前格路径总数'] || 0);
    const validCount = !isNaN(rawCount) ? rawCount : 0;

    const meta = {
      ...(step.thematicMeta?.grid || {}),
      rows,
      cols,
      curRow: step.thematicMeta?.grid?.curRow ?? step.current?.i ?? step.current?.row ?? 0,
      curCol: step.thematicMeta?.grid?.curCol ?? step.current?.j ?? step.current?.col ?? 0,
      obstacles,
      pathCount: validCount,
      dp2d: step.thematicMeta?.grid?.dp2d || step.dp2d,
    };
    renderGridExplorerStageSVG(container, meta);
  } else if (id.includes('house-robber') || id.includes('robber')) {
    const meta = step.thematicMeta?.robber || {
      houses: [
        { index: 0, val: 2 },
        { index: 1, val: 7 },
        { index: 2, val: 9 },
        { index: 3, val: 3 },
        { index: 4, val: 1 },
      ],
      curHouse: step.current?.index ?? step.current?.i ?? 0,
      robbedHouses: [],
      decision: step.actionMeta?.type === 'match' ? 'rob' : 'skip',
      totalStolen: Number(step.vars?.find((v: any) => v.name.includes('dp') || v.name.includes('金额'))?.value || step.metrics?.['最高金额'] || 0),
    };
    renderHouseRobberStageSVG(container, meta);
  } else if (id.includes('stock')) {
    const meta = step.thematicMeta?.stock || {
      prices: [7, 1, 5, 3, 6, 4],
      curDay: step.current?.i ?? step.current?.index ?? 0,
      action: step.actionMeta?.type === 'buy' ? 'buy' : step.actionMeta?.type === 'sell' ? 'sell' : 'hold',
      profit: Number(step.vars?.find((v: any) => v.name.includes('利润'))?.value || step.metrics?.['利润'] || 0),
      holding: Boolean(step.current?.j === 1),
    };
    renderStockTradingStageSVG(container, meta);
  } else if (id.includes('integer-break') || id.includes('cut') || id.includes('num-trees')) {
    const meta = step.thematicMeta?.mathCut || {
      totalLength: 6,
      cutPoint: step.current?.index ?? step.current?.i ?? 1,
      product: Number(step.vars?.find((v: any) => v.name.includes('乘积') || v.name.includes('dp'))?.value || step.metrics?.['乘积'] || 0),
    };
    renderMathCutStageSVG(container, meta);
  }
}
