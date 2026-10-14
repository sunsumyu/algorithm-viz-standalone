/**
 * 反向索引堆优化 Dijkstra (Dijkstra with Index Heap / Decrease-Key) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 100)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
  DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
  DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
} from './dijkstra-index-heap-problem-content';
import {
  buildIndexHeapSteps,
  type IndexHeapStep,
} from './dijkstra-index-heap-step-compiler';
import { DijkstraGraphCanvasAdapter } from '../../../core/renderers/adapters/dijkstra-graph-canvas-adapter';

export { buildIndexHeapSteps, type IndexHeapStep };

const { template, Visualizer } = createDeclarativeVisualizer<IndexHeapStep>({
  id: 'dijkstra-index-heap',
  name: '反向索引堆优化 Dijkstra (Dijkstra Index Heap)',
  viewId: 'algo-dijkstra-index-heap-view',
  category: 'graph',
  icon: '🏔️',
  badge: {
    mode: '反向索引映射 where[] · 原地 decreaseKey',
    complexity: 'O((V + E) log V) · O(V)',
  },
  card1Title: '🏔️ 最短路拓扑网络与索引堆沙盘',
  card2Title: '📊 反向索引堆监视器 (where, distance, heap)',
  card2Desc: '展示反向索引表 where[u] 三态映射 (-1 未入堆, >=0 堆中位置, -2 已锁定) 与 decreaseKey 原地更新',
  legend: [
    { label: '⚡ 当前堆顶出堆节点', color: '#f59e0b' },
    { label: '✔ 已锁定最短路节点 (where=-2)', state: 'discovered' },
    { label: '📥 处于小根堆中 (where>=0)', state: 'scanning' },
    { label: '⚪ 未入堆节点 (where=-1)', color: '#1e293b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典网络 (含多重松弛路径)', value: 'classic_4node' },
        { label: '3 节点三角网络 (含单次松弛更优)', value: 'simple_triangle' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典网络', values: { 'input-preset': 'classic_4node' } },
    { label: '3 节点三角网络', values: { 'input-preset': 'simple_triangle' } },
  ],
  metrics: [
    { id: 'metric-heap-size', label: '堆内有效节点', color: '#38bdf8' },
    { id: 'metric-settled-count', label: '已锁定节点数', color: '#10b981' },
    { id: 'metric-heap-cur', label: '当前出堆代表元', color: '#f59e0b' },
    { id: 'metric-heap-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
  problemHtml: DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
  analysisHtml: DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
  hasDeductionTree: true,
  aliases: [
    'dijkstra-decrease-key',
    'dijkstra-indexed-heap',
    'luogu-p4779',
    'class061-index-heap',
    'class062-index-heap',
    'class064-index-heap',
    'class064-indexed-dijkstra',
    'network-delay-time-index-heap',
  ],
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildIndexHeapSteps(preset);
  },
  renderCanvas: (container, step) => {
    DijkstraGraphCanvasAdapter.renderIndexHeap(container, step);
  },
  renderCustomMetrics: (container, step) => {
    DijkstraGraphCanvasAdapter.renderIndexHeapMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'dijkstra-index-heap',
  name: '反向索引堆优化 Dijkstra (Dijkstra Index Heap)',
  viewId: 'algo-dijkstra-index-heap-view',
  category: 'graph',
  description: '左程云图论核心：反向索引表 where[] 支持 O(log V) 原地 decreaseKey 上浮、消除冗余节点压堆、严格 O((V+E)log V) (Class 061/064)',
  icon: '🏔️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 93,
  learningGoal: '掌握反向索引堆设计、where 数组状态机 (-1/idx/-2) 及 decreaseKey 原地更新机制',
  aliases: [
    'dijkstra-decrease-key',
    'dijkstra-indexed-heap',
    'luogu-p4779',
    'class061-index-heap',
    'class062-index-heap',
    'class064-index-heap',
    'class064-indexed-dijkstra',
    'network-delay-time-index-heap',
  ],
});

export { Visualizer as DijkstraIndexHeapVisualizer };
