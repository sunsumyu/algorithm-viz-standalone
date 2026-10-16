/**
 * Class 053 Code03: 移掉 K 位数字 (Remove K Digits / LeetCode 402)
 * 已与通用单调栈版深度融为单一事实来源 (src/algorithms/categories/monotonic-stack/remove-k-digits-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['remove-k-digits-053', 'class053-code03', 'leetcode-402'] 统合分发
 */

import { RemoveKDigitsVisualizer } from '../remove-k-digits-renderer';
import {
  parseRemoveKDigitsInput,
  buildRemoveKDigits053Steps,
} from './remove-k-digits-053-step-compiler';
import { type Step053 } from './stack-053-shared';

export {
  parseRemoveKDigitsInput,
  buildRemoveKDigits053Steps,
  type Step053 as RemoveKDigits053Step,
};

export const removeKDigits053Visualizer = RemoveKDigitsVisualizer;
