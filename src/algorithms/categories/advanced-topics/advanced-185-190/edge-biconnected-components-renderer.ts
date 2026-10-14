/**
 * Class 189: 割边与边双连通分量 e-BCC (Bridges & 2-Edge-Connected Components)
 * low[v] > dfn[u] 判定割边 + 树形缩点 / 洛谷 P8436 【模板】边双连通分量
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { EDGE_BCC_CODES } from './advanced-185-190-stage-codes';
import {
  buildEdgeBCCSteps,
  EdgeBCCStep,
} from '../../../../core/renderers/adapters/edge-biconnected-components-189-step-compiler';
import { renderEdgeBCCCanvas } from '../../../../core/renderers/adapters/edge-biconnected-components-189-canvas-adapter';

export { buildEdgeBCCSteps, type EdgeBCCStep };

export const edgeBCCVisualizer = registerDeclarativeAlgorithm<EdgeBCCStep>({
  id: 'edge-biconnected-components-189',
  name: '割边与边双连通分量 e-BCC (Class 189)',
  aliases: ['class189-code01', 'edge-biconnected-components-189', 'edge-bcc'],
  category: 'graph',
  icon: '🌉',
  difficulty: 3,
  levelOrder: 189,
  description: '左程云算法通关课 Class 189：割边与边双连通分量 e-BCC。low[v] > dfn[u] 判定桥，忽略反向重边，非割边划分极大边双分量并缩点成树。',
  learningGoal: '深刻理解桥与边双连通的定义、成对存储反向边技巧以及无向图缩点成树的结构特性',
  problemHtml: ADVANCED_185_190_PROBLEMS.edgeBCC.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.edgeBCC.html,
  presets: [
    { label: '哑铃图 (环 1-2-3 -- 桥 3-4 -- 边 4-5)', values: { preset: 'bridge_dumbbell' } },
  ],
  codeLanguages: EDGE_BCC_CODES,
  generateSteps: () => buildEdgeBCCSteps(),
  renderCanvas: (container, step) => renderEdgeBCCCanvas(container, step),
});
