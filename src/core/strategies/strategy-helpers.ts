import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalTreeNode } from '../universal-stage-engine';
import { compileStateDependencyTree, type StateDependencyRule, type StateDepEdge, LINEAR_DEP_RULES, DEFAULT_LINEAR_DEP } from './dependency-tree-compiler';
import { cloneStateDepTree } from './tree-clone';

/**
 * 递归克隆树结构 (纯函数，防止状态共享污染)
 *
 * 委托通用泛型 cloneStateDepTree — 覆盖 UniversalTreeNode / DpTreeNode /
 * RecTreeNode / LcsTreeNode / TreeNode 等所有树形态。
 */
export { cloneStateDepTree };
/** @deprecated 保留别名以兼容历史调用方，下个大版本删除 */
export const cloneTree = cloneStateDepTree;
/**
 * 构建阶段 3 二维 DP 状态转移依赖树
 * 委托 StateDependencyTreeCompiler：脊柱边（首个依赖）胜者链保证根到基底闭合；
 * 其余分支按预算截断。计数类 DP 无单一最优前驱，脊柱即代表性依赖路径。
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
  const isForward = direction === 'forward';
  const startR = isForward ? mVal - 1 : 0;
  const startC = isForward ? nVal - 1 : 0;
  const isBoundary = (r: number, c: number) =>
    isForward ? r === 0 && c === 0 : r === mVal - 1 && c === nVal - 1;

  const rule: StateDependencyRule<{ r: number; c: number }> = {
    key: (s) => `dp-node-${s.r}-${s.c}`,
    coord: (s) => ({ r: s.r, c: s.c }),
    label: (s) => {
      const isObstacle = obstacleGrid?.[s.r]?.[s.c] === 1;
      const val = currentGrid?.[s.r]?.[s.c] ?? null;
      let status: 'normal' | 'current' | 'base' | 'pruned' | 'visited' = 'normal';
      let tag: string | undefined = undefined;
      if (isObstacle) {
        status = 'pruned';
        tag = '🚧障碍=0';
      } else if (val !== null) {
        status = 'visited';
        tag = `= ${val}`;
      }
      if (currentI === s.r && currentJ === s.c) {
        status = 'current';
        if (isObstacle) {
          tag = '🚧=0';
        } else if (val !== null) {
          tag = `= ${val}`;
        } else {
          tag = '当前计算';
        }
      }
      return { val: `dp[${s.r}][${s.c}]`, status, tag };
    },
    isBase: (s) => isBoundary(s.r, s.c),
    baseLabel: (s) => {
      const isObstacle = obstacleGrid?.[s.r]?.[s.c] === 1;
      const val = currentGrid?.[s.r]?.[s.c] ?? null;
      if (isObstacle) {
        return { val: `dp[${s.r}][${s.c}]`, tag: currentI === s.r && currentJ === s.c ? '🚧=0' : '🚧障碍=0', status: 'pruned' };
      }
      if (currentI === s.r && currentJ === s.c) {
        return { val: `dp[${s.r}][${s.c}]`, tag: val !== null ? `= ${val}` : '当前计算', status: 'current' };
      }
      return { val: `dp[${s.r}][${s.c}]`, tag: val !== null ? `= ${val}` : '= 1', status: val !== null ? 'base' : 'normal' };
    },
    dependencies: (s) => {
      if (obstacleGrid?.[s.r]?.[s.c] === 1) return [];
      const deps: StateDepEdge<{ r: number; c: number }>[] = [];
      if (isForward) {
        if (s.r > 0) deps.push({ state: { r: s.r - 1, c: s.c }, edgeLabel: '⬆️上方' });
        if (s.c > 0) deps.push({ state: { r: s.r, c: s.c - 1 }, edgeLabel: '⬅️左方' });
      } else {
        if (s.r + 1 < mVal) deps.push({ state: { r: s.r + 1, c: s.c }, edgeLabel: '⬇️下方' });
        if (s.c + 1 < nVal) deps.push({ state: { r: s.r, c: s.c + 1 }, edgeLabel: '➡️右方' });
      }
      if (deps.length > 0) deps[0].isWinner = true;
      return deps;
    }
  };

  return compileStateDependencyTree({ r: startR, c: startC }, rule, { maxExpandDepth: 4, maxNodes: 40 });
}

/**
 * 构建背包 DP 状态依赖树 (Knapsack DP Dependency Tree)
 * 「不放」边为脊柱胜者链：i 递减直达初始行基底，保证链路闭合。
 */
export function buildKnapsackDPDependencyTree(
  items: Array<{ weight: number; value: number }>,
  capacity: number,
  currentGrid?: (number | null)[][],
  currentI?: number,
  currentJ?: number
): UniversalTreeNode {
  const n = items.length;
  const targetI = currentI !== undefined && currentI >= 0 ? currentI : n - 1;
  const targetJ = currentJ !== undefined && currentJ >= 0 ? currentJ : capacity;

  const rule: StateDependencyRule<{ i: number; j: number }> = {
    key: (s) => `knap-dp-node-${s.i}-${s.j}`,
    coord: (s) => ({ r: s.i, c: s.j }),
    label: (s, from) => {
      const val = currentGrid?.[s.i]?.[s.j] ?? null;
      let status: 'normal' | 'current' | 'base' | 'visited' = 'normal';
      let tag: string | undefined = undefined;
      if (s.i > 0 && val !== null) {
        status = 'visited';
        tag = `= ${val}`;
      }
      if (currentI === s.i && currentJ === s.j) {
        status = 'current';
        tag = val !== null ? `= ${val}` : '当前计算';
      }
      const prefix = from ? `${from.edgeLabel} ` : '';
      return { val: `${prefix}dp[${s.i}][${s.j}]`, status, tag };
    },
    isBase: (s) => s.i <= 0,
    baseLabel: (s, from) => {
      const val = currentGrid?.[s.i]?.[s.j] ?? null;
      const prefix = from ? `${from.edgeLabel} ` : '';
      if (currentI === s.i && currentJ === s.j) {
        return { val: `${prefix}dp[${s.i}][${s.j}]`, tag: val !== null ? `= ${val}` : '当前计算', status: 'current' };
      }
      return { val: `${prefix}dp[${s.i}][${s.j}]`, tag: val !== null ? `= ${val}` : '初始行', status: val !== null ? 'base' : 'normal' };
    },
    dependencies: (s) => {
      if (s.i <= 0) return [];
      const wi = items[s.i]?.weight ?? 0;
      const deps: StateDepEdge<{ i: number; j: number }>[] = [
        { state: { i: s.i - 1, j: s.j }, edgeLabel: '不放', isWinner: true }
      ];
      if (s.j >= wi) {
        deps.push({ state: { i: s.i - 1, j: s.j - wi }, edgeLabel: `放(+${items[s.i]?.value ?? 0})` });
      }
      return deps;
    }
  };

  return compileStateDependencyTree({ i: targetI, j: targetJ }, rule, { maxExpandDepth: 4, maxNodes: 40 });
}

/** 查找线性 DP 依赖边表 — 纯静态表查询，无运行时 modelId 字符串分发 */
function lookupLinearDepRules(modelId: string): ReadonlyArray<{ delta: number; edgeLabel: string; isWinner?: boolean }> {
  return LINEAR_DEP_RULES[modelId] ?? DEFAULT_LINEAR_DEP;
}

/**
 * 构建一维 DP 状态依赖树 (1D DP Dependency Tree)
 * 首个依赖边（k-1 步）为脊柱胜者链：k 递减直达 Base。
 */
export function build1DDPDependencyTree(
  n: number,
  modelId: string,
  dpArray?: (number | null)[],
  currentIdx?: number,
  customData?: any
): UniversalTreeNode {
  const targetK = currentIdx !== undefined && currentIdx >= 0 ? currentIdx : n;
  void customData;

  const rule: StateDependencyRule<{ k: number }> = {
    key: (s) => `linear-dp-node-${s.k}`,
    coord: (s) => ({ r: 0, c: s.k }),
    label: (s, from) => {
      const val = dpArray?.[s.k] ?? null;
      let status: 'normal' | 'current' | 'base' | 'visited' = 'normal';
      let tag: string | undefined = undefined;
      if (s.k > 1 && val !== null) {
        status = 'visited';
        tag = `= ${val}`;
      }
      if (currentIdx === s.k) {
        status = 'current';
        tag = val !== null ? `= ${val}` : '当前计算';
      }
      const prefix = from ? `${from.edgeLabel} ` : '';
      return { val: `${prefix}dp[${s.k}]`, status, tag };
    },
    isBase: (s) => s.k <= 1,
    baseLabel: (s, from) => {
      const val = dpArray?.[s.k] ?? null;
      const prefix = from ? `${from.edgeLabel} ` : '';
      if (currentIdx === s.k) {
        return { val: `${prefix}dp[${s.k}]`, tag: val !== null ? `= ${val}` : '当前计算', status: 'current' };
      }
      return { val: `${prefix}dp[${s.k}]`, tag: val !== null ? `= ${val}` : 'Base', status: val !== null ? 'base' : 'normal' };
    },
    dependencies: (s) => {
      // 静态查找表替代运行时 modelId if/else 分发；首个 deps[0] 标记 isWinner 作为脊柱
      const table = lookupLinearDepRules(modelId);
      return table
        .filter((e) => s.k + e.delta >= 1)
        .map((e, idx) => ({
          state: { k: s.k + e.delta },
          edgeLabel: e.edgeLabel,
          isWinner: idx === 0 ? true : e.isWinner,
        }));
    }
  };

  return compileStateDependencyTree({ k: targetK }, rule, { maxExpandDepth: 4, maxNodes: 40 });
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
