/**
 * 背包四阶段演化 — 阶段 1 递归暴力搜索 (KnapsackStageRecursion)
 * 数据模型 + 递归展开树推演 + Card 1/2 渲染。从 knapsack-stage-evolution 拆出。
 */

import { KnapsackItem } from '../knapsack-execution-engine';
import { HighlightTarget } from './dark-code-terminal-presenter';
import { getLine, type KnapsackKind } from './knapsack-stage-shared';

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
