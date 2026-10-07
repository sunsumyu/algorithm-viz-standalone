/**
 * 左程云算法通关课 Class 066: 环绕字符串中唯一的子字符串 (LeetCode 467)
 * 字符结尾最长连续长度一维动态规划与数学归约
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import { UNIQUE_SUBSTRINGS_WRAPAROUND_066_CODES } from './dp-066-stage-codes';
import {
  buildUniqueSubstringsWraparound066Steps,
  type UniqueSubstringsWraparoundStep,
} from '../../../../core/renderers/adapters/unique-substrings-wraparound-step-compiler';
import { renderUniqueSubstringsWraparoundCanvas } from '../../../../core/renderers/adapters/unique-substrings-wraparound-canvas-adapter';

export { buildUniqueSubstringsWraparound066Steps };
export type { UniqueSubstringsWraparoundStep };

registerDeclarativeAlgorithm({
  id: 'unique-substrings-wraparound-066',
  name: '环绕字符串中唯一的子字符串 (26槽位DP)',
  category: 'dynamic-programming',
  difficulty: '中等',
  description: '左程云 Class 066 Code07：字符结尾最长连续长度一维动态规划与数学归约，26定长数组去重求和 (LeetCode 467)',
  aliases: ['class066-code07', 'unique-substrings-467', 'leetcode-467', 'unique-substrings-class066'],
  problemHtml: DP_066_PROBLEMS['unique-substrings-wraparound-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['unique-substrings-wraparound-066'].complexityHtml,
  codeLanguages: UNIQUE_SUBSTRINGS_WRAPAROUND_066_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'preset_zab',
      options: [
        { label: '环绕跨越用例 "zab" (6个)', value: 'preset_zab' },
        { label: '交替重复用例 "cac" (2个)', value: 'preset_cac' },
        { label: '混合跨越 "zaba" (6个)', value: 'preset_zaba' },
        { label: '单字符边界 "a" (1个)', value: 'preset_a' },
      ],
    },
  ],
  presets: [
    { label: '环绕跨越用例 "zab" (6个)', values: { preset: 'preset_zab' } },
    { label: '交替重复用例 "cac" (2个)', values: { preset: 'preset_cac' } },
    { label: '混合跨越 "zaba" (6个)', values: { preset: 'preset_zaba' } },
    { label: '单字符边界 "a" (1个)', values: { preset: 'preset_a' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildUniqueSubstringsWraparound066Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: UniqueSubstringsWraparoundStep) => {
    renderUniqueSubstringsWraparoundCanvas(container, step);
  },
});
