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
        step.j = slot; // 顶层物理纠偏：一维槽位列坐标必须等于 slot，小人才能跳动
        step.i = 0;    // 一维行坐标固定为 0

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
