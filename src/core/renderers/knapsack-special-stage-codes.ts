/**
 * 购买干草/零钱兑换 四阶段演化多语言代码模板库
 * 使用 @step:anchor 语义锚点标注，由 CodeStepIndexer 在编译期自动
 * 解析为 Java / C++ / Python / JavaScript 四语种 1-based 物理行号。
 * 彻底消除 knapsack-special-stage-evolution.ts 中 6 处内联 lineMap。
 */

import { createStageCodeRegistry, type StageCodeMap } from '../stage-code-registry';
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

const STAGE_TEMPLATES: StageCodeMap = {
  'buying-hay:s1': BUYING_HAY_STAGE1_CODE_LANGUAGES,
  'buying-hay:s2': BUYING_HAY_STAGE2_CODE_LANGUAGES,
  'buying-hay:s3': BUYING_HAY_STAGE3_CODE_LANGUAGES,
  'coins-from-piles:s1': COINS_FROM_PILES_STAGE1_CODE_LANGUAGES,
  'coins-from-piles:s2': COINS_FROM_PILES_STAGE2_CODE_LANGUAGES,
  'coins-from-piles:s3': COINS_FROM_PILES_STAGE3_CODE_LANGUAGES,
};

const registry = createStageCodeRegistry<SpecialKnapsackKind>('sk', STAGE_TEMPLATES);
registry.register();

export const registerSpecialKnapsackTemplates = registry.register;
export const getSpecialKnapsackAnchor: (
  stage: number,
  kind: SpecialKnapsackKind,
  anchor: string,
) => HighlightTarget = registry.getAnchor;
