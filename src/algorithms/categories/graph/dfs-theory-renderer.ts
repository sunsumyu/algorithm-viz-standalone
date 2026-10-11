/**
 * 深度优先搜索理论基础 (DFS Theory) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 步进推演委托至 DFSTheoryStepCompiler
 * 拓扑沙盘与指标舱委托至 DFSTheoryCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DFS_THEORY_CODE_LANGUAGES,
  DFS_THEORY_PROBLEM_HTML,
  DFS_THEORY_ANALYSIS_HTML,
} from './dfs-theory-problem-content';
import {
  buildDFSSteps,
  type DFSStep,
} from './dfs-theory-step-compiler';
import {
  renderDFSTheoryCanvas,
  renderDFSTheoryCustomMetrics,
} from '../../../core/renderers/adapters/dfs-theory-canvas-adapter';

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'dfs-theory',
  name: '深度优先搜索理论基础 (DFS Theory)',
  category: 'graph',
  description: 'DFS 核心原理解析：递归深入、栈帧维护、状态标记与回溯机制 O(V+E)',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握 DFS 递归深入与回溯机制，深刻理解递归调用栈与状态空间遍历',
  aliases: ['dfs-basic', 'depth-first-search-theory'],
  card1Title: 'DFS 递归遍历与状态染色沙盘',
  card2Title: '递归调用栈与访问序列',
  card2Desc: '实时跟踪递归调用栈 (Call Stack) 与已遍历顶点',
  metrics: [
    { id: 'metric-dfs-action', label: '当前动作', color: '#f59e0b' },
    { id: 'metric-dfs-depth', label: '调用栈深度', color: '#c084fc' },
    { id: 'metric-dfs-visited', label: '已访节点数', color: '#34d399' },
  ],
  codeLanguages: DFS_THEORY_CODE_LANGUAGES,
  problemHtml: DFS_THEORY_PROBLEM_HTML,
  analysisHtml: DFS_THEORY_ANALYSIS_HTML,
  generateSteps: () => buildDFSSteps(),
  renderCanvas: (container, step) => renderDFSTheoryCanvas(container, step as DFSStep),
  renderCustomMetrics: (container, step) => renderDFSTheoryCustomMetrics(container, step as DFSStep),
});

export { Visualizer as DFSTheoryVisualizer, buildDFSSteps, type DFSStep };
