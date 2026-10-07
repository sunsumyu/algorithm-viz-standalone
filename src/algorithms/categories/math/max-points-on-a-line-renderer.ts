/**
 * 直线上最多的点数 (Max Points on a Line)
 * LeetCode 149 (Hard / 大厂高频数学与几何哈希)
 * Thin Domain Adapter (< 60 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  Point,
  MaxPointsStep,
  MAX_POINTS_CODES,
  MAX_POINTS_CODE_LINES,
  buildMaxPointsSteps,
  parseMaxPointsInputs,
} from './max-points-on-a-line-step-compiler';
import { renderMaxPointsCanvas } from './max-points-on-a-line-canvas-adapter';

export type { Point, MaxPointsStep };
export {
  MAX_POINTS_CODES,
  MAX_POINTS_CODE_LINES,
  buildMaxPointsSteps,
  parseMaxPointsInputs,
  renderMaxPointsCanvas,
};

registerDeclarativeAlgorithm({
  id: 'max-points-on-a-line',
  name: '直线上最多的点数',
  category: 'math',
  difficulty: 3,
  learningGoal: 'LeetCode 149: 平面直角坐标系中最多有多少个点在同一条直线上。采用 GCD 斜率约分化简，以避免浮点数精度误差。',
  codeLanguages: MAX_POINTS_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.points as string | undefined;
    const pts = parseMaxPointsInputs(raw);
    return buildMaxPointsSteps(pts);
  },
  renderCanvas: (container: HTMLElement, step: MaxPointsStep) => {
    container.innerHTML = renderMaxPointsCanvas(step);
  },
  inputs: [
    {
      id: 'points',
      label: '点集坐标序列',
      type: 'text',
      defaultValue: '1,1; 2,2; 3,3; 1,4; 3,2; 5,3',
      placeholder: '格式如: x1,y1; x2,y2; ...',
    },
  ],
});
