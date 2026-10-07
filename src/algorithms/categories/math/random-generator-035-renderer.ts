/**
 * Class 035: 不均匀随机发生器向等概率转化模型 (Random Generator Transformation)
 * 左程云算法通关课入门篇 Class 035 / 冯·诺依曼偏置消除法 / LeetCode 470
 * Thin Domain Adapter (< 65 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RandomGenStep,
  RANDOM_GEN_035_CODES,
  RANDOM_GEN_035_CODE_LINES,
  generateRandomGenSteps,
} from './random-generator-035-step-compiler';
import { renderRandomGenCanvas } from './random-generator-035-canvas-adapter';

export type { RandomGenStep };
export {
  RANDOM_GEN_035_CODES,
  RANDOM_GEN_035_CODE_LINES,
  generateRandomGenSteps,
  renderRandomGenCanvas,
};

export const randomGenerator035Visualizer = registerDeclarativeAlgorithm<RandomGenStep>({
  id: 'random-generator-035',
  name: 'Class 035: 不均匀随机发生器向等概率转化模型 (Random Transformer)',
  category: 'math',
  icon: '🎲',
  difficulty: 2,
  levelOrder: 35,
  learningGoal: '理解冯·诺依曼偏置消除法数学原理，掌握由偏置随机发生器向等概率发生器及任意范围随机数的转化模型',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 035 / LeetCode 470)</h3>
      <p>给定一个黑盒函数 $f()$，它以未知固定概率 $p$ 产出 0，以 $1-p$ 产出 1：</p>
      <ul>
        <li><strong>问题 1</strong>：如何仅通过调用 $f()$，构造一个产生 0 和 1 概率严格各为 50% 的等概率发生器？</li>
        <li><strong>答案</strong>：独立双掷。若为 (0, 1) 则返回 0；若为 (1, 0) 则返回 1；若为 (0, 0) 或 (1, 1) 则重新投掷。因为 $p(1-p) = (1-p)p$ 绝对对称相等。</li>
        <li><strong>问题 2</strong>：如何基于等概率 01 发生器生成 $[1, 7]$ 的均匀随机数？</li>
        <li><strong>答案</strong>：调用 3 次生成 3 个二进制位，拼装出 $[0, 7]$；若得到 0 则重做，剩余 $[1, 7]$ 的 7 种结果概率严格等可能。</li>
      </ul>
    </div>
  `,
  codeLanguages: RANDOM_GEN_035_CODES,
  inputs: [
    {
      id: 'samples',
      label: '演示抽样次数',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '快速演示 (3 次抽样)', value: '3' },
        { label: '完整演示 (5 次抽样)', value: '5' },
      ],
    },
  ],
  generateSteps: (input) => {
    const samples = Number(input.samples) || 3;
    return generateRandomGenSteps(samples);
  },
  renderCanvas: (container, step) => {
    renderRandomGenCanvas(container, step);
  },
});
