/**
 * 背包四阶段演化 — 阶段 2 记忆化搜索 (KnapsackStageMemo)
 * 备忘录缓存 Hit/Miss 推演 + Card 1/2 渲染。从 knapsack-stage-evolution 拆出。
 */

import { KnapsackItem } from '../knapsack-execution-engine';
import { GridVisualAdapter, type GridRenderOptions } from './grid-visual-adapter';
import { getLine, type KnapsackKind } from './knapsack-stage-shared';
import type { RecursionStackFrame, KnapsackRecursionStep } from './knapsack-stage-recursion';

export interface KnapsackMemoStep extends KnapsackRecursionStep {
  memoHit: boolean;
  memoCoord?: { i: number; j: number };
  cachedVal?: number;
  hitCount: number;
  missCount: number;
  memoGrid: (number | null)[][];
}

export function buildKnapsackMemoSteps(
  kind: KnapsackKind,
  capacity: number,
  items: KnapsackItem[],
  maxSteps = 800
): KnapsackMemoStep[] {
  const steps: KnapsackMemoStep[] = [];
  const resolveLine = (anchor: string) => getLine(2, kind, anchor);
  let callCounter = 0;
  let hitCounter = 0;
  let missCounter = 0;
  let bestValOverall = 0;
  const stack: RecursionStackFrame[] = [];

  const m = items.length;
  const t = capacity;
  const memo: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array(t + 1).fill(null)
  );

  const pushMemoStep = (
    action: string,
    codeLineKey: string,
    idx: number,
    remCap: number,
    depth: number,
    msg: string,
    memoHit: boolean,
    cachedVal?: number
  ) => {
    if (steps.length >= maxSteps) return;
    const stepType =
      action === 'baseCheck' && (idx >= items.length || remCap <= 0)
        ? 'base'
        : (action === 'returnMax' || action === 'memoStore' ? 'return' : 'call');
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      type: stepType,
      action,
      codeLine: resolveLine(codeLineKey),
      curIndex: idx,
      remCap,
      depth,
      callStack: [...stack],
      decisionLog: msg,
      message: msg,
      log: `[MEMO] idx=${idx} remCap=${remCap} | ${action}: ${msg}`,
      bestVal: bestValOverall,
      totalCalls: callCounter,
      branches: [],
      memoHit,
      memoCoord: { i: idx, j: remCap },
      cachedVal,
      hitCount: hitCounter,
      missCount: missCounter,
      memoGrid: memo.map((r) => [...r]),
      metrics: {
        'metric-memo-status': memoHit ? '🎯 Cache HIT' : '📥 Cache MISS',
        'metric-hit-rate': `${Math.round((hitCounter / Math.max(1, hitCounter + missCounter)) * 100)}%`,
        'metric-calls': `${callCounter}`,
        'metric-best': `${bestValOverall}`,
      },
    });
  };

  // 1. 初始化备忘录数组
  pushMemoStep('memoInit', 'memoInit', 0, t, 0, `分配备忘录空间：long[][] memo = new long[${m}][${t} + 1]`, false);
  // 2. 填充 -1
  pushMemoStep('memoFill', 'memoFill', 0, t, 0, `初始化备忘录：将所有单元格全部置为 -1 (表示尚未求解)`, false);
  // 3. 入口调用
  pushMemoStep('callRoot', 'callRoot', 0, t, 0, `调用入口函数 dfsMemo(0, ${t}, memo)`, false);

  function dfsMemo(idx: number, remCap: number, depth: number): number {
    if (steps.length >= maxSteps) return 0;
    callCounter++;
    stack.push({ itemIndex: idx, remCap, action: 'call' });

    // 行 12: 函数入口
    pushMemoStep('fnEnter', 'fnEnter', idx, remCap, depth, `⚡ 进入 dfsMemo(i=${idx}, remCap=${remCap})`, false);

    // 行 13: 边界检查
    if (idx >= items.length || remCap <= 0) {
      pushMemoStep('baseCheck', 'baseCheck', idx, remCap, depth, `🛑 触达递归底 (i>=m 或 remCap<=0)，直接 return 0`, false);
      stack.pop();
      return 0;
    } else {
      pushMemoStep('baseCheck', 'baseCheck', idx, remCap, depth, `🔍 边界检查通过：idx=${idx} < ${items.length}, remCap=${remCap} > 0`, false);
    }

    // 行 14: 检查备忘录是否命中
    if (memo[idx][remCap] !== null) {
      hitCounter++;
      const cached = memo[idx][remCap]!;
      pushMemoStep(
        'memoCheck',
        'memoCheck',
        idx,
        remCap,
        depth,
        `🎯 命中备忘录！memo[${idx}][${remCap}] = ${cached} 已计算过，O(1) 立即返回结果！`,
        true,
        cached
      );
      stack.pop();
      return cached;
    } else {
      missCounter++;
      pushMemoStep(
        'memoCheck',
        'memoCheck',
        idx,
        remCap,
        depth,
        `📥 未命中备忘录 (Cache MISS)：memo[${idx}][${remCap}] 为 -1，开启首次递归推演`,
        false
      );
    }

    const curItem = items[idx];
    const itemName = curItem.name || `物品#${idx + 1}`;

    // 行 15: 分支 1 不选
    pushMemoStep('branch1', 'branch1', idx, remCap, depth, `🌿 分支 1：不选 ${itemName}，递归求解 dfsMemo(${idx + 1}, ${remCap})`, false);
    const valWithout = dfsMemo(idx + 1, remCap, depth + 1);

    // 行 16: 初始化 p2 = 0
    pushMemoStep('initP2', 'initP2', idx, remCap, depth, `准备分支 2：初始化选入收益 p2 = 0`, false);

    // 行 17: 检查容量
    const fits = remCap >= curItem.cost;
    pushMemoStep(
      'checkFit',
      'checkFit',
      idx,
      remCap,
      depth,
      fits ? `✅ 容量充足：剩余容量 ${remCap} >= 耗费 ${curItem.cost}` : `❌ 容量不足：剩余容量 ${remCap} < 耗费 ${curItem.cost}，无法选入`,
      false
    );

    let valWith = 0;
    if (fits) {
      const nextIdx = kind === 'unbounded' ? idx : idx + 1;
      pushMemoStep('branch2', 'branch2', idx, remCap, depth, `🎒 分支 2：选入 ${itemName}，消耗容量 ${curItem.cost} 并递归`, false);
      valWith = dfsMemo(nextIdx, remCap - curItem.cost, depth + 1) + curItem.val;
    }

    const res = Math.max(valWithout, valWith);
    memo[idx][remCap] = res;
    if (res > bestValOverall) bestValOverall = res;

    // 行 20: 写入备忘录并返回
    pushMemoStep(
      'memoStore',
      'memoStore',
      idx,
      remCap,
      depth,
      `💾 写入备忘录并返回：memo[${idx}][${remCap}] = max(${valWithout}, ${valWith}) = ${res}`,
      false,
      res
    );

    stack.pop();
    return res;
  }

  dfsMemo(0, capacity, 0);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function renderKnapsackMemoCard1(
  container: HTMLElement,
  step: KnapsackMemoStep
): void {
  const hit = step.memoHit;
  const statusColor = hit ? '#16a34a' : '#2563eb';
  const statusBg = hit ? '#f0fdf4' : '#eff6ff';
  const statusBorder = hit ? '#bbf7d0' : '#bfdbfe';
  const statusText = hit ? '🎯 命中备忘录 (Cache HIT) - O(1) 立即返回' : '📥 首次计算 (Cache MISS) - 递归求解后存入';

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; gap:10px; box-sizing:border-box;">
      <div style="background:${statusBg}; border:1px solid ${statusBorder}; border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:12.5px; font-weight:800; color:${statusColor};">${statusText}</div>
          <div style="font-size:11px; color:#475569; margin-top:2px;">${step.message || step.decisionLog}</div>
        </div>
        ${step.cachedVal !== undefined ? `<div style="background:#ffffff; border:1px solid ${statusColor}; border-radius:6px; padding:4px 10px; font-size:14px; font-weight:800; color:${statusColor}; font-family:'JetBrains Mono', monospace;">值: ${step.cachedVal}</div>` : ''}
      </div>

      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:11.5px; font-weight:700; color:#334155;">📚 记忆化递归调用栈与剪枝</span>
          <span style="font-size:10.5px; color:#64748b;">调用总数: ${step.totalCalls} 次</span>
        </div>
        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column-reverse; gap:6px;">
          ${step.callStack
            .map((f, idx) => `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-family:'JetBrains Mono', monospace; font-size:11px; color:#334155; display:flex; justify-content:space-between;">
                <span>#${idx} dfsMemo(${f.itemIndex}, ${f.remCap})</span>
                <span style="color:#64748b;">深度 ${step.depth - (step.callStack.length - 1 - idx)}</span>
              </div>
            `)
            .join('') || '<div style="color:#94a3b8; font-size:11px;">栈空</div>'}
        </div>
      </div>
    </div>
  `;
}

export function renderKnapsackMemoCard2(
  container: HTMLElement,
  step: KnapsackMemoStep
): void {
  const rows = step.memoGrid?.length || 0;
  const cols = step.memoGrid?.[0]?.length || 0;
  const rowLabels = step.memoGrid?.map((_, i) => `i=${i}`) || [];
  const colLabels = Array.from({ length: cols }, (_, j) => `${j}`);

  const stepData = {
    i: step.memoCoord?.i ?? 0,
    j: step.memoCoord?.j ?? 0,
    grid: step.memoGrid || [],
    type: step.memoHit ? '缓存命中' : '未命中试算',
    msg: `memo[${step.memoCoord?.i ?? 0}][${step.memoCoord?.j ?? 0}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: rows,
    n: cols,
    isReverse: false,
    isGridProblem: false,
    modelId: 'knapsack-memo',
    rowLabels,
    colLabels,
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; gap:10px; box-sizing:border-box;">
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
          <div style="color:#64748b; font-size:10px;">🎯 缓存命中 (Hits)</div>
          <div style="color:#16a34a; font-size:16px; font-weight:800; font-family:'JetBrains Mono', monospace;">${step.hitCount}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
          <div style="color:#64748b; font-size:10px;">📥 首次计算 (Misses)</div>
          <div style="color:#2563eb; font-size:16px; font-weight:800; font-family:'JetBrains Mono', monospace;">${step.missCount}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
          <div style="color:#64748b; font-size:10px;">⚡ 命中率 (Hit Rate)</div>
          <div style="color:#d97706; font-size:16px; font-weight:800; font-family:'JetBrains Mono', monospace;">
            ${Math.round((step.hitCount / Math.max(1, step.hitCount + step.missCount)) * 100)}%
          </div>
        </div>
      </div>

      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
        <div style="font-size:11px; font-weight:700; color:#334155; margin-bottom:6px;">
          💾 2D 备忘录缓存矩阵 memo[i][j]
        </div>
        <div class="knapsack-memo-grid-wrapper" style="flex:1; min-height:0; overflow:auto;">
        </div>
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.knapsack-memo-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}
