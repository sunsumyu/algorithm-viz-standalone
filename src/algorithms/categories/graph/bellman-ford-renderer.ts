/**
 * Bellman-Ford 负权最短路径可视化器 — 4-Card 标准现代架构
 * V-1 轮全边遍历松弛、早停检测与负权回路判定 (左程云 class061)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点初始化、V-1轮外层循环、全边扫描、松弛判断、距离更新、早停检测均发射独立Step）、四语言行号映射
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BELLMAN_FORD_PROBLEM_HTML,
  BELLMAN_FORD_ANALYSIS_HTML,
  BELLMAN_FORD_CODE_LANGUAGES,
} from './bellman-ford-problem-content';
import template from './bellman-ford.html?raw';
import { HighlightTarget } from '../../../core/code-panel';

export interface BFStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  round: number;
  maxRounds: number;
  currentEdge: { from: number; to: number; w: number } | null;
  roundRelaxCount: number;
  totalRelaxCount: number;
  action: 'init' | 'start-round' | 'relax' | 'skip' | 'round-done' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const BF_NODES = [0, 1, 2, 3, 4];
export const BF_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 2 },
  { from: 1, to: 2, w: -1 },
  { from: 1, to: 3, w: 2 },
  { from: 2, to: 3, w: 3 },
  { from: 3, to: 4, w: -2 },
  { from: 2, to: 4, w: 5 },
];

export const BF_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 200, y: 55 },
  { x: 200, y: 205 },
  { x: 340, y: 55 },
  { x: 440, y: 130 },
];

const INF = Infinity;

export function buildBFSteps(): BFStep[] {
  const steps: BFStep[] = [];
  const n = BF_NODES.length;
  const maxRounds = n - 1;
  const source = 0;

  // 精准 12 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 3, java: 5, python: 3, javascript: 3 },
    forRound: { cpp: 4, java: 6, python: 4, javascript: 4 },
    initUpdated: { cpp: 5, java: 7, python: 5, javascript: 5 },
    forEdge: { cpp: 6, java: 8, python: 6, javascript: 6 },
    unpackEdge: { cpp: 7, java: 9, python: 6, javascript: 6 },
    checkRelax: { cpp: 8, java: 10, python: 7, javascript: 7 },
    updateDist: { cpp: 9, java: 11, python: 8, javascript: 8 },
    setUpdated: { cpp: 10, java: 12, python: 9, javascript: 9 },
    checkEarlyStop: { cpp: 13, java: 15, python: 10, javascript: 12 },
    returnDist: { cpp: 15, java: 17, python: 11, javascript: 14 },
  };

  const dist = new Array(n).fill(INF);
  let totalRelaxCount = 0;
  let finalRound = 0;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'start-round' | 'relax' | 'skip' | 'round-done' | 'done',
    statusText: string,
    log: string,
    round: number,
    currentEdge: { from: number; to: number; w: number } | null = null,
    roundRelaxCount: number = 0
  ): void {
    const dStr = dist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');

    steps.push({
      nodes: BF_NODES,
      edges: BF_EDGES,
      dist: [...dist],
      round,
      maxRounds,
      currentEdge,
      roundRelaxCount,
      totalRelaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-bf-round': `${round} / ${maxRounds}`,
        'metric-bf-relax': `${totalRelaxCount}`,
        'metric-bf-edge': currentEdge ? `(${currentEdge.from}➔${currentEdge.to}, w=${currentEdge.w})` : '—',
        'metric-bf-dist': `[${dStr}]`,
      },
    });
  }

  // 1. 入口与初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] bellmanFord(n=5, edges, src=0)：启动 Bellman-Ford 最短路算法。', 'bellmanFord 入口', 0);
  makeStep(lines.initDist, 'init', '📊 [初始化距离表] Arrays.fill(dist, INF)；除源点外所有顶点初始距离设为正无穷。', 'Arrays.fill(dist, INF)', 0);

  dist[source] = 0;
  makeStep(lines.setSrc, 'init', '🌱 [设置源点距离] dist[0] = 0；从源点 0 出发探索全图。', 'dist[0] = 0', 0);

  // 2. V - 1 轮全边松弛
  for (let k = 1; k <= maxRounds; k++) {
    finalRound = k;
    makeStep(lines.forRound, 'start-round', `🔁 [轮次循环] for (i = ${k}; i <= ${maxRounds}; i++)：开始第 ${k} / ${maxRounds} 轮全边遍历松弛。`, `--- 第 ${k} 轮开始 ---`, k);

    let updated = false;
    let roundRelaxCount = 0;
    makeStep(lines.initUpdated, 'start-round', `🧹 [初始化标记] boolean updated = false；记录本轮是否有边成功松弛。`, 'updated = false', k);

    for (const edge of BF_EDGES) {
      const { from: u, to: v, w } = edge;
      makeStep(lines.forEdge, 'skip', `🔎 [考察边] 遍历边 (${u} ➔ ${v}, 权值 w=${w})。`, `edge (${u}->${v}, w=${w})`, k, edge, roundRelaxCount);
      makeStep(lines.unpackEdge, 'skip', `  ↳ [解构边元] u=${u}, v=${v}, w=${w}。`, `u=${u}, v=${v}, w=${w}`, k, edge, roundRelaxCount);

      const canRelax = dist[u] !== INF && dist[u] + w < dist[v];
      makeStep(lines.checkRelax, canRelax ? 'relax' : 'skip', `  🔎 [松弛核验] if (dist[${u}](${dist[u] === INF ? '∞' : dist[u]}) + ${w} < dist[${v}](${dist[v] === INF ? '∞' : dist[v]})) -> (${canRelax})。`, `check relax ${u}->${v}`, k, edge, roundRelaxCount);

      if (canRelax) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        updated = true;
        roundRelaxCount++;
        totalRelaxCount++;

        makeStep(lines.updateDist, 'relax', `  ⚡ [更新距离] 成功松弛！dist[${v}] 从 ${oldDist === INF ? '∞' : oldDist} 缩短为 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, k, edge, roundRelaxCount);
        makeStep(lines.setUpdated, 'relax', `  🏷️ [更新标记] updated = true；本轮发生松弛更新。`, 'updated = true', k, edge, roundRelaxCount);
      } else {
        makeStep(lines.checkRelax, 'skip', `  ⏭️ [无需松弛] 边 (${u} ➔ ${v}) 不满足三角不等式严格缩短条件，保持不变。`, `skip ${u}->${v}`, k, edge, roundRelaxCount);
      }
    }

    makeStep(lines.checkEarlyStop, 'round-done', `🔎 [检查早停优化] if (!updated) -> (!${updated})；${!updated ? '本轮无任何松弛，最短路已全局收敛，提前退出！' : '本轮发生松弛，继续下一轮检测。'}`, `check early stop (updated=${updated})`, k, null, roundRelaxCount);
    if (!updated) {
      break;
    }
  }

  makeStep(lines.returnDist, 'done', `🎉 [Bellman-Ford 达成] return dist！全图最短路已求得，且在第 ${finalRound} 轮提前收敛，无负权回路！结果: [${dist.join(', ')}]。`, 'return dist', finalRound);

  return steps;
}

export class BellmanFordVisualizer extends StepVisualizer<BFStep> {
  protected codeLanguages = BELLMAN_FORD_CODE_LANGUAGES;
  protected codeLines = BELLMAN_FORD_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'Bellman-Ford 算法代码调试';

  private svgCanvas: HTMLElement | null = null;
  private distTableBody: HTMLElement | null = null;
  private metricRoundEl: HTMLElement | null = null;
  private metricRoundRelaxEl: HTMLElement | null = null;
  private metricTotalRelaxEl: HTMLElement | null = null;
  private metricEarlyStopEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#bf-svg-canvas');
    this.distTableBody = this.root.querySelector('#bf-dist-table-body');
    this.metricRoundEl = this.root.querySelector('#metric-cur-round');
    this.metricRoundRelaxEl = this.root.querySelector('#metric-round-relax');
    this.metricTotalRelaxEl = this.root.querySelector('#metric-total-relax');
    this.metricEarlyStopEl = this.root.querySelector('#metric-early-stop');
    this.liveTextEl = this.root.querySelector('#bf-live-text');

    this.bindPlaybackControls();

    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: BELLMAN_FORD_PROBLEM_HTML,
      analysisHtml: BELLMAN_FORD_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BFStep[] {
    return buildBFSteps();
  }

  protected renderStep(step: BFStep): void {
    const { dist, round, maxRounds, currentEdge, roundRelaxCount, totalRelaxCount, action, statusText } = step;

    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-bf" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-bf-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker id="arrow-bf-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
        </defs>`;

      for (const e of BF_EDGES) {
        const p1 = BF_NODE_POSITIONS[e.from];
        const p2 = BF_NODE_POSITIONS[e.to];
        const isCurrent = currentEdge && currentEdge.from === e.from && currentEdge.to === e.to;
        const isRelaxed = isCurrent && action === 'relax';

        const strokeColor = isRelaxed ? '#10b981' : isCurrent ? '#3b82f6' : '#cbd5e1';
        const strokeWidth = isCurrent ? 3.5 : 1.8;
        const marker = isRelaxed ? 'url(#arrow-bf-relax)' : isCurrent ? 'url(#arrow-bf-active)' : 'url(#arrow-bf)';

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + (e.from === 1 && e.to === 2 ? 12 : -8);

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
        svgHtml += `<rect x="${midX - 12}" y="${midY - 8}" width="24" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
        svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${e.w < 0 ? '#ef4444' : '#0f172a'}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
      }

      BF_NODES.forEach((node) => {
        const p = BF_NODE_POSITIONS[node];
        const dVal = dist[node];
        const isSrc = node === 0;
        const isTarget = currentEdge && currentEdge.to === node;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isTarget && action === 'relax') {
          fill = '#dcfce7';
          stroke = '#10b981';
        } else if (isSrc) {
          fill = '#eff6ff';
          stroke = '#3b82f6';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? '#94a3b8' : '#2563eb'}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    if (this.distTableBody) {
      this.distTableBody.innerHTML = BF_NODES.map((node) => {
        const dVal = dist[node];
        const isCur = currentEdge && currentEdge.to === node;
        return `<tr class="${isCur ? 'bg-blue-50/70 font-semibold' : ''}">
          <td class="px-3 py-1.5 text-center font-mono font-bold text-slate-800">${node}</td>
          <td class="px-3 py-1.5 text-center font-mono font-extrabold ${dVal === INF ? 'text-slate-400' : 'text-blue-600'}">${dVal === INF ? '∞' : dVal}</td>
        </tr>`;
      }).join('');
    }

    if (this.metricRoundEl) {
      this.metricRoundEl.textContent = `${round} / ${maxRounds}`;
    }
    if (this.metricRoundRelaxEl) {
      this.metricRoundRelaxEl.textContent = `${roundRelaxCount}`;
    }
    if (this.metricTotalRelaxEl) {
      this.metricTotalRelaxEl.textContent = `${totalRelaxCount}`;
    }
    if (this.metricEarlyStopEl) {
      const isStopped = action === 'done' && round < maxRounds;
      this.metricEarlyStopEl.textContent = isStopped ? '已触发 (提前收敛)' : '未触发';
      this.metricEarlyStopEl.className = `font-mono font-bold ${isStopped ? 'text-emerald-600' : 'text-slate-500'}`;
    }

    if (this.liveTextEl) {
      this.liveTextEl.textContent = statusText;
    }
  }
}

registerAlgorithm({
  id: 'bellman-ford',
  name: 'Bellman-Ford 最短路',
  category: 'graph',
  difficulty: 3,
  levelOrder: 23,
  description: '左程云算法通关课 Class 061：支持负权边的单源最短路径算法，V-1 轮全边松弛与负权回路判定',
  learningGoal: '深刻理解全边松弛原理、早停判定机制以及负权回路的代数检测法则',
  template,
  Visualizer: BellmanFordVisualizer,
});
