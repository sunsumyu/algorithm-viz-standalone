/**
 * 左程云算法通关课 Class 066: 丑数 II (Ugly Number II · LeetCode 264)
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import { UGLY_NUMBER_II_066_CODES } from './dp-066-stage-codes';
import {
  type UglyNumberIIStep,
  buildUglyNumberII066Steps,
} from '../../../../core/renderers/adapters/ugly-number-ii-step-compiler';
import { renderUglyNumberIICanvas } from '../../../../core/renderers/adapters/ugly-number-ii-canvas-adapter';

// 向后兼容导出
export {
  type UglyNumberIIStep,
  buildUglyNumberII066Steps,
};

registerDeclarativeAlgorithm({
  id: 'ugly-number-ii-066',
  name: '丑数 II (三指针归并DP)',
  category: 'dynamic-programming',
  difficulty: '中等',
  description: '左程云 Class 066 Code05：三指针一维动态规划模拟多路有序链表合并，质因数2/3/5同步递增去重 (LeetCode 264)',
  aliases: ['class066-code05', 'ugly-number-264', 'leetcode-264', 'ugly-number-ii-class066'],
  problemHtml: DP_066_PROBLEMS['ugly-number-ii-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['ugly-number-ii-066'].complexityHtml,
  codeLanguages: UGLY_NUMBER_II_066_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'n_10',
      options: [
        { label: '第 10 个丑数 (值: 12)', value: 'n_10' },
        { label: '第 15 个丑数 (值: 24)', value: 'n_15' },
        { label: '第 20 个丑数 (值: 36)', value: 'n_20' },
        { label: '第 1 个丑数 (边界: 1)', value: 'n_1' },
      ],
    },
  ],
  presets: [
    { label: '第 10 个丑数 (值: 12)', values: { preset: 'n_10' } },
    { label: '第 15 个丑数 (值: 24)', values: { preset: 'n_15' } },
    { label: '第 20 个丑数 (值: 36)', values: { preset: 'n_20' } },
    { label: '第 1 个丑数 (边界: 1)', values: { preset: 'n_1' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildUglyNumberII066Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: UglyNumberIIStep) => {
    renderUglyNumberIICanvas(container, step);
  },
});
