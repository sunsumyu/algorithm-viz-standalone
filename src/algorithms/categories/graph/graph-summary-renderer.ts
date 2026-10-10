/**
 * 图论总结篇 (Graph Summary) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 步进推演委托至 GraphSummaryStepCompiler
 * 全景星系图谱与指标舱委托至 GraphSummaryCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  GRAPH_SUMMARY_CODE_LANGUAGES,
  GRAPH_SUMMARY_PROBLEM_HTML,
  GRAPH_SUMMARY_ANALYSIS_HTML,
} from './graph-summary-problem-content';
import {
  buildGraphSummarySteps,
  type GSStep,
} from './graph-summary-step-compiler';
import {
  renderGraphSummaryCanvas,
  renderGraphSummaryCustomMetrics,
} from '../../../core/renderers/adapters/graph-summary-canvas-adapter';

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'graph-summary',
  name: '图论总结篇 (Graph Summary)',
  category: 'graph',
  description: '图论算法全景星系图谱：遍历搜索、并查集、最小生成树、拓扑排序与最短路径五大核心领域',
  icon: '🗺️',
  difficulty: 1,
  levelOrder: 30,
  learningGoal: '掌握图论五大核心领域及其经典算法适用边界与选型决策',
  aliases: ['graph-overview', 'graph-cheat-sheet'],
  metrics: [
    { id: 'metric-gs-domain', label: '核心支柱', color: '#38bdf8' },
    { id: 'metric-gs-status', label: '时空尺度', color: '#34d399' },
    { id: 'metric-gs-algos', label: '经典算法', color: '#a855f7' },
  ],
  codeLanguages: GRAPH_SUMMARY_CODE_LANGUAGES,
  problemHtml: GRAPH_SUMMARY_PROBLEM_HTML,
  analysisHtml: GRAPH_SUMMARY_ANALYSIS_HTML,
  generateSteps: () => buildGraphSummarySteps(),
  renderCanvas: (container, step) => renderGraphSummaryCanvas(container, step as GSStep),
  renderCustomMetrics: (container, step) => renderGraphSummaryCustomMetrics(container, step as GSStep),
});

export { Visualizer as GraphSummaryVisualizer, buildGraphSummarySteps, type GSStep };
