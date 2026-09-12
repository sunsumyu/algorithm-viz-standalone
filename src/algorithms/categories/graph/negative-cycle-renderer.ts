/**
 * Bellman-Ford 负权回路检测
 * 4-Card 标准现代架构可视化器 (左程云 class061 / 洛谷 P3385)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点初始化、V-1轮常规松弛外层、全边扫描、松弛条件更新、第V轮额外检测、负环捕获分支均发射独立Step）、四语言行号映射
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  NEGATIVE_CYCLE_PROBLEM_HTML,
  NEGATIVE_CYCLE_ANALYSIS_HTML,
  NEGATIVE_CYCLE_CODE_LANGUAGES,
} from './negative-cycle-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface NCStep extends StepBase {
  dist: number[];
  round: number;
  maxRounds: number;
  currentEdge: { u: number; v: number; w: number } | null;
  relaxedEdge: boolean;
  relaxCount: number;
  hasCycle: boolean;
  cycleEdges: { u: number; v: number; w: number }[];
  action: 'init' | 'relax-success' | 'relax-skip' | 'round-done' | 'cycle-detected' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const NC_EDGES = [
  { u: 0, v: 1, w: 2 },
  { u: 1, v: 2, w: -3 },
  { u: 2, v: 3, w: 1 },
  { u: 3, v: 1, w: -1 },
  { u: 0, v: 3, w: 5 },
  { u: 3, v: 4, w: 2 },
];

export const NC_NODES = [0, 1, 2, 3, 4];
export const NC_NODE_POS = [
  { x: 60, y: 130 },
  { x: 180, y: 60 },
  { x: 320, y: 60 },
  { x: 250, y: 190 },
  { x: 400, y: 150 },
];

export function buildNCSteps(): NCStep[] {
  const steps: NCStep[] = [];
  const n = NC_NODES.length;
  const INF = 999999;

  // 精准 13 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 3, java: 2, python: 2, javascript: 1 },
    initDist: { cpp: 5, java: 4, python: 3, javascript: 3 },
    setSrc: { cpp: 6, java: 5, python: 4, javascript: 4 },
    forRound: { cpp: 7, java: 7, python: 5, javascript: 5 },
    forEdge: { cpp: 8, java: 8, python: 6, javascript: 6 },
    unpackEdge: { cpp: 9, java: 9, python: 6, javascript: 6 },
    checkRelax: { cpp: 10, java: 10, python: 7, javascript: 7 },
    updateDist: { cpp: 11, java: 11, python: 8, javascript: 8 },
    forCheckRound: { cpp: 15, java: 14, python: 9, javascript: 12 },
    unpackCheckEdge: { cpp: 16, java: 15, python: 9, javascript: 12 },
    checkCycleRelax: { cpp: 17, java: 16, python: 10, javascript: 13 },
    returnTrue: { cpp: 18, java: 17, python: 11, javascript: 14 },
    returnFalse: { cpp: 21, java: 20, python: 12, javascript: 17 },
  };

  const dist = new Array(n).fill(INF);
  dist[0] = 0;
  let totalRelax = 0;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'relax-success' | 'relax-skip' | 'round-done' | 'cycle-detected' | 'done',
    statusText: string,
    log: string,
    round: number,
    currentEdge: { u: number; v: number; w: number } | null = null,
    relaxedEdge: boolean = false,
    hasCycle: boolean = false,
    cycleEdges: { u: number; v: number; w: number }[] = []
  ): void {
    const dStr = dist.map((d, idx) => `${idx}:${d >= INF ? '∞' : d}`).join(', ');

    steps.push({
      dist: [...dist],
      round,
      maxRounds: n,
      currentEdge,
      relaxedEdge,
      relaxCount: totalRelax,
      hasCycle,
      cycleEdges,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-nc-round': `${round} / ${n}`,
        'metric-nc-edge': currentEdge ? `(${currentEdge.u}➔${currentEdge.v}, w=${currentEdge.w})` : '—',
        'metric-nc-cycle': hasCycle ? '❌ 检测到负权回路' : '检测中...',
        'metric-nc-dist': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] hasNegativeCycle(n=5, edges, src=0)：启动负权回路检测算法。', 'hasNegativeCycle 入口', 0);
  makeStep(lines.initDist, 'init', '📊 [初始化距离数组] int[] dist = new int[5]; Arrays.fill(dist, INF)。', 'Arrays.fill(dist, INF)', 0);

  dist[0] = 0;
  makeStep(lines.setSrc, 'init', '🌱 [设置源点距离] dist[0] = 0；从源点 0 开始展开最短路径。', 'dist[0] = 0', 0);

  // 2. 前 n - 1 轮常规松弛
  for (let round = 1; round <= n - 1; round++) {
    makeStep(lines.forRound, 'round-done', `🔁 [轮次循环] for (i = ${round}; i <= ${n - 1}; i++)：开始第 ${round} / ${n - 1} 轮全边遍历。`, `--- 第 ${round} 轮常规松弛 ---`, round);

    for (let ei = 0; ei < NC_EDGES.length; ei++) {
      const e = NC_EDGES[ei];
      makeStep(lines.forEdge, 'relax-skip', `🔎 [考察边] 遍历边 (${e.u} ➔ ${e.v}, 权值 w=${e.w})。`, `edge (${e.u}->${e.v}, w=${e.w})`, round, e);
      makeStep(lines.unpackEdge, 'relax-skip', `  ↳ [解构边元] u=${e.u}, v=${e.v}, w=${e.w}。`, `u=${e.u}, v=${e.v}, w=${e.w}`, round, e);

      const canRelax = dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v];
      makeStep(lines.checkRelax, canRelax ? 'relax-success' : 'relax-skip', `  🔎 [松弛核验] if (dist[${e.u}](${dist[e.u] >= INF ? '∞' : dist[e.u]}) + ${e.w} < dist[${e.v}](${dist[e.v] >= INF ? '∞' : dist[e.v]})) -> (${canRelax})。`, `check (${e.u}->${e.v})`, round, e);

      if (canRelax) {
        const oldVal = dist[e.v];
        dist[e.v] = dist[e.u] + e.w;
        totalRelax++;
        makeStep(lines.updateDist, 'relax-success', `  ⚡ [更新距离] 成功松弛！dist[${e.v}] 从 ${oldVal >= INF ? '∞' : oldVal} 缩短为 ${dist[e.v]}！`, `dist[${e.v}]=${dist[e.v]}`, round, e, true);
      } else {
        makeStep(lines.checkRelax, 'relax-skip', `  ⏭️ [跳过边] 边 (${e.u} ➔ ${e.v}) 不满足严格缩短条件。`, `skip (${e.u}->${e.v})`, round, e);
      }
    }

    makeStep(lines.forRound, 'round-done', `✓ [轮次完成] 完成第 ${round} 轮松弛迭代，累计松弛 ${totalRelax} 次。`, `round ${round} done`, round);
  }

  // 3. 第 n 轮额外检测负权回路
  makeStep(lines.forCheckRound, 'round-done', `🚨 [第 N 轮额外检测] 启动第 ${n} 轮额外扫描！若此时仍有边能被松弛，说明存在负权回路！`, `--- 第 ${n} 轮负环判定 ---`, n);

  let cycleFound = false;
  const cycleEdges: { u: number; v: number; w: number }[] = [];

  for (let ei = 0; ei < NC_EDGES.length; ei++) {
    const e = NC_EDGES[ei];
    makeStep(lines.forCheckRound, 'relax-skip', `🔎 [核验边] 第 ${n} 轮复验边 (${e.u} ➔ ${e.v}, w=${e.w})。`, `check edge (${e.u}->${e.v})`, n, e);
    makeStep(lines.unpackCheckEdge, 'relax-skip', `  ↳ [解构边元] u=${e.u}, v=${e.v}, w=${e.w}。`, `u=${e.u}, v=${e.v}, w=${e.w}`, n, e);

    const stillCanRelax = dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v];
    makeStep(lines.checkCycleRelax, stillCanRelax ? 'cycle-detected' : 'relax-skip', `  🔎 [负环松弛核验] if (dist[${e.u}] + ${e.w} < dist[${e.v}]) -> (${stillCanRelax})。`, `cycle relax check (${e.u}->${e.v})`, n, e);

    if (stillCanRelax) {
      cycleFound = true;
      cycleEdges.push(e);
      makeStep(lines.returnTrue, 'cycle-detected', `⚠️ [捕获负权回路] return true！第 ${n} 轮边 (${e.u} ➔ ${e.v}) 依然能被松弛！图中存在负权回路（环权和 < 0），最短路无下界！`, 'return true (负环成立)', n, e, true, true, [...cycleEdges]);
      break;
    }
  }

  if (!cycleFound) {
    makeStep(lines.returnFalse, 'done', '🎉 [检测完成] return false！第 n 轮无任何边能继续松弛，图中无负权回路，最短路完全收敛！', 'return false (无负环)', n);
  }

  return steps;
}

/** 主视觉：有向带权图 SVG（负环红色高亮）+ dist 数组芯片条 */
export function renderNegativeCycleCanvas(container: HTMLElement, step: NCStep): void {
  const { dist, currentEdge, relaxedEdge, hasCycle, cycleEdges } = step;

  let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="nc-arrow-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
      </marker>
      <marker id="nc-arrow-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
      </marker>
      <marker id="nc-arrow-green" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
      </marker>
      <marker id="nc-arrow-red" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
      </marker>
    </defs>`;

  for (const e of NC_EDGES) {
    const p1 = NC_NODE_POS[e.u];
    const p2 = NC_NODE_POS[e.v];
    const isCurrent = currentEdge && currentEdge.u === e.u && currentEdge.v === e.v;
    const isCycleEdge = cycleEdges.some((ce) => ce.u === e.u && ce.v === e.v);

    let strokeColor = '#cbd5e1';
    let strokeWidth = 2;
    let marker = 'url(#nc-arrow-gray)';

    if (isCycleEdge) {
      strokeColor = '#dc2626';
      strokeWidth = 3.5;
      marker = 'url(#nc-arrow-red)';
    } else if (isCurrent && relaxedEdge) {
      strokeColor = '#16a34a';
      strokeWidth = 3;
      marker = 'url(#nc-arrow-green)';
    } else if (isCurrent) {
      strokeColor = '#2563eb';
      strokeWidth = 3;
      marker = 'url(#nc-arrow-blue)';
    }

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + (e.u === 1 && e.v === 2 ? -10 : e.u === 3 && e.v === 1 ? 12 : 0);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 12}" y="${midY - 8}" width="24" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${e.w < 0 ? '#dc2626' : '#0f172a'}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  NC_NODES.forEach((node) => {
    const p = NC_NODE_POS[node];
    const dVal = dist[node];
    const isCurrentTarget = currentEdge && currentEdge.v === node;
    const inCycle = hasCycle && (node === 1 || node === 2 || node === 3);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    if (inCycle) {
      fill = '#fee2e2';
      stroke = '#dc2626';
    } else if (isCurrentTarget && relaxedEdge) {
      fill = '#dcfce7';
      stroke = '#16a34a';
    } else if (isCurrentTarget) {
      fill = '#dbeafe';
      stroke = '#2563eb';
    } else if (node === 0) {
      fill = '#eff6ff';
      stroke = '#3b82f6';
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 30}" fill="${dVal >= 999999 ? '#94a3b8' : '#2563eb'}" font-size="10.5" font-family="monospace" font-weight="800" text-anchor="middle">${dVal >= 999999 ? 'INF' : dVal}</text>`;
  });

  svgHtml += `</svg>`;

  const distChips = NC_NODES.map((node) => {
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
  id: 'negative-cycle',
  name: '负权回路检测 (Negative Cycle)',
  category: 'graph',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 26,
  description: '左程云算法通关课 Class 061：基于 Bellman-Ford 的第 N 轮松弛判定准则，识别图中使得最短路无下界的负权环 (洛谷 P3385)',
  learningGoal: '掌握负权回路判定定理、第 N 轮额外松弛扫描机制以及无限递减状态识别',
  inputs: [],
  presets: [
    { label: '默认图 (含负环)', values: {} },
  ],
  metrics: [
    { id: 'metric-nc-round', label: '当前轮次', color: '#2563eb' },
    { id: 'metric-nc-edge', label: '考察边 (u➔v, w)', color: '#eab308' },
    { id: 'metric-nc-cycle', label: '负环判定', color: '#10b981' },
    { id: 'metric-nc-dist', label: 'dist 距离表', color: '#16a34a' },
  ],
  legend: [
    { label: '正在松弛边', color: '#2563eb' },
    { label: '正常松弛', color: '#16a34a' },
    { label: '负权回路边', color: '#dc2626' },
    { label: '负环节点', color: '#fee2e2' },
  ],
  codeLanguages: NEGATIVE_CYCLE_CODE_LANGUAGES,
  problemHtml: NEGATIVE_CYCLE_PROBLEM_HTML,
  analysisHtml: NEGATIVE_CYCLE_ANALYSIS_HTML,
  generateSteps: (inputs) => buildNCSteps(),
  renderCanvas: (container, step) => renderNegativeCycleCanvas(container, step as NCStep),
});
