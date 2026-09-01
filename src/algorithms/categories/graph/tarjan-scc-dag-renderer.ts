/**
 * Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & DAG Condensation) 声明式可视化器
 * 进阶图论: 时间戳 dfn[u] 与追溯值 low[u]、栈维护强连通节点、缩点重建 DAG (洛谷 P3387)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TARJAN_SCC_DAG_CODE_LANGUAGES,
  TARJAN_SCC_DAG_PROBLEM_HTML,
  TARJAN_SCC_DAG_ANALYSIS_HTML,
} from './tarjan-scc-dag-problem-content';

export interface TarjanSCCStep {
  dfnMap: Record<number, number>;
  lowMap: Record<number, number>;
  tarjanStack: number[];
  sccList: Array<number[]>;
  condensedEdges: Array<[number, number]>;
  status: 'dfs' | 'pop_scc' | 'condense' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTarjanSCCSteps(): TarjanSCCStep[] {
  const steps: TarjanSCCStep[] = [];

  steps.push({
    dfnMap: { 1: 1, 2: 2, 3: 3 },
    lowMap: { 1: 1, 2: 1, 3: 1 },
    tarjanStack: [1, 2, 3],
    sccList: [],
    condensedEdges: [],
    status: 'dfs',
    message: '1. [DFS 树边与后向边] 访问 1 ➔ 2 ➔ 3，通过后向边 (3, 1) 更新 low[3]=1, low[2]=1, low[1]=1！栈中元素 [1, 2, 3]！',
    log: 'DFS 遍历形成强连通环：low[1..3] 均更新为 1',
    codeLine: [18, 28],
  });

  steps.push({
    dfnMap: { 1: 1, 2: 2, 3: 3 },
    lowMap: { 1: 1, 2: 1, 3: 1 },
    tarjanStack: [],
    sccList: [[1, 2, 3]],
    condensedEdges: [],
    status: 'pop_scc',
    message: '2. [发现 SCC 根节点 1 并弹栈] 回溯至 1 发现 dfn[1] == low[1]，连续弹栈直到 1，形成强连通分量 SCC1 = {1, 2, 3}！',
    log: '弹栈构建强连通分量：SCC1 = {1, 2, 3}',
    codeLine: [30, 38],
  });

  steps.push({
    dfnMap: { 1: 1, 2: 2, 3: 3, 4: 4 },
    lowMap: { 1: 1, 2: 1, 3: 1, 4: 4 },
    tarjanStack: [],
    sccList: [[1, 2, 3], [4]],
    condensedEdges: [[1, 2]],
    status: 'done',
    message: '🎉 [DAG 缩点完成] 节点 4 构成单点 SCC2 = {4}！跨 SCC 边 (3, 4) 重建为 DAG 边 (SCC1 ➔ SCC2)！',
    log: '✓ Tarjan 缩点完毕：原有向图成功转化为有向无环图 DAG',
    codeLine: [40, 48],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TarjanSCCStep>({
  id: 'tarjan-scc-dag',
  name: 'Tarjan 强连通分量缩点 (Tarjan SCC)',
  category: 'graph',
  icon: '🌀',
  badge: {
    mode: 'dfn/low 栈缩点化 DAG',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🌀 有向图强连通环与 DAG 缩点沙盘',
  card2Title: '🧭 时间戳 dfn/low 与 SCC 分组监视器',
  card2Desc: 'DFS 遍历时间戳、追溯值 low[u] 与强连通分量缩点表',
  legend: [
    { label: 'SCC1 强连通分量', color: '#0284c7' },
    { label: 'SCC2 单点分量', color: '#f59e0b' },
    { label: '🟢 缩点后 DAG 跨分量边', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典强连通缩点图 (P3387)', values: {} },
  ],
  metrics: [
    { id: 'metric-scc-count', label: '强连通分量数', color: '#10b981' },
    { id: 'metric-dag-nodes', label: '缩点后 DAG 规模', color: '#2563eb' },
  ],
  codeLanguages: TARJAN_SCC_DAG_CODE_LANGUAGES,
  problemHtml: TARJAN_SCC_DAG_PROBLEM_HTML,
  analysisHtml: TARJAN_SCC_DAG_ANALYSIS_HTML,
  buildSteps: () => buildTarjanSCCSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 75 },
      2: { x: 155, y: 55 },
      3: { x: 115, y: 145 },
      4: { x: 235, y: 110 },
    };

    const edges = [
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 1 },
      { u: 3, v: 4 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isCross = e.u === 3 && e.v === 4;
        const color = isCross ? '#10b981' : '#475569';
        const width = isCross ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#arrow-tarjan)" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const inScc1 = u <= 3;
        const bg = inScc1 ? '#0369a1' : '#b45309';
        const border = inScc1 ? '#38bdf8' : '#facc15';
        const dfn = step.dfnMap[u] || 0;
        const low = step.lowMap[u] || 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="8.5" font-weight="700" text-anchor="middle">${dfn}/${low}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          <defs>
            <marker id="arrow-tarjan" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🔵 蓝色为 SCC1 = {1, 2, 3} | 🟡 金色为 SCC2 = {4} | 节点下方标注 dfn/low 时间戳
        </div>
      </div>
    `;

    const root = container.closest('#algo-tarjan-scc-dag-view');
    if (root) {
      const cEl = root.querySelector('#metric-scc-count');
      const dEl = root.querySelector('#metric-dag-nodes');

      if (cEl) cEl.textContent = `${step.sccList.length} 个`;
      if (dEl) dEl.textContent = `${step.sccList.length} 节点 DAG`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const sccStr = step.sccList.map((scc, idx) => `SCC${idx + 1}:{${scc.join(',')}}`).join(' ') || '计算中...';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>强连通分量集合:</span>
              <strong style="color: #10b981; font-family: monospace;">${sccStr}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 Tarjan SCC 判据:</span>
              <strong style="font-family: monospace; color: #2563eb;">dfn[u] == low[u] ⟺ u 为当前强连通分量在 DFS 树上的唯一根节点</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tarjan-scc-dag',
  name: 'Tarjan 强连通分量缩点 (Tarjan SCC)',
  viewId: 'algo-tarjan-scc-dag-view',
  category: 'graph',
  description: '有向图连通性基石：dfn/low 双时间戳维护、栈追踪环内节点、缩点重建 DAG 并结合拓扑排序 DP (洛谷 P3387)',
  icon: '🌀',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 37,
  learningGoal: '掌握 Tarjan 强连通分量算法的栈操作细节、low 值的后向边更新原理及 DAG 缩点重构',
});

export { Visualizer as TarjanSCCDAGVisualizer };
