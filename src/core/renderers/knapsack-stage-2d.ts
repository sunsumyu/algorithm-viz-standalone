/**
 * 背包四阶段演化 — 阶段 3 二维动态规划 (KnapsackStage2D)
 * 2D 填表与依赖追踪推演 + Card 1/2 渲染。从 knapsack-stage-evolution 拆出。
 */

import { KnapsackItem } from '../knapsack-execution-engine';
import { HighlightTarget } from './dark-code-terminal-presenter';
import { GridVisualAdapter, type GridRenderOptions } from './grid-visual-adapter';
import { getLine, type KnapsackKind } from './knapsack-stage-shared';

export interface Knapsack2DStep {
  stepIndex: number;
  totalSteps: number;
  action: string;
  codeLine?: HighlightTarget;
  curI: number; // 1-based row index
  curJ: number; // 0..capacity
  dpTable: number[][]; // (M+1) x (T+1)
  items: KnapsackItem[];
  capacity: number;
  kind: KnapsackKind;
  message: string;
  log: string;
  decisionText: string;
  depNoPick: { r: number; c: number; val: number };
  depPick?: { r: number; c: number; val: number; itemCost: number; itemVal: number };
  chosenBranch: 'noPick' | 'pick';
  metrics: Record<string, string>;
}

export function buildKnapsack2DSteps(
  kind: KnapsackKind,
  capacity: number,
  items: KnapsackItem[]
): Knapsack2DStep[] {
  const steps: Knapsack2DStep[] = [];
  const resolveLine = (anchor: string) => getLine(3, kind, anchor);
  const m = items.length;
  const t = capacity;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(t + 1).fill(0));

  const push2DStep = (
    action: string,
    codeLineKey: string,
    i: number,
    j: number,
    msg: string,
    decisionText: string,
    depNoPick: { r: number; c: number; val: number },
    chosenBranch: 'noPick' | 'pick',
    depPick?: Knapsack2DStep['depPick']
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeLineKey),
      curI: i,
      curJ: j,
      dpTable: dp.map((row) => [...row]),
      items,
      capacity: t,
      kind,
      message: msg,
      log: `[2D DP] i=${i} j=${j} | ${action}: ${msg}`,
      decisionText,
      depNoPick,
      depPick,
      chosenBranch,
      metrics: {
        'metric-cell': `dp[${i}][${j}]`,
        'metric-val': `${dp[i]?.[j] ?? 0}`,
        'metric-dep':
          chosenBranch === 'pick' && depPick
            ? `dp[${depPick.r}][${depPick.c}] + ${depPick.itemVal}`
            : `dp[${depNoPick.r}][${depNoPick.c}]`,
      },
    });
  };

  // 行 7: 初始化二维数组
  push2DStep(
    'initDp',
    'initDp',
    0,
    0,
    `🚀 初始化二维 DP 数组：long[][] dp = new long[${m} + 1][${t} + 1]，base case 全 0`,
    `基础条件：考察 0 个物品或容量为 0 时最大价值均为 0`,
    { r: 0, c: 0, val: 0 },
    'noPick'
  );

  for (let i = 1; i <= m; i++) {
    const item = items[i - 1];
    const itemName = item.name || `物品#${i}`;

    // 行 8: 外层物品循环
    push2DStep(
      'outerLoop',
      'outerLoop',
      i,
      0,
      `🔄 外层循环：开始考察第 ${i} 种物品 ${itemName} (耗费=${item.cost}, 价值=${item.val})`,
      `遍历物品索引 i = ${i} / ${m}`,
      { r: i - 1, c: 0, val: dp[i - 1][0] },
      'noPick'
    );

    for (let j = 0; j <= t; j++) {
      const noPickVal = dp[i - 1][j];
      const depNoPick = { r: i - 1, c: j, val: noPickVal };

      // 行 9: 内层容量循环
      push2DStep(
        'capLoop',
        'capLoop',
        i,
        j,
        `➡️ 内层循环：枚举背包容量 j = ${j} / ${t}`,
        `当前待填充单元格为 dp[${i}][${j}]`,
        depNoPick,
        'noPick'
      );

      // 行 10: 不选当前物品，继承上一行 dp[i-1][j]
      dp[i][j] = noPickVal;
      push2DStep(
        'inherit',
        'inherit',
        i,
        j,
        `执行 dp[${i}][${j}] = dp[${i - 1}][${j}] = ${noPickVal} (默认不选当前物品，继承上一行)`,
        `不选分支：直接承袭前 ${i - 1} 个物品在容量 ${j} 下的最优收益 ${noPickVal}`,
        depNoPick,
        'noPick'
      );

      // 行 11: 检查容量是否够选
      const fits = j >= item.cost;
      let depPick: Knapsack2DStep['depPick'] | undefined = undefined;
      let pickVal = -1;

      if (fits) {
        if (kind === 'unbounded') {
          // 完全背包依赖【同行左侧】dp[i][j - cost]
          const sourceVal = dp[i][j - item.cost];
          pickVal = sourceVal + item.val;
          depPick = {
            r: i,
            c: j - item.cost,
            val: sourceVal,
            itemCost: item.cost,
            itemVal: item.val,
          };
        } else {
          // 01 背包依赖【上一行左侧】dp[i - 1][j - cost]
          const sourceVal = dp[i - 1][j - item.cost];
          pickVal = sourceVal + item.val;
          depPick = {
            r: i - 1,
            c: j - item.cost,
            val: sourceVal,
            itemCost: item.cost,
            itemVal: item.val,
          };
        }
      }

      push2DStep(
        'checkFit',
        'checkFit',
        i,
        j,
        fits
          ? `✅ 容量充足：j=${j} >= cost[${i - 1}]=${item.cost}，可尝试选入`
          : `❌ 容量不足：j=${j} < cost[${i - 1}]=${item.cost}，无法装入`,
        fits
          ? `满足装入条件，进入选入价值比较`
          : `保持不选方案 dp[${i}][${j}] = ${noPickVal}`,
        depNoPick,
        'noPick',
        depPick
      );

      // 行 12: 若可装入，执行 Math.max 更新
      if (fits && depPick) {
        let chosen: 'noPick' | 'pick' = 'noPick';
        let decisionText = '';
        if (pickVal > noPickVal) {
          chosen = 'pick';
          dp[i][j] = pickVal;
          decisionText = `✨ 选入收益更优！dp[${depPick.r}][${depPick.c}](${depPick.val}) + 价值(${item.val}) = ${pickVal} > 不选(${noPickVal})`;
        } else {
          decisionText = `⏸ 保持不选更优：选入价值(${pickVal}) <= 不选(${noPickVal})，取较大值 ${noPickVal}`;
        }

        push2DStep(
          'update',
          'update',
          i,
          j,
          `执行 dp[${i}][${j}] = Math.max(dp[${i}][${j}], dp[${depPick.r}][${depPick.c}] + ${item.val}) -> ${dp[i][j]}`,
          decisionText,
          depNoPick,
          chosen,
          depPick
        );
      }
    }
  }

  // 行 16: 返回最终答案
  push2DStep(
    'returnAns',
    'returnAns',
    m,
    t,
    `🎉 2D 状态递推完成！最终答案为 dp[${m}][${t}] = ${dp[m][t]}`,
    `遍历全部物品并在总容量限制 ${t} 下获得全局最大价值 ${dp[m][t]}`,
    { r: m, c: t, val: dp[m][t] },
    'noPick'
  );

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function renderKnapsack2DCard1(
  container: HTMLElement,
  step: Knapsack2DStep
): void {
  const m = step.items.length;
  const t = step.capacity;

  const rowLabels = Array.from({ length: m + 1 }, (_, i) => (i === 0 ? 'base' : `#${i}`));
  const colLabels = Array.from({ length: t + 1 }, (_, j) => `${j}`);

  const deps: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }> = [];
  if (step.depNoPick) {
    deps.push({ r: step.depNoPick.r, c: step.depNoPick.c, type: 'top', label: '不选源' });
  }
  if (step.depPick) {
    const isSameRow = step.depPick.r === step.curI;
    deps.push({
      r: step.depPick.r,
      c: step.depPick.c,
      type: isSameRow ? 'left' : 'diag',
      label: '选入源',
    });
  }

  const stepData = {
    i: step.curI,
    j: step.curJ,
    topI: step.depNoPick?.r,
    topJ: step.depNoPick?.c,
    diagI: step.depPick && step.depPick.r !== step.curI ? step.depPick.r : undefined,
    diagJ: step.depPick && step.depPick.r !== step.curI ? step.depPick.c : undefined,
    leftI: step.depPick && step.depPick.r === step.curI ? step.depPick.r : undefined,
    leftJ: step.depPick && step.depPick.r === step.curI ? step.depPick.c : undefined,
    grid: step.dpTable || [],
    deps,
    msg: `dp[${step.curI}][${step.curJ}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: m + 1,
    n: t + 1,
    isReverse: false,
    isGridProblem: false,
    modelId: 'knapsack-2d',
    rowLabels,
    colLabels,
    deps,
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; gap:8px; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px 12px;">
        <span style="font-size:11.5px; font-weight:700; color:#1e3a8a;">${step.message}</span>
        <span style="font-size:10.5px; color:#64748b;">阶段 3: 严格二维表拓扑填表 (dp[${step.curI}][${step.curJ}])</span>
      </div>

      <div class="knapsack-2d-table-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px;" id="dp2d-table-wrapper">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.knapsack-2d-table-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }

  // 自动滚到当前单元格
  setTimeout(() => {
    const el = container.querySelector(`[data-coord="${step.curI},${step.curJ}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, 10);
}

export function renderKnapsack2DCard2(
  container: HTMLElement,
  step: Knapsack2DStep
): void {
  const depPickHtml = step.depPick
    ? `
      <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:6px; padding:8px 10px;">
        <div style="font-size:11px; font-weight:700; color:#166534; margin-bottom:2px;">分支 2 (选入本物品)</div>
        <div style="font-family:'JetBrains Mono', monospace; font-size:12px; color:#1e293b;">
          dp[${step.depPick.r}][${step.depPick.c}](${step.depPick.val}) + 价值(${step.depPick.itemVal}) = <span style="color:#16a34a; font-weight:800;">${step.depPick.val + step.depPick.itemVal}</span>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">
          ${step.kind === 'unbounded' ? '完全背包：来自【同行左侧】dp[i][j-c]，支持无限次叠加' : '01 背包：来自【上一行左侧】dp[i-1][j-c]，确保只选 1 次'}
        </div>
      </div>
    `
    : `
      <div style="background:#fef2f2; border:1px dashed #ef4444; border-radius:6px; padding:8px 10px; color:#dc2626; font-size:11px;">
        ❌ 分支 2 不可选：当前剩余容量 j=${step.curJ} 不足装入该物品
      </div>
    `;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; gap:10px; box-sizing:border-box;">
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px;">
        <div style="font-size:11px; font-weight:800; color:#0284c7; margin-bottom:6px;">📐 状态转移方程式解析</div>
        <div style="font-family:'JetBrains Mono', monospace; font-size:12px; color:#0f172a; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 10px; border-radius:4px; margin-bottom:8px;">
          dp[i][j] = max( dp[i-1][j], ${step.kind === 'unbounded' ? 'dp[i][j-cost] + val' : 'dp[i-1][j-cost] + val'} )
        </div>
        <div style="font-size:12px; color:#475569;">${step.decisionText}</div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px 10px;">
          <div style="font-size:11px; font-weight:700; color:#1d4ed8; margin-bottom:2px;">分支 1 (不选本物品)</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:12px; color:#1e293b;">
            直接继承上一行同列 dp[${step.depNoPick.r}][${step.depNoPick.c}] = <span style="color:#2563eb; font-weight:800;">${step.depNoPick.val}</span>
          </div>
        </div>
        ${depPickHtml}
      </div>

      <div style="flex:1; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:10px; display:flex; flex-direction:column; justify-content:center;">
        <div style="font-size:11px; font-weight:700; color:#92400e; margin-bottom:4px;">💡 空间压缩演化预览</div>
        <div style="font-size:11px; color:#78350f; line-height:1.5;">
          观察发现：计算第 <code>i</code> 行仅依赖上一行或当前行左侧。因此无需保存全部 <code>M &times; T</code> 的网格，只需一个一维数组 <code>dp[j]</code>。点击第 4 阶段 <strong>(4 一维优化)</strong> 体验正序/倒序滚动的极限压缩！
        </div>
      </div>
    </div>
  `;
}
