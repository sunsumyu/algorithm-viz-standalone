/**
 * K 短路与 A* 启发式搜索 (K-th Shortest Path - A* Algorithm · 洛谷 P2483) 领域适配器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：声明式元数据配置、预设案例定义与委托挂载 (LOC < 130)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  K_SHORTEST_PATH_CODE_LANGUAGES,
  K_SHORTEST_PATH_PROBLEM_HTML,
  K_SHORTEST_PATH_ANALYSIS_HTML,
} from './k-shortest-path-problem-content';
import {
  type KPathStep,
  buildKShortestPathSteps,
} from './k-shortest-path-step-compiler';
import { KShortestPathCanvasAdapter } from '../../../core/renderers/adapters/k-shortest-path-canvas-adapter';

export type { KPathStep };
export { buildKShortestPathSteps };

const { template, Visualizer } = createDeclarativeVisualizer<KPathStep>({
  id: 'k-shortest-path',
  name: 'K 短路与 A* 启发式搜索 (K-th Shortest Path)',
  viewId: 'algo-k-shortest-path-view',
  category: 'graph',
  icon: '🧭',
  badge: {
    mode: '反向 Dijkstra + A* 优先队列',
    complexity: 'O((M + K) log N) · O(N + M)',
  },
  card1Title: '🧭 有向图拓扑、启发估价与路径沙盘',
  card2Title: '📊 A* 状态分析器 (h, countPop, g/h/f 估价)',
  card2Desc: '逐行对齐反向图 Dijkstra 预处理 h(u)、A* 优先队列综合估价 f(u) 升序扩展及终点第 K 次出堆命中判定',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 当前出堆点', color: '#f59e0b' },
    { label: '🎯 目标汇点 T', color: '#ef4444' },
    { label: '🟢 活跃路径边', state: 'comparing' },
    { label: '⚪ 普通有向边', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设查询',
      type: 'select',
      defaultValue: 'classic_4node_k2',
      options: [
        { label: '4 节点经典图 - 第 2 短路 (K=2, ans: 5)', value: 'classic_4node_k2' },
        { label: '4 节点经典图 - 第 3 短路 (K=3, ans: 6)', value: 'classic_4node_k3' },
      ],
    },
  ],
  presets: [
    { label: '第 2 短路 (K=2)', values: { 'input-preset': 'classic_4node_k2' } },
    { label: '第 3 短路 (K=3)', values: { 'input-preset': 'classic_4node_k3' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前出堆状态', color: '#f59e0b' },
    { id: 'metric-f-val', label: '综合估价 f(u)', color: '#38bdf8' },
    { id: 'metric-hit-count', label: '终点出堆进度', color: '#10b981' },
    { id: 'metric-kpath-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: K_SHORTEST_PATH_CODE_LANGUAGES,
  problemHtml: K_SHORTEST_PATH_PROBLEM_HTML,
  analysisHtml: K_SHORTEST_PATH_ANALYSIS_HTML,
  hasDeductionTree: true,
  aliases: [
    'luogu-p2483',
    'luogu-p4467',
    'kth-shortest-path',
  ],
  buildSteps: (inputs) => buildKShortestPathSteps(String(inputs?.['input-preset'] || 'classic_4node_k2')),
  renderCanvas: (container, step) => KShortestPathCanvasAdapter.render(container, step),
  renderCustomMetrics: (container, step) => {
    const indices = [1, 2, 3, 4];
    const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = val === 999 ? '∞' : val;
          const bg = isActive ? '#fef08a' : '#1e293b';
          const textCol = isActive ? '#854d0e' : '#e2e8f0';
          const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';
          return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:32px;height:30px;background:${bg};border:${border};border-radius:4px;color:${textCol};font-family:monospace;font-size:10px;font-weight:700;"><span style="font-size:7.5px;color:#64748b;line-height:1;">[${idx}]</span><span style="line-height:1.1;">${displayVal}</span></div>`;
        })
        .join('');
      return `<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:11px;font-weight:700;width:110px;color:${color};">${name}:</span><div style="display:flex;gap:4px;">${cells}</div></div>`;
    };

    const hRow = renderRow('h[] (反向最短路)', step.hArray, 'h', '#38bdf8');
    const countRow = renderRow('countPop[] (出堆数)', step.countPopArray, 'countPop', '#f59e0b');
    const pathsStr = step.foundPaths.length > 0
      ? step.foundPaths.map((p, i) => `#${i + 1}: ${p.path.join('➔')} (长${p.len})`).join(' | ')
      : '尚未到达终点';

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;font-size:11px;color:#374151;padding:2px 0;">
        <div style="display:flex;flex-direction:column;gap:4px;background:#f8fafc;padding:8px;border-radius:6px;border:1px solid #e2e8f0;">
          ${hRow}
          ${countRow}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px dashed #cbd5e1;padding-top:4px;">
            <span style="color:#10b981;font-size:10px;font-weight:700;">已探明路径:</span>
            <strong style="color:#10b981;font-family:monospace;font-size:10px;">${pathsStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'k-shortest-path',
  name: 'K 短路与 A* 启发式搜索 (K-th Shortest Path)',
  viewId: 'algo-k-shortest-path-view',
  category: 'graph',
  description: '进阶搜索经典：反向图 Dijkstra 预处理估价 h(u)、正向 A* 优先队列综合估价 f(u) 启发式搜索 (洛谷 P2483)',
  icon: '🧭',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 78,
  learningGoal: '掌握 K 短路问题建模、反向图最短路估价函数设计以及 A* 算法第 K 次出堆最优性定理',
  aliases: [
    'luogu-p2483',
    'luogu-p4467',
    'kth-shortest-path',
  ],
});

export { Visualizer as KShortestPathVisualizer };
