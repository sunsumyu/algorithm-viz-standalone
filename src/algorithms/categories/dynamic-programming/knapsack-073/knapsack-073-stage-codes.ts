/**
 * 背包 073 四阶段演化多语言代码模板库
 * 使用 @step:anchor 语义锚点标注，由 CodeStepIndexer 在编译期自动
 * 解析为 Java / C++ / Python / JavaScript 四语种 1-based 物理行号。
 * 彻底消除 knapsack-073 各 stage-evolution.ts 中 12 处内联 lineMap。
 */

import { codeStepIndexer } from '../../../../core/code-step-indexer';
import type { HighlightTarget } from '../../../../core/code-panel';
import {
  DEPENDENT_STAGE1_CODE_LANGUAGES,
  DEPENDENT_STAGE2_CODE_LANGUAGES,
  DEPENDENT_STAGE3_CODE_LANGUAGES,
  LAST_STONE_STAGE1_CODE_LANGUAGES,
  LAST_STONE_STAGE2_CODE_LANGUAGES,
  LAST_STONE_STAGE3_CODE_LANGUAGES,
  TARGET_SUM_STAGE1_CODE_LANGUAGES,
  TARGET_SUM_STAGE2_CODE_LANGUAGES,
  TARGET_SUM_STAGE3_CODE_LANGUAGES,
  BUY_GOODS_STAGE1_CODE_LANGUAGES,
  BUY_GOODS_STAGE2_CODE_LANGUAGES,
  BUY_GOODS_STAGE3_CODE_LANGUAGES,
} from './knapsack-073-templates';

export type Knapsack073Kind =
  | 'dependent'
  | 'last-stone'
  | 'target-sum'
  | 'buy-goods';

const TEMPLATE_MAP: Record<string, Record<string, Record<string, string[]>>> = {
  'dependent': {
    s1: DEPENDENT_STAGE1_CODE_LANGUAGES,
    s2: DEPENDENT_STAGE2_CODE_LANGUAGES,
    s3: DEPENDENT_STAGE3_CODE_LANGUAGES,
  },
  'last-stone': {
    s1: LAST_STONE_STAGE1_CODE_LANGUAGES,
    s2: LAST_STONE_STAGE2_CODE_LANGUAGES,
    s3: LAST_STONE_STAGE3_CODE_LANGUAGES,
  },
  'target-sum': {
    s1: TARGET_SUM_STAGE1_CODE_LANGUAGES,
    s2: TARGET_SUM_STAGE2_CODE_LANGUAGES,
    s3: TARGET_SUM_STAGE3_CODE_LANGUAGES,
  },
  'buy-goods': {
    s1: BUY_GOODS_STAGE1_CODE_LANGUAGES,
    s2: BUY_GOODS_STAGE2_CODE_LANGUAGES,
    s3: BUY_GOODS_STAGE3_CODE_LANGUAGES,
  },
};

/** 自动注册所有模板到 CodeStepIndexer */
export function registerKnapsack073Templates(): void {
  for (const [kind, stages] of Object.entries(TEMPLATE_MAP)) {
    for (const [stage, langs] of Object.entries(stages)) {
      codeStepIndexer.register(`k073:${kind}:${stage}`, langs);
    }
  }
}

registerKnapsack073Templates();

/**
 * 查询背包 073 某阶段某 kind 的 anchor 对应行号
 */
export function getKnapsack073Anchor(
  stage: number,
  kind: Knapsack073Kind,
  anchor: string
): HighlightTarget {
  const key = `k073:${kind}:s${stage}`;
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
