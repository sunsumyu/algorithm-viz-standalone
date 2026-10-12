/**
 * Class 187: 欧拉路径与欧拉回路 (Eulerian Path & Circuit)
 * 度数判定 + Hierholzer 圈套圈算法 + 当前弧优化 / 洛谷 P7771 【模板】欧拉路径
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { EULERIAN_PATH_CODES } from './advanced-185-190-stage-codes';
import {
  buildEulerianSteps,
  EulerianStep,
} from '../../../../core/renderers/adapters/eulerian-path-circuit-187-step-compiler';
import { renderEulerianPathCanvas } from '../../../../core/renderers/adapters/eulerian-path-circuit-187-canvas-adapter';

export { buildEulerianSteps, type EulerianStep };

export const eulerianPathVisualizer = registerDeclarativeAlgorithm<EulerianStep>({
  id: 'eulerian-path-circuit-187',
  name: '欧拉路径与欧拉回路 (Class 187)',
  aliases: ['class187-code01', 'eulerian-path-circuit-187', 'hierholzer-algorithm'],
  category: 'graph',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 187,
  description: '左程云算法通关课 Class 187：欧拉路径与欧拉回路。度数奇偶判定起点终点，Hierholzer 圈套圈深搜结合当前弧优化，O(V + E) 求解合法欧拉序。',
  learningGoal: '掌握有向图欧拉路径充要条件、Hierholzer 圈套圈递归回溯压栈与当前弧删边防退化',
  problemHtml: ADVANCED_185_190_PROBLEMS.eulerianPathCircuit.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.eulerianPathCircuit.html,
  inputs: [
    {
      id: 'preset',
      label: '有向图拓扑预设',
      type: 'select',
      defaultValue: 'euler_4node',
      options: [
        { label: '4 点 4 边有向欧拉图 (起点 1, 终点 2)', value: 'euler_4node' },
      ],
    },
  ],
  codeLanguages: EULERIAN_PATH_CODES,
  generateSteps: () => buildEulerianSteps(),
  renderCanvas: (container, step) => renderEulerianPathCanvas(container, step),
});
