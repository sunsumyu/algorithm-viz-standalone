/**
 * 堆优化 Dijkstra (O(E log V)) 领域适配器 (Thin Domain Adapter)
 * 优先队列动态提取、惰性丢弃、邻接边松弛与拓扑高亮 (左程云 class061)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DIJKSTRA_HEAP_PROBLEM_HTML,
  DIJKSTRA_HEAP_ANALYSIS_HTML,
  DIJKSTRA_HEAP_CODE_LANGUAGES,
} from './dijkstra-heap-problem-content';
import {
  buildDJHSteps,
  type DJHStep,
} from './dijkstra-heap-step-compiler';
import { renderDijkstraHeapCanvas } from '../../../core/renderers/adapters/dijkstra-graph-canvas-adapter';

export { buildDJHSteps, type DJHStep };
export { renderDijkstraHeapCanvas };

export const dijkstraHeapVisualizer = registerDeclarativeAlgorithm({
  id: 'dijkstra-heap',
  aliases: ['dijkstra-heap-061', 'dijkstra-pq', 'dijkstra-priority-queue', 'class061-dijkstra-heap'],
  name: 'Dijkstra 堆优化最短路',
  category: 'graph',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 28,
  hasDeductionTree: true,
  description: '左程云算法通关课 Class 061：基于优先队列（小顶堆）与惰性删除的单源最短路算法，时间复杂度 O(E log V)',
  learningGoal: '深刻理解优先队列加速选点、惰性删除冗余标号与稀疏图性能优势',
  inputs: [],
  presets: [
    { label: '默认图 (5 节点)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-extract', label: '堆顶出队 (d, u)', color: '#fbbf24' },
    { id: 'metric-pq-size', label: '优先队列大小', color: '#a855f7' },
    { id: 'metric-relax-count', label: '松弛次数', color: '#10b981' },
    { id: 'metric-dist-info', label: 'dist 距离表', color: '#2563eb' },
  ],
  legend: [
    { label: '堆顶出队节点', state: 'pivot' },
    { label: '惰性丢弃', state: 'swapping' },
    { label: '松弛目标', state: 'discovered' },
    { label: '在堆中', state: 'comparing' },
  ],
  codeLanguages: DIJKSTRA_HEAP_CODE_LANGUAGES,
  problemHtml: DIJKSTRA_HEAP_PROBLEM_HTML,
  analysisHtml: DIJKSTRA_HEAP_ANALYSIS_HTML,
  generateSteps: () => buildDJHSteps(),
  renderCanvas: (container, step) => renderDijkstraHeapCanvas(container, step as DJHStep),
});
