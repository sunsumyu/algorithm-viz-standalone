/**
 * 所有可能的路径 (LC 797)
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REACHABLE_PATHS_PROBLEM_HTML,
  REACHABLE_PATHS_ANALYSIS_HTML,
  REACHABLE_PATHS_CODE_LANGUAGES,
} from './reachable-paths-problem-content';
import template from './reachable-paths.html?raw';

export interface RPStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  currentNode: number | null;
  currentPath: number[];
  allPaths: number[][];
  action: 'init' | 'dfs-enter' | 'target-reached' | 'backtrack' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export const DAG_NODES = [0, 1, 2, 3];
export const DAG_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
];

export const DAG_POSITIONS = [
  { x: 70, y: 125 },
  { x: 200, y: 60 },
  { x: 200, y: 190 },
  { x: 380, y: 125 },
];

export const DEFAULT_GRAPH = [[1, 2], [3], [3], []];

export function buildReachableSteps(graph: number[][] = DEFAULT_GRAPH): RPStep[] {
  const steps: RPStep[] = [];
  const nodes = Array.from({ length: graph.length }, (_, i) => i);
  const edges: [number, number][] = [];
  for (let u = 0; u < graph.length; u++) {
    for (const v of graph[u]) {
      edges.push([u, v]);
    }
  }

  const target = graph.length - 1;
  const allPaths: number[][] = [];
  const currentPath: number[] = [0];

  steps.push({
    nodes,
    edges,
    currentNode: null,
    currentPath: [0],
    allPaths: [],
    action: 'init',
    statusText: `初始化 DAG 图结构，节点 0 为起点，节点 ${target} 为目标终点。`,
    log: `初始化: 0 -> ${target} 所有路径搜索`,
    codeLine: [1, 2, 3, 4],
  });

  const dfs = (node: number) => {
    steps.push({
      nodes,
      edges,
      currentNode: node,
      currentPath: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      action: 'dfs-enter',
      statusText: `递归进入节点 ${node}，当前路径: [${currentPath.join(' -> ')}]。`,
      log: `访问节点: ${node}，路径: [${currentPath.join(' -> ')}]`,
      codeLine: [8, 9],
    });

    if (node === target) {
      allPaths.push([...currentPath]);
      steps.push({
        nodes,
        edges,
        currentNode: node,
        currentPath: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        action: 'target-reached',
        statusText: `🎉 到达终点 ${target}！收集一条完整有效路径: [${currentPath.join(' -> ')}]。`,
        log: `✓ 命中目标: 找到路径 #${allPaths.length} [${currentPath.join(' -> ')}]`,
        codeLine: [10, 11, 12],
      });
      return;
    }

    for (const next of graph[node]) {
      currentPath.push(next);
      dfs(next);
      currentPath.pop();

      steps.push({
        nodes,
        edges,
        currentNode: node,
        currentPath: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        action: 'backtrack',
        statusText: `回溯：从节点 ${next} 返回，当前路径恢复为 [${currentPath.join(' -> ')}]。`,
        log: `回溯返回: 节点 ${node}，弹出 ${next}`,
        codeLine: 16,
      });
    }
  };

  dfs(0);

  steps.push({
    nodes,
    edges,
    currentNode: null,
    currentPath: [],
    allPaths: allPaths.map((p) => [...p]),
    action: 'done',
    statusText: `🎉 路径搜索完成！从 0 到 ${target} 共发现 ${allPaths.length} 条所有可能路径。`,
    log: `✓ 搜索完毕: 共输出 ${allPaths.length} 条路径方案`,
    codeLine: 6,
  });

  return steps;
}

export class ReachablePathsVisualizer extends StepVisualizer<RPStep> {
  protected codeLanguages = REACHABLE_PATHS_CODE_LANGUAGES;
  protected codeLines = REACHABLE_PATHS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '所有可能路径 (LC 797) 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricCurPathEl: HTMLElement | null = null;
  private metricActionEl: HTMLElement | null = null;
  private metricTotalPathsEl: HTMLElement | null = null;
  private allPathsEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#rp-svg-canvas');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricCurPathEl = this.root.querySelector('#metric-cur-path');
    this.metricActionEl = this.root.querySelector('#metric-action');
    this.metricTotalPathsEl = this.root.querySelector('#metric-total-paths');
    this.allPathsEl = this.root.querySelector('#rp-all-paths');
    this.liveTextEl = this.root.querySelector('#rp-live-text');
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
      problemHtml: REACHABLE_PATHS_PROBLEM_HTML,
      analysisHtml: REACHABLE_PATHS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RPStep[] {
    return buildReachableSteps();
  }

  protected renderStep(step: RPStep): void {
    const { nodes, edges, currentNode, currentPath, allPaths, statusText, action } = step;

    // 1. 绘制有向图 SVG
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 450 250" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
          </marker>
          <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
          </marker>
        </defs>`;

      // 当前路径边的集合
      const curEdgeSet = new Set<string>();
      if (currentPath.length > 1) {
        for (let i = 0; i < currentPath.length - 1; i++) {
          curEdgeSet.add(`${currentPath[i]}->${currentPath[i + 1]}`);
        }
      }

      // 绘制有向边
      for (const [u, v] of edges) {
        const p1 = DAG_POSITIONS[u] || { x: 50, y: 50 };
        const p2 = DAG_POSITIONS[v] || { x: 150, y: 150 };
        const isCurEdge = curEdgeSet.has(`${u}->${v}`);

        const stroke = isCurEdge ? '#2563eb' : '#cbd5e1';
        const strokeWidth = isCurEdge ? 3 : 2;
        const marker = isCurEdge ? 'url(#arrow-blue)' : 'url(#arrow-gray)';

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
      }

      // 绘制节点
      for (const u of nodes) {
        const pos = DAG_POSITIONS[u] || { x: 50, y: 50 };
        const isCurrent = currentNode === u;
        const inPath = currentPath.includes(u);
        const isTarget = u === nodes.length - 1;

        let fill = '#ffffff';
        let stroke = '#94a3b8';
        let textColor = '#0f172a';

        if (action === 'target-reached' && inPath) {
          fill = '#f0fdf4';
          stroke = '#16a34a';
          textColor = '#15803d';
        } else if (isCurrent) {
          fill = '#eff6ff';
          stroke = '#2563eb';
          textColor = '#1d4ed8';
        } else if (inPath) {
          fill = '#fef9c3';
          stroke = '#facc15';
          textColor = '#854d0e';
        }

        let badge = u === 0 ? ' (S)' : isTarget ? ' (T)' : '';

        svgHtml += `
          <g>
            <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
            <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono">${u}${badge}</text>
          </g>
        `;
      }

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 更新状态监视器
    if (this.metricCurNodeEl) {
      this.metricCurNodeEl.textContent = currentNode !== null ? `${currentNode}` : '—';
    }
    if (this.metricCurPathEl) {
      this.metricCurPathEl.textContent = currentPath.length > 0 ? `[${currentPath.join(' -> ')}]` : '[ ]';
    }
    if (this.metricActionEl) {
      this.metricActionEl.textContent =
        action === 'target-reached'
          ? '🎯 找到路径'
          : action === 'backtrack'
          ? '↩ 回溯弹出'
          : action === 'dfs-enter'
          ? '深入探索'
          : '准备开始';
    }
    if (this.metricTotalPathsEl) {
      this.metricTotalPathsEl.textContent = `${allPaths.length}`;
    }

    if (this.allPathsEl) {
      this.allPathsEl.textContent =
        allPaths.length > 0 ? allPaths.map((p) => `[${p.join('->')}]`).join(', ') : '[ ]';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done' || action === 'target-reached'
          ? '#f0fdf4'
          : action === 'backtrack'
          ? '#fff7ed'
          : '#eff6ff';
      logEntry.style.color =
        action === 'done' || action === 'target-reached'
          ? '#15803d'
          : action === 'backtrack'
          ? '#c2410c'
          : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done' || action === 'target-reached'
          ? '#bbf7d0'
          : action === 'backtrack'
          ? '#fed7aa'
          : '#bfdbfe');
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

    const badgePaths = this.root?.querySelector('#badge-path-count');
    if (badgePaths) badgePaths.textContent = `已找到: ${allPaths.length} 条路径`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'reachable-paths',
  name: '所有可能的路径 (LC 797)',
  viewId: 'algo-reachable-paths-view',
  category: 'graph',
  description: '回溯 DFS 搜索有向无环图 (DAG) 中从源点到目标点的所有可能路径',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 21,
  learningGoal: '掌握 DAG 上的深度优先回溯搜索与路径压栈恢复机制',
  template,
  Visualizer: ReachablePathsVisualizer,
});
