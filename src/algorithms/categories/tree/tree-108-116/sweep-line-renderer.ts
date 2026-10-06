/**
 * Class 115: 扫描线求矩形面积并 (Sweep Line)
 * 洛谷 P5490 【模板】扫描线
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import {
  SweepEvent,
  Rectangle,
  SweepLineStep,
  buildSweepLineSteps,
  SWEEP_LINE_CODES,
} from '../../../../core/renderers/adapters/sweep-line-step-compiler';
import { renderSweepLineCanvas } from '../../../../core/renderers/adapters/sweep-line-canvas-adapter';

export type { SweepEvent, Rectangle, SweepLineStep };
export { buildSweepLineSteps };

export const sweepLineVisualizer = registerDeclarativeAlgorithm<SweepLineStep>({
  id: 'sweep-line-115',
  name: '扫描线与矩形面积并 (Class 115)',
  aliases: ['class115-code01', 'sweep-line', 'sweep-line-115', 'rectangle-area-union'],
  category: 'tree',
  icon: '📐',
  difficulty: 3,
  levelOrder: 115,
  learningGoal: '掌握经典几何扫描线 (Sweep Line) 思想，将二维面积积分转化为一维切片线段树覆盖长度的动态维护',
  problemHtml: TREE_108_116_PROBLEMS.sweepLine.html,
  analysisHtml: TREE_108_116_PROBLEMS.sweepLine.html,
  inputs: [
    {
      id: 'rects',
      label: '矩形集合 (x1,y1,x2,y2 竖线分隔)',
      type: 'text',
      defaultValue: '10,10,30,40 | 20,20,50,50 | 40,10,60,30',
      placeholder: '格式如 10,10,30,40 | 20,20,50,50',
    },
  ],
  codeLanguages: SWEEP_LINE_CODES,
  generateSteps: (input) => {
    const raw = String(input.rects || '10,10,30,40 | 20,20,50,50 | 40,10,60,30');
    const rects: Rectangle[] = raw.split('|').map(s => {
      const [x1, y1, x2, y2] = s.split(',').map(Number);
      return { x1: x1 || 0, y1: y1 || 0, x2: x2 || 10, y2: y2 || 10 };
    });
    return buildSweepLineSteps(rects);
  },
  renderCanvas: (container, step) => {
    renderSweepLineCanvas(container, step);
  },
});
