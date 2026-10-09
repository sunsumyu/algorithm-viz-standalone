/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 100)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  NETWORK_DELAY_CODE_LANGUAGES,
  NETWORK_DELAY_PROBLEM_HTML,
  NETWORK_DELAY_ANALYSIS_HTML,
} from './network-delay-time-problem-content';
import {
  traceNetworkDelay,
  buildNetworkDelaySteps,
  type NetworkDelayStep,
  type NetworkDelayStepVars,
} from './network-delay-time-step-compiler';
import { NetworkDelayCanvasAdapter } from '../../../core/renderers/adapters/network-delay-canvas-adapter';

export {
  traceNetworkDelay,
  buildNetworkDelaySteps,
  type NetworkDelayStep,
  type NetworkDelayStepVars,
};

const { template, Visualizer } = createDeclarativeVisualizer<NetworkDelayStep>({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  icon: '📡',
  badge: {
    mode: '单源最短路 Dijkstra · 波前广播模型',
    complexity: 'O(E log V) · O(V + E)',
  },
  card1Title: '📡 网络拓扑与信号波前广播舱',
  card2Title: '📊 网络状态监视器 (distance[], visited[], PQ 优先队列)',
  card2Desc: '展示从源点 k 出发 Dijkstra 信号广播向外扩散、松弛各节点到达时间与全网收齐时间 max(dist[i])',
  legend: [
    { label: '📡 广播发射源点 (k)', state: 'secondary' },
    { label: '✔ 信号已接收锁定', state: 'discovered' },
    { label: '⚡ 当前波前扩散点', color: '#f59e0b' },
    { label: '❌ 信号不可达孤立点', state: 'swapping' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设网络连通模式',
      type: 'select',
      defaultValue: 'reachable_4node',
      options: [
        { label: '4 节点全连通广播 (源点 2，全覆盖延迟 2 ms)', value: 'reachable_4node' },
        { label: '3 节点含孤立盲区 (源点 1，节点 3 不可达返回 -1)', value: 'unreachable_3node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点全连通', values: { 'input-preset': 'reachable_4node' } },
    { label: '3 节点孤立盲区', values: { 'input-preset': 'unreachable_3node' } },
  ],
  metrics: [
    { id: 'metric-delay-cur', label: '当前扩散节点', color: '#f59e0b' },
    { id: 'metric-delay-max', label: '全网延迟时间', color: '#10b981' },
    { id: 'metric-delay-pq', label: '波前优先队列', color: '#38bdf8' },
    { id: 'metric-delay-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: NETWORK_DELAY_CODE_LANGUAGES,
  problemHtml: NETWORK_DELAY_PROBLEM_HTML,
  analysisHtml: NETWORK_DELAY_ANALYSIS_HTML,
  hasDeductionTree: true,
  aliases: [
    'network-delay-time-064',
    'leetcode-743',
    'class064-code01',
    'class064-network-delay',
  ],
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'reachable_4node') as string;
    return buildNetworkDelaySteps(preset === 'reachable_4node');
  },
  renderCanvas: (container, step) => {
    NetworkDelayCanvasAdapter.render(container, step);
  },
  renderCustomMetrics: (container, step) => {
    const n = step.distList.length - 1;
    const indices = Array.from({ length: n }, (_, i) => i + 1);

    const renderRow = (name: string, arr: any[], activeName: string, color: string, formatVal: (v: any) => string) => {
      const cells = indices.map((idx) => {
        const val = arr[idx];
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const displayVal = formatVal(val);
        const bg = isActive ? '#fef3c7' : '#ffffff';
        const textCol = isActive ? '#b45309' : '#0f172a';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:34px;height:32px;background:${bg};border:${border};border-radius:4px;color:${textCol};font-family:monospace;font-size:11px;font-weight:700;"><span style="font-size:8px;color:#64748b;line-height:1;">N[${idx}]</span><span style="line-height:1.1;">${displayVal}</span></div>`;
      }).join('');
      return `<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:11px;font-weight:700;width:135px;color:${color};">${name}:</span><div style="display:flex;gap:4px;">${cells}</div></div>`;
    };

    const distRow = renderRow('distance[] (到达时间)', step.distList, 'dist', '#38bdf8', (v) => v === Infinity ? '∞' : `${v}`);
    const visRow = renderRow('visited[] (已锁定)', step.visitedList, 'visited', '#10b981', (v) => v ? 'T' : 'F');
    const pqStr = step.pqSnapshot.length > 0 ? step.pqSnapshot.map((x) => `(N${x.u}, ${x.d}ms)`).join(' ➔ ') : '空';

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;font-size:11px;color:#374151;padding:4px 8px;box-sizing:border-box;">
        <div style="display:flex;flex-direction:column;gap:6px;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
          ${distRow}${visRow}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px dashed #cbd5e1;padding-top:4px;">
            <span style="color:#a855f7;font-size:10.5px;font-weight:700;">波前小根堆:</span>
            <strong style="color:#a855f7;font-family:monospace;font-size:11px;">[ ${pqStr} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  description: '左程云 Class 064 最短路模版：从源点 k 出发跑堆优化 Dijkstra、信号全网广播、全网覆盖时间 max(dist[1..n]) (LeetCode 743)',
  icon: '📡',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握经典堆优化 Dijkstra 模板实现、单源最短路波前广播思想与不可达全网检测',
  aliases: [
    'network-delay-time-064',
    'leetcode-743',
    'class064-code01',
    'class064-network-delay',
  ],
});

export { Visualizer as NetworkDelayTimeVisualizer };
