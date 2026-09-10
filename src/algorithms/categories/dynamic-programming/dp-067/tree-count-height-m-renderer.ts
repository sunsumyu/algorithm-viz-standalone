/**
 * 节点数为 n 高度不大于 m 的二叉树结构数 (牛客网 / 左神 Class067 Code05)
 * 核心：树形规模拆解、左右子树独立形态笛卡尔乘积累加、双列滚动空间压缩
 * 涵盖：
 * 阶段 1: 规模拆解暴力递归 f(n, m)
 * 阶段 2: 记忆化搜索 memo[n][m]
 * 阶段 3: 严格二维表 dp[i][j] (列循环外层递推)
 * 阶段 4: 空间压缩双列滚动优化 dp[i]
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  TREE_COUNT_STAGE1_CODE_LANGUAGES,
  TREE_COUNT_STAGE2_CODE_LANGUAGES,
  TREE_COUNT_STAGE3_CODE_LANGUAGES,
  TREE_COUNT_STAGE4_CODE_LANGUAGES,
} from './dp-067-stage-codes';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  DpCellDep,
} from './dp-067-shared';

const MOD = 1000000007;

export function parseTreeCountInputs(inputs: Record<string, any>) {
  const n = Math.max(0, Math.min(10, parseInt(String(inputs?.['input-n'] ?? '5'), 10) || 5));
  const m = Math.max(0, Math.min(10, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3));
  return { n, m };
}

// ==========================================
// 0. 通用树节点模型与工厂函数
// ==========================================

export interface TreeCountTreeNode {
  id: string;
  val: string;
  edgeLabel?: string;
  status?: 'current' | 'visited' | 'pruned' | 'base' | 'active';
  tag?: string;
  children: TreeCountTreeNode[];
}

export function cloneTreeCountTree(node: TreeCountTreeNode | null): TreeCountTreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    val: node.val,
    edgeLabel: node.edgeLabel,
    status: node.status,
    tag: node.tag,
    children: (node.children || []).map(cloneTreeCountTree).filter(Boolean) as TreeCountTreeNode[],
  };
}

export function buildTreeCountDepTree(
  title: string,
  curI: number,
  curJ: number,
  totalSum: number,
  partitions: Array<{ k: number; leftWays: number; rightWays: number; ways: number }>,
  activeK?: number
): TreeCountTreeNode {
  if (curI === 0) {
    return {
      id: `dep-0-${curJ}`,
      val: `${title} = 1`,
      tag: '空树基底',
      status: 'base',
      children: [],
    };
  }

  const children: TreeCountTreeNode[] = partitions.map((p) => {
    const isActive = activeK !== undefined && p.k === activeK;
    return {
      id: `part-${curI}-${curJ}-${p.k}`,
      val: `k=${p.k}: 贡献 ${p.ways} 种`,
      edgeLabel: `划分 k=${p.k}`,
      tag: `${p.leftWays} × ${p.rightWays}`,
      status: isActive ? 'active' : 'visited',
      children: [
        {
          id: `left-${curI}-${curJ}-${p.k}`,
          val: `🌱左: ${p.leftWays} 种`,
          edgeLabel: `规模 ${p.k}`,
          tag: `高度≤${Math.max(0, curJ - 1)}`,
          status: 'visited',
          children: [],
        },
        {
          id: `right-${curI}-${curJ}-${p.k}`,
          val: `🌿右: ${p.rightWays} 种`,
          edgeLabel: `规模 ${curI - 1 - p.k}`,
          tag: `高度≤${Math.max(0, curJ - 1)}`,
          status: 'visited',
          children: [],
        },
      ],
    };
  });

  return {
    id: `root-${curI}-${curJ}`,
    val: `${title} = ${totalSum}`,
    tag: '👑根节点 (1节点)',
    status: 'active',
    children,
  };
}

// ==========================================
// 1. Stage 1: 暴力递归
// ==========================================

export interface TreeCountRecStep {
  currentCall: string;
  n: number;
  m: number;
  k?: number;
  callStack: Array<{ label: string }>;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, any>;
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
}

export function buildTreeCountStage1Steps(inputs: Record<string, any>): TreeCountRecStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const steps: TreeCountRecStep[] = [];
  const stack: Array<{ label: string }> = [];

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    enter: { java: 2, cpp: 2, python: 2, javascript: 2 },
    baseN0: { java: 3, cpp: 3, python: 3, javascript: 3 },
    baseM0: { java: 4, cpp: 4, python: 4, javascript: 4 },
    loopK: { java: 7, cpp: 7, python: 6, javascript: 8 },
    returnSum: { java: 9, cpp: 9, python: 6, javascript: 10 },
  };

  let nodeIdCounter = 0;
  const rootTree: TreeCountTreeNode = {
    id: `node-${++nodeIdCounter}`,
    val: `f(${n}, ${m})`,
    status: 'active',
    tag: '入口',
    children: [],
  };

  steps.push({
    currentCall: `f1(${n}, ${m})`,
    n,
    m,
    callStack: [],
    decision: `主函数入口：求解节点数 n=${n} 且高度上限 m=${m} 的二叉树结构种类数`,
    message: `以 1 个节点作为根节点，左右分配子树节点规模递推`,
    log: `enter f1(${n}, ${m})`,
    codeLine: lines.entry,
    metrics: { 'metric-params': `n=${n}, m=${m}`, 'metric-status': '函数入口' },
    treeRoot: cloneTreeCountTree(rootTree),
    activeNodeId: rootTree.id,
  });

  function f(curN: number, curM: number, parentNode?: TreeCountTreeNode, edgeLabel?: string): number {
    stack.push({ label: `f(${curN}, ${curM})` });

    let currentNode: TreeCountTreeNode;
    if (!parentNode) {
      currentNode = rootTree;
      currentNode.status = 'active';
    } else {
      currentNode = {
        id: `node-${++nodeIdCounter}`,
        val: `f(${curN}, ${curM})`,
        edgeLabel,
        status: 'active',
        children: [],
      };
      parentNode.children.push(currentNode);
    }

    steps.push({
      currentCall: `f(${curN}, ${curM})`,
      n: curN,
      m: curM,
      callStack: [...stack],
      decision: `探查规模: 节点数 n=${curN}，高度上限 m=${curM}`,
      message: `固定 1 个根节点，枚举左子树节点数 k 从 0 到 ${curN - 1}`,
      log: `f(${curN}, ${curM})`,
      codeLine: lines.enter,
      metrics: { 'metric-params': `n=${curN}, m=${curM}`, 'metric-status': '递归探查' },
      treeRoot: cloneTreeCountTree(rootTree),
      activeNodeId: currentNode.id,
    });

    if (curN === 0) {
      currentNode.status = 'base';
      currentNode.tag = '1 (空树)';
      steps.push({
        currentCall: `f(${curN}, ${curM})`,
        n: curN,
        m: curM,
        callStack: [...stack],
        decision: `Base Case: 节点数 n=0，空树形态为 1 种且高度为 0 <= ${curM}`,
        message: '空树返回 1',
        log: `base n=0: 1`,
        codeLine: lines.baseN0,
        metrics: { 'metric-params': `n=0, m=${curM}`, 'metric-ans': '1' },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return 1;
    }

    if (curM === 0) {
      currentNode.status = 'base';
      currentNode.tag = '0 (无高度)';
      steps.push({
        currentCall: `f(${curN}, ${curM})`,
        n: curN,
        m: curM,
        callStack: [...stack],
        decision: `Base Case: 节点数 n=${curN} > 0 但高度上限 m=0，无法构建有效二叉树`,
        message: '高度不足，返回 0',
        log: `base m=0: 0`,
        codeLine: lines.baseM0,
        metrics: { 'metric-params': `n=${curN}, m=0`, 'metric-ans': '0' },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return 0;
    }

    let sum = 0;
    for (let k = 0; k < curN; k++) {
      const leftWays = f(k, curM - 1, currentNode, `🌱左k=${k}`);
      const rightWays = f(curN - 1 - k, curM - 1, currentNode, `🌿右=${curN - 1 - k}`);
      const ways = (leftWays * rightWays) % MOD;
      sum = (sum + ways) % MOD;

      currentNode.tag = `累加+${ways}`;
      steps.push({
        currentCall: `f(${curN}, ${curM})`,
        n: curN,
        m: curM,
        k,
        callStack: [...stack],
        decision: `拆分左子树 ${k} 节点(方案 ${leftWays}) × 右子树 ${curN - 1 - k} 节点(方案 ${rightWays}) = +${ways}`,
        message: `左右子树高度上限均为 ${curM - 1}，乘积累加入当前总和`,
        log: `k=${k}: ${leftWays} * ${rightWays} = ${ways}`,
        codeLine: lines.loopK,
        metrics: { 'metric-params': `k=${k}`, 'metric-ans': `${sum}` },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
      });
    }

    currentNode.status = 'visited';
    currentNode.tag = `${sum}种`;
    stack.pop();
    return sum;
  }

  f(n, m);
  rootTree.status = 'visited';
  return steps;
}

// ==========================================
// 2. Stage 2: 记忆化搜索
// ==========================================

export interface TreeCountMemoStep {
  currentCall: string;
  n: number;
  m: number;
  memoHit: boolean;
  hitCount: number;
  missCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  memoGrid: number[][];
  cachedVal?: number;
  metrics?: Record<string, any>;
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
}

export function buildTreeCountStage2Steps(inputs: Record<string, any>): TreeCountMemoStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const steps: TreeCountMemoStep[] = [];
  const memo: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(-1));
  let hitCount = 0;
  let missCount = 0;

  let nodeIdCounter = 0;
  const rootTree: TreeCountTreeNode = {
    id: `node-${++nodeIdCounter}`,
    val: `f(${n}, ${m})`,
    status: 'active',
    tag: '入口',
    children: [],
  };

  steps.push({
    currentCall: `f2(${n}, ${m})`,
    n,
    m,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `主函数入口：初始化 ${n + 1}×${m + 1} 备忘录矩阵 memo`,
    message: `以 memo[n][m] 缓存对应规模的树结构数，消除重复搜索`,
    log: `enter f2(${n}, ${m})`,
    codeLine: { java: 2, cpp: 2, python: 2, javascript: 2 },
    memoGrid: memo.map((r) => [...r]),
    metrics: { 'metric-status': '函数入口', 'metric-hits': '0' },
    treeRoot: cloneTreeCountTree(rootTree),
    activeNodeId: rootTree.id,
  });

  function fMemo(curN: number, curM: number, parentNode?: TreeCountTreeNode, edgeLabel?: string): number {
    if (curN === 0) return 1;
    if (curM === 0) return 0;

    let currentNode: TreeCountTreeNode;
    if (!parentNode) {
      currentNode = rootTree;
      currentNode.status = 'active';
    } else {
      currentNode = {
        id: `node-${++nodeIdCounter}`,
        val: `f(${curN}, ${curM})`,
        edgeLabel,
        status: 'active',
        children: [],
      };
      parentNode.children.push(currentNode);
    }

    if (memo[curN][curM] !== -1) {
      hitCount++;
      currentNode.status = 'pruned';
      currentNode.tag = `🎯命中=${memo[curN][curM]}`;
      steps.push({
        currentCall: `fMemo(${curN}, ${curM})`,
        n: curN,
        m: curM,
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: memo[curN][curM],
        decision: `🎯 命中备忘录: memo[${curN}][${curM}] = ${memo[curN][curM]}`,
        message: `形态数计算此前已完成，直接复用结果！`,
        log: `hit memo[${curN}][${curM}] = ${memo[curN][curM]}`,
        codeLine: { java: 5, cpp: 5, python: 5, javascript: 5 },
        memoGrid: memo.map((r) => [...r]),
        metrics: { 'metric-status': '命中剪枝', 'metric-hits': `${hitCount}` },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
      });
      return memo[curN][curM];
    }

    missCount++;
    currentNode.tag = '🔍未命中';
    steps.push({
      currentCall: `fMemo(${curN}, ${curM})`,
      n: curN,
      m: curM,
      memoHit: false,
      hitCount,
      missCount,
      decision: `⚠️ 未命中备忘录: 首次探查 f(${curN}, ${curM})`,
      message: `枚举左子树节点数拆分进行递归累加`,
      log: `miss memo[${curN}][${curM}]`,
      codeLine: { java: 6, cpp: 6, python: 6, javascript: 6 },
      memoGrid: memo.map((r) => [...r]),
      metrics: { 'metric-status': '展开递归', 'metric-misses': `${missCount}` },
      treeRoot: cloneTreeCountTree(rootTree),
      activeNodeId: currentNode.id,
    });

    let sum = 0;
    for (let k = 0; k < curN; k++) {
      const left = fMemo(k, curM - 1, currentNode, `🌱左k=${k}`);
      const right = fMemo(curN - 1 - k, curM - 1, currentNode, `🌿右=${curN - 1 - k}`);
      sum = (sum + left * right) % MOD;
    }

    memo[curN][curM] = sum;
    currentNode.status = 'visited';
    currentNode.tag = `💾存=${sum}`;
    steps.push({
      currentCall: `fMemo(${curN}, ${curM})`,
      n: curN,
      m: curM,
      memoHit: false,
      hitCount,
      missCount,
      cachedVal: sum,
      decision: `💾 计算完成存入备忘录: memo[${curN}][${curM}] = ${sum}`,
      message: `状态 (${curN}, ${curM}) 的形态总数已写入备忘录`,
      log: `store memo[${curN}][${curM}] = ${sum}`,
      codeLine: { java: 10, cpp: 10, python: 8, javascript: 10 },
      memoGrid: memo.map((r) => [...r]),
      metrics: { 'metric-status': '写入备忘录', 'metric-val': `${sum}` },
      treeRoot: cloneTreeCountTree(rootTree),
      activeNodeId: currentNode.id,
    });

    return sum;
  }

  fMemo(n, m);
  rootTree.status = 'visited';
  return steps;
}

// ==========================================
// 3. Stage 3: 严格二维表递推
// ==========================================

export interface TreeCount2DStep {
  curI: number;
  curJ: number;
  currentCell: string;
  currentVal: number;
  dpTable: number[][];
  depCells: DpCellDep[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, any>;
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
}

export function buildTreeCountStage3Steps(inputs: Record<string, any>): TreeCount2DStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const steps: TreeCount2DStep[] = [];
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  // 1. 初始化空树行: dp[0][j] = 1
  for (let j = 0; j <= m; j++) {
    dp[0][j] = 1;
  }

  const lines3 = {
    initBase: { java: 5, cpp: 5, python: 5, javascript: 5 },
    colLoop: { java: 6, cpp: 6, python: 6, javascript: 6 },
    calcCell: { java: 12, cpp: 12, python: 8, javascript: 12 },
    returnAns: { java: 15, cpp: 15, python: 9, javascript: 15 },
  };

  const baseTree = buildTreeCountDepTree('dp[0][0..m]', 0, 0, 1, []);

  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: 'dp[0][0..m]',
    currentVal: 1,
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: '初始化第 0 行: 节点数 n=0 的空树形态数为 1',
    message: '对于任意高度限制，空树都是合法的一种形态',
    log: 'init dp[0][*] = 1',
    codeLine: lines3.initBase,
    metrics: { 'metric-status': '空树边界初始化' },
    treeRoot: baseTree,
    activeNodeId: baseTree.id,
  });

  // 列外层循环 j: 1..m，行内层循环 i: 1..n
  for (let j = 1; j <= m; j++) {
    const colTree = buildTreeCountDepTree(`开始第 ${j} 列 (高度上限 m=${j})`, 0, j, 1, []);

    steps.push({
      curI: 0,
      curJ: j,
      currentCell: `开始计算第 ${j} 列`,
      currentVal: 1,
      dpTable: dp.map((r) => [...r]),
      depCells: [],
      decision: `🔄 外层列循环推进: 当前树高度上限 m = ${j}`,
      message: `按列递推，本列所有状态只依赖左侧前一列 (高度 ${j - 1}) 的计算结果`,
      log: `start column j = ${j}`,
      codeLine: lines3.colLoop,
      metrics: { 'metric-status': `推进高度列 ${j}` },
      treeRoot: colTree,
      activeNodeId: colTree.id,
    });

    for (let i = 1; i <= n; i++) {
      let sum = 0;
      const deps: DpCellDep[] = [];
      const parts: Array<{ k: number; leftWays: number; rightWays: number; ways: number }> = [];

      for (let k = 0; k < i; k++) {
        const left = dp[k][j - 1];
        const right = dp[i - 1 - k][j - 1];
        const ways = (left * right) % MOD;
        sum = (sum + ways) % MOD;
        deps.push({
          r: k,
          c: j - 1,
          label: `左[${k}][${j - 1}]×右[${i - 1 - k}][${j - 1}]`,
          color: 'rgba(129, 140, 248, 0.2)',
        });
        parts.push({ k, leftWays: left, rightWays: right, ways });
      }

      dp[i][j] = sum;
      const cellTree = buildTreeCountDepTree(`dp[${i}][${j}]`, i, j, sum, parts);

      steps.push({
        curI: i,
        curJ: j,
        currentCell: `dp[${i}][${j}]`,
        currentVal: dp[i][j],
        dpTable: dp.map((r) => [...r]),
        depCells: deps.slice(0, 4),
        decision: `计算 dp[${i}][${j}]: 累加前一列 j=${j - 1} 各拆分乘积和 = ${sum}`,
        message: `当前列 j 仅依赖左侧前一列 j-1 的全部状态，支持列滚动`,
        log: `dp[${i}][${j}] = ${sum}`,
        codeLine: lines3.calcCell,
        metrics: { 'metric-status': '列依赖求和', 'metric-val': `${sum}` },
        treeRoot: cellTree,
        activeNodeId: cellTree.id,
      });
    }
  }

  const finalParts: Array<{ k: number; leftWays: number; rightWays: number; ways: number }> = [];
  for (let k = 0; k < n; k++) {
    const left = dp[k][m - 1];
    const right = dp[n - 1 - k][m - 1];
    finalParts.push({ k, leftWays: left, rightWays: right, ways: (left * right) % MOD });
  }
  const finalTree = buildTreeCountDepTree(`dp[${n}][${m}]`, n, m, dp[n][m], finalParts);

  steps.push({
    curI: n,
    curJ: m,
    currentCell: `dp[${n}][${m}]`,
    currentVal: dp[n][m],
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `🎉 严格二维DP递推完成: 节点数 ${n} 高度不大于 ${m} 的二叉树形态数为 ${dp[n][m]}`,
    message: `返回最终结果 dp[${n}][${m}] = ${dp[n][m]}`,
    log: `return dp[${n}][${m}] = ${dp[n][m]}`,
    codeLine: lines3.returnAns,
    metrics: { 'metric-status': '递推完成', 'metric-val': `${dp[n][m]}` },
    treeRoot: finalTree,
    activeNodeId: finalTree.id,
  });

  return steps;
}

// ==========================================
// 4. Stage 4: 空间压缩双列滚动
// ==========================================

export interface TreeCountSpaceOptStep {
  curI: number;
  curJ: number;
  dp: number[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, any>;
  currentCell?: string;
  currentVal?: number;
  depCells?: DpCellDep[];
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
}

export function buildTreeCountStage4Steps(inputs: Record<string, any>): TreeCountSpaceOptStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const steps: TreeCountSpaceOptStep[] = [];
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  prev[0] = 1;

  const lines4 = {
    initBase: { java: 6, cpp: 4, python: 4, javascript: 5 },
    colLoop: { java: 7, cpp: 5, python: 5, javascript: 6 },
    calcCell: { java: 10, cpp: 9, python: 8, javascript: 10 },
    swapPrev: { java: 12, cpp: 11, python: 9, javascript: 11 },
    returnAns: { java: 14, cpp: 13, python: 10, javascript: 13 },
  };

  const baseTree = buildTreeCountDepTree('prev[0]', 0, 0, 1, []);

  steps.push({
    curI: 0,
    curJ: 0,
    dp: [...prev],
    currentCell: 'prev[0]',
    currentVal: 1,
    depCells: [],
    decision: `初始化第 0 列 (m=0): 空树 prev[0]=1，其他节点数为 0`,
    message: `空间优化：由于每一列只依赖前一列，维护两条长度为 ${n + 1} 的数组滚动交替`,
    log: `init prev[0] = 1`,
    codeLine: lines4.initBase,
    metrics: { 'metric-space': `2 × O(${n + 1})`, 'metric-val': '1' },
    treeRoot: baseTree,
    activeNodeId: baseTree.id,
  });

  for (let j = 1; j <= m; j++) {
    curr = new Array(n + 1).fill(0);
    curr[0] = 1;

    const colTree = buildTreeCountDepTree(`curr[0..${n}] (m=${j})`, 0, j, 1, []);

    steps.push({
      curI: 0,
      curJ: j,
      dp: [...prev],
      currentCell: `curr[0] (m=${j})`,
      currentVal: 1,
      depCells: [],
      decision: `🔄 开启第 ${j} 列高度状态计算 (m=${j})`,
      message: `基于上一列形态向量 prev 滚动递推当前列 curr`,
      log: `start column ${j}`,
      codeLine: lines4.colLoop,
      metrics: { 'metric-space': `2 × O(${n + 1})`, 'metric-val': `${prev[0]}` },
      treeRoot: colTree,
      activeNodeId: colTree.id,
    });

    for (let i = 1; i <= n; i++) {
      let sum = 0;
      const deps: DpCellDep[] = [];
      const parts: Array<{ k: number; leftWays: number; rightWays: number; ways: number }> = [];

      for (let k = 0; k < i; k++) {
        const left = prev[k];
        const right = prev[i - 1 - k];
        const ways = (left * right) % MOD;
        sum = (sum + ways) % MOD;
        deps.push({
          r: k,
          c: j - 1,
          label: `prev[${k}]×prev[${i - 1 - k}]`,
          color: 'rgba(129, 140, 248, 0.2)',
        });
        parts.push({ k, leftWays: left, rightWays: right, ways });
      }
      curr[i] = sum;

      const cellTree = buildTreeCountDepTree(`curr[${i}]`, i, j, sum, parts);

      steps.push({
        curI: i,
        curJ: j,
        dp: [...curr],
        currentCell: `curr[${i}]`,
        currentVal: sum,
        depCells: deps.slice(0, 4),
        decision: `计算节点数 ${i} 在高度上限 ${j} 下的结构数 curr[${i}] = ${sum}`,
        message: `枚举左子树节点数 k ∈ [0..${i - 1}]，笛卡尔乘积并取模`,
        log: `curr[${i}] = ${sum}`,
        codeLine: lines4.calcCell,
        metrics: { 'metric-space': `2 × O(${n + 1})`, 'metric-val': `${sum}` },
        treeRoot: cellTree,
        activeNodeId: cellTree.id,
      });
    }

    prev = [...curr];
    const swapParts: Array<{ k: number; leftWays: number; rightWays: number; ways: number }> = [];
    for (let k = 0; k < n; k++) {
      const left = prev[k];
      const right = prev[n - 1 - k];
      swapParts.push({ k, leftWays: left, rightWays: right, ways: (left * right) % MOD });
    }
    const swapTree = buildTreeCountDepTree(`prev[${n}] (m=${j})`, n, j, prev[n], swapParts);

    steps.push({
      curI: n,
      curJ: j,
      dp: [...prev],
      currentCell: `prev[${n}]`,
      currentVal: prev[n],
      depCells: [],
      decision: `完成第 ${j} 列计算，执行双列滚动指针置换: prev = curr`,
      message: `当高度上限拓展到 ${j} 时，节点数为 ${n} 的二叉树结构数为 ${prev[n]}`,
      log: `column ${j} done: dp[${n}] = ${prev[n]}`,
      codeLine: lines4.swapPrev,
      metrics: { 'metric-space': `2 × O(${n + 1})`, 'metric-val': `${prev[n]}` },
      treeRoot: swapTree,
      activeNodeId: swapTree.id,
    });
  }

  const finalParts: Array<{ k: number; leftWays: number; rightWays: number; ways: number }> = [];
  for (let k = 0; k < n; k++) {
    const left = prev[k];
    const right = prev[n - 1 - k];
    finalParts.push({ k, leftWays: left, rightWays: right, ways: (left * right) % MOD });
  }
  const finalTree = buildTreeCountDepTree(`prev[${n}] (m=${m})`, n, m, prev[n], finalParts);

  steps.push({
    curI: n,
    curJ: m,
    dp: [...prev],
    currentCell: `prev[${n}]`,
    currentVal: prev[n],
    depCells: [],
    decision: `🎉 双列滚动空间压缩计算完成！最终二叉树形态数为 ${prev[n]}`,
    message: `空间复杂度由 O(N×M) 显著优化至 2 × O(N)`,
    log: `return prev[${n}] = ${prev[n]}`,
    codeLine: lines4.returnAns,
    metrics: { 'metric-space': `2 × O(${n + 1})`, 'metric-val': `${prev[n]}` },
    treeRoot: finalTree,
    activeNodeId: finalTree.id,
  });

  return steps;
}

// ==========================================
// 5. 声明式 Visualizer
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'tree-count-height-m',
  name: '节点数n高度不大于m的二叉树结构数',
  category: 'dynamic-programming',
  badge: {
    mode: '树形规模拆分 · 列滚动 DP',
    complexity: 'O(M×N^2) · O(N) 空间',
  },
  card1Title: '📈 二维形态计数表与列滚动向量',
  card2Title: '🌲 树形规模左右分配与状态依赖树解构舱',
  card2Desc: '展示以 1 为根拆解规模、左右子树独立形态笛卡尔乘积及列依赖压缩',
  legend: [
    { label: '当前生成列', color: '#2563eb' },
    { label: '前一列依赖', color: '#8b5cf6' },
    { label: '基础形态', color: '#10b981' },
  ],
  inputs: [
    { id: 'input-n', label: '节点总数 n:', type: 'number', defaultValue: 5, width: '60px' },
    { id: 'input-m', label: '高度上限 m:', type: 'number', defaultValue: 3, width: '60px' },
  ],
  presets: [
    { label: '牛客经典案例 (n=5, m=3 Ans=6)', values: { 'input-n': 5, 'input-m': 3 } },
    { label: '单节点案例 (n=1, m=1 Ans=1)', values: { 'input-n': 1, 'input-m': 1 } },
    { label: '卡特兰数上限 (n=4, m=4 Ans=14)', values: { 'input-n': 4, 'input-m': 4 } },
  ],
  metrics: [
    { id: 'metric-params', label: '当前规模', color: '#2563eb' },
    { id: 'metric-status', label: '状态', color: '#10b981' },
    { id: 'metric-val', label: '结构形态数', color: '#f59e0b' },
  ],
  codeLanguages: DP_067_PROBLEMS['tree-count-height-m'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['tree-count-height-m'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['tree-count-height-m'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildTreeCountStage1Steps,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(指数级)',
      theme: 'bg-blue',
      badge: {
        mode: '树形规模拆解 · 暴力递归',
        complexity: 'O(Catalan(N))',
      },
      legend: [
        { label: '根节点 (1)', color: '#10b981' },
        { label: '左子树 (k)', color: '#2563eb' },
        { label: '右子树 (n-1-k)', color: '#7c3aed' },
      ],
      card1Title: '🌲 左右子树规模拆分示图',
      card2Title: '🌿 规模拆解递归调用树',
      card2Desc: '固定 1 个根节点，左右分配子树节点规模递推',
      codeLanguages: TREE_COUNT_STAGE1_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage1Steps,
      renderCanvas: (container, step) => {
        renderTreeSplitView(container, step.n, step.m, step.k);
      },
      renderCustomMetrics: (container, step) => {
        renderRecursionCard1(
          container,
          step.currentCall,
          step.callStack,
          `<div style="font-size:12px; font-weight:700; color:#0f172a;">${step.decision}</div>
           <div style="font-size:11px; color:#64748b; margin-top:3px;">${step.message}</div>`,
          step.treeRoot,
          step.activeNodeId
        );
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(M×N^2)',
      theme: 'bg-blue',
      badge: {
        mode: '树形规模拆解 · 记忆化搜索',
        complexity: 'O(M×N^2) · O(M×N) 备忘录',
      },
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中 (Miss)', color: '#ef4444' },
        { label: '已缓存单元格', color: '#34d399' },
      ],
      card1Title: '🎯 2D 备忘录矩阵 memo[n][m]',
      card2Title: '💾 备忘录缓存与剪枝树',
      card2Desc: '以 memo[n][m] 缓存对应规模的形态总数，消除重复搜索',
      codeLanguages: TREE_COUNT_STAGE2_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage2Steps,
      renderCanvas: (container, step) => {
        renderMemoGridCard(
          container,
          '结构数备忘录 memo[n][m]',
          step.memoGrid,
          step.n,
          step.m
        );
      },
      renderCustomMetrics: (container, step) => {
        renderMemoCard1(
          container,
          step.currentCall,
          step.memoHit,
          step.hitCount,
          step.missCount,
          step.decision,
          step.message,
          step.cachedVal,
          step.treeRoot,
          step.activeNodeId
        );
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格二维表',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(M×N^2)',
      theme: 'bg-emerald',
      badge: {
        mode: '树形规模拆解 · 列优先严格填表',
        complexity: 'O(M×N^2) · O(M×N)',
      },
      legend: [
        { label: '当前填充格', color: '#10b981' },
        { label: '前一列依赖', color: '#8b5cf6' },
        { label: '空树基底', color: '#38bdf8' },
      ],
      card1Title: '📊 严格二维状态表 dp[i][j]',
      card2Title: '📐 笛卡尔乘积状态依赖树',
      card2Desc: '展示以 1 为根拆解规模、左右子树独立形态笛卡尔乘积及列依赖递推',
      codeLanguages: TREE_COUNT_STAGE3_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage3Steps,
      renderCanvas: (container, step) => {
        renderDp2DCard2(
          container,
          '形态计数表 dp[节点数i][高度j]',
          step.dpTable,
          step.curI,
          step.curJ,
          step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c }))
        );
      },
      renderCustomMetrics: (container, step) => {
        renderDp2DCard1(
          container,
          step.currentCell,
          step.currentVal,
          step.depCells,
          step.decision,
          step.message,
          step.treeRoot,
          step.activeNodeId
        );
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(N) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '树形规模拆解 · 双列滚动优化',
        complexity: 'O(M×N^2) · O(N) 空间',
      },
      legend: [
        { label: '当前生成列', color: '#2563eb' },
        { label: '前一列依赖', color: '#8b5cf6' },
        { label: '基础形态', color: '#10b981' },
      ],
      card1Title: '📈 双列滚动向量 dp[i]',
      card2Title: '🌲 双列滚动状态依赖树解构舱',
      card2Desc: '仅保留前一列形态，双列交替滚动将空间优化至 O(N)',
      codeLanguages: TREE_COUNT_STAGE4_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage4Steps,
      renderCanvas: (container, step) => {
        renderSpaceOptCard2(
          container,
          `空间压缩向量 dp[0..${step.dp.length - 1}]`,
          step.dp,
          step.curI
        );
      },
      renderCustomMetrics: (container, step) => {
        renderDp2DCard1(
          container,
          step.currentCell || `curr[${step.curI}]`,
          step.currentVal ?? step.dp[step.curI],
          step.depCells || [],
          step.decision,
          step.message,
          step.treeRoot,
          step.activeNodeId
        );
      },
    },
  ],
  renderCanvas: (container, step) => {
    renderSpaceOptCard2(
      container,
      `空间压缩向量 dp[0..${step.dp ? step.dp.length - 1 : 0}]`,
      step.dp || [],
      step.curI
    );
  },
  renderCustomMetrics: (container, step) => {
    renderDp2DCard1(
      container,
      step.currentCell || `curr[${step.curI}]`,
      step.currentVal ?? step.dp?.[step.curI] ?? 0,
      step.depCells || [],
      step.decision,
      step.message,
      step.treeRoot,
      step.activeNodeId
    );
  },
});

function renderTreeSplitView(
  container: HTMLElement,
  curN: number,
  curM: number,
  curK?: number
): void {
  if (!container) return;
  const leftN = curK !== undefined ? curK : 'k';
  const rightN = curK !== undefined ? curN - 1 - curK : 'n-1-k';

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11.5px;
        font-weight: 700;
        color: #475569;
      ">
        <span>当前规模：节点总数 <strong style="color: #2563eb; font-size: 13px;">${curN}</strong></span>
        <span style="color: #cbd5e1;">|</span>
        <span>高度上限 <strong style="color: #d97706; font-size: 13px;">${curM}</strong></span>
      </div>

      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 18px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        width: 92%;
        max-width: 480px;
      ">
        <!-- 👑 根节点 -->
        <div style="
          padding: 6px 14px;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1.5px solid #10b981;
          color: #047857;
          font-weight: 800;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 2px rgba(16, 185, 129, 0.15);
        ">
          <span>👑 根节点</span>
          <span style="font-size: 10px; background: #ffffff; border: 1px solid #a7f3d0; padding: 1px 5px; border-radius: 6px; color: #065f46;">固定占用 1 个节点</span>
        </div>

        <!-- 左右子树分支连线与乘积 -->
        <div style="display: flex; gap: 16px; align-items: center; width: 100%; justify-content: center;">
          <!-- 左子树 -->
          <div style="
            flex: 1;
            max-width: 170px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 8px 12px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(59, 130, 246, 0.08);
          ">
            <span style="font-size: 10.5px; font-weight: 700; color: #1e40af;">🌱 左子树</span>
            <span style="font-size: 13.5px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${leftN} 节点</span>
            <span style="font-size: 10px; color: #64748b; font-weight: 500;">高度 ≤ ${Math.max(0, curM - 1)}</span>
          </div>

          <!-- 乘号 -->
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #d97706;
          ">
            <span style="font-size: 20px; font-weight: 900; line-height: 1;">×</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #b45309;">笛卡尔积</span>
          </div>

          <!-- 右子树 -->
          <div style="
            flex: 1;
            max-width: 170px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 8px 12px;
            background: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(168, 85, 247, 0.08);
          ">
            <span style="font-size: 10.5px; font-weight: 700; color: #6b21a8;">🌿 右子树</span>
            <span style="font-size: 13.5px; font-weight: 800; color: #7c3aed; font-family: 'JetBrains Mono', monospace;">${rightN} 节点</span>
            <span style="font-size: 10px; color: #64748b; font-weight: 500;">高度 ≤ ${Math.max(0, curM - 1)}</span>
          </div>
        </div>

        <!-- 算式解释 -->
        <div style="
          font-size: 10.5px;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 5px 10px;
          text-align: center;
          line-height: 1.4;
          width: 100%;
          box-sizing: border-box;
        ">
          左右子树相互独立，当前划分形态总数 = <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0f172a;">f(${leftN}, ${Math.max(0, curM - 1)}) × f(${rightN}, ${Math.max(0, curM - 1)})</span>
        </div>
      </div>
    </div>
  `;
}

function renderMemoWithTreeSplit(container: HTMLElement, step: TreeCountMemoStep): void {
  if (!container) return;
  const total = step.hitCount + step.missCount;
  const hitRate = total > 0 ? Math.round((step.hitCount / total) * 100) : 0;
  const curM = step.m;
  const curN = step.n;

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      box-sizing: border-box;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <!-- 探查与缓存诊断顶栏 -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px;
      ">
        <div style="
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        ">
          <span style="font-size: 10px; font-weight: 600; color: #64748b;">探查状态规模</span>
          <span style="font-size: 12.5px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${step.currentCall}</span>
        </div>

        <div style="
          background: ${step.memoHit ? '#ecfdf5' : '#fef2f2'};
          border: 1px solid ${step.memoHit ? '#a7f3d0' : '#fecaca'};
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        ">
          <span style="font-size: 10px; font-weight: 600; color: ${step.memoHit ? '#065f46' : '#991b1b'};">备忘录诊断</span>
          <span style="font-size: 11.5px; font-weight: 800; color: ${step.memoHit ? '#047857' : '#b91c1c'};">${step.memoHit ? '🎯 CACHE HIT' : '⚠️ CACHE MISS'}</span>
        </div>

        <div style="
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        ">
          <span style="font-size: 10px; font-weight: 600; color: #64748b;">全局剪枝率</span>
          <span style="font-size: 12.5px; font-weight: 800; color: #d97706; font-family: 'JetBrains Mono', monospace;">${hitRate}% (${step.hitCount}/${total})</span>
        </div>
      </div>

      ${step.cachedVal !== undefined ? `
        <div style="
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span style="font-size: 11px; font-weight: 700; color: #166534;">🎉 读取已缓存形态数:</span>
          <span style="font-size: 13.5px; font-weight: 800; color: #15803d; font-family: 'JetBrains Mono', monospace;">memo[${step.n}][${step.m}] = ${step.cachedVal}</span>
        </div>
      ` : ''}

      <!-- 二叉树拆解主画布 -->
      <div style="
        flex: 1;
        min-height: 130px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 10px 14px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        gap: 8px;
      ">
        <div style="
          padding: 4px 12px;
          border-radius: 6px;
          background: #ecfdf5;
          border: 1.5px solid #10b981;
          color: #047857;
          font-weight: 800;
          font-size: 11.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span>👑 根节点 (1 节点)</span>
        </div>

        <div style="display: flex; gap: 14px; align-items: center; width: 100%; justify-content: center;">
          <div style="
            flex: 1;
            max-width: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            padding: 6px 10px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
          ">
            <span style="font-size: 10px; font-weight: 700; color: #1e40af;">🌱 左子树 (k)</span>
            <span style="font-size: 12.5px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">0 .. ${Math.max(0, curN - 1)}</span>
            <span style="font-size: 9.5px; color: #64748b;">高度 ≤ ${Math.max(0, curM - 1)}</span>
          </div>

          <span style="font-size: 16px; font-weight: 900; color: #d97706;">×</span>

          <div style="
            flex: 1;
            max-width: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            padding: 6px 10px;
            background: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 6px;
          ">
            <span style="font-size: 10px; font-weight: 700; color: #6b21a8;">🌿 右子树 (n-1-k)</span>
            <span style="font-size: 12.5px; font-weight: 800; color: #7c3aed; font-family: 'JetBrains Mono', monospace;">${Math.max(0, curN - 1)} .. 0</span>
            <span style="font-size: 9.5px; color: #64748b;">高度 ≤ ${Math.max(0, curM - 1)}</span>
          </div>
        </div>

        <div style="font-size: 10.5px; color: #475569; text-align: center; line-height: 1.4;">
          ${step.memoHit ? '已命中备忘录缓存，跳过递归拆分直接返回结果！' : '若未命中，则枚举左子树规模 k 从 0 到 ' + Math.max(0, curN - 1) + ' 进行笛卡尔乘积累加。'}
        </div>
      </div>

      <!-- 决策详情条 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
      ">
        <div style="font-size: 11.5px; font-weight: 700; color: #0f172a;">${step.decision}</div>
        <div style="font-size: 11px; color: #64748b;">${step.message}</div>
      </div>
    </div>
  `;
}

export const TreeCountHeightMVisualizer = Visualizer;

registerAlgorithm({
  id: 'tree-count-height-m',
  name: '节点数n高度不大于m的二叉树结构数',
  viewId: 'algo-tree-count-height-m-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code05：节点数为n高度不大于m的二叉树结构种类数，左右子树独立形态笛卡尔乘积累加',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 105,
  learningGoal: '掌握树形规模拆分思想、左右子树笛卡尔乘积计数模型以及二维列滚动空间压缩',
});
