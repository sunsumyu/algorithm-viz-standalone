import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalTreeNode } from '../universal-stage-engine';

/**
 * 递归克隆树结构 (纯函数，防止状态共享污染)
 */
export function cloneTree(node: UniversalTreeNode | null): UniversalTreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    r: node.r,
    c: node.c,
    val: node.val,
    edgeLabel: node.edgeLabel,
    status: node.status,
    tag: node.tag,
    children: node.children ? node.children.map(cloneTree as any) : []
  };
}

/**
 * 构建阶段 3 二维 DP 状态转移依赖树
 */
export function build2DDPDependencyTree(
  mVal: number,
  nVal: number,
  direction: 'forward' | 'reverse' = 'forward',
  obstacleGrid?: number[][],
  currentGrid?: (number | null)[][],
  currentI?: number,
  currentJ?: number
): UniversalTreeNode {
  let nodeIdCounter = 0;
  const isForward = direction === 'forward';
  const startR = isForward ? mVal - 1 : 0;
  const startC = isForward ? nVal - 1 : 0;
  const MAX_TREE_DEPTH = 4;
  const MAX_NODES = 40;

  function buildNode(r: number, c: number, depth: number = 0): UniversalTreeNode {
    const id = `dp-node-${r}-${c}-${++nodeIdCounter}`;
    const isCurrent = currentI === r && currentJ === c;
    const isObstacle = obstacleGrid?.[r]?.[c] === 1;
    const val = currentGrid?.[r]?.[c] ?? null;

    let status: 'normal' | 'current' | 'base' | 'pruned' | 'visited' = 'normal';
    let tag: string | undefined = undefined;

    if (isObstacle) {
      status = 'pruned';
      tag = '🚧障碍=0';
    } else if (isForward ? (r === 0 && c === 0) : (r === mVal - 1 && c === nVal - 1)) {
      status = val !== null ? 'base' : (isCurrent ? 'current' : 'normal');
      tag = val !== null ? `= ${val}` : '= 1';
    } else if (val !== null) {
      status = 'visited';
      tag = `= ${val}`;
    }

    if (isCurrent) {
      status = 'current';
      if (isObstacle) {
        tag = '🚧=0';
      } else if (val !== null) {
        tag = `= ${val}`;
      } else {
        tag = '当前计算';
      }
    }

    const node: UniversalTreeNode = {
      id,
      r,
      c,
      val: `dp[${r}][${c}]`,
      status,
      tag,
      children: []
    };

    // 遇障碍物、Base 起点或超出深度/节点上限停止向下展开
    if (
      isObstacle ||
      (isForward ? (r === 0 && c === 0) : (r === mVal - 1 && c === nVal - 1)) ||
      depth >= MAX_TREE_DEPTH ||
      nodeIdCounter >= MAX_NODES
    ) {
      return node;
    }

    // 顺推：依赖上方 (r - 1, c) 与左方 (r, c - 1)
    if (isForward) {
      if (r > 0) {
        node.children.push(buildNode(r - 1, c, depth + 1));
      }
      if (c > 0 && nodeIdCounter < MAX_NODES) {
        node.children.push(buildNode(r, c - 1, depth + 1));
      }
    } else {
      // 逆推：依赖下方 (r + 1, c) 与右方 (r, c + 1)
      if (r + 1 < mVal) {
        node.children.push(buildNode(r + 1, c, depth + 1));
      }
      if (c + 1 < nVal && nodeIdCounter < MAX_NODES) {
        node.children.push(buildNode(r, c + 1, depth + 1));
      }
    }

    return node;
  }

  return buildNode(startR, startC, 0);
}

/**
 * 构建背包 DP 状态依赖树 (Knapsack DP Dependency Tree)
 */
export function buildKnapsackDPDependencyTree(
  items: Array<{ weight: number; value: number }>,
  capacity: number,
  currentGrid?: (number | null)[][],
  currentI?: number,
  currentJ?: number
): UniversalTreeNode {
  let nodeIdCounter = 0;
  const n = items.length;
  const targetI = currentI !== undefined && currentI >= 0 ? currentI : n - 1;
  const targetJ = currentJ !== undefined && currentJ >= 0 ? currentJ : capacity;
  const MAX_TREE_DEPTH = 4;
  const MAX_NODES = 40;

  function buildNode(i: number, j: number, depth: number = 0, labelPrefix?: string): UniversalTreeNode {
    const id = `knap-dp-node-${i}-${j}-${++nodeIdCounter}`;
    const isCurrent = currentI === i && currentJ === j;
    const val = currentGrid?.[i]?.[j] ?? null;

    let status: 'normal' | 'current' | 'base' | 'pruned' | 'visited' = 'normal';
    let tag: string | undefined = undefined;

    if (i === 0) {
      status = val !== null ? 'base' : (isCurrent ? 'current' : 'normal');
      tag = val !== null ? `= ${val}` : '初始行';
    } else if (val !== null) {
      status = 'visited';
      tag = `= ${val}`;
    }

    if (isCurrent) {
      status = 'current';
      tag = val !== null ? `= ${val}` : '当前计算';
    }

    const nodeName = labelPrefix ? `${labelPrefix} dp[${i}][${j}]` : `dp[${i}][${j}]`;

    const node: UniversalTreeNode = {
      id,
      r: i,
      c: j,
      val: nodeName,
      status,
      tag,
      children: []
    };

    if (i <= 0 || depth >= MAX_TREE_DEPTH || nodeIdCounter >= MAX_NODES) {
      return node;
    }

    const wi = items[i]?.weight ?? 0;
    // 1. 不放物品 i 分支：依赖 dp[i - 1][j]
    node.children.push(buildNode(i - 1, j, depth + 1, '不放'));

    // 2. 放物品 i 分支：依赖 dp[i - 1][j - wi] (当 j >= wi)
    if (j >= wi && nodeIdCounter < MAX_NODES) {
      node.children.push(buildNode(i - 1, j - wi, depth + 1, `放(+${items[i]?.value ?? 0})`));
    }

    return node;
  }

  return buildNode(targetI, targetJ, 0);
}

/**
 * 构建一维 DP 状态依赖树 (1D DP Dependency Tree)
 */
export function build1DDPDependencyTree(
  n: number,
  modelId: string,
  dpArray?: (number | null)[],
  currentIdx?: number,
  customData?: any
): UniversalTreeNode {
  let nodeIdCounter = 0;
  const targetK = currentIdx !== undefined && currentIdx >= 0 ? currentIdx : n;
  const MAX_TREE_DEPTH = 4;
  const MAX_NODES = 40;

  function buildNode(k: number, depth: number = 0, labelPrefix?: string): UniversalTreeNode {
    const id = `linear-dp-node-${k}-${++nodeIdCounter}`;
    const isCurrent = currentIdx === k;
    const val = dpArray?.[k] ?? null;

    let status: 'normal' | 'current' | 'base' | 'pruned' | 'visited' = 'normal';
    let tag: string | undefined = undefined;

    if (k <= 1) {
      status = val !== null ? 'base' : (isCurrent ? 'current' : 'normal');
      tag = val !== null ? `= ${val}` : 'Base';
    } else if (val !== null) {
      status = 'visited';
      tag = `= ${val}`;
    }

    if (isCurrent) {
      status = 'current';
      tag = val !== null ? `= ${val}` : '当前计算';
    }

    const nodeName = labelPrefix ? `${labelPrefix} dp[${k}]` : `dp[${k}]`;

    const node: UniversalTreeNode = {
      id,
      r: 0,
      c: k,
      val: nodeName,
      status,
      tag,
      children: []
    };

    if (k <= 1 || depth >= MAX_TREE_DEPTH || nodeIdCounter >= MAX_NODES) {
      return node;
    }

    if (modelId === 'tribonacci') {
      if (k >= 1) node.children.push(buildNode(k - 1, depth + 1, '-1步'));
      if (k >= 2 && nodeIdCounter < MAX_NODES) node.children.push(buildNode(k - 2, depth + 1, '-2步'));
      if (k >= 3 && nodeIdCounter < MAX_NODES) node.children.push(buildNode(k - 3, depth + 1, '-3步'));
    } else if (modelId.startsWith('house-robber')) {
      if (k >= 1) node.children.push(buildNode(k - 1, depth + 1, '不偷'));
      if (k >= 2 && nodeIdCounter < MAX_NODES) node.children.push(buildNode(k - 2, depth + 1, '偷(+val)'));
    } else {
      // 默认双分支 (Fibonacci, ClimbStairs, MinCost, etc.)
      if (k >= 1) node.children.push(buildNode(k - 1, depth + 1, '-1步'));
      if (k >= 2 && nodeIdCounter < MAX_NODES) node.children.push(buildNode(k - 2, depth + 1, '-2步'));
    }

    return node;
  }

  return buildNode(targetK, 0);
}

/**
 * 按坐标在树中查找对应节点 ID
 */
export function findNodeIdByCoord(root: any, r?: number, c?: number): string | undefined {
  if (!root || r === undefined || c === undefined || r < 0 || c < 0) return undefined;
  if (root.r === r && root.c === c) {
    return root.id;
  }
  if (root.val && (root.val === `dp[${r}][${c}]` || root.val.includes(`dfs(${r},${c})`) || root.val.includes(`dfs(${r}, ${c})`))) {
    return root.id;
  }
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeIdByCoord(child, r, c);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * 动态生成契合当前 (m, n) 尺寸的障碍物网格矩阵
 */
export function getDynamicObstacleGrid(
  model: IYamlAlgorithmModel,
  mVal: number,
  nVal: number
): number[][] | undefined {
  if (model.id !== 'unique-paths-ii' && !(model.defaultParams as any)?.obstacleGrid) {
    return undefined;
  }
  const defaultGrid = (model.defaultParams as any)?.obstacleGrid as number[][] | undefined;
  if (defaultGrid && defaultGrid.length === mVal && defaultGrid[0]?.length === nVal) {
    return JSON.parse(JSON.stringify(defaultGrid));
  }
  return Array.from({ length: mVal }, (_, r) =>
    Array.from({ length: nVal }, (_, c) => {
      if (defaultGrid && defaultGrid[r]?.[c] !== undefined) {
        return defaultGrid[r][c];
      }
      return (r === 1 && c === 1 && mVal > 1 && nVal > 1) ? 1 : 0;
    })
  );
}

/**
 * 动态生成契合当前 (m, n) 尺寸的权值网格矩阵 (用于最小路径和等网格权值题型)
 */
export function getDynamicWeightsGrid(
  model: IYamlAlgorithmModel,
  mVal: number,
  nVal: number
): number[][] | undefined {
  if (model.id !== 'min-path-sum' && !(model.defaultParams as any)?.grid) {
    return undefined;
  }
  const defaultGrid = (model.defaultParams as any)?.grid as number[][] | undefined;
  if (defaultGrid && defaultGrid.length === mVal && defaultGrid[0]?.length === nVal) {
    return JSON.parse(JSON.stringify(defaultGrid));
  }
  const fallbackTemplate = [
    [1, 3, 1, 2, 1, 4, 2, 3],
    [1, 5, 1, 3, 2, 1, 5, 2],
    [4, 2, 1, 1, 4, 3, 1, 2],
    [2, 1, 3, 2, 1, 5, 2, 1],
    [3, 4, 1, 2, 3, 1, 4, 2],
    [1, 2, 5, 1, 2, 4, 1, 3],
    [2, 3, 1, 4, 1, 2, 3, 1],
    [1, 4, 2, 1, 3, 2, 1, 5]
  ];
  return Array.from({ length: mVal }, (_, r) =>
    Array.from({ length: nVal }, (_, c) => {
      if (defaultGrid && defaultGrid[r]?.[c] !== undefined) {
        return defaultGrid[r][c];
      }
      return fallbackTemplate[r % fallbackTemplate.length][c % fallbackTemplate[0].length];
    })
  );
}
