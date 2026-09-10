/**
 * 统一演化步骤泛型基类 (Unified Step Generic Base Types)
 *
 * 所有 stage-evolution 文件中的步骤接口共享 7 个核心字段。
 * 本模块将它们提取为 3 个泛型基类：
 * - RecursionStepBase<T>：递归阶段，T = 调用栈帧形状
 * - MemoStepBase：记忆化阶段
 * - Dp2DStepBase：严格二维 DP 阶段
 *
 * 各算法的具体接口只需 extends 对应基类并添加算法特有字段，
 * 无需重复声明共享字段。字段命名保持原样，不做任何重命名。
 */

import type { HighlightTarget } from './renderers/dark-code-terminal-presenter';

/** 所有步骤类型共享的核心字段 */
export interface StepBase {
  stepIndex: number;
  totalSteps: number;
  action: string;
  decision: string;
  message: string;
  log: string;
  metrics: Record<string, string>;
}

/**
 * 递归阶段步骤基类
 * @template T — 调用栈帧形状，如 `{ i: number; remCap: number; label: string }`
 */
export interface RecursionStepBase<T> extends StepBase {
  codeLine: HighlightTarget;
  callStack: T[];
  returnValue?: number;
}

/** 记忆化阶段步骤基类 */
export interface MemoStepBase extends StepBase {
  codeLine: HighlightTarget;
  i: number;
  hitCount: number;
  missCount: number;
}

/** 严格二维 DP 阶段步骤基类 */
export interface Dp2DStepBase extends StepBase {
  codeLine: HighlightTarget;
  curI: number;
  curJ: number;
}
