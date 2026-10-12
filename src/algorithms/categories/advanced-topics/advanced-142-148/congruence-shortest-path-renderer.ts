/**
 * Class 143: 同余最短路 (Congruence Shortest Path)
 * 洛谷 P3403 跳楼机 / 洛谷 P2371 [国家集训队] 墨墨的等式
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { CONGRUENCE_PATH_CODES } from './advanced-142-148-stage-codes';
import {
  CongruenceStep,
  buildCongruenceSteps,
} from '../../../../core/renderers/adapters/congruence-shortest-path-step-compiler';
import { renderCongruenceShortestPathCanvas } from '../../../../core/renderers/adapters/congruence-shortest-path-canvas-adapter';

export type { CongruenceStep };
export { buildCongruenceSteps };

export const congruenceShortestPathVisualizer = registerDeclarativeAlgorithm<CongruenceStep>({
  id: 'congruence-shortest-path-143',
  name: '同余最短路 (Class 143)',
  aliases: ['class143-code01', 'congruence-shortest-path', 'congruence-shortest-path-143', 'elevator-congruence'],
  category: 'graph',
  icon: '🏢',
  difficulty: 3,
  levelOrder: 143,
  description: '左程云算法通关课 Class 143：同余最短路。通过取模建立模 x 的剩余系有向图，用 Dijkstra 求各余数类的最小可达高度，将极大上界 H 统计化为 O(x) 数学除法。',
  learningGoal: '掌握同余最短路建模思想，利用基准模数降维大范围线性组合可行解统计',
  problemHtml: ADVANCED_142_148_PROBLEMS.congruenceShortestPath.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.congruenceShortestPath.html,
  inputs: [
    {
      id: 'preset',
      label: '跳跃步长与楼高配置',
      type: 'select',
      defaultValue: 'elevator_small',
      options: [
        { label: '标准跳楼机 (x=3, y=4, z=5, H=15)', value: 'elevator_small' },
        { label: '扩展测试例 (x=4, y=6, z=7, H=30)', value: 'elevator_medium' },
      ],
    },
  ],
  codeLanguages: CONGRUENCE_PATH_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'elevator_small');
    if (preset === 'elevator_medium') {
      return buildCongruenceSteps(4, 6, 7, 30);
    }
    return buildCongruenceSteps(3, 4, 5, 15);
  },
  renderCanvas: (container, step) => {
    renderCongruenceShortestPathCanvas(container, step);
  },
});
