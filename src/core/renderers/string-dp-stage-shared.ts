/**
 * 字符串 DP 四阶段演化 — 共享锚点解析 (StringDpStageShared)
 * 从 string-dp-stage-evolution 拆出：StringDpKind 词汇与 stage→代码行锚点解析。
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { getStringDpAnchor } from './string-dp-stage-codes';

export type StringDpKind = 'regex' | 'wildcard';

// Stage code line resolution via CodeStepIndexer @step:anchor compilation
export function getLine(stage: number, kind: StringDpKind, anchor: string): HighlightTarget {
  return getStringDpAnchor(stage, kind, anchor);
}
