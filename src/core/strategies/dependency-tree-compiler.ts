/**
 * StateDependencyTreeCompiler (状态依赖树编译深模块)
 *
 * 顶层强制约束（全库唯一实现，算法渲染器禁止自写展开策略）：
 * 1. 最优依赖链（胜者链，isWinner 标记的边）不受深度预算限制，无条件追溯到边界基底；
 *    胜者链长度 ≤ 状态维度之和（如 n+m），线性有界，无指数爆炸风险。
 * 2. 落选分支按 maxExpandDepth 预算截断——DAG 展开成树会复制共享子问题，
 *    全量无界展开在退化输入下节点数呈指数膨胀。
 * 3. 全局节点上限 maxNodes 作为最终保险丝。
 *
 * 领域规则以纯数据注入（StateDependencyRule），引擎不感知任何具体算法语义。
 * 计数类 DP（无单一胜者）可标记一条脊柱边（spine）isWinner 保证根到基底路径闭合。
 */
import type { UniversalTreeNode } from '../universal-stage-engine';

export type StateDepNode = UniversalTreeNode;

/** 依赖边：从前驱状态指向其依赖的子状态 */
export interface StateDepEdge<S> {
  state: S;
  edgeLabel: string;
  /** 胜者边：不受深度预算限制，沿其展开的链无条件追溯到基底 */
  isWinner?: boolean;
  /** 覆盖子节点展示元数据（不填则回退 rule.label） */
  val?: string;
  tag?: string;
  status?: string;
}

/** 领域依赖规则：纯函数集合，描述「状态如何依赖子状态」 */
export interface StateDependencyRule<S> {
  /** 状态唯一键（用于节点路径 id 拼接） */
  key(state: S): string;
  /** 状态在树节点上的坐标（供 findNodeIdByCoord 命中） */
  coord(state: S): { r: number; c: number };
  /** 常规节点展示文案（from 为引入该状态的边，可空） */
  label(state: S, from?: StateDepEdge<S>): { val: string; tag?: string; status?: string };
  /** 边界基底：展开到此终止 */
  isBase(state: S): boolean;
  /** 基底节点文案（默认回退 label；status 缺省为 base） */
  baseLabel?(state: S, from?: StateDepEdge<S>): { val: string; tag?: string; status?: string };
/** 前驱依赖边集合；childDepth 为子节点深度（根为 0，根的子为 1），
   * 规则可据此区分「根邻接层」与「更深层」的边文案。
   */
  dependencies(state: S, childDepth: number): StateDepEdge<S>[];
}

/**
 * 声明式状态码阶梯配置 (Declarative Status Ladder)
 *
 * 替代各 adapter 闭包中重复的 `normal → current → visited → pruned → base`
 * 状态推断逻辑。引擎在缺省 config 时回退到 rule.label 提供的原有行为
 *（向后兼容），仅当 statusConfig 提供时接管状态推断。
 *
 * 三类查询都接受 `(state, ctx)` 形参，其中 ctx 由调用处传入的
 * currentGrid / currentI / currentJ 等运行时上下文填充。
 */
export interface StatusLadderConfig<S> {
  /** 状态唯一键（用于节点 id 拼接） */
  val: (s: S, ctx?: unknown) => number | null;
  /** 是否为「当前计算」高亮节点 */
  isCurrent?: (s: S, ctx?: unknown) => boolean;
  /** 是否为障碍/剪枝点（仅 2D 网格） */
  isObstacle?: (s: S, ctx?: unknown) => boolean;
  /** 是否为已计算过的节点（用于 visited 标记） */
  hasBeenComputed?: (s: S, ctx?: unknown) => boolean;
  /** 基底/当前节点的缺省 tag 文本 */
  tags: {
    visited: (val: number) => string;
    current: (val: number | null) => string;
    base: (val: number | null) => string;
  };
  /** 前缀显示：edgeLabel 传入时前缀，否则空 */
  prefix?: (from?: unknown) => string;
}

/** 静态线性 DP 依赖边定义表 — 替代 modelId 运行时 if/else 分发 */
export const LINEAR_DEP_RULES: Record<string, ReadonlyArray<LinearDepEdge>> = {
  tribonacci: [
    { delta: -1, edgeLabel: '-1步', isWinner: true },
    { delta: -2, edgeLabel: '-2步' },
    { delta: -3, edgeLabel: '-3步' },
  ],
  'house-robber': [
    { delta: -1, edgeLabel: '不偷', isWinner: true },
    { delta: -2, edgeLabel: '偷(+val)' },
  ],
  'house-robber-ii': [
    { delta: -1, edgeLabel: '不偲', isWinner: true },
    { delta: -2, edgeLabel: '偷(+val)' },
  ],
  'house-robber-iii': [
    { delta: -1, edgeLabel: '不偲', isWinner: true },
    { delta: -2, edgeLabel: '偷(+val)' },
  ],
};
/** 默认双分支 (Fibonacci, ClimbStairs, MinCost, etc.) */
export const DEFAULT_LINEAR_DEP = [
  { delta: -1, edgeLabel: '-1步', isWinner: true },
  { delta: -2, edgeLabel: '-2步' },
] as const;

export interface LinearDepEdge {
  /** k 递减量 (负数) */
  delta: number;
  edgeLabel: string;
  isWinner?: boolean;
}

export interface StateDepCompileOptions {
  /** 根节点 id（默认 rule.key(rootState)） */
  rootId?: string;
  /** 根节点展示元数据（默认走 rule.label(rootState)） */
  rootVal?: string;
  rootTag?: string;
  rootStatus?: string;
  /** 落选分支深度预算（默认 2） */
  maxExpandDepth?: number;
  /** 全局节点上限（默认 400） */
  maxNodes?: number;
  /** 胜者链安全上限（默认 256，防御规则非良基的退化输入） */
  maxChainLength?: number;
}

const DEFAULT_MAX_EXPAND_DEPTH = 2;
const DEFAULT_MAX_NODES = 400;
const DEFAULT_MAX_CHAIN_LENGTH = 256;

/**
 * 编译状态依赖拓扑展开树：从 rootState 出发按领域规则展开 DAG 的树状投影视图。
 * 纯函数、零 DOM 依赖；返回结构兼容 RecursionTreeAdapter 与 findNodeIdByCoord。
 */
export function compileStateDependencyTree<S>(
  rootState: S,
  rule: StateDependencyRule<S>,
  options: StateDepCompileOptions = {}
): StateDepNode {
  const maxExpandDepth = options.maxExpandDepth ?? DEFAULT_MAX_EXPAND_DEPTH;
  const maxNodes = options.maxNodes ?? DEFAULT_MAX_NODES;
  const maxChainLength = options.maxChainLength ?? DEFAULT_MAX_CHAIN_LENGTH;

  let nodeCount = 0;

  function expand(
    state: S,
    edge: StateDepEdge<S> | undefined,
    depth: number,
    pathId: string,
    onOptimalChain: boolean
  ): StateDepNode {
    nodeCount++;
    const coord = rule.coord(state);
    const id = depth === 0 ? (options.rootId ?? rule.key(state)) : `${pathId}/${rule.key(state)}`;

    if (rule.isBase(state)) {
      const base = rule.baseLabel?.(state, edge) ?? rule.label(state, edge);
      return {
        id,
        r: coord.r,
        c: coord.c,
        val: base.val,
        edgeLabel: edge?.edgeLabel,
        status: (base.status ?? 'base') as StateDepNode['status'],
        tag: base.tag,
        children: [],
      };
    }

    const lbl = rule.label(state, edge);
    const node: StateDepNode = {
      id,
      r: coord.r,
      c: coord.c,
      val: depth === 0 ? (options.rootVal ?? edge?.val ?? lbl.val) : (edge?.val ?? lbl.val),
      edgeLabel: edge?.edgeLabel,
      status: (depth === 0
        ? (options.rootStatus ?? edge?.status ?? lbl.status ?? 'current')
        : (edge?.status ?? lbl.status ?? 'normal')) as StateDepNode['status'],
      tag: depth === 0 ? (options.rootTag ?? edge?.tag ?? lbl.tag) : (edge?.tag ?? lbl.tag),
      children: [],
    };

    // 胜者链不受深度预算限制；落选分支按 maxExpandDepth 截断
    const expandable =
      (onOptimalChain && depth < maxChainLength) || depth < maxExpandDepth;
    if (!expandable || nodeCount >= maxNodes) {
      return node;
    }

    for (const dep of rule.dependencies(state, depth + 1)) {
      if (nodeCount >= maxNodes) break;
      node.children.push(
        expand(
          dep.state,
          dep,
          depth + 1,
          id,
          onOptimalChain && dep.isWinner === true
        )
      );
    }
    return node;
  }

  return expand(rootState, undefined, 0, options.rootId ?? rule.key(rootState), true);
}
