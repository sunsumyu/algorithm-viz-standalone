/**
 * 购买干草/零钱兑换 四阶段演化多语言代码模板库
 * 使用 @step:anchor 语义锚点标注，由 CodeStepIndexer 在编译期自动
 * 解析为 Java / C++ / Python / JavaScript 四语种 1-based 物理行号。
 * 彻底消除 knapsack-special-stage-evolution.ts 中 6 处内联 lineMap。
 */

import { codeStepIndexer } from '../code-step-indexer';
import type { HighlightTarget } from './dark-code-terminal-presenter';
import {
  BUYING_HAY_STAGE1_CODE_LANGUAGES,
  BUYING_HAY_STAGE2_CODE_LANGUAGES,
  BUYING_HAY_STAGE3_CODE_LANGUAGES,
  COINS_FROM_PILES_STAGE1_CODE_LANGUAGES,
  COINS_FROM_PILES_STAGE2_CODE_LANGUAGES,
  COINS_FROM_PILES_STAGE3_CODE_LANGUAGES,
} from '../../algorithms/categories/dynamic-programming/knapsack-074/knapsack-074-problem-content';

export type SpecialKnapsackKind = 'buying-hay' | 'coins-from-piles';

const TEMPLATE_MAP: Record<string, Record<string, Record<string, string[]>>> = {
  'buying-hay': {
    s1: BUYING_HAY_STAGE1_CODE_LANGUAGES,
    s2: BUYING_HAY_STAGE2_CODE_LANGUAGES,
    s3: BUYING_HAY_STAGE3_CODE_LANGUAGES,
  },
  'coins-from-piles': {
    s1: COINS_FROM_PILES_STAGE1_CODE_LANGUAGES,
    s2: COINS_FROM_PILES_STAGE2_CODE_LANGUAGES,
    s3: COINS_FROM_PILES_STAGE3_CODE_LANGUAGES,
  },
};

/** 自动注册所有模板到 CodeStepIndexer */
export function registerSpecialKnapsackTemplates(): void {
  for (const [kind, stages] of Object.entries(TEMPLATE_MAP)) {
    for (const [stage, langs] of Object.entries(stages)) {
      codeStepIndexer.register(`sk:${kind}:${stage}`, langs);
    }
  }
}

registerSpecialKnapsackTemplates();

/**
 * 查询特殊背包某阶段某 kind 的 anchor 对应行号
 */
export function getSpecialKnapsackAnchor(
  stage: number,
  kind: SpecialKnapsackKind,
  anchor: string
): HighlightTarget {
  const key = `sk:${kind}:s${stage}`;
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
