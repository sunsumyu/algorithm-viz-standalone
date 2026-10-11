/**
 * 图论理论基础 (Graph Theory) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 步进推演委托至 GraphTheoryStepCompiler
 * 拓扑沙盘与双视舱委托至 GraphTheoryCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  GRAPH_THEORY_CODE_LANGUAGES,
  GRAPH_THEORY_PROBLEM_HTML,
  GRAPH_THEORY_ANALYSIS_HTML,
} from './graph-theory-problem-content';
import {
  buildGraphTheorySteps,
  type GTStep,
} from './graph-theory-step-compiler';
import {
  renderGraphTheoryCanvas,
  renderGraphTheoryCustomMetrics,
} from '../../../core/renderers/adapters/graph-theory-canvas-adapter';

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'graph-theory',
  name: '图论理论基础 (Graph Theory)',
  category: 'graph',
  description: '图的表示方法：邻接矩阵 vs 邻接表，空间与时间权衡，动态边操作',
  icon: '🕸️',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握图的两种基本表示方法及其适用场景，理解时空效率权衡',
  aliases: ['graph-representation', 'graph-basics'],
  card1Title: '图拓扑结构与连通分量沙盘',
  card2Title: '邻接矩阵与邻接表双重表示看板',
  card2Desc: '对比观察邻接矩阵与邻接表图数据结构及顶点度数',
  metrics: [
    { id: 'metric-gt-type', label: '图结构状态', color: '#38bdf8' },
    { id: 'metric-gt-v', label: '顶点总数 (V)', color: '#34d399' },
    { id: 'metric-gt-e', label: '边总数 (E)', color: '#f59e0b' },
  ],
  codeLanguages: GRAPH_THEORY_CODE_LANGUAGES,
  problemHtml: GRAPH_THEORY_PROBLEM_HTML,
  analysisHtml: GRAPH_THEORY_ANALYSIS_HTML,
  generateSteps: () => buildGraphTheorySteps(),
  renderCanvas: (container, step) => renderGraphTheoryCanvas(container, step as GTStep),
  renderCustomMetrics: (container, step) => renderGraphTheoryCustomMetrics(container, step as GTStep),
});

export { Visualizer as GraphTheoryVisualizer, buildGraphTheorySteps, type GTStep };
