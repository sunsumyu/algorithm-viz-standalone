/**
/**
 * 通用多阶段状态推导执行引擎 (UniversalStageEngine) - 门面模式 (Facade Pattern)
 * 遵循 LSP（里氏替换原则）、OCP（开闭原则）与六边形架构：
 * 统一作为对外公开接缝门面，将具体的算法单步生成逻辑全权委托给策略流水线注册表 (AlgorithmStrategyRegistry)
 */

import type { IYamlAlgorithmModel } from './interfaces';
import {
  AlgorithmStrategyRegistry,
  cloneTree as helperCloneTree,
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
  status: 'normal' | 'current' | 'base' | 'pruned' | 'visited';
  tag?: string;
  children: UniversalTreeNode[];
}

export interface UniversalStep {
  type: string;
  i: number;
  j: number;
  grid?: (number | null)[][];
  activeStack?: string[];
  visited?: string[];
  line?: number;
  tag?: string;
  log?: string;
  msg?: string;
  topI?: number;
  topJ?: number;
  leftI?: number;
  leftJ?: number;
  activeNodeId?: string;
  treeRoot?: UniversalTreeNode | null;
  // 阶段 3 & 4 空间压缩与转移计算专用元数据
  memo?: number[];
  memoUpdatedIndex?: number;
  memoRefLeftIndex?: number;
  topVal?: number;
  leftVal?: number;
  sumVal?: number;
  obstacleGrid?: number[][];
  weightsGrid?: number[][];
  activeSlot?: number;
  slotMode?: 'down' | 'right' | 'updated' | 'final';
  memoSnapshot?: number[];
  dp1d?: number[];
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
    if (steps) return steps;

    throw new Error(`[UniversalStageEngine] 算法 "${model?.id || 'unknown'}" (阶段 ${params.stage}) 暂无匹配的推导计算策略！禁止静默回退至其他算法。`);
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
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return this.generateSteps(model, {
      stage: 3,
      m: mVal,
      n: nVal,
      direction,
      isMemo: false,
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
    variant: 'if' | 'for' = 'if',
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
