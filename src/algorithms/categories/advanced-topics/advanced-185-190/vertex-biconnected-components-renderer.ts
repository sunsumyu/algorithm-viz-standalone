/**
 * Class 190: 割点与点双连通分量 v-BCC (Cut Vertices & 2-Vertex-Connected Components)
 * low[v] >= dfn[u] 判定割点 + 极大点双连通块划分 / 洛谷 P3388 【模板】割点
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { VERTEX_BCC_CODES } from './advanced-185-190-stage-codes';
import {
  buildVertexBCCSteps,
  VertexBCCStep,
} from '../../../../core/renderers/adapters/vertex-biconnected-components-190-step-compiler';
import { renderVertexBCCCanvas } from '../../../../core/renderers/adapters/vertex-biconnected-components-190-canvas-adapter';

export { buildVertexBCCSteps, type VertexBCCStep };

export const vertexBCCVisualizer = registerDeclarativeAlgorithm<VertexBCCStep>({
  id: 'vertex-biconnected-components-190',
  name: '割点与点双连通分量 v-BCC (Class 190)',
  aliases: ['class190-code01', 'vertex-biconnected-components-190', 'vertex-bcc'],
  category: 'graph',
  icon: '📍',
  difficulty: 3,
  levelOrder: 190,
  description: '左程云算法通关课 Class 190：割点与点双连通分量 v-BCC。low[v] >= dfn[u] 判定割顶，根子树数量特判，栈弹边划分极大点双并支撑圆方树。',
  learningGoal: '掌握割点非根与根的两种判定准则、割点可属于多个点双的核心特性以及栈维护极大点双的机制',
  problemHtml: ADVANCED_185_190_PROBLEMS.vertexBCC.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.vertexBCC.html,
  presets: [
    { label: '8 字形双环相交图 (割点: 3, 点双: {1,2,3}, {3,4,5})', values: { preset: 'figure_8' } },
  ],
  codeLanguages: VERTEX_BCC_CODES,
  generateSteps: () => buildVertexBCCSteps(),
  renderCanvas: (container, step) => renderVertexBCCCanvas(container, step),
});
