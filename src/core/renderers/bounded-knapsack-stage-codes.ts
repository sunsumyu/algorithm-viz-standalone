/**
 * 多重背包/二进制拆分/零钱兑换 四阶段演化多语言代码模板库
 * 使用 @step:anchor 语义锚点标注，由 CodeStepIndexer 在编译期自动
 * 解析为 Java / C++ / Python / JavaScript 四语种 1-based 物理行号。
 * 彻底消除 bounded-knapsack-stage-evolution.ts 中 9 处内联 lineMap。
 */

import { createStageCodeRegistry, type StageCodeMap } from '../stage-code-registry';
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

const STAGE_TEMPLATES: StageCodeMap = {
  'bounded-naive:s1': BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
  'bounded-naive:s2': BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
  'bounded-naive:s3': BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
  'binary-split:s1': BINARY_SPLIT_STAGE1_CODE_LANGUAGES,
  'binary-split:s2': BINARY_SPLIT_STAGE2_CODE_LANGUAGES,
  'binary-split:s3': BINARY_SPLIT_STAGE3_CODE_LANGUAGES,
  'coins-change:s1': COINS_CHANGE_STAGE1_CODE_LANGUAGES,
  'coins-change:s2': COINS_CHANGE_STAGE2_CODE_LANGUAGES,
  'coins-change:s3': COINS_CHANGE_STAGE3_CODE_LANGUAGES,
};

const registry = createStageCodeRegistry<BoundedKnapsackKind>('bk', STAGE_TEMPLATES);
registry.register();

export const registerBoundedKnapsackTemplates = registry.register;
export const getBoundedKnapsackAnchor: (
  stage: number,
  kind: BoundedKnapsackKind,
  anchor: string,
) => HighlightTarget = registry.getAnchor;
