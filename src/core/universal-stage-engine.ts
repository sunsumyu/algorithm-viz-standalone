/**
/**
 * 通用多阶段状态推导执行引擎 (UniversalStageEngine) - 门面模式 (Facade Pattern)
 * 遵循 LSP（里氏替换原则）、OCP（开闭原则）与六边形架构：
 * 统一作为对外公开接缝门面，将具体的算法单步生成逻辑全权委托给策略流水线注册表 (AlgorithmStrategyRegistry)
 */

import type { IYamlAlgorithmModel } from './interfaces';
import { ProblemDimensionResolver } from './resolvers/problem-dimension-resolver';
import {
  AlgorithmStrategyRegistry,
  cloneStateDepTree as helperCloneTree,
  build2DDPDependencyTree as helperBuild2DDPDependencyTree,
  findNodeIdByCoord as helperFindNodeIdByCoord,
  getDynamicObstacleGrid as helperGetDynamicObstacleGrid,
  getDynamicWeightsGrid as helperGetDynamicWeightsGrid
} from './strategies';

export interface UniversalTreeNode {
  id: string;
  r: number;
  c: number;
  val: string;
  edgeLabel?: string;
  status: 'normal' | 'current' | 'base' | 'pruned' | 'visited' | 'active' | string;
  tag?: string;
  children: UniversalTreeNode[];
}

export interface ActorPhysicsState {
  currentSlot: number;
  jumpFrom?: number;
  action?: 'idle' | 'walk' | 'jump' | 'compare';
}

export interface UniversalStep {
  type?: string;
  flowPhase?: 'forward' | 'backtrack' | 'terminal';
  actorState?: ActorPhysicsState;
  fromSlot?: number;
  i?: number;
  j?: number;
  grid?: (number | null)[][];
  activeStack?: string[];
  activeTrail?: string[];
  callStack?: Array<{ l?: number; r?: number; i?: number; j?: number; [key: string]: any } | string>;
  visited?: string[];
  line?: number;
  tag?: string;
  log?: string;
  msg?: string;
  topI?: number;
  topJ?: number;
  leftI?: number;
  leftJ?: number;
  diagI?: number;
  diagJ?: number;
  deps?: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }>;
  activeNodeId?: string;
  treeRoot?: UniversalTreeNode | null;
  // 阶段 3 & 4 空间压缩与转移计算专用元数据
  memo?: (number | null)[] | Record<string | number, any>;
  memoUpdatedIndex?: number;
  memoRefLeftIndex?: number;
  topVal?: number;
  leftVal?: number;
  sumVal?: number;
  obstacleGrid?: number[][];
  weightsGrid?: number[][];
  activeSlot?: number;
  slotMode?: 'down' | 'right' | 'updated' | 'final';
  memoSnapshot?: (number | null)[];
  dp1d?: (number | null)[];
  highlightSlots?: number[];
  srcSlots?: number[];
  currentI?: number;
  currentJ?: number;
  memoj?: number | string;
  down?: number | string;
  right?: number | string;
  gridHighlight?: { i: number; j: number };
  fromTopCell?: { i: number; j: number } | null;
  fromLeftCell?: { i: number; j: number } | null;
  action?: string;
  // 越界拦截与物理反弹属性
  fromI?: number;
  fromJ?: number;
  outOfBoundsDir?: 'river' | 'right-wall' | 'top-wall' | 'left-wall' | string;
  isOutOfBounds?: boolean;
  isBlockedStep?: boolean;
  // 行内局部表达式发光聚焦 (Inline Sub-Expression Highlighting)
  highlightText?: string;
  // 多维状态数组监视器 (Multi-Array State Inspector)
  stateArrays?: StateArrayItem[];
  stepId?: number;
  [key: string]: any;
}

export interface StateArrayItem {
  id: string;
  name: string;
  label?: string;
  indices: (number | string)[];
  values: (number | string | null)[];
  activeIdx?: number;
  highlightIndices?: number[];
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'sky';
}

export class UniversalStageEngine {
  public static cloneTree(node: UniversalTreeNode | null): UniversalTreeNode | null {
    return helperCloneTree(node);
  }

  public static getDynamicObstacleGrid(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number
  ): number[][] | undefined {
    return helperGetDynamicObstacleGrid(model, mVal, nVal);
  }

  public static getDynamicWeightsGrid(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number
  ): number[][] | undefined {
    return helperGetDynamicWeightsGrid(model, mVal, nVal);
  }

  public static build2DDPDependencyTree(
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    obstacleGrid?: number[][],
    currentGrid?: (number | null)[][],
    currentI?: number,
    currentJ?: number
  ): UniversalTreeNode {
    return helperBuild2DDPDependencyTree(mVal, nVal, direction, obstacleGrid, currentGrid, currentI, currentJ);
  }

  public static findNodeIdByCoord(root: any, r?: number, c?: number): string | undefined {
    return helperFindNodeIdByCoord(root, r, c);
  }

  /**
   * 统一生成多阶段演化步骤主入口
   */
  public static generateSteps(
    model: IYamlAlgorithmModel,
    params: {
      stage: number;
      m?: number;
      n?: number;
      direction?: 'forward' | 'reverse';
      isMemo?: boolean;
      stageVariant?: string;
      anchorMap?: Record<string, number>;
    }
  ): UniversalStep[] {
    const steps = AlgorithmStrategyRegistry.tryGenerate(model, {
      stage: params.stage,
      m: params.m ?? 3,
      n: params.n ?? 3,
      direction: params.direction ?? 'forward',
      isMemo: Boolean(params.isMemo),
      stageVariant: params.stageVariant ?? 'terminal',
      anchorMap: params.anchorMap
    });
    if (steps) {
      return this.normalizeStepInvariants(steps, model, params);
    }

    throw new Error(`[UniversalStageEngine] 算法 "${model?.id || 'unknown'}" (阶段 ${params.stage}) 暂无匹配的推导计算策略！禁止静默回退至其他算法。`);
  }

  /**
   * 顶层步骤不变式物理归一化管道 (Step Invariants Normalization Pipeline)
   * 确保全库所有算法生成的步骤，满足顶层物理视口与小人运动学的不变式契约
   */
  public static normalizeStepInvariants(
    steps: UniversalStep[],
    model: IYamlAlgorithmModel,
    params: { stage: number; m?: number; n?: number; direction?: 'forward' | 'reverse' }
  ): UniversalStep[] {
    if (!steps || steps.length === 0) return steps;

    const is1D = ProblemDimensionResolver.isPure1DProblem(model?.id || '', { m: params.m, n: params.n });

    // 提取全域数据输入（items, arr, nums, grid, matrix, s, str, piles, weights, values, costs, times, edges）
    const modelDefaults = (model?.defaultParams as Record<string, any>) || {};
    const inputParams = (params as Record<string, any>) || {};
    const metaDemo = (model as any)?.metadata?.demoData || (model as any)?.demoData || {};

    const rawInputs: Record<string, any> = {
      ...metaDemo,
      ...modelDefaults,
      ...inputParams,
    };

    let cumulativeScope: Record<string, any> = {
      ...(params.m !== undefined ? { m: params.m } : (rawInputs.m !== undefined ? { m: rawInputs.m } : {})),
      ...(params.n !== undefined ? { n: params.n } : (rawInputs.n !== undefined ? { n: rawInputs.n } : {})),
    };

    // 数组与核心数据集提取与语义别名同步
    const rawItems = rawInputs.items ?? rawInputs.arr ?? rawInputs.nums ?? rawInputs.data;
    if (rawItems !== undefined) {
      cumulativeScope.items = rawItems;
      cumulativeScope.arr = rawItems;
      cumulativeScope.nums = rawItems;
      if (Array.isArray(rawItems) && cumulativeScope.n === undefined) {
        cumulativeScope.n = rawItems.length;
      }
    }

    const rawGrid = rawInputs.grid ?? rawInputs.matrix ?? rawInputs.board;
    if (rawGrid !== undefined) {
      cumulativeScope.grid = rawGrid;
      cumulativeScope.matrix = rawGrid;
      cumulativeScope.board = rawGrid;
    }

    const rawStr = rawInputs.s ?? rawInputs.str ?? rawInputs.s1 ?? rawInputs.text1;
    if (rawStr !== undefined) {
      cumulativeScope.s = rawStr;
      cumulativeScope.str = rawStr;
    }

    if (rawInputs.capacity !== undefined) {
      cumulativeScope.capacity = rawInputs.capacity;
      if (cumulativeScope.m === undefined) cumulativeScope.m = rawInputs.capacity;
    }
    if (rawInputs.m !== undefined && cumulativeScope.capacity === undefined) {
      cumulativeScope.capacity = rawInputs.m;
    }
    if (rawInputs.k !== undefined) cumulativeScope.k = rawInputs.k;
    if (rawInputs.piles !== undefined) cumulativeScope.piles = rawInputs.piles;
    if (rawInputs.stones !== undefined) cumulativeScope.stones = rawInputs.stones;
    if (rawInputs.values !== undefined) cumulativeScope.values = rawInputs.values;
    if (rawInputs.target !== undefined) cumulativeScope.target = rawInputs.target;
    if (rawInputs.times !== undefined) cumulativeScope.times = rawInputs.times;
    if (rawInputs.edges !== undefined) cumulativeScope.edges = rawInputs.edges;
    if (rawInputs.hats !== undefined) cumulativeScope.hats = rawInputs.hats;
    if (rawInputs.transactions !== undefined) cumulativeScope.transactions = rawInputs.transactions;
    if (rawInputs.debts !== undefined) cumulativeScope.debts = rawInputs.debts;
    if (rawInputs.primes !== undefined) cumulativeScope.primes = rawInputs.primes;
    if (rawInputs.quantity !== undefined) cumulativeScope.quantity = rawInputs.quantity;

    // 扫描 model.stages 中所有源码的静态常量定义 (如 MAXN = 1005, MAXM = 1005, INF = 1e9)
    if (model?.stages && typeof model.stages === 'object') {
      try {
        const stageList = Object.values(model.stages);
        for (const st of stageList) {
          const variants = (st as any)?.variants || {};
          for (const v of Object.values(variants)) {
            const sources = [
              (v as any)?.code?.forward?.source,
              (v as any)?.code?.reverse?.source,
              (v as any)?.code?.source,
              (v as any)?.source,
            ];
            for (const src of sources) {
              if (typeof src === 'string') {
                const constMatches = src.matchAll(/(?:public\s+static\s+|const\s+|#define\s+)?(?:final\s+)?(?:int|long|double|float)\s+([A-Z0-9_]{2,})\s*=\s*(-?\d+|0x[0-9a-fA-F]+)/g);
                for (const match of constMatches) {
                  const cName = match[1];
                  const cValStr = match[2];
                  if (!cumulativeScope[cName]) {
                    const parsedNum = cValStr.startsWith('0x') ? parseInt(cValStr, 16) : parseInt(cValStr, 10);
                    cumulativeScope[cName] = !isNaN(parsedNum) ? parsedNum : cValStr;
                  }
                }
              }
            }
          }
        }
      } catch {
        // 静默安全保护
      }
    }

    let prevSlot: number | undefined = undefined;
    for (let idx = 0; idx < steps.length; idx++) {
      const step = steps[idx];

      // 🌟 1. 一维线性状态空间权威位置锁 (1D Authoritative Slot Invariant)
      // 杜绝任何底层 strategy 错误写出 j: 0 将小人定死在原点！
      if (is1D) {
        const slot = step.activeSlot !== undefined
          ? step.activeSlot
          : (step.currentJ !== undefined
              ? step.currentJ
              : (step.j !== undefined && step.j !== 0
                  ? step.j
                  : (step.currentI !== undefined
                      ? step.currentI
                      : (step.i !== undefined ? step.i : 0))));

        step.activeSlot = slot;
        if (!step.grid || step.grid.length <= 1) {
          step.j = slot; // 仅在没有多行 2D 表格时将 j 作为 slot
          step.i = 0;    // 一维行坐标固定为 0
        } else {
          // 存在多行 2D 表格时，保留真实的 2D 表格坐标
          if (step.currentI !== undefined) step.i = step.currentI;
          if (step.currentJ !== undefined) step.j = step.currentJ;
        }

        // 🌟 2. 物理实体规范化协议 (ActorPhysicsState Invariant)
        const jumpOrigin = step.fromSlot !== undefined
          ? step.fromSlot
          : (step.actorState?.jumpFrom !== undefined
              ? step.actorState.jumpFrom
              : (prevSlot !== undefined && prevSlot !== slot ? prevSlot : undefined));

        step.actorState = {
          currentSlot: slot,
          jumpFrom: jumpOrigin,
          action: step.actorState?.action || (jumpOrigin !== undefined && jumpOrigin !== slot ? 'jump' : 'walk')
        };
        prevSlot = slot;
      }

      // 🌟 3. 代码行号权威契约物理归一化 (Code Line Authority Invariant - 全维度全阶段通用)
      // 彻底消除策略层 line / codeLine 字段混淆，确保 step.line 与 codeLine 双向对齐且 100% 可用
      const resolvedLine = step.line !== undefined
        ? step.line
        : ((step as any).codeLine !== undefined ? (step as any).codeLine : undefined);

      if (resolvedLine !== undefined) {
        step.line = resolvedLine;
        (step as any).codeLine = resolvedLine;
      }

      // 🌟 4. 双向推导语义权威契约归一化 (Dual Direction Semantic Authority Invariant)
      if (params.direction === 'reverse') {
        step.direction = 'reverse';
        const text = (step.decision || '') + (step.msg || '') + (step.log || '') + (step.tag || '');
        if (!text.includes('逆') && !text.includes('对偶') && !text.includes('反向') && !text.includes('倒序')) {
          if (step.decision) {
            step.decision = `【逆向对偶】${step.decision}`;
          }
          if (step.msg) {
            step.msg = `【逆向推演】${step.msg}`;
          }
          if (step.tag) {
            step.tag = `[逆向] ${step.tag}`;
          }
          if (step.log) {
            step.log = `| 🔄 逆向对偶 ${step.log}`;
          }
        }
      }

      // 🌟 5. 全自动词法作用域累积继承契约 (Cumulative Lexical Scope Invariant)
      // 消除步骤孤岛效应：自动继承前序步骤已声明的有效变量（如 teams, m, n, start, end），防止 hover 时丢失
      const stepExplicit = (step.scope && typeof step.scope === 'object' ? step.scope : undefined) ||
        (step.variables && typeof step.variables === 'object' && !Array.isArray(step.variables) ? step.variables : undefined) ||
        (step.locals && typeof step.locals === 'object' ? step.locals : undefined);

      const stepPrimitives: Record<string, any> = {};
      const trackKeys = [
        'i', 'j', 'k', 'l', 'r', 'c', 'u', 'v', 'm', 'n',
        'teams', 'start', 'end', 'candidate', 'group', 'curGroup', 'groupCount', 'remCap',
        'capacity', 'cost', 'val', 'ans', 'sum', 'status', 'rest', 'full', 'nextS',
        'sub', 'mask', 'c', 'p', 'h',
        'arr', 'items', 'nums', 'grid', 'matrix', 'piles', 'stones', 'values', 'times', 'edges',
        'hats', 'transactions', 'debts', 'primes', 'quantity',
        'MAXN', 'MAXM', 'INF', 'MOD',
      ];
      for (const k of trackKeys) {
        if (step[k] !== undefined && typeof step[k] !== 'function') {
          stepPrimitives[k] = step[k];
        }
      }

      cumulativeScope = {
        ...cumulativeScope,
        ...stepPrimitives,
        ...(stepExplicit || {}),
      };

      step.scope = { ...cumulativeScope };
      step.variables = { ...cumulativeScope };
    }

    return steps;
  }

  /**
   * 生成阶段 1 (朴素递归) 或阶段 2 (记忆化搜索) 的完整演化步骤
   */
  public static generateStage1or2Steps(
    model: IYamlAlgorithmModel,
    mVal: number = 3,
    nVal: number = 3,
    direction: 'forward' | 'reverse' = 'forward',
    isMemo: boolean = false,
    anchorMap?: Record<string, number>,
    variant: string = 'terminal'
  ): UniversalStep[] {
    return this.generateSteps(model, {
      stage: isMemo ? 2 : 1,
      m: mVal,
      n: nVal,
      direction,
      isMemo,
      stageVariant: variant,
      anchorMap
    });
  }

  /**
   * 生成阶段 3 (经典二维 DP 填表) 演化步骤
   */
  public static generateStage3Steps(
    model: IYamlAlgorithmModel,
    mVal: number = 3,
    nVal: number = 3,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>,
    variant: string = 'for'
  ): UniversalStep[] {
    return this.generateSteps(model, {
      stage: 3,
      m: mVal,
      n: nVal,
      direction,
      isMemo: false,
      stageVariant: variant,
      anchorMap
    });
  }

  /**
   * 生成阶段 4 (一维空间压缩) 演化步骤
   */
  public static generateStage4Steps(
    model: IYamlAlgorithmModel,
    mVal: number = 3,
    nVal: number = 3,
    direction: 'forward' | 'reverse' = 'forward',
    variant: string = 'if',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return this.generateSteps(model, {
      stage: 4,
      m: mVal,
      n: nVal,
      direction,
      isMemo: false,
      stageVariant: variant,
      anchorMap
    });
  }
}
