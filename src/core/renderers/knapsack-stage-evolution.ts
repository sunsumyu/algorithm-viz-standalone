/**
 * 背包四阶段演化引擎与渲染模块 (KnapsackStageEvolution)
 * 核心设计准则：每一行代码都是一个单步（逐行高亮执行，绝不跳步）
 * 
 * 包含：
 * 1. 阶段 1：递归暴力搜索 (DFS Exploration Tree & Call Stack - 逐行高亮推演)
 * 2. 阶段 2：记忆化搜索 (Memoization Cache Hit / Miss Tracker - 逐行高亮推演)
 * 3. 阶段 3：二维动态规划 (2D Table Fill & Dependencies Trace - 逐行高亮推演)
 * 4. 阶段 4：一维空间压缩 (由 KnapsackExecutionEngine 提供逐行推演)
 */

import { KnapsackItem } from '../knapsack-execution-engine';
import { HighlightTarget } from './dark-code-terminal-presenter';
import { getKnapsackAnchor } from './knapsack-stage-codes';
import { GridVisualAdapter, type GridRenderOptions } from './grid-visual-adapter';

export type KnapsackKind = '01' | 'unbounded' | 'partitioned';

// ==========================================
// 1. 各阶段 4 语言行号 (由 CodeStepIndexer 从 @step:anchor 编译自动解析)
// ==========================================

export interface StageLineMap {
  [action: string]: HighlightTarget;
}

/**
 * 从 CodeStepIndexer 获取某阶段某 kind 的 anchor 对应行号
 * 替代原有的 STAGE_LINE_MAPS 常量查找
 */
function getLine(stage: number, kind: KnapsackKind, anchor: string): HighlightTarget {
  return getKnapsackAnchor(stage, kind, anchor);
}

// ==========================================
// 2. 数据模型定义
// ==========================================

export interface RecursionStackFrame {
  itemIndex: number;
  remCap: number;
  choice?: string;
  action: 'call' | 'return' | 'prune';
  val?: number;
}

export interface KnapsackRecursionStep {
  stepIndex: number;
  totalSteps: number;
  type?: 'call' | 'return' | 'base' | string;
  action: string;
  codeLine?: HighlightTarget;
  curIndex: number;
  remCap: number;
  depth: number;
  callStack: RecursionStackFrame[];
  decisionLog: string;
  message: string;
  log: string;
  bestVal: number;
  totalCalls: number;
  branches: Array<{
    name: string;
    cost: number;
    val: number;
    nextCap: number;
    fits: boolean;
    chosen?: boolean;
  }>;
  metrics: Record<string, string>;
}

export interface KnapsackMemoStep extends KnapsackRecursionStep {
  memoHit: boolean;
  memoCoord?: { i: number; j: number };
  cachedVal?: number;
  hitCount: number;
  missCount: number;
  memoGrid: (number | null)[][];
}

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

// ==========================================
// 3. 阶段 1：递归步骤生成器 (逐行步进)
// ==========================================

export function buildKnapsackRecursionSteps(
  kind: KnapsackKind,
  capacity: number,
  items: KnapsackItem[],
  maxSteps = 800
): KnapsackRecursionStep[] {
  const steps: KnapsackRecursionStep[] = [];
  const resolveLine = (anchor: string) => getLine(1, kind, anchor);
  let callCounter = 0;
  const stack: RecursionStackFrame[] = [];
  let bestValOverall = 0;

  const pushStep = (
    action: string,
    codeLineKey: string,
    idx: number,
    remCap: number,
    depth: number,
    msg: string,
    branches: any[] = []
  ) => {
    if (steps.length >= maxSteps) return;
    const curItem = items[idx];
    const itemName = curItem?.name || `物品#${idx + 1}`;
    const stepType =
      action === 'baseCheck' && (idx >= items.length || remCap <= 0)
        ? 'base'
        : (action === 'returnMax' ? 'return' : 'call');
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
      log: `[DFS] idx=${idx} remCap=${remCap} | ${action}: ${msg}`,
      bestVal: bestValOverall,
      totalCalls: callCounter,
      branches,
      metrics: {
        'metric-cur-state': `dfs(${idx}, ${remCap})`,
        'metric-depth': `${depth}`,
        'metric-calls': `${callCounter}`,
        'metric-best': `${bestValOverall}`,
      },
    });
  };

  // 1. 入口调用行
  pushStep('callRoot', 'callRoot', 0, capacity, 0, `🚀 主函数调用 dfs(0, ${capacity}) 启动完全暴力递归搜索`);

  function dfs(idx: number, remCap: number, depth: number): number {
    if (steps.length >= maxSteps) return 0;
    callCounter++;

    stack.push({ itemIndex: idx, remCap, action: 'call' });

    // 行 8: 进入 dfs 函数
    pushStep('fnEnter', 'fnEnter', idx, remCap, depth, `⚡ 进入 dfs(i=${idx}, remCap=${remCap}) 函数栈帧`);

    // 行 9: 检查递归基底边界
    if (idx >= items.length || remCap <= 0) {
      const reason = idx >= items.length ? `已考察全部 ${items.length} 种物品 (i>=m)` : `背包剩余容量耗尽 (remCap<=0)`;
      pushStep('baseCheck', 'baseCheck', idx, remCap, depth, `🛑 触达递归基底：${reason}，直接 return 0`);
      stack.pop();
      return 0;
    } else {
      pushStep('baseCheck', 'baseCheck', idx, remCap, depth, `🔍 边界检查通过：仍有物品待决策且剩余容量 ${remCap} > 0`);
    }

    const curItem = items[idx];
    const itemName = curItem.name || `物品#${idx + 1}`;

    // 行 10: 分支 1：不选当前物品，递归调用 dfs(idx + 1, remCap)
    pushStep(
      'branch1',
      'branch1',
      idx,
      remCap,
      depth,
      `🌿 分支 1：不选 ${itemName}，准备递归调用 dfs(${idx + 1}, ${remCap})`
    );
    const valWithout = dfs(idx + 1, remCap, depth + 1);

    // 行 11: 初始化 p2 = 0
    pushStep('initP2', 'initP2', idx, remCap, depth, `准备分支 2：初始化选入收益 p2 = 0`);

    // 行 12: 检查容量是否够装入当前物品
    const fits = remCap >= curItem.cost;
    pushStep(
      'checkFit',
      'checkFit',
      idx,
      remCap,
      depth,
      fits
        ? `✅ 容量校验：当前剩余容量 remCap=${remCap} >= 耗费 cost[${idx}]=${curItem.cost}，可以装入！`
        : `❌ 容量校验：当前剩余容量 remCap=${remCap} < 耗费 cost[${idx}]=${curItem.cost}，超重无法装入`
    );

    let valWith = 0;
    if (fits) {
      // 行 13: 选入当前物品，递归调用
      // 完全背包停留当前物种 idx，01 背包推进到下一物种 idx + 1
      const nextIdx = kind === 'unbounded' ? idx : idx + 1;
      const desc =
        kind === 'unbounded'
          ? `🎒 分支 2：选入 ${itemName}，消耗容量 ${curItem.cost}，完全背包仍停留在物种 #${nextIdx + 1} 继续选`
          : `🎒 分支 2：选入 ${itemName}，消耗容量 ${curItem.cost}，推进至下一物品 #${nextIdx + 1}`;

      pushStep('branch2', 'branch2', idx, remCap, depth, desc);
      valWith = dfs(nextIdx, remCap - curItem.cost, depth + 1) + curItem.val;
    }

    const res = Math.max(valWithout, valWith);
    if (res > bestValOverall) bestValOverall = res;

    // 行 15: 归纳两分支取 max 并返回
    pushStep(
      'returnMax',
      'returnMax',
      idx,
      remCap,
      depth,
      `↩️ dfs(i=${idx}, remCap=${remCap}) 决策完成：不选=${valWithout} vs 选入=${valWith} -> return max(${valWithout}, ${valWith}) = ${res}`
    );

    stack.pop();
    return res;
  }

  // 严格按用户实际输入的容量运行，不篡改容量！
  dfs(0, capacity, 0);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 4. 阶段 2：记忆化搜索步骤生成器 (逐行步进)
// ==========================================

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

// ==========================================
// 5. 阶段 3：二维动态规划步骤生成器 (逐行步进)
// ==========================================

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

// ==========================================
// 6. 阶段 1 渲染器 (递归暴力探索)
// ==========================================

export function renderKnapsackRecursionCard1(
  container: HTMLElement,
  step: KnapsackRecursionStep
): void {
  const stackItemsHtml = step.callStack
    .map((frame, idx) => {
      const isTop = idx === step.callStack.length - 1;
      return `
        <div style="background:${isTop ? '#eff6ff' : '#f8fafc'}; border:1px solid ${isTop ? '#3b82f6' : '#e2e8f0'}; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'JetBrains Mono', monospace; font-size:11.5px; color:${isTop ? '#1d4ed8' : '#334155'}; font-weight:700;">
            #${idx} dfs(idx=${frame.itemIndex}, remCap=${frame.remCap})
          </span>
          <span style="font-size:10px; color:${isTop ? '#2563eb' : '#94a3b8'}; font-weight:600;">
            ${isTop ? '⚡ 当前执行帧' : '等待返回'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; gap:10px; box-sizing:border-box;">
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 12px; border-left:4px solid #3b82f6;">
        <div style="font-size:11px; font-weight:700; color:#1d4ed8; margin-bottom:4px;">🌿 当前执行语句解说</div>
        <div style="font-size:12.5px; color:#1e293b; line-height:1.5;">${step.message || step.decisionLog}</div>
      </div>

      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:11.5px; font-weight:700; color:#334155;">📚 运行时调用栈 (Call Stack)</span>
          <span style="font-size:10.5px; color:#64748b;">深度: ${step.depth} | 栈大小: ${step.callStack.length}</span>
        </div>
        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column-reverse; gap:6px;">
          ${stackItemsHtml || '<div style="color:#94a3b8; font-size:11px;">栈空</div>'}
        </div>
      </div>
    </div>
  `;
}

export function renderKnapsackRecursionCard2(
  container: HTMLElement,
  step: KnapsackRecursionStep
): void {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; gap:12px; box-sizing:border-box;">
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
        <div style="font-size:11.5px; font-weight:800; color:#334155; margin-bottom:8px;">📊 暴力递归探索开销统计</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
            <div style="color:#64748b; font-size:10px;">总递归调用次数</div>
            <div style="color:#0284c7; font-size:16px; font-weight:800; font-family:'JetBrains Mono', monospace;">${step.totalCalls}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
            <div style="color:#64748b; font-size:10px;">当前探索最大深度</div>
            <div style="color:#7c3aed; font-size:16px; font-weight:800; font-family:'JetBrains Mono', monospace;">${step.depth}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
            <div style="color:#64748b; font-size:10px;">当前探得全局最大价值</div>
            <div style="color:#16a34a; font-size:16px; font-weight:800; font-family:'JetBrains Mono', monospace;">${step.bestVal}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
            <div style="color:#64748b; font-size:10px;">时间复杂度</div>
            <div style="color:#dc2626; font-size:14px; font-weight:800; font-family:'JetBrains Mono', monospace;">O(2^N) 爆炸</div>
          </div>
        </div>
      </div>

      <div style="flex:1; background:#fef2f2; border:1px dashed #f87171; border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:center;">
        <div style="color:#dc2626; font-size:12px; font-weight:700; margin-bottom:4px;">⚠️ 重叠子问题指数级爆炸警告</div>
        <div style="color:#475569; font-size:11.5px; line-height:1.6;">
          在暴力递归中，相同参数的 <code>dfs(idx, remCap)</code> 会被成百上千次重复计算。点击上方第 2 阶段 <strong>(2 记忆化)</strong> 体验如何通过开辟备忘录将指数级复杂度骤降为多项式级！
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 7. 阶段 2 渲染器 (记忆化搜索)
// ==========================================

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

// ==========================================
// 8. 阶段 3 渲染器 (二维动态规划递推)
// ==========================================

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
