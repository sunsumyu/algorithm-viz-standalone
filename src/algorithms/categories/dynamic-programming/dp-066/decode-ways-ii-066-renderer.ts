/**
 * 左程云算法通关课 Class 066: 解码方法 II (Decode Ways II · LeetCode 639)
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import { DECODE_WAYS_II_066_CODES } from './dp-066-stage-codes';
import {
  type DecodeWaysIIStep,
  buildDecodeWaysII066Steps,
} from '../../../../core/renderers/adapters/decode-ways-ii-step-compiler';
import { renderDecodeWaysIICanvas } from '../../../../core/renderers/adapters/decode-ways-ii-canvas-adapter';

// 向后兼容导出
export {
  type DecodeWaysIIStep,
  buildDecodeWaysII066Steps,
  renderDecodeWaysIICanvas,
};

registerDeclarativeAlgorithm({
  id: 'decode-ways-ii-066',
  name: '解码方法 II (带通配符DP)',
  category: 'dynamic-programming',
  difficulty: '困难',
  description: '左程云 Class 066 Code04：带通配符 * 的字符分类讨论与空间压缩一维动态规划 (LeetCode 639)',
  aliases: ['class066-code04', 'decode-ways-639', 'leetcode-639', 'decode-ways-ii-class066'],
  problemHtml: DP_066_PROBLEMS['decode-ways-ii-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['decode-ways-ii-066'].complexityHtml,
  codeLanguages: DECODE_WAYS_II_066_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'two_star',
      options: [
        { label: '双字符通配符 "2*" (15种)', value: 'two_star' },
        { label: '单通配符 "*" (9种)', value: 'single_star' },
        { label: '连续通配符 "**" (96种)', value: 'star_star' },
        { label: '复杂多通配符 "*1*2*"', value: 'complex_sample' },
      ],
    },
  ],
  presets: [
    { label: '双字符通配符 "2*" (15种)', values: { preset: 'two_star' } },
    { label: '单通配符 "*" (9种)', values: { preset: 'single_star' } },
    { label: '连续通配符 "**" (96种)', values: { preset: 'star_star' } },
    { label: '复杂多通配符 "*1*2*"', values: { preset: 'complex_sample' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildDecodeWaysII066Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: DecodeWaysIIStep) => {
    renderDecodeWaysIICanvas(container, step);
  },
});
