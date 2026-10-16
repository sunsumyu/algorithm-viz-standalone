/**
 * Class 173: 网络流最大流 Dinic 算法 (Dinic Maximum Flow)
 * 层次图 BFS + 多路增广 DFS + 当前弧优化 / 洛谷 P3376 【模板】网络最大流
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { DINIC_MAX_FLOW_CODES } from './advanced-173-178-stage-codes';
import { buildDinicSteps, DinicStep } from '../../../../core/renderers/adapters/dinic-max-flow-173-step-compiler';
import { renderDinicCanvas } from '../../../../core/renderers/adapters/dinic-max-flow-173-canvas-adapter';

export { buildDinicSteps, type DinicStep };

export const dinicMaxFlowVisualizer = registerDeclarativeAlgorithm<DinicStep>({
  id: 'dinic-max-flow-173',
  name: '网络流最大流 Dinic (Class 173)',
  aliases: ['class173-code01', 'dinic-max-flow-173', 'dinic-173'],
  category: 'graph',
  icon: '🌊',
  difficulty: 3,
  levelOrder: 173,
  description: '左程云算法通关课 Class 173：网络流最大流 Dinic 算法。层次图分层 BFS + 多路增广 DFS + 当前弧优化，O(V^2 E) 求解网络最大流。',
  learningGoal: '深刻理解残量网络与反向弧退流机制，掌握 BFS 层次图定向与当前弧优化避免冗余搜索',
  problemHtml: ADVANCED_173_178_PROBLEMS.dinicMaxFlow.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.dinicMaxFlow.html,
  presets: [
    { label: '标准 4 节点网络流 (S=1, T=4, 最大流: 4)', values: { preset: 'standard_4node' } },
  ],
  codeLanguages: DINIC_MAX_FLOW_CODES,
  generateSteps: () => buildDinicSteps(),
  renderCanvas: (container, step) => renderDinicCanvas(container, step),
});
