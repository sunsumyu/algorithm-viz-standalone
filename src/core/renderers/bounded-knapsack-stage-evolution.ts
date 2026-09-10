/**
 * 多重背包朴素枚举四阶段演化算法推演引擎 (BoundedKnapsackStageEvolution)
 * 核心设计准则：每一行代码都是一个单步（逐行高亮执行，绝不跳步）
 * 
 * 包含：
 * 1. 阶段 1: 暴力递归搜索 (DFS 尝试每种宝物拿 0..c[i] 件)
 * 2. 阶段 2: 记忆化搜索 (memo[i][remCap] 缓存追踪 Hit/Miss)
 * 3. 阶段 3: 严格位置依赖二维动态规划 (dp[i][j] 填表)
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { type RecursionStepBase, type MemoStepBase, type Dp2DStepBase } from '../step-types';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from './knapsack-special-stage-evolution';
import { getBoundedKnapsackAnchor, type BoundedKnapsackKind } from './bounded-knapsack-stage-codes';

export {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
};

// ==========================================
// 1. 阶段 1：多重背包暴力递归步骤生成器
// ==========================================

export interface BoundedRecursionStep extends RecursionStepBase<{ i: number; remCap: number; label: string }> {
  i: number;
  remCap: number;
  k?: number;
  n: number;
  vList: number[];
  wList: number[];
  cList: number[];
  treeRoot?: any;
  activeNodeId?: string;
}

export function buildBoundedNaiveRecursionSteps(
  t: number,
  vList: number[],
  wList: number[],
  cList: number[],
  maxSteps = 800
): BoundedRecursionStep[] {
  const steps: BoundedRecursionStep[] = [];
  const n = Math.min(vList.length, wList.length, cList.length);
  const callStack: Array<{ i: number; remCap: number; label: string }> = [];

  interface RecTreeNode {
    id: string;
    label: string;
    val: string;
    status: 'current' | 'visited' | 'base' | 'pruned';
    tag?: string;
    children: RecTreeNode[];
  }

  function cloneTree(node: RecTreeNode | null): RecTreeNode | null {
    if (!node) return null;
    return {
      id: node.id,
      label: node.label,
      val: node.val,
      status: node.status,
      tag: node.tag,
      children: node.children.map(cloneTree).filter(Boolean) as RecTreeNode[],
    };
  }

  let nodeSeq = 0;
  const treeRoot: RecTreeNode = {
    id: 'node-root',
    label: `dfs(0, ${t})`,
    val: `dfs(0, ${t})`,
    status: 'current',
    children: [],
  };

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(1, 'bounded-naive' as BoundedKnapsackKind, anchor);

  const pushStep = (
    action: string,
    codeKey: string,
    i: number,
    remCap: number,
    k: number | undefined,
    decision: string,
    message: string,
    activeId?: string,
    retVal?: number
  ) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i,
      remCap,
      k,
      n,
      vList,
      wList,
      cList,
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS] i=${i} remCap=${remCap} k=${k ?? '-'} | ${action}: ${message}`,
      returnValue: retVal,
      treeRoot: cloneTree(treeRoot),
      activeNodeId: activeId || treeRoot.id,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, remCap=${remCap})` : '越界终止',
        'metric-cur-item': i < n ? `宝物 #${i + 1} (重:${wList[i]}, 价:${vList[i]}, 上限:${cList[i]})` : '无',
        'metric-branch-k': k !== undefined ? `尝试选 ${k} 件` : '—',
        'metric-stack-depth': `${callStack.length}`,
      },
    });
  };

  pushStep(
    'callRoot',
    'callRoot',
    0,
    t,
    undefined,
    '启动多重背包顶层递归',
    `🚀 启动多重背包顶层暴力尝试：从宝物 #1 开始决策，背包总容量 remCap=${t}。`,
    treeRoot.id
  );

  function dfs(i: number, remCap: number, depth: number, parentNode?: RecTreeNode): number {
    if (steps.length >= maxSteps) return 0;
    const frameLabel = `dfs(i=${i}, remCap=${remCap})`;
    callStack.push({ i, remCap, label: frameLabel });

    let curNode: RecTreeNode;
    if (parentNode) {
      curNode = {
        id: `node-${++nodeSeq}`,
        label: frameLabel,
        val: frameLabel,
        status: 'current',
        children: [],
      };
      parentNode.children.push(curNode);
    } else {
      curNode = treeRoot;
      curNode.status = 'current';
    }

    pushStep(
      'fnEnter',
      'fnEnter',
      i,
      remCap,
      undefined,
      '进入递归函数栈帧',
      `📥 进入栈帧 ${frameLabel}：当前剩余容量 remCap=${remCap}。`,
      curNode.id
    );

    pushStep(
      'baseCheck',
      'baseCheck',
      i,
      remCap,
      undefined,
      '检查基本终止条件 (i >= n || remCap <= 0)',
      i >= n
        ? `🛑 递归触底：所有 ${n} 种宝物已决策完毕，无法再选，返回 0 收益。`
        : remCap <= 0
        ? `🛑 背包已满：剩余可用容量 remCap=${remCap} <= 0，返回 0 收益。`
        : `✅ 边界检查通过：剩余容量 remCap=${remCap} > 0 且还有可用宝物件数。`,
      curNode.id
    );

    if (i >= n || remCap <= 0) {
      curNode.status = 'base';
      curNode.tag = '边界 0';
      callStack.pop();
      return 0;
    }

    pushStep(
      'initMax',
      'initMax',
      i,
      remCap,
      undefined,
      '初始化最大收益 maxVal = 0',
      `💡 初始化当前状态最大收益 maxVal = 0，准备枚举宝物 #${i + 1} 选取件数 k。`,
      curNode.id
    );

    let maxVal = 0;
    const maxK = cList[i];
    const weight = wList[i];
    const val = vList[i];

    for (let k = 0; k <= maxK && k * weight <= remCap; k++) {
      if (steps.length >= maxSteps) break;

      pushStep(
        'loopK',
        'loopK',
        i,
        remCap,
        k,
        `枚举选取件数 k = ${k} 件`,
        `🔍 枚举决策：尝试选择 ${k} 件宝物 #${i + 1}（耗重 ${k * weight} <= ${remCap}，获得直接价值 ${k * val}）。`,
        curNode.id
      );

      const subVal = dfs(i + 1, remCap - k * weight, depth + 1, curNode);
      const totalCandidate = subVal + k * val;
      if (totalCandidate > maxVal) {
        maxVal = totalCandidate;
      }

      pushStep(
        'branchNext',
        'branchNext',
        i,
        remCap,
        k,
        `回溯评估：k=${k} 总收益 = ${totalCandidate}`,
        `✨ 评估分支 k=${k}：后续收益 ${subVal} + 当前价值 ${k * val} = ${totalCandidate}，刷新当前最大值 maxVal=${maxVal}。`,
        curNode.id
      );
    }

    curNode.status = 'visited';
    curNode.tag = `=${maxVal}`;

    pushStep(
      'returnMax',
      'returnMax',
      i,
      remCap,
      undefined,
      `返回最优收益 maxVal = ${maxVal}`,
      `📤 结束当前栈帧 ${frameLabel}：在剩余容量 ${remCap} 下宝物 #${i + 1} 的所有件数试算完毕，返回最优收益 ${maxVal}。`,
      curNode.id,
      maxVal
    );

    callStack.pop();
    return maxVal;
  }

  dfs(0, t, 0, undefined);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 2. 阶段 2：多重背包记忆化搜索步骤生成器
// ==========================================

export interface BoundedMemoStep extends MemoStepBase {
  remCap: number;
  k?: number;
  memoHit: boolean;
  memoGrid: (number | null)[][];
  cachedVal?: number;
}

export function buildBoundedNaiveMemoSteps(
  t: number,
  vList: number[],
  wList: number[],
  cList: number[],
  maxSteps = 800
): BoundedMemoStep[] {
  const steps: BoundedMemoStep[] = [];
  const n = Math.min(vList.length, wList.length, cList.length);
  const memo: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(null));
  let hitCount = 0;
  let missCount = 0;

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(2, 'bounded-naive' as BoundedKnapsackKind, anchor);

  const pushStep = (
    action: string,
    codeKey: string,
    i: number,
    remCap: number,
    k: number | undefined,
    memoHit: boolean,
    decision: string,
    message: string,
    cachedVal?: number
  ) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i,
      remCap,
      k,
      memoHit,
      memoGrid: memo.map((row) => [...row]),
      hitCount,
      missCount,
      decision,
      message,
      log: `[MEMO] i=${i} remCap=${remCap} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': i < n ? `dfsMemo(i=${i}, remCap=${remCap})` : '越界终止',
        'metric-cache-status': memoHit ? '🎯 Cache HIT (命中缓存)' : '⚪ Cache MISS (初次计算)',
        'metric-hit-count': `${hitCount}`,
        'metric-miss-count': `${missCount}`,
      },
    });
  };

  pushStep(
    'callRoot',
    'callRoot',
    0,
    t,
    undefined,
    false,
    '启动记忆化搜索',
    `🚀 启动多重背包记忆化搜索：容量上限 t=${t}，初始化备忘录网格 memo[${n + 1}][${t + 1}] 为 null。`
  );

  function dfsMemo(i: number, remCap: number): number {
    if (steps.length >= maxSteps) return 0;

    pushStep(
      'fnEnter',
      'fnEnter',
      i,
      remCap,
      undefined,
      false,
      '进入递归栈帧',
      `📥 进入栈帧 dfsMemo(i=${i}, remCap=${remCap})。`
    );

    if (i >= n || remCap <= 0) {
      pushStep(
        'baseCheck',
        'baseCheck',
        i,
        remCap,
        undefined,
        false,
        '边界检查终止返回 0',
        `🛑 边界触底：i=${i} >= ${n} 或剩余容量 remCap=${remCap} <= 0，直接返回 0。`
      );
      return 0;
    }

    if (memo[i][remCap] !== null) {
      hitCount++;
      const val = memo[i][remCap]!;
      pushStep(
        'memoCheck',
        'memoCheck',
        i,
        remCap,
        undefined,
        true,
        `命中备忘录缓存 memo[${i}][${remCap}] = ${val}`,
        `🎯 缓存命中！状态 memo[${i}][${remCap}] 此前已求解过，直接读取结果 ${val} 并剪枝返回，避免重复分支展开！`,
        val
      );
      return val;
    }

    missCount++;
    pushStep(
      'memoCheck',
      'memoCheck',
      i,
      remCap,
      undefined,
      false,
      `未命中缓存 memo[${i}][${remCap}]`,
      `⚪ 缓存未命中：状态 (i=${i}, remCap=${remCap}) 首次访问，开始三重循环枚举件数计算。`
    );

    let maxVal = 0;
    const maxK = cList[i];
    const weight = wList[i];
    const val = vList[i];

    for (let k = 0; k <= maxK && k * weight <= remCap; k++) {
      if (steps.length >= maxSteps) break;

      pushStep(
        'loopK',
        'loopK',
        i,
        remCap,
        k,
        false,
        `枚举件数 k = ${k}`,
        `🔍 枚举件数 k=${k}：尝试将宝物 #${i + 1} 装入 ${k} 件。`
      );

      const subVal = dfsMemo(i + 1, remCap - k * weight);
      const totalCandidate = subVal + k * val;
      if (totalCandidate > maxVal) {
        maxVal = totalCandidate;
      }

      pushStep(
        'branchNext',
        'branchNext',
        i,
        remCap,
        k,
        false,
        `分支计算完毕：当前综合收益 ${totalCandidate}`,
        `✨ 分支收益计算：子问题 ${subVal} + 本级收益 ${k * val} = ${totalCandidate}，当前最大值 maxVal=${maxVal}。`
      );
    }

    memo[i][remCap] = maxVal;
    pushStep(
      'memoStore',
      'memoStore',
      i,
      remCap,
      undefined,
      false,
      `写入备忘录 memo[${i}][${remCap}] = ${maxVal}`,
      `💾 写入备忘录：将求解结果 ${maxVal} 存入 memo[${i}][${remCap}]，后续同参数查询将 O(1) 秒回！`,
      maxVal
    );

    return maxVal;
  }

  dfsMemo(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 3. 阶段 3：多重背包二维动态规划步骤生成器
// ==========================================

export interface Bounded2DStep extends Dp2DStepBase {
  curK?: number;
  dpTable: number[][];
  depCells: Array<{ label: string; val: number; r: number; c: number }>;
}

export function buildBoundedNaive2DSteps(
  t: number,
  vList: number[],
  wList: number[],
  cList: number[]
): Bounded2DStep[] {
  const steps: Bounded2DStep[] = [];
  const n = Math.min(vList.length, wList.length, cList.length);
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(0));

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(3, 'bounded-naive' as BoundedKnapsackKind, anchor);

  const pushStep = (
    action: string,
    codeKey: string,
    curI: number,
    curJ: number,
    curK: number | undefined,
    depCells: Array<{ label: string; val: number; r: number; c: number }>,
    decision: string,
    message: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      curI,
      curJ,
      curK,
      dpTable: dp.map((row) => [...row]),
      depCells,
      decision,
      message,
      log: `[2D DP] i=${curI} j=${curJ} k=${curK ?? '-'} | ${action}: ${message}`,
      metrics: {
        'metric-cur-cell': `dp[${curI}][${curJ}]`,
        'metric-cell-val': `${dp[curI][curJ]}`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 0',
      },
    });
  };

  pushStep(
    'initDp',
    'initDp',
    0,
    0,
    undefined,
    [],
    '初始化二维 DP 状态表',
    `🚀 初始化二维动态规划表格 dp[${n + 1}][${t + 1}]，第一行 dp[0][...] 表示不选任何宝物，全赋值为 0。`
  );

  for (let i = 1; i <= n; i++) {
    const weight = wList[i - 1];
    const val = vList[i - 1];
    const limitC = cList[i - 1];

    pushStep(
      'outerLoopI',
      'outerLoopI',
      i,
      0,
      undefined,
      [],
      `外层循环：考察第 ${i} 种宝物`,
      `📦 外层循环：开始考察宝物 #${i}（单重=${weight}, 单价=${val}, 数量上限=${limitC} 件）。`
    );

    for (let j = 0; j <= t; j++) {
      // k = 0: 不选当前物品，直接继承上一行同列 dp[i-1][j]
      dp[i][j] = dp[i - 1][j];
      const baseDep = { label: `dp[${i - 1}][${j}] (k=0)`, val: dp[i - 1][j], r: i - 1, c: j };

      pushStep(
        'inheritK0',
        'inheritK0',
        i,
        j,
        0,
        [baseDep],
        `k=0 基准继承：dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp[i][j]}`,
        `⏸️ 决策 k=0：不选宝物 #${i}，直接继承上一行容量 ${j} 的最优价值 ${dp[i - 1][j]}。`
      );

      // 枚举 k >= 1 件
      for (let k = 1; k <= limitC && k * weight <= j; k++) {
        const prevCap = j - k * weight;
        const candidateVal = dp[i - 1][prevCap] + k * val;
        const prevDpVal = dp[i][j];
        const isBetter = candidateVal > prevDpVal;
        if (isBetter) {
          dp[i][j] = candidateVal;
        }

        const depCell = {
          label: `dp[${i - 1}][${prevCap}] + ${k * val}`,
          val: candidateVal,
          r: i - 1,
          c: prevCap,
        };

        pushStep(
          'updateDp',
          'updateDp',
          i,
          j,
          k,
          [baseDep, depCell],
          `试算装入 ${k} 件：candidate = ${candidateVal}`,
          isBetter
            ? `✨ 状态刷新：装入 ${k} 件宝物 #${i}（耗重 ${k * weight}），相比原收益 ${prevDpVal} 更优，dp[${i}][${j}] 刷新为 ${dp[i][j]}！`
            : `⏸️ 状态保持：装入 ${k} 件候选收益 ${candidateVal} <= 当前收益 ${dp[i][j]}，保持原值不变。`
        );
      }
    }
  }

  pushStep(
    'returnAns',
    'returnAns',
    n,
    t,
    undefined,
    [{ label: `dp[${n}][${t}]`, val: dp[n][t], r: n, c: t }],
    `最终最优解：dp[${n}][${t}] = ${dp[n][t]}`,
    `🎉 多重背包严格二维 DP 填表完毕！在总容量 ${t} 下，考察完全部 ${n} 种宝物的全局最大价值为 ${dp[n][t]}！`
  );

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 4. 二进制拆分转化为 01 背包演化推演生成器
// ==========================================

export interface DerivedItem {
  origIndex: number;
  multiplier: number;
  val: number;
  weight: number;
}

export function splitItemsBinary(
  vList: number[],
  wList: number[],
  cList: number[]
): DerivedItem[] {
  const derived: DerivedItem[] = [];
  const n = Math.min(vList.length, wList.length, cList.length);
  for (let i = 0; i < n; i++) {
    let count = cList[i];
    let k = 1;
    while (count >= k) {
      derived.push({
        origIndex: i + 1,
        multiplier: k,
        val: vList[i] * k,
        weight: wList[i] * k,
      });
      count -= k;
      k <<= 1;
    }
    if (count > 0) {
      derived.push({
        origIndex: i + 1,
        multiplier: count,
        val: vList[i] * count,
        weight: wList[i] * count,
      });
    }
  }
  return derived;
}

export function buildBinarySplitRecursionSteps(
  t: number,
  derivedItemsOrVList: DerivedItem[] | number[],
  maxStepsOrWList: number | number[] = 800,
  cList?: number[]
) {
  let derivedItems: DerivedItem[];
  let maxSteps = 800;
  if (Array.isArray(maxStepsOrWList) && Array.isArray(cList)) {
    derivedItems = splitItemsBinary(derivedItemsOrVList as number[], maxStepsOrWList, cList);
  } else {
    derivedItems = derivedItemsOrVList as DerivedItem[];
    if (typeof maxStepsOrWList === 'number') maxSteps = maxStepsOrWList;
  }

  const steps: any[] = [];
  const m = derivedItems.length;
  const callStack: Array<{ idx: number; remCap: number; label: string }> = [];

  interface RecTreeNode {
    id: string;
    label: string;
    val: string;
    status: 'current' | 'visited' | 'base' | 'pruned';
    tag?: string;
    children: RecTreeNode[];
  }

  function cloneTree(node: RecTreeNode | null): RecTreeNode | null {
    if (!node) return null;
    return {
      id: node.id,
      label: node.label,
      val: node.val,
      status: node.status,
      tag: node.tag,
      children: node.children.map(cloneTree).filter(Boolean) as RecTreeNode[],
    };
  }

  let nodeSeq = 0;
  const treeRoot: RecTreeNode = {
    id: 'node-root',
    label: `dfs(0, ${t})`,
    val: `dfs(0, ${t})`,
    status: 'current',
    children: [],
  };

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(1, 'binary-split' as BoundedKnapsackKind, anchor);

  const pushStep = (
    action: string,
    codeKey: string,
    idx: number,
    remCap: number,
    decision: string,
    message: string,
    activeId?: string,
    retVal?: number
  ) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i: idx,
      remCap,
      n: m,
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS Derived] idx=${idx} remCap=${remCap} | ${action}: ${message}`,
      returnValue: retVal,
      treeRoot: cloneTree(treeRoot),
      activeNodeId: activeId || treeRoot.id,
      metrics: {
        'metric-cur-state': idx < m ? `dfs(idx=${idx}, remCap=${remCap})` : '越界终止',
        'metric-cur-item': idx < m ? `衍生包 #${idx + 1} (权:${derivedItems[idx].multiplier}, 重:${derivedItems[idx].weight}, 价:${derivedItems[idx].val})` : '无',
        'metric-stack-depth': `${callStack.length}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, t, '启动衍生01包暴力递归', `🚀 启动衍生 01 背包暴力分治：共 ${m} 个二进制位权衍生包，初始容量 remCap=${t}。`, treeRoot.id);

  function dfs(idx: number, remCap: number, parentNode?: RecTreeNode): number {
    if (steps.length >= maxSteps) return 0;
    const label = `dfs(${idx}, ${remCap})`;
    callStack.push({ idx, remCap, label });

    let curNode: RecTreeNode;
    if (parentNode) {
      curNode = {
        id: `node-${++nodeSeq}`,
        label,
        val: label,
        status: 'current',
        children: [],
      };
      parentNode.children.push(curNode);
    } else {
      curNode = treeRoot;
      curNode.status = 'current';
    }

    pushStep('fnEnter', 'fnEnter', idx, remCap, '进入栈帧', `📥 进入栈帧 ${label}。`, curNode.id);

    if (idx >= m || remCap <= 0) {
      curNode.status = 'base';
      curNode.tag = '边界 0';
      pushStep('baseCheck', 'baseCheck', idx, remCap, '触底终止', `🛑 递归边界触底 (idx>=${m} 或 remCap<=0)，直接返回 0。`, curNode.id, 0);
      callStack.pop();
      return 0;
    }

    pushStep('baseCheck', 'baseCheck', idx, remCap, '边界检查通过', `✅ 剩余容量 remCap=${remCap}，继续考察衍生包 #${idx + 1}。`, curNode.id);

    const item = derivedItems[idx];
    const p1 = dfs(idx + 1, remCap, curNode);
    pushStep('branchNoPick', 'branchNoPick', idx, remCap, '分支 1：不选当前衍生包', `🌿 分支 1：不选衍生包 #${idx + 1}，后续收益 = ${p1}。`, curNode.id);

    let p2 = 0;
    if (remCap >= item.weight) {
      p2 = dfs(idx + 1, remCap - item.weight, curNode) + item.val;
      pushStep('branchPick', 'branchPick', idx, remCap, '分支 2：选入当前衍生包', `💎 分支 2：选入衍生包 #${idx + 1} (重:${item.weight}, 价:${item.val})，总收益 = ${p2}。`, curNode.id);
    }

    const res = Math.max(p1, p2);
    curNode.status = 'visited';
    curNode.tag = `=${res}`;
    pushStep('returnMax', 'returnMax', idx, remCap, `返回最优解 max(${p1}, ${p2}) = ${res}`, `📤 栈帧 ${label} 决策完毕：返回最优值 ${res}。`, curNode.id, res);

    callStack.pop();
    return res;
  }

  dfs(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildBinarySplitMemoSteps(
  t: number,
  derivedItemsOrVList: DerivedItem[] | number[],
  maxStepsOrWList: number | number[] = 800,
  cList?: number[]
) {
  let derivedItems: DerivedItem[];
  let maxSteps = 800;
  if (Array.isArray(maxStepsOrWList) && Array.isArray(cList)) {
    derivedItems = splitItemsBinary(derivedItemsOrVList as number[], maxStepsOrWList, cList);
  } else {
    derivedItems = derivedItemsOrVList as DerivedItem[];
    if (typeof maxStepsOrWList === 'number') maxSteps = maxStepsOrWList;
  }

  const steps: any[] = [];
  const m = derivedItems.length;
  const memo: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(t + 1).fill(null));
  let hitCount = 0;
  let missCount = 0;

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(2, 'binary-split' as BoundedKnapsackKind, anchor);

  const pushStep = (action: string, codeKey: string, idx: number, remCap: number, memoHit: boolean, decision: string, message: string, cachedVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i: idx,
      remCap,
      memoHit,
      memoGrid: memo.map((row) => [...row]),
      hitCount,
      missCount,
      decision,
      message,
      log: `[MEMO Derived] idx=${idx} remCap=${remCap} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': idx < m ? `dfsMemo(idx=${idx}, remCap=${remCap})` : '越界终止',
        'metric-cache-status': memoHit ? '🎯 Cache HIT' : '⚪ Cache MISS',
        'metric-hit-count': `${hitCount}`,
        'metric-miss-count': `${missCount}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, t, false, '启动记忆化搜索', `🚀 启动衍生 01 背包记忆化搜索：初始化备忘录 memo[${m + 1}][${t + 1}]。`);

  function dfsMemo(idx: number, remCap: number): number {
    if (steps.length >= maxSteps) return 0;
    pushStep('fnEnter', 'fnEnter', idx, remCap, false, '进入栈帧', `📥 进入栈帧 dfsMemo(idx=${idx}, remCap=${remCap})。`);

    if (idx >= m || remCap <= 0) {
      pushStep('baseCheck', 'baseCheck', idx, remCap, false, '触底终止', `🛑 边界触底 (idx>=${m} 或 remCap<=0)，直接返回 0。`);
      return 0;
    }

    if (memo[idx][remCap] !== null) {
      hitCount++;
      const val = memo[idx][remCap]!;
      pushStep('memoCheck', 'memoCheck', idx, remCap, true, `命中缓存 memo[${idx}][${remCap}] = ${val}`, `🎯 缓存命中！直接复用结果 ${val}，剪除后续递归分支！`, val);
      return val;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', idx, remCap, false, `未命中缓存 memo[${idx}][${remCap}]`, `⚪ 缓存未命中：首次访问，开始分治。`);

    const item = derivedItems[idx];
    const p1 = dfsMemo(idx + 1, remCap);
    pushStep('branchNoPick', 'branchNoPick', idx, remCap, false, '分支 1：不选', `🌿 分支 1：不选衍生包 #${idx + 1}，后续收益 ${p1}。`);

    let p2 = 0;
    if (remCap >= item.weight) {
      p2 = dfsMemo(idx + 1, remCap - item.weight) + item.val;
      pushStep('branchPick', 'branchPick', idx, remCap, false, '分支 2：选入', `💎 分支 2：选入衍生包 #${idx + 1}，总收益 ${p2}。`);
    }

    const res = Math.max(p1, p2);
    memo[idx][remCap] = res;
    pushStep('memoStore', 'memoStore', idx, remCap, false, `写入缓存 memo[${idx}][${remCap}] = ${res}`, `💾 写入缓存：memo[${idx}][${remCap}] = ${res}，O(1) 返回。`, res);
    return res;
  }

  dfsMemo(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildBinarySplit2DSteps(
  t: number,
  derivedItemsOrVList: DerivedItem[] | number[],
  wListOrIgnored?: number[],
  cList?: number[]
) {
  let derivedItems: DerivedItem[];
  if (Array.isArray(wListOrIgnored) && Array.isArray(cList)) {
    derivedItems = splitItemsBinary(derivedItemsOrVList as number[], wListOrIgnored, cList);
  } else {
    derivedItems = derivedItemsOrVList as DerivedItem[];
  }

  const steps: any[] = [];
  const m = derivedItems.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(t + 1).fill(0));

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(3, 'binary-split' as BoundedKnapsackKind, anchor);

  const pushStep = (action: string, codeKey: string, curI: number, curJ: number, depCells: Array<{ label: string; val: number; r: number; c: number }>, decision: string, message: string) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      curI,
      curJ,
      dpTable: dp.map((row) => [...row]),
      depCells,
      decision,
      message,
      log: `[2D Derived] i=${curI} j=${curJ} | ${action}: ${message}`,
      metrics: {
        'metric-cur-cell': `dp[${curI}][${curJ}]`,
        'metric-cell-val': `${dp[curI][curJ]}`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 0',
      },
    });
  };

  pushStep('initDp', 'initDp', 0, 0, [], '初始化二维 DP 状态表', `🚀 初始化二维动态规划表格 dp[${m + 1}][${t + 1}]，base case 全为 0。`);

  for (let i = 1; i <= m; i++) {
    const item = derivedItems[i - 1];
    pushStep('outerLoopI', 'outerLoopI', i, 0, [], `考察衍生包 #${i}`, `📦 外层循环：考察衍生 01 包 #${i} (重:${item.weight}, 价:${item.val})。`);

    for (let j = 0; j <= t; j++) {
      dp[i][j] = dp[i - 1][j];
      const baseDep = { label: `dp[${i - 1}][${j}]`, val: dp[i - 1][j], r: i - 1, c: j };

      if (j < item.weight) {
        pushStep('inheritNoPick', 'inheritNoPick', i, j, [baseDep], `容量不足，直接继承：dp[${i}][${j}] = ${dp[i][j]}`, `⏸️ 容量 j=${j} < 重:${item.weight}，无法选入，继承上方值 ${dp[i - 1][j]}。`);
      } else {
        const prevCap = j - item.weight;
        const candidate = dp[i - 1][prevCap] + item.val;
        const isBetter = candidate > dp[i][j];
        if (isBetter) dp[i][j] = candidate;

        const pickDep = { label: `dp[${i - 1}][${prevCap}] + ${item.val}`, val: candidate, r: i - 1, c: prevCap };
        pushStep('updatePick', 'updatePick', i, j, [baseDep, pickDep], `试算选入：dp[${i}][${j}] = max(${dp[i - 1][j]}, ${candidate}) = ${dp[i][j]}`, isBetter ? `✨ 选入衍生包更优，价值提升至 ${dp[i][j]}！` : `⏸️ 保持原值 ${dp[i][j]}。`);
      }
    }
  }

  pushStep('returnAns', 'returnAns', m, t, [{ label: `dp[${m}][${t}]`, val: dp[m][t], r: m, c: t }], `最终最优收益：dp[${m}][${t}] = ${dp[m][t]}`, `🎉 二维 DP 填表完毕！衍生包全部决策完毕，最大收益为 ${dp[m][t]}！`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

// ==========================================
// 4. Coins Change Kinds (POJ 1742 混合背包找零种类)
// ==========================================

export function buildCoinsChangeRecursionSteps(
  m: number,
  valList: number[],
  cntList: number[],
  maxSteps = 800
) {
  const steps: any[] = [];
  const n = Math.min(valList.length, cntList.length);
  const callStack: Array<{ i: number; remCap: number; label: string }> = [];

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(1, 'coins-change' as BoundedKnapsackKind, anchor);

  const pushStep = (
    action: string,
    codeKey: string,
    i: number,
    rem: number,
    k: number | undefined,
    decision: string,
    message: string,
    retVal?: number
  ) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i,
      remCap: rem,
      k,
      n,
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS Coins] i=${i} rem=${rem} k=${k ?? '-'} | ${action}: ${message}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': `check(i=${i}, rem=${rem})`,
        'metric-stack-depth': `${callStack.length} 层`,
        'metric-cur-coin': i < n ? `货币 #${i + 1} (面值 ${valList[i]}, 限 ${cntList[i]} 张)` : '无更多货币',
        'metric-rem-money': rem <= 0 ? (rem === 0 ? '恰好凑齐 0 元' : `溢出 ${-rem} 元`) : `待凑 ${rem} 元`,
      },
    });
  };

  function dfs(i: number, rem: number): boolean {
    if (steps.length >= maxSteps) return false;
    callStack.push({ i, remCap: rem, label: `check(i=${i}, rem=${rem})` });
    pushStep('fnEnter', 'fnEnter', i, rem, undefined, '进入递归函数', `⚡ 进入 check(i=${i}, rem=${rem})：考察货币 #${i + 1}，剩余待凑金额 ${rem} 元。`);

    if (rem === 0) {
      pushStep('baseZero', 'baseZero', i, rem, undefined, '基底命中：金额恰好凑齐', `🎯 剩余待凑金额为 0 元，成功凑齐！返回 true。`, 1);
      callStack.pop();
      return true;
    }

    if (i === n || rem < 0) {
      pushStep('baseBound', 'baseBound', i, rem, undefined, '基底越界：货币耗尽或金额超出', `❌ 货币耗尽且金额尚未凑齐，返回 false。`, 0);
      callStack.pop();
      return false;
    }

    const c = cntList[i];
    const v = valList[i];
    for (let k = 0; k <= c && k * v <= rem; k++) {
      pushStep('loopK', 'loopK', i, rem, k, `尝试使用 k=${k} 张货币 #${i + 1}`, `🔍 尝试使用货币 #${i + 1} (面值 ${v} 元) 共 k=${k} 张，耗资 ${k * v} 元，剩余待凑 ${rem - k * v} 元。`);
      const ok = dfs(i + 1, rem - k * v);
      if (ok) {
        pushStep('returnTrue', 'returnTrue', i, rem, k, `子调用成功，立即返回 true`, `✨ 找到可行找零组合！通过使用 ${k} 张货币 #${i + 1} 成功凑齐！`, 1);
        callStack.pop();
        return true;
      }
    }

    pushStep('returnFalse', 'returnFalse', i, rem, undefined, '所有枚举张数均无法凑齐，返回 false', `⏸️ 枚举货币 #${i + 1} 的 0..${c} 张后均无法凑出目标金额，返回 false。`, 0);
    callStack.pop();
    return false;
  }

  for (let target = 1; target <= m; target++) {
    if (steps.length >= maxSteps) break;
    dfs(0, target);
  }
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildCoinsChangeMemoSteps(
  m: number,
  valList: number[],
  cntList: number[],
  maxSteps = 800
) {
  const steps: any[] = [];
  const n = Math.min(valList.length, cntList.length);
  const memo: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(-1));
  let hitCount = 0;
  let missCount = 0;

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(2, 'coins-change' as BoundedKnapsackKind, anchor);

  const pushStep = (
    action: string,
    codeKey: string,
    i: number,
    rem: number,
    memoHit: boolean,
    decision: string,
    message: string,
    cachedVal?: number
  ) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i,
      remCap: rem,
      memoHit,
      hitCount,
      missCount,
      cachedVal,
      memoGrid: memo.map((row) => [...row]),
      decision,
      message,
      log: `[Memo Coins] i=${i} rem=${rem} hit=${memoHit} | ${action}: ${message}`,
      metrics: {
        'metric-cur-state': `checkMemo(i=${i}, rem=${rem})`,
        'metric-memo-status': memoHit ? `命中缓存 (${cachedVal === 1 ? 'True' : 'False'})` : '未命中 (继续枚举)',
        'metric-hit-count': `${hitCount} 次`,
        'metric-miss-count': `${missCount} 次`,
      },
    });
  };

  function dfsMemo(i: number, rem: number): boolean {
    if (steps.length >= maxSteps) return false;
    if (rem === 0) {
      pushStep('baseZero', 'baseZero', i, rem, false, '基底命中：金额恰好凑齐', `🎯 剩余待凑金额为 0 元，成功凑齐！返回 true。`, 1);
      return true;
    }

    if (i === n || rem < 0) {
      pushStep('baseBound', 'baseBound', i, rem, false, '基底越界：货币耗尽或金额超出', `❌ 货币耗尽且金额尚未凑齐，返回 false。`, 0);
      return false;
    }

    if (memo[i][rem] !== -1) {
      hitCount++;
      const val = memo[i][rem];
      pushStep('checkMemo', 'checkMemo', i, rem, true, `命中缓存 memo[${i}][${rem}] = ${val === 1 ? 'True' : 'False'}`, `⚡ 缓存命中！memo[${i}][${rem}] 预先计算过，直接 O(1) 返回 ${val === 1 ? 'true' : 'false'}！`, val);
      return val === 1;
    }

    missCount++;
    pushStep('checkMemo', 'checkMemo', i, rem, false, `未命中缓存 memo[${i}][${rem}]`, `🔍 缓存未命中，开始枚举货币 #${i + 1} 的可能数量。`);

    const c = cntList[i];
    const v = valList[i];
    for (let k = 0; k <= c && k * v <= rem; k++) {
      pushStep('loopK', 'loopK', i, rem, false, `尝试使用 k=${k} 张货币 #${i + 1}`, `🔍 尝试使用货币 #${i + 1} (面值 ${v} 元) 共 k=${k} 张，耗资 ${k * v} 元，剩余待凑 ${rem - k * v} 元。`);
      const ok = dfsMemo(i + 1, rem - k * v);
      if (ok) {
        memo[i][rem] = 1;
        pushStep('memoTrue', 'memoTrue', i, rem, false, `写入缓存 memo[${i}][${rem}] = 1 (True)`, `💾 写入缓存：memo[${i}][${rem}] = 1，可成功凑齐！`, 1);
        return true;
      }
    }

    memo[i][rem] = 0;
    pushStep('memoFalse', 'memoFalse', i, rem, false, `写入缓存 memo[${i}][${rem}] = 0 (False)`, `💾 写入缓存：memo[${i}][${rem}] = 0，无法凑齐目标金额。`, 0);
    return false;
  }

  for (let target = 1; target <= m; target++) {
    if (steps.length >= maxSteps) break;
    dfsMemo(0, target);
  }
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildCoinsChange2DSteps(
  m: number,
  valList: number[],
  cntList: number[]
) {
  const steps: any[] = [];
  const n = Math.min(valList.length, cntList.length);
  const dp: boolean[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(false));
  dp[0][0] = true;

  const resolveLine = (anchor: string) => getBoundedKnapsackAnchor(3, 'coins-change' as BoundedKnapsackKind, anchor);

  const pushStep = (
    action: string,
    codeKey: string,
    curI: number,
    curJ: number,
    depCells: Array<{ label: string; val: number; r: number; c: number }>,
    decision: string,
    message: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      curI,
      curJ,
      dpTable: dp.map((row) => row.map((v) => (v ? 1 : 0))),
      depCells,
      decision,
      message,
      log: `[2D Coins] i=${curI} j=${curJ} | ${action}: ${message}`,
      metrics: {
        'metric-cur-cell': `dp[${curI}][${curJ}]`,
        'metric-cell-val': dp[curI]?.[curJ] ? 'True (可凑出)' : 'False (暂不可)',
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val === 1 ? 'True' : 'False'}`).join(', ') || '基底赋值',
      },
    });
  };

  pushStep('initDp', 'initDp', 0, 0, [], '初始化二维布尔状态表', `🚀 初始化二维状态表 dp[${n + 1}][${m + 1}]，初始全为 false。`);
  pushStep('initBase', 'initBase', 0, 0, [], '基底状态 dp[0][0] = true', `🎯 0 张货币凑 0 元自然可行：dp[0][0] = true。`);

  for (let i = 1; i <= n; i++) {
    const v = valList[i - 1];
    const c = cntList[i - 1];
    pushStep('outerI', 'outerI', i, 0, [], `考察货币 #${i}`, `🪙 外层循环：考察货币 #${i} (面值 ${v} 元，共有 ${c} 张)。`);

    for (let j = 0; j <= m; j++) {
      dp[i][j] = dp[i - 1][j];
      const baseDep = { label: `dp[${i - 1}][${j}]`, val: dp[i - 1][j] ? 1 : 0, r: i - 1, c: j };

      if (dp[i][j]) {
        pushStep('inherit', 'inherit', i, j, [baseDep], `直接继承：dp[${i}][${j}] = true`, `✔ 上方状态 dp[${i - 1}][${j}] 已经可凑出，不使用当前货币即可成立。`);
      } else {
        let found = false;
        const depList = [baseDep];
        for (let k = 1; k <= c && k * v <= j; k++) {
          const prevJ = j - k * v;
          const ok = dp[i - 1][prevJ];
          depList.push({ label: `dp[${i - 1}][${prevJ}]`, val: ok ? 1 : 0, r: i - 1, c: prevJ });
          if (ok) {
            dp[i][j] = true;
            found = true;
            pushStep('updateTrue', 'updateTrue', i, j, depList, `使用 ${k} 张货币 #${i} 凑出金额 ${j}`, `✨ 成功转移：使用 ${k} 张货币 #${i} (耗资 ${k * v} 元) + dp[${i - 1}][${prevJ}]=true，使 dp[${i}][${j}] = true！`);
            break;
          }
        }
        if (!found) {
          pushStep('inherit', 'inherit', i, j, depList, `金额 ${j} 无法凑出`, `⏸️ 枚举 1..${c} 张货币 #${i} 后均无法转移，dp[${i}][${j}] = false。`);
        }
      }
    }
  }

  let kinds = 0;
  for (let j = 1; j <= m; j++) {
    if (dp[n][j]) kinds++;
  }

  pushStep('countKinds', 'countKinds', n, m, [], `统计可凑出的金额总种类`, `📊 统计 dp[${n}][1..${m}] 中为 true 的单元格总数，共 ${kinds} 种！`);
  pushStep('returnAns', 'returnAns', n, m, [], `最终答案：共 ${kinds} 种面值`, `🎉 二维 DP 状态表推导完毕！可找零的不同金额种类总数为 ${kinds} 种！`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

