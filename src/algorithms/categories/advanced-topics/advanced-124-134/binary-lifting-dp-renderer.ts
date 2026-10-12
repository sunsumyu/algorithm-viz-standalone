/**
 * Class 129: 倍增优化 DP (Binary Lifting DP)
 * 洛谷 P1613 跑路 / 环形转移倍增
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { BINARY_LIFTING_DP_CODES } from './advanced-124-134-stage-codes';
import {
  BinaryLiftingDpStep,
  buildBinaryLiftingDpSteps,
} from '../../../../core/renderers/adapters/binary-lifting-dp-step-compiler';
import { renderBinaryLiftingDpCanvas } from '../../../../core/renderers/adapters/binary-lifting-dp-canvas-adapter';

export type { BinaryLiftingDpStep };
export { buildBinaryLiftingDpSteps, renderBinaryLiftingDpCanvas };

export const binaryLiftingDpVisualizer = registerDeclarativeAlgorithm<BinaryLiftingDpStep>({
  id: 'binary-lifting-dp-129',
  name: '倍增优化 DP (Class 129)',
  aliases: ['class129-code01', 'binary-lifting-dp', 'binary-lifting-dp-129'],
  category: 'dynamic-programming',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 129,
  learningGoal: '深刻理解倍增 DP 状态预处理 to[u][k] 与高次步数二进制对齐拆分的快速跳跃机制',
  problemHtml: ADVANCED_124_134_PROBLEMS.binaryLiftingDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.binaryLiftingDp.html,
  inputs: [
    {
      id: 'start',
      label: '起点节点 ID (0 ~ 5)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 5,
    },
    {
      id: 'steps',
      label: '转移总步数 Steps',
      type: 'number',
      defaultValue: 13,
      min: 1,
      max: 1000,
    },
  ],
  codeLanguages: BINARY_LIFTING_DP_CODES,
  generateSteps: (input) => {
    const n = 6;
    const succ = [1, 2, 3, 4, 5, 0];
    const start = Math.max(0, Math.min(n - 1, Number(input.start) || 0));
    const stepsCount = Math.max(1, Math.min(1000, Number(input.steps) || 13));
    return buildBinaryLiftingDpSteps(n, succ, start, stepsCount);
  },
  renderCanvas: (container, step) => {
    renderBinaryLiftingDpCanvas(container, step);
  },
});
