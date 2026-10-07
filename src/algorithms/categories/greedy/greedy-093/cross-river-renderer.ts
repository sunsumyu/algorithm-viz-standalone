/**
 * 经典过河问题 (POJ 1700) - 声明式教学级沙盘渲染器
 * 核心贪心：每次运送最慢两人，比较策略 1 (最快者当船夫) 与策略 2 (双快护航，慢者同行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import { CROSS_RIVER_CODES } from './greedy-093-stage-codes';
import {
  RoundCrossingDef,
  CrossRiverStep,
  buildCrossRiverSteps,
} from '../../../../core/renderers/adapters/cross-river-093-step-compiler';
import { crossRiver093CanvasAdapter } from '../../../../core/renderers/adapters/cross-river-093-canvas-adapter';

export type { RoundCrossingDef, CrossRiverStep };
export { buildCrossRiverSteps };

export const crossRiverVisualizer = registerDeclarativeAlgorithm<CrossRiverStep>({
  id: 'cross-river-classic',
  name: '经典过河问题 (Cross River)',
  category: 'greedy',
  icon: '🛶',
  difficulty: 2,
  levelOrder: 934,
  aliases: ['class093-code04', 'cross-river', 'poj-1700', 'bridge-crossing'],
  learningGoal: '掌握过河问题中策略一（最快者当船夫）与策略二（双快护航最慢同行）的贪心比对',
  problemHtml: GREEDY_093_PROBLEMS.crossRiver.html,
  analysisHtml: GREEDY_093_PROBLEMS.crossRiver.html,
  inputs: [
    {
      id: 'input-times',
      label: '各人员耗时 times',
      type: 'text',
      defaultValue: '1, 2, 5, 10',
      placeholder: '1, 2, 5, 10',
    },
  ],
  codeLanguages: CROSS_RIVER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-times'] || '1, 2, 5, 10');
    const times = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((x) => !isNaN(x));
    return buildCrossRiverSteps(times);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CrossRiverStep) => {
    crossRiver093CanvasAdapter.render(stageContainer, step);
  },
});

export function registerCrossRiver(): void {
  // 保持向前兼容导出
}
