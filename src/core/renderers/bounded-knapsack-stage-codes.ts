/**
 * 多重背包/二进制拆分/零钱兑换 四阶段演化多语言代码模板库
 * 使用 @step:anchor 语义锚点标注，由 CodeStepIndexer 在编译期自动
 * 解析为 Java / C++ / Python / JavaScript 四语种 1-based 物理行号。
 * 彻底消除 bounded-knapsack-stage-evolution.ts 中 9 处内联 lineMap。
 */

import { codeStepIndexer } from '../code-step-indexer';
import type { HighlightTarget } from './dark-code-terminal-presenter';
import {
  BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
  BINARY_SPLIT_STAGE1_CODE_LANGUAGES,
  BINARY_SPLIT_STAGE2_CODE_LANGUAGES,
  BINARY_SPLIT_STAGE3_CODE_LANGUAGES,
  COINS_CHANGE_STAGE1_CODE_LANGUAGES,
  COINS_CHANGE_STAGE2_CODE_LANGUAGES,
  COINS_CHANGE_STAGE3_CODE_LANGUAGES,
} from '../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-stage-codes';

export type BoundedKnapsackKind = 'bounded-naive' | 'binary-split' | 'coins-change';

const TEMPLATE_MAP: Record<string, Record<string, Record<string, string[]>>> = {
  'bounded-naive': {
    s1: BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
    s2: BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
    s3: BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
  },
  'binary-split': {
    s1: BINARY_SPLIT_STAGE1_CODE_LANGUAGES,
    s2: BINARY_SPLIT_STAGE2_CODE_LANGUAGES,
    s3: BINARY_SPLIT_STAGE3_CODE_LANGUAGES,
  },
  'coins-change': {
    s1: COINS_CHANGE_STAGE1_CODE_LANGUAGES,
    s2: COINS_CHANGE_STAGE2_CODE_LANGUAGES,
    s3: COINS_CHANGE_STAGE3_CODE_LANGUAGES,
  },
};

/** 自动注册所有模板到 CodeStepIndexer */
export function registerBoundedKnapsackTemplates(): void {
  for (const [kind, stages] of Object.entries(TEMPLATE_MAP)) {
    for (const [stage, langs] of Object.entries(stages)) {
      codeStepIndexer.register(`bk:${kind}:${stage}`, langs);
    }
  }
}

registerBoundedKnapsackTemplates();

/**
 * 查询多重背包某阶段某 kind 的 anchor 对应行号
 */
export function getBoundedKnapsackAnchor(
  stage: number,
  kind: BoundedKnapsackKind,
  anchor: string
): HighlightTarget {
  const key = `bk:${kind}:s${stage}`;
  const fallback: HighlightTarget = { java: 1, cpp: 1, python: 1, javascript: 1 };

  const java = codeStepIndexer.resolveHighlight(key, anchor, 'java');
  const cpp = codeStepIndexer.resolveHighlight(key, anchor, 'cpp');
  const python = codeStepIndexer.resolveHighlight(key, anchor, 'python');
  const javascript = codeStepIndexer.resolveHighlight(key, anchor, 'javascript');

  if (java != null || cpp != null || python != null || javascript != null) {
    return {
      java: java ?? (fallback as any).java,
      cpp: cpp ?? (fallback as any).cpp,
      python: python ?? (fallback as any).python,
      javascript: javascript ?? (fallback as any).javascript,
    };
  }
  return fallback;
}
