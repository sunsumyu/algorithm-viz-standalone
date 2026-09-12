/**
 * 背包四阶段演化 — 共享锚点解析 (KnapsackStageShared)
 * 从 knapsack-stage-evolution 拆出：KnapsackKind 词汇与 stage→代码行锚点解析。
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { getKnapsackAnchor } from './knapsack-stage-codes';

export type KnapsackKind = '01' | 'unbounded' | 'partitioned';

export interface StageLineMap {
  [action: string]: HighlightTarget;
}

/**
 * 从 CodeStepIndexer 获取某阶段某 kind 的 anchor 对应行号
 * 替代原有的 STAGE_LINE_MAPS 常量查找
 */
export function getLine(stage: number, kind: KnapsackKind, anchor: string): HighlightTarget {
  return getKnapsackAnchor(stage, kind, anchor);
}
