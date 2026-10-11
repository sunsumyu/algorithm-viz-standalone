/**
 * 广度优先搜索理论基础 (BFS Theory) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 步进推演委托至 BFSTheoryStepCompiler
 * 层序拓扑沙盘与指标舱委托至 BFSTheoryCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BFS_THEORY_CODE_LANGUAGES,
  BFS_THEORY_PROBLEM_HTML,
  BFS_THEORY_ANALYSIS_HTML,
} from './bfs-theory-problem-content';
import {
  buildBFSSteps,
  type BFSStep,
} from './bfs-theory-step-compiler';
import {
  renderBFSTheoryCanvas,
  renderBFSTheoryCustomMetrics,
} from '../../../core/renderers/adapters/bfs-theory-canvas-adapter';

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'bfs-theory',
  name: '广度优先搜索理论基础 (BFS Theory)',
  category: 'graph',
  description: 'BFS 核心原理解析：FIFO 队列驱动、分层水波纹扩展与无权图最短路 O(V+E)',
  icon: '🌊',
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握 BFS 队列机制与层序遍历特性，深刻理解无权图最短路径不变量',
  aliases: ['bfs-basic', 'breadth-first-search-theory'],
  card1Title: 'BFS 层序遍历与状态染色沙盘',
  card2Title: '先进先出队列与层级演进',
  card2Desc: '实时跟踪先进先出队列 (FIFO Queue) 与已访问序列',
  metrics: [
    { id: 'metric-bfs-action', label: '当前动作', color: '#f59e0b' },
    { id: 'metric-bfs-level', label: '当前层级', color: '#22d3ee' },
    { id: 'metric-bfs-queue', label: '队列待办数', color: '#c084fc' },
  ],
  codeLanguages: BFS_THEORY_CODE_LANGUAGES,
  problemHtml: BFS_THEORY_PROBLEM_HTML,
  analysisHtml: BFS_THEORY_ANALYSIS_HTML,
  generateSteps: () => buildBFSSteps(),
  renderCanvas: (container, step) => renderBFSTheoryCanvas(container, step as BFSStep),
  renderCustomMetrics: (container, step) => renderBFSTheoryCustomMetrics(container, step as BFSStep),
});

export { Visualizer as BFSTheoryVisualizer, buildBFSSteps, type BFSStep };
