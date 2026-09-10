/**
 * 背包 073 四阶段演化多语言代码模板库
 * 使用 @step:anchor 语义锚点标注，由 CodeStepIndexer 在编译期自动
 * 解析为 Java / C++ / Python / JavaScript 四语种 1-based 物理行号。
 * 彻底消除 knapsack-073 各 stage-evolution.ts 中 12 处内联 lineMap。
 */

import { createStageCodeRegistry, type StageCodeMap } from '../../../../core/stage-code-registry';
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

const STAGE_TEMPLATES: StageCodeMap = {
  'dependent:s1': DEPENDENT_STAGE1_CODE_LANGUAGES,
  'dependent:s2': DEPENDENT_STAGE2_CODE_LANGUAGES,
  'dependent:s3': DEPENDENT_STAGE3_CODE_LANGUAGES,
  'last-stone:s1': LAST_STONE_STAGE1_CODE_LANGUAGES,
  'last-stone:s2': LAST_STONE_STAGE2_CODE_LANGUAGES,
  'last-stone:s3': LAST_STONE_STAGE3_CODE_LANGUAGES,
  'target-sum:s1': TARGET_SUM_STAGE1_CODE_LANGUAGES,
  'target-sum:s2': TARGET_SUM_STAGE2_CODE_LANGUAGES,
  'target-sum:s3': TARGET_SUM_STAGE3_CODE_LANGUAGES,
  'buy-goods:s1': BUY_GOODS_STAGE1_CODE_LANGUAGES,
  'buy-goods:s2': BUY_GOODS_STAGE2_CODE_LANGUAGES,
  'buy-goods:s3': BUY_GOODS_STAGE3_CODE_LANGUAGES,
};

const registry = createStageCodeRegistry<Knapsack073Kind>('k073', STAGE_TEMPLATES);
registry.register();

export const registerKnapsack073Templates = registry.register;
export const getKnapsack073Anchor: (
  stage: number,
  kind: Knapsack073Kind,
  anchor: string,
) => HighlightTarget = registry.getAnchor;
