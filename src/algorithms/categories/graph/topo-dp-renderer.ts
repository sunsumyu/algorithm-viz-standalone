/**
 * 拓扑排序与 DAG 动态规划 (Topological DP - 最长路与关键路径) — 声明式 Thin Domain Adapter 架构
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：DAG 无后效性、拓扑序线性递推 dp[v] = max(dp[v], dp[u] + w)、工程关键路径 CPM
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TOPO_DP_CODE_LANGUAGES,
  TOPO_DP_PROBLEM_HTML,
  TOPO_DP_ANALYSIS_HTML,
} from './topo-dp-problem-content';
import {
  type TopoDPStep,
  buildTopoDPSteps,
} from './topo-dp-step-compiler';
import {
  TopoDPCanvasAdapter,
  renderTopoDPCanvas,
} from '../../../core/renderers/adapters/topo-dp-canvas-adapter';

export type { TopoDPStep };
export { buildTopoDPSteps, renderTopoDPCanvas };

const { template, Visualizer } = registerDeclarativeAlgorithm<TopoDPStep>({
  id: 'topo-dp',
  aliases: ['parallel-courses-iii', 'leetcode-2050', 'class060-code03', 'topo-dp-cpm'],
  name: '拓扑排序与动态规划 (Topological DP)',
  category: 'graph',
  icon: '📈',
  difficulty: 3,
  levelOrder: 60,
  hasDeductionTree: true,
  description: '经典 DAG 动态规划：拓扑排序保证无后效性、dp[v] = max(dp[v], dp[u] + w) 递推最长路 (洛谷 P4017 / LeetCode 2050)',
  learningGoal: '掌握 DAG 拓扑排序消除后效性机理、有向无环图最长路与关键路径算法 (CPM)',
  inputs: [
    {
      id: 'input-preset',
      label: '预设 DAG 网络结构',
      type: 'select',
      defaultValue: 'classic_5node',
      options: [
        { label: '5 节点工程网络 (关键路径 1->2->4->5，长度 9)', value: 'classic_5node' },
        { label: '4 节点经典网络 (关键路径 1->2->4，长度 7)', value: 'simple_4node' },
      ],
    },
  ],
  presets: [
    { label: '5 节点工程网络', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点经典网络', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-topodp-cur', label: '当前拓扑节点', color: '#f59e0b' },
    { id: 'metric-topodp-max', label: '当前最长路径', color: '#10b981' },
    { id: 'metric-topo-queue', label: '当前拓扑就绪队列', color: '#38bdf8' },
    { id: 'metric-topodp-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  legend: [
    { label: '⚡ 当前出队拓扑节点', color: '#f59e0b' },
    { label: '🏆 最长关键路径节点/边', state: 'discovered' },
    { label: '📥 队列中待处理', state: 'scanning' },
  ],
  codeLanguages: TOPO_DP_CODE_LANGUAGES,
  problemHtml: TOPO_DP_PROBLEM_HTML,
  analysisHtml: TOPO_DP_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'classic_5node') as string;
    return buildTopoDPSteps(preset);
  },
  renderCanvas: (container, step) => TopoDPCanvasAdapter.render(container, step as TopoDPStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as TopoDPStep;
    const is5Node = Object.keys(step.dpDist).length === 5;
    const n = is5Node ? 5 : 4;
    const indices = Array.from({ length: n }, (_, i) => i + 1);

    const renderRow = (name: string, arr: number[], color: string) => {
      const cells = indices.map((idx) => {
        const val = arr[idx] ?? 0;
        return `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:32px; height:28px; background:#ffffff; border:1px solid #cbd5e1; border-radius:4px; font-family:monospace; font-size:10.5px; font-weight:700;">
            <span style="font-size:7.5px; color:#64748b; line-height:1;">N[${idx}]</span>
            <span style="line-height:1.1; color:#0f172a;">${val}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-family:monospace; font-size:10.5px; font-weight:700; width:110px; color:${color};">${name}:</span>
          <div style="display:flex; gap:3px;">${cells}</div>
        </div>
      `;
    };

    const critPathHtml = step.criticalPath && step.criticalPath.length > 0
      ? step.criticalPath.map((u, idx) => `<span style="background:#dcfce7; border:1px solid #86efac; border-radius:4px; padding:1px 6px; font-size:10.5px; color:#15803d; font-family:monospace; font-weight:700;">${idx === 0 ? '' : '➔ '}N${u}</span>`).join(' ')
      : '<span style="font-size:10.5px; color:#94a3b8;">推演计算中...</span>';

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px; padding:4px 0;">
        <div style="display:flex; flex-direction:column; gap:4px; background:#f8fafc; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
          ${renderRow('dp[] (最长路)', step.dpArray, '#10b981')}
          ${renderRow('inDegree[]', step.inDegreeArray, '#f59e0b')}
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px; border-top:1px dashed #e2e8f0; padding-top:4px;">
            <span style="color:#0284c7; font-size:10.5px; font-weight:700;">关键路径 CPM:</span>
            <div style="display:flex; gap:3px; align-items:center;">${critPathHtml}</div>
          </div>
        </div>
      </div>
    `;
  },
});

export const topoDPVisualizer = Visualizer;
export { Visualizer as TopoDPVisualizer };
