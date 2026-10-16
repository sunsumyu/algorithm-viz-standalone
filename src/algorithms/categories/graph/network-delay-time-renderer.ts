/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与双版本长处综合整合规范 (Bi-Version Synthesis)
 * 职责：声明式元数据配置、Stage 1 系统堆、Stage 2 距离剪枝优化、Stage 3 反向索引堆演化、委托挂载 (LOC < 150)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  NETWORK_DELAY_CODE_LANGUAGES,
  NETWORK_DELAY_PRUNED_CODE_LANGUAGES,
  NETWORK_DELAY_PROBLEM_HTML,
  NETWORK_DELAY_ANALYSIS_HTML,
  DELAY_LEGEND,
  DELAY_METRICS,
  INDEX_HEAP_LEGEND,
  INDEX_HEAP_METRICS,
} from './network-delay-time-problem-content';
import { DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES } from './dijkstra-index-heap-problem-content';
import {
  traceNetworkDelay,
  buildNetworkDelaySteps,
  buildNetworkDelayPrunedSteps,
  type NetworkDelayStep,
  type NetworkDelayStepVars,
} from './network-delay-time-step-compiler';
import {
  buildIndexHeapSteps,
  type IndexHeapStep,
} from './dijkstra-index-heap-step-compiler';
import { NetworkDelayCanvasAdapter } from '../../../core/renderers/adapters/network-delay-canvas-adapter';
import { DijkstraGraphCanvasAdapter } from '../../../core/renderers/adapters/dijkstra-graph-canvas-adapter';

export {
  traceNetworkDelay,
  buildNetworkDelaySteps,
  buildNetworkDelayPrunedSteps,
  type NetworkDelayStep,
  type NetworkDelayStepVars,
};

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  icon: '📡',
  badge: {
    mode: '单源最短路 Dijkstra · 波前广播模型',
    complexity: 'O(E log V) · O(V + E)',
  },
  presets: [
    { label: '4 节点经典全连通 (LeetCode 743)', values: { 'input-preset': 'reachable_4node' } },
    { label: '4 节点多路径剪枝 (触发 d > dist[u])', values: { 'input-preset': 'shortcut_prune' } },
    { label: '3 节点链状广播', values: { 'input-preset': 'line_chain' } },
    { label: '不可达孤立盲区特判 (-1)', values: { 'input-preset': 'unreachable_3node' } },
  ],
  problemHtml: NETWORK_DELAY_PROBLEM_HTML,
  analysisHtml: NETWORK_DELAY_ANALYSIS_HTML,
  hasDeductionTree: true,
  aliases: ['network-delay-time-064', 'leetcode-743', 'class064-code01', 'class064-network-delay'],
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 系统堆优化 (visited 标记过滤)',
      shortName: '系统小根堆',
      num: 1,
      badge: { mode: '系统优先队列 · visited 数组', complexity: 'O(E log V) · O(V + E)' },
      card1Title: '📡 网络拓扑与信号波前广播舱',
      card2Title: '📊 网络状态监视器 (distance[], visited[], PQ 优先队列)',
      card2Desc: '展示从源点 k 出发 Dijkstra 信号广播向外扩散、松弛各节点到达时间与全网收齐时间 max(dist[i])',
      legend: DELAY_LEGEND,
      metrics: DELAY_METRICS,
      codeLanguages: NETWORK_DELAY_CODE_LANGUAGES,
      buildSteps: (inputs) => buildNetworkDelaySteps((inputs['input-preset'] || 'reachable_4node') as string),
      renderCanvas: (c, s) => NetworkDelayCanvasAdapter.render(c, s),
      renderCustomMetrics: (c, s) => NetworkDelayCanvasAdapter.renderMetrics(c, s),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 距离剪枝优化 (d > dist[u] 替代 visited)',
      shortName: '距离剪枝优化',
      num: 2,
      badge: { mode: '系统优先队列 · 距离剪枝', complexity: 'O(E log V) · O(V + E)' },
      card1Title: '📡 网络拓扑与信号波前广播舱',
      card2Title: '📊 网络状态监视器 (distance[], PQ 优先队列 · 无 visited)',
      card2Desc: '出堆时通过 d > distance[u] 剪枝跳过失效记录，无需维护 visited[] 布尔数组',
      legend: DELAY_LEGEND,
      metrics: DELAY_METRICS,
      codeLanguages: NETWORK_DELAY_PRUNED_CODE_LANGUAGES,
      buildSteps: (inputs) => buildNetworkDelayPrunedSteps((inputs['input-preset'] || 'reachable_4node') as string),
      renderCanvas: (c, s) => NetworkDelayCanvasAdapter.render(c, s),
      renderCustomMetrics: (c, s) => NetworkDelayCanvasAdapter.renderMetrics(c, s),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 反向索引堆优化 (where[] 映射与原地 decreaseKey)',
      shortName: '反向索引堆',
      num: 3,
      badge: { mode: '反向索引映射 where[] · 原地 decreaseKey', complexity: 'O((V + E) log V) · O(V)' },
      card1Title: '🏔️ 最短路拓扑网络与索引堆沙盘',
      card2Title: '📊 反向索引堆监视器 (where, distance, heap)',
      card2Desc: '展示反向索引表 where[u] 三态映射与 decreaseKey 原地更新',
      legend: INDEX_HEAP_LEGEND,
      metrics: INDEX_HEAP_METRICS,
      codeLanguages: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
      buildSteps: (inputs) => {
        const p = (inputs['input-preset'] || 'reachable_4node') as string;
        const mapped = (p === 'line_chain' || p === 'unreachable_3node') ? 'simple_triangle' : 'classic_4node';
        return buildIndexHeapSteps(mapped);
      },
      renderCanvas: (c, s) => DijkstraGraphCanvasAdapter.renderIndexHeap(c, s as IndexHeapStep),
      renderCustomMetrics: (c, s) => DijkstraGraphCanvasAdapter.renderIndexHeapMetrics(c, s as IndexHeapStep),
    },
  ],
});

registerAlgorithm({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  description: '左程云 Class 064 最短路模版：阶段 1 系统堆基础版、阶段 2 距离剪枝优化版与阶段 3 反向索引堆演化 (LeetCode 743)',
  icon: '📡',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握经典系统堆、距离剪枝 (d > dist[u]) 与反向索引堆 (IndexMinHeap) 三种 Dijkstra 演化、状态机与全网波前广播',
  aliases: ['network-delay-time-064', 'leetcode-743', 'class064-code01', 'class064-network-delay'],
});

export { Visualizer as NetworkDelayTimeVisualizer };
