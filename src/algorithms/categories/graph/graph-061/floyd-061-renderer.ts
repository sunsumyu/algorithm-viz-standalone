/**
 * 左程云算法通关课 Class 061: Floyd-Warshall 全源最短路算法 (O(V³) 动态规划)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import { FLOYD_061_CODES } from './graph-061-stage-codes';
import {
  renderGraph061SvgTopology,
  renderFloydMatrix,
} from './graph-061-shared';
import {
  FloydStep,
  buildFloyd061Steps,
} from './floyd-061-step-compiler';

export type { FloydStep };
export { buildFloyd061Steps };

export const floyd061Visualizer = registerDeclarativeAlgorithm<FloydStep>({
  id: 'floyd-061',
  aliases: ['floyd', 'class061-code05', 'floyd-warshall'],
  name: 'Floyd 全源最短路算法 (Class 061)',
  category: 'graph',
  icon: '🌐',
  difficulty: 2,
  levelOrder: 6105,
  learningGoal: '掌握中转跳板 k 枚举外层准则、动态规划多阶段决策与 O(V³) 全源最短路求解',
  problemHtml: GRAPH_061_PROBLEMS.floyd061.html,
  codeLanguages: FLOYD_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'default_4nodes',
      options: [
        { label: '4 节点交叉拓扑 (非对称权值)', value: 'default_4nodes' },
        { label: '4 节点有向环拓扑 (环形连通闭包)', value: 'directed_cycle' },
      ],
    },
  ],
  presets: [
    { label: '4 节点交叉图', values: { preset: 'default_4nodes' } },
    { label: '4 节点有向环', values: { preset: 'directed_cycle' } },
  ],
  generateSteps: (inputs) => buildFloyd061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 250px; box-sizing: border-box; padding: 4px;">
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.k,
          activeEdge: step.activePath ? { from: step.activePath.from, to: step.activePath.via } : null,
        })}
      </div>
    `;
  },
});
