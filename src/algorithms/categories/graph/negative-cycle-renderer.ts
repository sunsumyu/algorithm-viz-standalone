/**
 * Bellman-Ford 负权回路检测
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  NEGATIVE_CYCLE_PROBLEM_HTML,
  NEGATIVE_CYCLE_ANALYSIS_HTML,
  NEGATIVE_CYCLE_CODE_LANGUAGES,
} from './negative-cycle-problem-content';
import template from './negative-cycle.html?raw';

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
  codeLine: number | number[];
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
  const dist = new Array(n).fill(INF);
  dist[0] = 0;
  let totalRelax = 0;

  steps.push({
    dist: [...dist],
    round: 0,
    maxRounds: n,
    currentEdge: null,
    relaxedEdge: false,
    relaxCount: 0,
    hasCycle: false,
    cycleEdges: [],
    action: 'init',
    statusText: `初始化：V=${n} 个节点，${NC_EDGES.length} 条有向边。源点=0，dist[0]=0，其余=INF。将进行 V-1 轮常规松弛与第 V 轮负环检测。`,
    log: `初始化: ${n} 个节点, ${NC_EDGES.length} 条有向边`,
    codeLine: [1, 2, 3, 4],
  });

  // 1. 前 n - 1 轮常规松弛
  for (let round = 1; round <= n - 1; round++) {
    for (let ei = 0; ei < NC_EDGES.length; ei++) {
      const e = NC_EDGES[ei];

      if (dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v]) {
        const oldVal = dist[e.v];
        dist[e.v] = dist[e.u] + e.w;
        totalRelax++;

        steps.push({
          dist: [...dist],
          round,
          maxRounds: n,
          currentEdge: e,
          relaxedEdge: true,
          relaxCount: totalRelax,
          hasCycle: false,
          cycleEdges: [],
          action: 'relax-success',
          statusText: `第 ${round} 轮，边 (${e.u})->(${e.v}) 权值=${e.w}：dist[${e.u}]+${e.w}=${dist[e.v]} < ${oldVal === INF ? 'INF' : oldVal}，松弛成功！`,
          log: `[第 ${round} 轮] 松弛成功: (${e.u})->(${e.v})，dist[${e.v}]=${dist[e.v]}`,
          codeLine: [8, 9, 10],
        });
      } else {
        const reason = dist[e.u] === INF ? `前驱 dist[${e.u}]=INF` : `dist[${e.u}]+${e.w} >= dist[${e.v}] (${dist[e.v]})`;
        steps.push({
          dist: [...dist],
          round,
          maxRounds: n,
          currentEdge: e,
          relaxedEdge: false,
          relaxCount: totalRelax,
          hasCycle: false,
          cycleEdges: [],
          action: 'relax-skip',
          statusText: `第 ${round} 轮，边 (${e.u})->(${e.v}) 权值=${e.w}：${reason}，跳过不更新。`,
          log: `[第 ${round} 轮] 边 (${e.u})->(${e.v}): 无需松弛`,
          codeLine: 7,
        });
      }
    }

    steps.push({
      dist: [...dist],
      round,
      maxRounds: n,
      currentEdge: null,
      relaxedEdge: false,
      relaxCount: totalRelax,
      hasCycle: false,
      cycleEdges: [],
      action: 'round-done',
      statusText: `✓ 完成第 ${round} 轮松弛迭代。`,
      log: `✓ 完成第 ${round} 轮迭代`,
      codeLine: 6,
    });
  }

  // 2. 第 n 轮额外检测负权回路
  let cycleFound = false;
  const cycleEdges: { u: number; v: number; w: number }[] = [];

  for (let ei = 0; ei < NC_EDGES.length; ei++) {
    const e = NC_EDGES[ei];

    if (dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v]) {
      cycleFound = true;
      cycleEdges.push(e);

      steps.push({
        dist: [...dist],
        round: n,
        maxRounds: n,
        currentEdge: e,
        relaxedEdge: true,
        relaxCount: totalRelax,
        hasCycle: true,
        cycleEdges: [...cycleEdges],
        action: 'cycle-detected',
        statusText: `⚠️ 第 ${n} 轮额外检测命中：边 (${e.u})->(${e.v}) 仍能继续松弛 (${dist[e.u]}+${e.w}=${dist[e.u] + e.w} < dist[${e.v}]=${dist[e.v]})！判定存在负权回路！`,
        log: `⚠️ 检测到负权回路！边 (${e.u})->(${e.v}) 持续产生负收益`,
        codeLine: [15, 16, 17],
      });
      break;
    }
  }

  steps.push({
    dist: [...dist],
    round: n,
    maxRounds: n,
    currentEdge: null,
    relaxedEdge: false,
    relaxCount: totalRelax,
    hasCycle: cycleFound,
    cycleEdges,
    action: 'done',
    statusText: cycleFound
      ? `🎉 检测完成：图中存在负权回路（如 1->2->3->1 权重和 -3 < 0），最短路径无界 (-∞)。`
      : `🎉 检测完成：图中不存在负权回路，最短距离已收敛。`,
    log: `✓ 检测完毕: 负权回路 = ${cycleFound}`,
    codeLine: 19,
  });

  return steps;
}

export class NegativeCycleVisualizer extends StepVisualizer<NCStep> {
  protected codeLanguages = NEGATIVE_CYCLE_CODE_LANGUAGES;
  protected codeLines = NEGATIVE_CYCLE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '负权回路检测 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private metricRoundEl: HTMLElement | null = null;
  private metricCurEdgeEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private metricHasCycleEl: HTMLElement | null = null;
  private distArrayEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#nc-svg-canvas');
    this.metricRoundEl = this.root.querySelector('#metric-round');
    this.metricCurEdgeEl = this.root.querySelector('#metric-cur-edge');
    this.metricRelaxCountEl = this.root.querySelector('#metric-relax-count');
    this.metricHasCycleEl = this.root.querySelector('#metric-has-cycle');
    this.distArrayEl = this.root.querySelector('#nc-dist-array');
    this.liveTextEl = this.root.querySelector('#nc-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 500;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: NEGATIVE_CYCLE_PROBLEM_HTML,
      analysisHtml: NEGATIVE_CYCLE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): NCStep[] {
    return buildNCSteps();
  }

  protected renderStep(step: NCStep): void {
    const { dist, round, maxRounds, currentEdge, relaxedEdge, relaxCount, hasCycle, cycleEdges, statusText, action } = step;

    // 1. 绘制有向带权图 SVG
    if (this.svgCanvas) {
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

      // 绘制边与权重
      for (const e of NC_EDGES) {
        const p1 = NC_NODE_POS[e.u];
        const p2 = NC_NODE_POS[e.v];
        const isCurrent = currentEdge && currentEdge.u === e.u && currentEdge.v === e.v;
        const isCycleEdge = cycleEdges.some((ce) => ce.u === e.u && ce.v === e.v);

        let stroke = isCycleEdge ? '#dc2626' : isCurrent ? (relaxedEdge ? '#16a34a' : '#2563eb') : '#cbd5e1';
        let strokeWidth = isCycleEdge ? 4 : isCurrent ? 3.5 : 2;
        let marker = isCycleEdge
          ? 'url(#nc-arrow-red)'
          : isCurrent
          ? relaxedEdge
            ? 'url(#nc-arrow-green)'
            : 'url(#nc-arrow-blue)'
          : 'url(#nc-arrow-gray)';

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 - 6;

        svgHtml += `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />
          <text x="${mx}" y="${my}" fill="${isCycleEdge ? '#dc2626' : isCurrent ? '#2563eb' : '#64748b'}" font-size="11" font-weight="700" font-family="JetBrains Mono">${e.w}</text>
        `;
      }

      // 绘制节点
      for (const u of NC_NODES) {
        const pos = NC_NODE_POS[u];
        const d = dist[u] >= 999999 ? 'INF' : dist[u];

        let fill = '#ffffff';
        let stroke = '#94a3b8';
        let textColor = '#0f172a';

        if (action === 'cycle-detected' && (u === 1 || u === 2 || u === 3)) {
          fill = '#fef2f2';
          stroke = '#dc2626';
          textColor = '#b91c1c';
        } else if (currentEdge && (currentEdge.u === u || currentEdge.v === u)) {
          fill = relaxedEdge && currentEdge.v === u ? '#f0fdf4' : '#eff6ff';
          stroke = relaxedEdge && currentEdge.v === u ? '#16a34a' : '#2563eb';
          textColor = relaxedEdge && currentEdge.v === u ? '#15803d' : '#1d4ed8';
        }

        let badge = u === 0 ? ' (S)' : '';

        svgHtml += `
          <g>
            <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
            <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono">${u}${badge}</text>
            <text x="${pos.x}" y="${pos.y + 32}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#64748b" font-family="JetBrains Mono">d:${d}</text>
          </g>
        `;
      }

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 更新状态监视器
    if (this.metricRoundEl) {
      this.metricRoundEl.textContent = `${round} / ${maxRounds}`;
    }
    if (this.metricCurEdgeEl) {
      this.metricCurEdgeEl.textContent = currentEdge ? `(${currentEdge.u} -> ${currentEdge.v}) [${currentEdge.w}]` : '—';
    }
    if (this.metricRelaxCountEl) {
      this.metricRelaxCountEl.textContent = `${relaxCount}`;
    }
    if (this.metricHasCycleEl) {
      this.metricHasCycleEl.textContent = hasCycle ? '是 (True)' : action === 'done' ? '否 (False)' : '检测中';
      this.metricHasCycleEl.style.color = hasCycle ? '#dc2626' : '#10b981';
    }

    if (this.distArrayEl) {
      this.distArrayEl.textContent = `[${dist.map((d, i) => `${i}:${d >= 999999 ? 'INF' : d}`).join(', ')}]`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'cycle-detected'
          ? '#fef2f2'
          : action === 'done' || action === 'relax-success'
          ? '#f0fdf4'
          : action === 'round-done'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'cycle-detected'
          ? '#dc2626'
          : action === 'done' || action === 'relax-success'
          ? '#15803d'
          : action === 'round-done'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'cycle-detected'
          ? '#fecaca'
          : action === 'done' || action === 'relax-success'
          ? '#bbf7d0'
          : action === 'round-done'
          ? '#bfdbfe'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 5. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeStatus = this.root?.querySelector('#badge-cycle-status');
    if (badgeStatus) {
      badgeStatus.textContent = hasCycle ? '⚠️ 发现负权回路' : '状态: 正常松弛中';
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'negative-cycle',
  name: '负权回路检测 (Bellman-Ford)',
  viewId: 'algo-negative-cycle-view',
  category: 'graph',
  description: 'Bellman-Ford 第 V 轮额外松弛检测：判断图中是否存在导致最短路无界的负权环',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 23,
  learningGoal: '掌握利用 Bellman-Ford 算法特性在 O(V·E) 下准确判定负权回路',
  template,
  Visualizer: NegativeCycleVisualizer,
});
