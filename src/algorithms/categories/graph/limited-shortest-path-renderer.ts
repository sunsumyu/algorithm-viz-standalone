/**
 * K 站中转内最便宜的航班 (LC 787)
 * 4-Card 标准现代架构可视化器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  LIMITED_SHORTEST_PATH_PROBLEM_HTML,
  LIMITED_SHORTEST_PATH_ANALYSIS_HTML,
  LIMITED_SHORTEST_PATH_CODE_LANGUAGES,
} from './limited-shortest-path-problem-content';

export interface LSPStep extends StepBase {
  dist: number[];
  prevDist: number[];
  round: number;
  maxK: number;
  currentEdge: { u: number; v: number; w: number } | null;
  relaxedEdge: boolean;
  relaxCount: number;
  source: number;
  target: number;
  action: 'init' | 'relax-success' | 'relax-skip' | 'round-done' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export const LSP_EDGES = [
  { u: 0, v: 1, w: 3 },
  { u: 0, v: 2, w: 5 },
  { u: 1, v: 2, w: 1 },
  { u: 1, v: 3, w: 6 },
  { u: 2, v: 3, w: 2 },
  { u: 2, v: 4, w: 7 },
  { u: 3, v: 4, w: 2 },
];

export const LSP_NODES = [0, 1, 2, 3, 4];
export const LSP_NODE_POS = [
  { x: 60, y: 130 },
  { x: 180, y: 60 },
  { x: 180, y: 200 },
  { x: 320, y: 60 },
  { x: 400, y: 150 },
];

export const LSP_SOURCE = 0;
export const LSP_TARGET = 4;
export const LSP_K = 2; // 最多 2 次中转 => 最多 3 条边

export function buildLSPSteps(): LSPStep[] {
  const steps: LSPStep[] = [];
  const n = LSP_NODES.length;
  const INF = 999999;
  let dist = new Array(n).fill(INF);
  dist[LSP_SOURCE] = 0;
  let totalRelax = 0;

  steps.push({
    dist: [...dist],
    prevDist: [...dist],
    round: 0,
    maxK: LSP_K + 1,
    currentEdge: null,
    relaxedEdge: false,
    relaxCount: 0,
    source: LSP_SOURCE,
    target: LSP_TARGET,
    action: 'init',
    statusText: `初始化：起点=${LSP_SOURCE}，终点=${LSP_TARGET}，最多允许中转 ${LSP_K} 次（最多走 ${LSP_K + 1} 条边）。dist[${LSP_SOURCE}]=0，其余=INF。`,
    log: `初始化: src=${LSP_SOURCE}, dst=${LSP_TARGET}, K=${LSP_K}`,
    codeLine: [1, 2, 3, 4],
  });

  for (let round = 1; round <= LSP_K + 1; round++) {
    const clone = [...dist]; // 关键备份

    for (let ei = 0; ei < LSP_EDGES.length; ei++) {
      const e = LSP_EDGES[ei];

      if (clone[e.u] !== INF && clone[e.u] + e.w < dist[e.v]) {
        const oldVal = dist[e.v];
        dist[e.v] = clone[e.u] + e.w;
        totalRelax++;

        steps.push({
          dist: [...dist],
          prevDist: clone,
          round,
          maxK: LSP_K + 1,
          currentEdge: e,
          relaxedEdge: true,
          relaxCount: totalRelax,
          source: LSP_SOURCE,
          target: LSP_TARGET,
          action: 'relax-success',
          statusText: `第 ${round} 轮，航线 (${e.u})->(${e.v}) 价格=${e.w}：clone[${e.u}]+${e.w}=${clone[e.u] + e.w} < ${oldVal === INF ? 'INF' : oldVal}，松弛成功！更新 dist[${e.v}]=${dist[e.v]}。`,
          log: `[第 ${round} 轮] 松弛成功: (${e.u})->(${e.v})，价格更新为 ${dist[e.v]}`,
          codeLine: [9, 10],
        });
      } else {
        const reason = clone[e.u] === INF ? `前驱 dist[${e.u}]=INF` : `${clone[e.u]}+${e.w} >= dist[${e.v}] (${dist[e.v]})`;
        steps.push({
          dist: [...dist],
          prevDist: clone,
          round,
          maxK: LSP_K + 1,
          currentEdge: e,
          relaxedEdge: false,
          relaxCount: totalRelax,
          source: LSP_SOURCE,
          target: LSP_TARGET,
          action: 'relax-skip',
          statusText: `第 ${round} 轮，航线 (${e.u})->(${e.v}) 价格=${e.w}：${reason}，跳过不更新。`,
          log: `[第 ${round} 轮] 航线 (${e.u})->(${e.v}): 无需松弛`,
          codeLine: 8,
        });
      }
    }

    steps.push({
      dist: [...dist],
      prevDist: clone,
      round,
      maxK: LSP_K + 1,
      currentEdge: null,
      relaxedEdge: false,
      relaxCount: totalRelax,
      source: LSP_SOURCE,
      target: LSP_TARGET,
      action: 'round-done',
      statusText: `✓ 第 ${round} 轮松弛迭代完成（已允许最多经过 ${round} 条边）。`,
      log: `✓ 完成第 ${round} 轮松弛，当前终点最低价格 = ${dist[LSP_TARGET] === INF ? 'INF' : dist[LSP_TARGET]}`,
      codeLine: 6,
    });
  }

  const finalCost = dist[LSP_TARGET] === INF ? -1 : dist[LSP_TARGET];
  steps.push({
    dist: [...dist],
    prevDist: [...dist],
    round: LSP_K + 1,
    maxK: LSP_K + 1,
    currentEdge: null,
    relaxedEdge: false,
    relaxCount: totalRelax,
    source: LSP_SOURCE,
    target: LSP_TARGET,
    action: 'done',
    statusText: `🎉 有限最短路算法完成！在最多 ${LSP_K} 站中转内，从城市 ${LSP_SOURCE} 到城市 ${LSP_TARGET} 的最低总价格为 ${finalCost}。`,
    log: `✓ 求解完成: 最低总价格 = ${finalCost}`,
    codeLine: 13,
  });

  return steps;
}

/** 附加指标卡快照（轮次 / 考察边 / 松弛次数 / 终点最低价格） */
function withMetrics(steps: LSPStep[]): LSPStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-lsp-round': `${s.round} / ${s.maxK}`,
      'metric-lsp-edge': s.currentEdge ? `(${s.currentEdge.u} ➔ ${s.currentEdge.v}) [${s.currentEdge.w}]` : '—',
      'metric-lsp-relax': `${s.relaxCount}`,
      'metric-lsp-dst': `${s.dist[s.target] >= 999999 ? 'INF' : s.dist[s.target]}`,
    },
  }));
}

/** 主视觉：航班航线图 SVG（松弛高亮）+ dist 数组芯片条 */
export function renderLimitedShortestPathCanvas(container: HTMLElement, step: LSPStep): void {
  const { dist, currentEdge, relaxedEdge, target } = step;

  let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="lsp-arrow-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
      </marker>
      <marker id="lsp-arrow-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
      </marker>
      <marker id="lsp-arrow-green" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
      </marker>
    </defs>`;

  // 绘制边与权重
  for (const e of LSP_EDGES) {
    const p1 = LSP_NODE_POS[e.u];
    const p2 = LSP_NODE_POS[e.v];
    const isCurrent = currentEdge && currentEdge.u === e.u && currentEdge.v === e.v;

    const stroke = isCurrent ? (relaxedEdge ? '#16a34a' : '#2563eb') : '#cbd5e1';
    const strokeWidth = isCurrent ? 3.5 : 2;
    const marker = isCurrent ? (relaxedEdge ? 'url(#lsp-arrow-green)' : 'url(#lsp-arrow-blue)') : 'url(#lsp-arrow-gray)';

    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2 - 6;

    svgHtml += `
      <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />
      <text x="${mx}" y="${my}" fill="${isCurrent ? '#2563eb' : '#64748b'}" font-size="11" font-weight="700" font-family="JetBrains Mono">${e.w}</text>
    `;
  }

  // 绘制节点
  for (const u of LSP_NODES) {
    const pos = LSP_NODE_POS[u];
    const d = dist[u] >= 999999 ? 'INF' : dist[u];
    const isSrc = u === LSP_SOURCE;
    const isDst = u === target;

    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let textColor = '#0f172a';

    if (currentEdge && (currentEdge.u === u || currentEdge.v === u)) {
      fill = relaxedEdge && currentEdge.v === u ? '#f0fdf4' : '#eff6ff';
      stroke = relaxedEdge && currentEdge.v === u ? '#16a34a' : '#2563eb';
      textColor = relaxedEdge && currentEdge.v === u ? '#15803d' : '#1d4ed8';
    }

    let badge = isSrc ? ' (S)' : isDst ? ' (D)' : '';

    svgHtml += `
      <g>
        <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono">${u}${badge}</text>
        <text x="${pos.x}" y="${pos.y + 32}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#64748b" font-family="JetBrains Mono">d:${d}</text>
      </g>
    `;
  }

  svgHtml += `</svg>`;

  const distChips = LSP_NODES.map((node) => {
    const dVal = dist[node];
    const isTarget = currentEdge && currentEdge.v === node;
    const chipStyle = isTarget
      ? 'display: flex; flex-direction: column; align-items: center; padding: 6px; border-radius: 6px; border: 1px solid #93c5fd; background: #eff6ff;'
      : 'display: flex; flex-direction: column; align-items: center; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc;';
    return `<div style="${chipStyle}">
      <span style="font-size: 10px; color: #64748b; font-family: monospace;">dist[${node}]</span>
      <span style="font-size: 12px; font-family: monospace; font-weight: 700; color: ${dVal >= 999999 ? '#94a3b8' : '#2563eb'};">${dVal >= 999999 ? 'INF' : dVal}</span>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 8px; box-sizing: border-box;">
      <div style="width: 100%;">${svgHtml}</div>
      <div style="display: flex; gap: 8px; justify-content: center; width: 100%;">${distChips}</div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'limited-shortest-path',
  name: '有限最短路 (LC 787)',
  category: 'graph',
  description: 'Bellman-Ford 状态备份松弛：限制最多走 K+1 条边求解最便宜航班价格',
  icon: '✈️',
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握 Bellman-Ford 算法在有限边数约束下的状态备份与松弛过程',
  inputs: [],
  presets: [
    { label: '默认航班图 (K=2)', values: {} },
  ],
  metrics: [
    { id: 'metric-lsp-round', label: '当前轮次', color: '#2563eb' },
    { id: 'metric-lsp-edge', label: '考察航线 (u➔v)', color: '#eab308' },
    { id: 'metric-lsp-relax', label: '松弛次数', color: '#16a34a' },
    { id: 'metric-lsp-dst', label: '终点最低价格', color: '#10b981' },
  ],
  legend: [
    { label: '松弛成功', color: '#16a34a' },
    { label: '正在考察', color: '#2563eb' },
    { label: '普通航线', color: '#cbd5e1' },
  ],
  codeLanguages: LIMITED_SHORTEST_PATH_CODE_LANGUAGES,
  problemHtml: LIMITED_SHORTEST_PATH_PROBLEM_HTML,
  analysisHtml: LIMITED_SHORTEST_PATH_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildLSPSteps()),
  renderCanvas: (container, step) => renderLimitedShortestPathCanvas(container, step as LSPStep),
});
