/**
 * 节点数 n 高度不大于 m 的二叉树结构数 (牛客网 / 左神 Class067 Code05)
 * Step Compiler: 树形规模拆解、左右子树独立形态笛卡尔乘积、双列滚动状态推演
 */

import {
  getDp067Anchor,
  type ResolvedLineTarget,
} from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-stage-codes';
import { type DpCellDep } from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-shared';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';
import { captureScope } from '../../strategies/scope-capture';
import { cloneStateDepTree as cloneTreeCountTree } from '../../strategies/tree-clone';

const MOD = 1000000007;

export function parseTreeCountInputs(inputs: Record<string, any>) {
  const n = Math.max(0, Math.min(10, parseInt(String(inputs?.['input-n'] ?? '5'), 10) || 5));
  const m = Math.max(0, Math.min(10, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3));
  return { n, m };
}

export interface TreeCountTreeNode {
  id: string;
  val: string;
  edgeLabel?: string;
  status?: 'current' | 'visited' | 'pruned' | 'base' | 'active';
  tag?: string;
  children: TreeCountTreeNode[];
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
  ways?: number;
  sum?: number;
  callStack: Array<{ label: string }>;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  metrics?: Record<string, any>;
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
  scope?: Record<string, any>;
}

export function buildTreeCountStage1Steps(inputs: Record<string, any>): TreeCountRecStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const steps: TreeCountRecStep[] = [];
  const stack: Array<{ label: string }> = [];

  const lines = {
    entry: getDp067Anchor(1, 'tree-count', 'entry'),
    enter: getDp067Anchor(1, 'tree-count', 'enter'),
    baseN0: getDp067Anchor(1, 'tree-count', 'baseN0'),
    baseM0: getDp067Anchor(1, 'tree-count', 'baseM0'),
    loopK: getDp067Anchor(1, 'tree-count', 'loopK'),
    returnSum: getDp067Anchor(1, 'tree-count', 'returnSum'),
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
    ways: 0,
    sum: 0,
    callStack: [],
    decision: `主函数入口：求解节点数 n=${n} 且高度上限 m=${m} 的二叉树结构种类数`,
    message: `以 1 个节点作为根节点，左右分配子树节点规模递推`,
    log: `enter f1(${n}, ${m})`,
    codeLine: lines.entry,
    metrics: { 'metric-params': `n=${n}, m=${m}`, 'metric-status': '函数入口' },
    treeRoot: cloneTreeCountTree(rootTree),
    activeNodeId: rootTree.id,
    scope: captureScope({ n, m, ways: 0, sum: 0 }),
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
      ways: 0,
      sum: 0,
      callStack: [...stack],
      decision: `探查规模: 节点数 n=${curN}，高度上限 m=${curM}`,
      message: `固定 1 个根节点，枚举左子树节点数 k 从 0 到 ${curN - 1}`,
      log: `f(${curN}, ${curM})`,
      codeLine: lines.enter,
      metrics: { 'metric-params': `n=${curN}, m=${curM}`, 'metric-status': '递归探查' },
      treeRoot: cloneTreeCountTree(rootTree),
      activeNodeId: currentNode.id,
      scope: captureScope({ n: curN, m: curM, ways: 0, sum: 0 }),
    });

    if (curN === 0) {
      currentNode.status = 'base';
      currentNode.tag = '1 (空树)';
      steps.push({
        currentCall: `f(${curN}, ${curM})`,
        n: curN,
        m: curM,
        ways: 1,
        sum: 1,
        callStack: [...stack],
        decision: `Base Case: 节点数 n=0，空树形态为 1 种且高度为 0 <= ${curM}`,
        message: '空树返回 1',
        log: `base n=0: 1`,
        codeLine: lines.baseN0,
        metrics: { 'metric-params': `n=0, m=${curM}`, 'metric-ans': '1' },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
        scope: captureScope({ n: curN, m: curM, ways: 1, sum: 1 }),
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
        ways: 0,
        sum: 0,
        callStack: [...stack],
        decision: `Base Case: 节点数 n=${curN} > 0 但高度上限 m=0，无法构建有效二叉树`,
        message: '高度不足，返回 0',
        log: `base m=0: 0`,
        codeLine: lines.baseM0,
        metrics: { 'metric-params': `n=${curN}, m=0`, 'metric-ans': '0' },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
        scope: captureScope({ n: curN, m: curM, ways: 0, sum: 0 }),
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
        ways,
        sum,
        callStack: [...stack],
        decision: `拆分左子树 ${k} 节点(方案 ${leftWays}) × 右子树 ${curN - 1 - k} 节点(方案 ${rightWays}) = +${ways}`,
        message: `左右子树高度上限均为 ${curM - 1}，乘积累加入当前总和`,
        log: `k=${k}: ${leftWays} * ${rightWays} = ${ways}`,
        codeLine: lines.loopK,
        metrics: { 'metric-params': `k=${k}`, 'metric-ans': `${sum}` },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
        scope: captureScope({ n: curN, m: curM, k, leftWays, rightWays, ways, sum }),
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
  k?: number;
  ways?: number;
  sum?: number;
  memoHit: boolean;
  hitCount: number;
  missCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  memoGrid: number[][];
  cachedVal?: number;
  metrics?: Record<string, any>;
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
  scope?: Record<string, any>;
}

export function buildTreeCountStage2Steps(inputs: Record<string, any>): TreeCountMemoStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const lines2 = {
    entry: getDp067Anchor(2, 'tree-count', 'entry'),
    checkMemo: getDp067Anchor(2, 'tree-count', 'checkMemo'),
    enumK: getDp067Anchor(2, 'tree-count', 'enumK'),
    calcSum: getDp067Anchor(2, 'tree-count', 'calcSum'),
    memoStore: getDp067Anchor(2, 'tree-count', 'memoStore'),
  };
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
    codeLine: lines2.entry,
    memoGrid: snapshotGrid2D(memo),
    metrics: { 'metric-status': '函数入口', 'metric-hits': '0' },
    treeRoot: cloneTreeCountTree(rootTree),
    activeNodeId: rootTree.id,
    scope: captureScope({ n, m, memo: snapshotGrid2D(memo), hitCount: 0, missCount: 0 }),
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
        codeLine: lines2.checkMemo,
        memoGrid: snapshotGrid2D(memo),
        metrics: { 'metric-status': '命中剪枝', 'metric-hits': `${hitCount}` },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
        scope: captureScope({ n: curN, m: curM, cachedVal: memo[curN][curM], memo: snapshotGrid2D(memo), hitCount }),
      });
      return memo[curN][curM];
    }

    missCount++;
    steps.push({
      currentCall: `fMemo(${curN}, ${curM})`,
      n: curN,
      m: curM,
      memoHit: false,
      hitCount,
      missCount,
      decision: `⚠️ 未命中备忘录: memo[${curN}][${curM}] 为空，开始枚举子树拆分`,
      message: `枚举左子树规模 k 从 0 到 ${curN - 1}`,
      log: `miss memo[${curN}][${curM}]`,
      codeLine: lines2.enumK,
      memoGrid: snapshotGrid2D(memo),
      metrics: { 'metric-status': '展开未命中', 'metric-hits': `${hitCount}` },
      treeRoot: cloneTreeCountTree(rootTree),
      activeNodeId: currentNode.id,
      scope: captureScope({ n: curN, m: curM, memo: snapshotGrid2D(memo), hitCount, missCount }),
    });

    let sum = 0;
    for (let k = 0; k < curN; k++) {
      const leftWays = fMemo(k, curM - 1, currentNode, `🌱左k=${k}`);
      const rightWays = fMemo(curN - 1 - k, curM - 1, currentNode, `🌿右=${curN - 1 - k}`);
      const ways = (leftWays * rightWays) % MOD;
      sum = (sum + ways) % MOD;

      currentNode.tag = `累加+${ways}`;
      steps.push({
        currentCall: `fMemo(${curN}, ${curM})`,
        n: curN,
        m: curM,
        k,
        ways,
        sum,
        memoHit: false,
        hitCount,
        missCount,
        decision: `子树乘积: 左(${leftWays}) × 右(${rightWays}) = +${ways}`,
        message: `枚举 k=${k}，当前累计形态数 = ${sum}`,
        log: `fMemo(${curN}, ${curM}) k=${k} -> ${ways}`,
        codeLine: lines2.calcSum,
        memoGrid: snapshotGrid2D(memo),
        metrics: { 'metric-status': '累加计算', 'metric-hits': `${hitCount}` },
        treeRoot: cloneTreeCountTree(rootTree),
        activeNodeId: currentNode.id,
        scope: captureScope({ n: curN, m: curM, k, leftWays, rightWays, ways, sum, memo: snapshotGrid2D(memo) }),
      });
    }

    memo[curN][curM] = sum;
    currentNode.status = 'visited';
    currentNode.tag = `存入=${sum}`;

    steps.push({
      currentCall: `fMemo(${curN}, ${curM})`,
      n: curN,
      m: curM,
      memoHit: false,
      hitCount,
      missCount,
      cachedVal: sum,
      decision: `💾 结果写入备忘录: memo[${curN}][${curM}] = ${sum}`,
      message: `子问题求解完毕，记录缓存供后续剪枝`,
      log: `save memo[${curN}][${curM}] = ${sum}`,
      codeLine: lines2.memoStore,
      memoGrid: snapshotGrid2D(memo),
      metrics: { 'metric-status': '缓存落盘', 'metric-hits': `${hitCount}`, 'metric-val': `${sum}` },
      treeRoot: cloneTreeCountTree(rootTree),
      activeNodeId: currentNode.id,
      scope: captureScope({ n: curN, m: curM, memo: snapshotGrid2D(memo), ways: sum, sum }),
    });

    return sum;
  }

  fMemo(n, m);
  rootTree.status = 'visited';
  return steps;
}

// ==========================================
// 3. Stage 3: 严格二维表
// ==========================================

export interface TreeCount2DStep {
  curI: number;
  curJ: number;
  n?: number;
  m?: number;
  k?: number;
  leftWays?: number;
  rightWays?: number;
  ways?: number;
  currentCell: string;
  currentVal: number;
  dpTable: number[][];
  depCells: DpCellDep[];
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  metrics?: Record<string, any>;
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
  scope?: Record<string, any>;
}

export function buildTreeCountStage3Steps(inputs: Record<string, any>): TreeCount2DStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const steps: TreeCount2DStep[] = [];
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let j = 0; j <= m; j++) {
    dp[0][j] = 1;
  }

  const lines3 = {
    initBase: getDp067Anchor(3, 'tree-count', 'initBase'),
    colLoop: getDp067Anchor(3, 'tree-count', 'colLoop'),
    calcCell: getDp067Anchor(3, 'tree-count', 'calcCell'),
    returnAns: getDp067Anchor(3, 'tree-count', 'returnAns'),
  };

  const baseTree = buildTreeCountDepTree('dp[0][0..m]', 0, 0, 1, []);

  steps.push({
    curI: 0,
    curJ: 0,
    n,
    m,
    currentCell: 'dp[0][0..m]',
    currentVal: 1,
    dpTable: snapshotGrid2D(dp),
    depCells: [],
    decision: '初始化第 0 行: 节点数 n=0 的空树形态数为 1',
    message: '对于任意高度限制，空树都是合法的一种形态',
    log: 'init dp[0][*] = 1',
    codeLine: lines3.initBase,
    metrics: { 'metric-status': '空树边界初始化' },
    treeRoot: baseTree,
    activeNodeId: baseTree.id,
    scope: captureScope({ n, m, i: 0, j: 0, dpTable: snapshotGrid2D(dp) }),
  });

  for (let j = 1; j <= m; j++) {
    const colTree = buildTreeCountDepTree(`开始第 ${j} 列 (高度上限 m=${j})`, 0, j, 1, []);

    steps.push({
      curI: 0,
      curJ: j,
      n,
      m,
      currentCell: `开始计算第 ${j} 列`,
      currentVal: 1,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `🔄 外层列循环推进: 当前树高度上限 m = ${j}`,
      message: `按列递推，本列所有状态只依赖左侧前一列 (高度 ${j - 1}) 的计算结果`,
      log: `start column j = ${j}`,
      codeLine: lines3.colLoop,
      metrics: { 'metric-status': `推进高度列 ${j}` },
      treeRoot: colTree,
      activeNodeId: colTree.id,
      scope: captureScope({ n, m, i: 0, j, dpTable: snapshotGrid2D(dp) }),
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
        n,
        m,
        currentCell: `dp[${i}][${j}]`,
        currentVal: dp[i][j],
        dpTable: snapshotGrid2D(dp),
        depCells: deps.slice(0, 4),
        decision: `计算 dp[${i}][${j}]: 累加前一列 j=${j - 1} 各拆分乘积和 = ${sum}`,
        message: `当前列 j 仅依赖左侧前一列 j-1 的全部状态，支持列滚动`,
        log: `dp[${i}][${j}] = ${sum}`,
        codeLine: lines3.calcCell,
        metrics: { 'metric-status': '列依赖求和', 'metric-val': `${sum}` },
        treeRoot: cellTree,
        activeNodeId: cellTree.id,
        scope: captureScope({ n, m, i, j, ways: sum, dpTable: snapshotGrid2D(dp) }),
      });
    }
  }

  const ans = dp[n][m];
  const finalParts: Array<{ k: number; leftWays: number; rightWays: number; ways: number }> = [];
  for (let k = 0; k < n; k++) {
    const left = dp[k][m - 1];
    const right = dp[n - 1 - k][m - 1];
    finalParts.push({ k, leftWays: left, rightWays: right, ways: (left * right) % MOD });
  }
  const finalTree = buildTreeCountDepTree(`dp[${n}][${m}]`, n, m, ans, finalParts);

  steps.push({
    curI: n,
    curJ: m,
    n,
    m,
    currentCell: `dp[${n}][${m}]`,
    currentVal: ans,
    dpTable: snapshotGrid2D(dp),
    depCells: [],
    decision: `🎉 严格二维表递推求解完成！最终二叉树形态数为 ${ans}`,
    message: `全局最优解已得出，所有规模与高度的形态数已全部计算`,
    log: `return dp[${n}][${m}] = ${ans}`,
    codeLine: lines3.returnAns,
    metrics: { 'metric-status': '求解完成', 'metric-val': `${ans}` },
    treeRoot: finalTree,
    activeNodeId: finalTree.id,
    scope: captureScope({ n, m, i: n, j: m, ans, dpTable: snapshotGrid2D(dp) }),
  });

  return steps;
}

// ==========================================
// 4. Stage 4: 空间压缩
// ==========================================

export interface TreeCountSpaceOptStep {
  curI: number;
  curJ: number;
  n?: number;
  m?: number;
  dp: number[];
  prev?: number[];
  currentCell: string;
  currentVal: number;
  depCells: DpCellDep[];
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  metrics?: Record<string, any>;
  treeRoot?: TreeCountTreeNode | null;
  activeNodeId?: string;
  scope?: Record<string, any>;
}

export function buildTreeCountStage4Steps(inputs: Record<string, any>): TreeCountSpaceOptStep[] {
  const { n, m } = parseTreeCountInputs(inputs);
  const steps: TreeCountSpaceOptStep[] = [];
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  prev[0] = 1;

  const lines4 = {
    initBase: getDp067Anchor(4, 'tree-count', 'initBase'),
    colLoop: getDp067Anchor(4, 'tree-count', 'colLoop'),
    calcCell: getDp067Anchor(4, 'tree-count', 'calcCell'),
    swapPrev: getDp067Anchor(4, 'tree-count', 'swapPrev'),
    returnAns: getDp067Anchor(4, 'tree-count', 'returnAns'),
  };

  const baseTree = buildTreeCountDepTree('prev[0]', 0, 0, 1, []);

  steps.push({
    curI: 0,
    curJ: 0,
    n,
    m,
    dp: [...prev],
    prev: [...prev],
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
    scope: captureScope({ n, m, dp: [...prev], prev: [...prev] }),
  });

  for (let j = 1; j <= m; j++) {
    curr = new Array(n + 1).fill(0);
    curr[0] = 1;

    const colTree = buildTreeCountDepTree(`curr[0..${n}] (m=${j})`, 0, j, 1, []);

    steps.push({
      curI: 0,
      curJ: j,
      n,
      m,
      dp: [...prev],
      prev: [...prev],
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
      scope: captureScope({ n, m, j, dp: [...prev], prev: [...prev] }),
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
        n,
        m,
        dp: [...curr],
        prev: [...prev],
        currentCell: `curr[${i}]`,
        currentVal: curr[i],
        depCells: deps.slice(0, 4),
        decision: `计算 curr[${i}]: 拆分累加上一列 prev 对应形态乘积 = ${sum}`,
        message: `curr[${i}] 仅从 prev 数组中读取，无需保留早期列的历史数据`,
        log: `curr[${i}] = ${sum}`,
        codeLine: lines4.calcCell,
        metrics: { 'metric-space': `2 × O(${n + 1})`, 'metric-val': `${sum}` },
        treeRoot: cellTree,
        activeNodeId: cellTree.id,
        scope: captureScope({ n, m, i, j, ways: sum, dp: [...curr], prev: [...prev] }),
      });
    }

    prev = [...curr];
    const swapParts: Array<{ k: number; leftWays: number; rightWays: number; ways: number }> = [];
    for (let k = 0; k < n; k++) {
      const left = prev[k];
      const right = prev[n - 1 - k];
      swapParts.push({ k, leftWays: left, rightWays: right, ways: (left * right) % MOD });
    }
    const swapTree = buildTreeCountDepTree(`滚动完成: prev = curr (高度≤${j})`, n, j, prev[n], swapParts);

    steps.push({
      curI: n,
      curJ: j,
      n,
      m,
      dp: [...prev],
      prev: [...prev],
      currentCell: `prev[${n}] = curr[${n}]`,
      currentVal: prev[n],
      depCells: [],
      decision: `完成第 ${j} 列计算，执行双列滚动指针置换: prev = curr`,
      message: `当高度上限拓展到 ${j} 时，节点数为 ${n} 的二叉树结构数为 ${prev[n]}`,
      log: `column ${j} done: dp[${n}] = ${prev[n]}`,
      codeLine: lines4.swapPrev,
      metrics: { 'metric-space': `2 × O(${n + 1})`, 'metric-val': `${prev[n]}` },
      treeRoot: swapTree,
      activeNodeId: swapTree.id,
      scope: captureScope({ n, m, j, dp: [...prev], prev: [...prev] }),
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
    n,
    m,
    dp: [...prev],
    prev: [...prev],
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
    scope: captureScope({ n, m, ans: prev[n], dp: [...prev], prev: [...prev] }),
  });

  return steps;
}
