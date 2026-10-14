/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与双版本长处综合整合规范 (Bi-Version Synthesis)
 * 职责：声明式元数据配置、Stage 1 系统堆与 Stage 2 反向索引堆演化、委托挂载 (LOC < 150)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  NETWORK_DELAY_CODE_LANGUAGES,
  NETWORK_DELAY_PROBLEM_HTML,
  NETWORK_DELAY_ANALYSIS_HTML,
} from './network-delay-time-problem-content';
import { DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES } from './dijkstra-index-heap-problem-content';
import {
  traceNetworkDelay,
  buildNetworkDelaySteps,
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
    { label: '3 节点链状广播', values: { 'input-preset': 'line_chain' } },
    { label: '不可达孤立盲区特判 (-1)', values: { 'input-preset': 'unreachable_3node' } },
  ],
  problemHtml: NETWORK_DELAY_PROBLEM_HTML,
  analysisHtml: NETWORK_DELAY_ANALYSIS_HTML,
  hasDeductionTree: true,
  aliases: ['network-delay-time-064', 'leetcode-743', 'class064-code01', 'class064-code02', 'class064-network-delay'],
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 系统堆优化 (PriorityQueue 惰性过滤)',
      shortName: '系统小根堆',
      num: 1,
      badge: { mode: '系统优先队列 · visited 数组', complexity: 'O(E log V) · O(V + E)' },
      card1Title: '📡 网络拓扑与信号波前广播舱',
      card2Title: '📊 网络状态监视器 (distance[], visited[], PQ 优先队列)',
      card2Desc: '展示从源点 k 出发 Dijkstra 信号广播向外扩散、松弛各节点到达时间与全网收齐时间 max(dist[i])',
      legend: [
        { label: '📡 广播发射源点 (k)', state: 'secondary' },
        { label: '✔ 信号已接收锁定', state: 'discovered' },
        { label: '⚡ 当前波前扩散点', color: '#f59e0b' },
        { label: '❌ 信号不可达孤立点', state: 'swapping' },
      ],
      metrics: [
        { id: 'metric-delay-cur', label: '当前扩散节点', color: '#f59e0b' },
        { id: 'metric-delay-max', label: '全网延迟时间', color: '#10b981' },
        { id: 'metric-delay-pq', label: '波前优先队列', color: '#38bdf8' },
        { id: 'metric-delay-phase', label: '当前算法阶段', color: '#a855f7' },
      ],
      codeLanguages: NETWORK_DELAY_CODE_LANGUAGES,
      buildSteps: (inputs) => buildNetworkDelaySteps((inputs['input-preset'] || 'reachable_4node') as string),
      renderCanvas: (c, s) => NetworkDelayCanvasAdapter.render(c, s),
      renderCustomMetrics: (c, s) => NetworkDelayCanvasAdapter.renderMetrics(c, s),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 反向索引堆优化 (where[] 映射与原地 decreaseKey)',
      shortName: '反向索引堆',
      num: 2,
      badge: { mode: '反向索引映射 where[] · 原地 decreaseKey', complexity: 'O((V + E) log V) · O(V)' },
      card1Title: '🏔️ 最短路拓扑网络与索引堆沙盘',
      card2Title: '📊 反向索引堆监视器 (where, distance, heap)',
      card2Desc: '展示反向索引表 where[u] 三态映射 (-1 未入堆, >=0 堆中位置, -2 已锁定) 与 decreaseKey 原地更新',
      legend: [
        { label: '⚡ 当前堆顶出堆节点', color: '#f59e0b' },
        { label: '✔ 已锁定最短路节点 (where=-2)', state: 'discovered' },
        { label: '📥 处于小根堆中 (where>=0)', state: 'scanning' },
        { label: '⚪ 未入堆节点 (where=-1)', color: '#1e293b' },
      ],
      metrics: [
        { id: 'metric-heap-size', label: '堆内有效节点', color: '#38bdf8' },
        { id: 'metric-settled-count', label: '已锁定节点数', color: '#10b981' },
        { id: 'metric-heap-cur', label: '当前出堆代表元', color: '#f59e0b' },
        { id: 'metric-heap-phase', label: '当前算法阶段', color: '#a855f7' },
      ],
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
  description: '左程云 Class 064 最短路模版：阶段 1 系统堆 Dijkstra 与阶段 2 反向索引堆 decreaseKey 演化对比 (LeetCode 743)',
  icon: '📡',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握经典系统堆与反向索引堆 (IndexMinHeap) 两种 Dijkstra 模板演化、where 数组状态机与波前广播全网覆盖检测',
  aliases: ['network-delay-time-064', 'leetcode-743', 'class064-code01', 'class064-code02', 'class064-network-delay'],
});

export { Visualizer as NetworkDelayTimeVisualizer };
