/**
 * 背包四阶段演化引擎与渲染模块 (KnapsackStageEvolution)
 * 核心设计准则：每一行代码都是一个单步（逐行高亮执行，绝不跳步）
 *
 * 职责分层（SRP 拆分）：
 * - 锚点解析 → knapsack-stage-shared
 * - 阶段 1 递归推演与渲染 → knapsack-stage-recursion
 * - 阶段 2 记忆化推演与渲染 → knapsack-stage-memo
 * - 阶段 3 二维 DP 推演与渲染 → knapsack-stage-2d
 * - 阶段 4 一维压缩由 KnapsackExecutionEngine 提供
 * - 本模块作为对外统一接缝，全量再导出
 */

export * from './knapsack-stage-shared';
export * from './knapsack-stage-recursion';
export * from './knapsack-stage-memo';
export * from './knapsack-stage-2d';
