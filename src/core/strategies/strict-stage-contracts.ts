/**
 * 顶级算法演化强契约与抽象基类 (Strict Stage Invariant Contracts)
 * 遵循《Java 抽象类式硬约束》：
 * 强制所有经典动态规划算法在实现阶段 1 (暴力递归) 和阶段 2 (记忆化搜索) 时，
 * 必须提供 2D 物理探索网格坐标、动态决策调用树 (treeRoot)、探索足迹 (activeTrail) 与调用栈 (callStack)。
 * 若有缺失，编译期 (tsc) 立即报错，门禁测试 (vitest) 立即爆红拦截！
 */

import type { UniversalTreeNode, UniversalStep } from '../universal-stage-engine';

/**
 * 阶段 1 (暴力递归) 强制步骤规范：
 * 强制包含物理网格坐标 (i, j)、递归决策树 (treeRoot)、当前活跃节点 (activeNodeId) 与足迹 (activeTrail)
 */
export interface IStrictRecursionStep extends UniversalStep {
  i: number;
  j: number;
  treeRoot: UniversalTreeNode;
  activeNodeId: string;
  activeTrail: string[];
  callStack: Array<any>;
}

/**
 * 阶段 1 规范强接口：强制要求 Card 1 网格沙盘与 Card 2 动态调用树挂载函数
 */
export interface IStrictDpStage1Spec<TStep extends IStrictRecursionStep = IStrictRecursionStep> {
  id: 'stage-1';
  name: string;
  card1Title: string;
  card2Title: string;
  renderCanvas: (container: HTMLElement, step: TStep, extra?: any) => void;
  renderCustomMetrics: (container: HTMLElement, step: TStep, extra?: any) => void;
  buildSteps: (inputs: Record<string, any>, mode?: string) => TStep[];
}

/**
 * 阶段 2 (记忆化搜索) 强制步骤规范：
 * 强制包含 memoGrid 备忘录矩阵、缓存命中状态 (memoHit) 与足迹 (activeTrail)
 */
export interface IStrictMemoStep extends UniversalStep {
  i: number;
  j: number;
  memoGrid: number[][];
  memoHit: boolean;
  hitCount: number;
  missCount: number;
  treeRoot: UniversalTreeNode;
  activeNodeId: string;
  activeTrail: string[];
  callStack: Array<any>;
}

/**
 * 阶段 2 规范强接口：强制要求 Card 1 备忘录沙盘与 Card 2 记忆化剪枝树挂载函数
 */
export interface IStrictDpStage2Spec<TStep extends IStrictMemoStep = IStrictMemoStep> {
  id: 'stage-2';
  name: string;
  card1Title: string;
  card2Title: string;
  renderCanvas: (container: HTMLElement, step: TStep, extra?: any) => void;
  renderCustomMetrics: (container: HTMLElement, step: TStep, extra?: any) => void;
  buildSteps: (inputs: Record<string, any>, mode?: string) => TStep[];
}
