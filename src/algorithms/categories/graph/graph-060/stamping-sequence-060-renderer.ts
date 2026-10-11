/**
 * 左程云算法通关课 Class 060: 戳印序列 (LeetCode 936 · 逆向拓扑排序)
 * 倒放电影法：最后盖印的区间必然与印章完全一致，扣成通配符 '?' 后为重叠窗口削减入度差异
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import { STAMPING_SEQUENCE_060_CODES } from './graph-060-stage-codes';
import { renderStampingBoard } from './stamping-sequence-060-canvas-adapter';
import {
  type StampingStep,
  buildStampingSequence060Steps,
} from './stamping-sequence-060-step-compiler';

export { buildStampingSequence060Steps, type StampingStep };

export const stampingSequence060Visualizer = registerDeclarativeAlgorithm<StampingStep>({
  id: 'stamping-sequence-060',
  aliases: ['stamping-sequence', 'moves-to-stamp', 'leetcode-936', 'class060-code05'],
  name: '戳印序列 (LeetCode 936 · 逆向拓扑排序) (Class 060)',
  category: 'graph',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 6005,
  learningGoal: '掌握逆向思维倒放电影建模、通配符扩散机制与滑动窗口入度削减拓扑驱动',
  problemHtml: GRAPH_060_PROBLEMS.stampingSequence060.html,
  codeLanguages: STAMPING_SEQUENCE_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '目标串用例选择',
      type: 'select',
      defaultValue: 'classic_ababc',
      options: [
        { label: 'stamp="abc", target="ababc" (经典双盖印)', value: 'classic_ababc' },
        { label: 'stamp="abca", target="aabcaca" (三重嵌套重叠)', value: 'nested_aabc' },
      ],
    },
  ],
  presets: [
    { label: '经典双盖印', values: { preset: 'classic_ababc' } },
    { label: '三重嵌套重叠', values: { preset: 'nested_aabc' } },
  ],
  generateSteps: (inputs) => buildStampingSequence060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        ${renderStampingBoard(step.stamp, step.targetChars, step.inDegree, step.curStart, step.path, step.queue)}
      </div>
    `;
  },
});
