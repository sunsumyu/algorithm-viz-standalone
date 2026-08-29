/**
 * 太平洋大西洋水流问题 (LC 417)
 * 4-Card 标准现代架构可视化器
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  WATER_FLOW_PROBLEM_HTML,
  WATER_FLOW_ANALYSIS_HTML,
  WATER_FLOW_CODE_LANGUAGES,
} from './water-flow-problem-content';
import template from './water-flow.html?raw';

export interface WFStep extends StepBase {
  heights: number[][];
  rows: number;
  cols: number;
  pacReachable: boolean[][];
  atlReachable: boolean[][];
  currentCell: [number, number] | null;
  stage: string;
  pacCount: number;
  atlCount: number;
  bothCount: number;
  action: 'init' | 'pacific' | 'atlantic' | 'intersect' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const DEFAULT_HEIGHTS = [
  [1, 2, 2, 3, 5],
  [3, 2, 3, 4, 4],
  [2, 4, 5, 3, 1],
  [6, 7, 1, 4, 5],
  [5, 1, 1, 2, 4],
];

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildWaterFlowSteps(heights: number[][] = DEFAULT_HEIGHTS): WFStep[] {
  const steps: WFStep[] = [];
  const R = heights.length;
  const C = heights[0].length;

  const pac = Array.from({ length: R }, () => Array(C).fill(false));
  const atl = Array.from({ length: R }, () => Array(C).fill(false));

  let pacCount = 0;
  let atlCount = 0;

  steps.push({
    heights: heights.map((r) => [...r]),
    rows: R,
    cols: C,
    pacReachable: pac.map((r) => [...r]),
    atlReachable: atl.map((r) => [...r]),
    currentCell: null,
    stage: '准备开始',
    pacCount: 0,
    atlCount: 0,
    bothCount: 0,
    action: 'init',
    statusText: `初始化 ${R}×${C} 高度网格。水从高向低流，采用逆向思维：从双洋边界逆流向更高或等高格子搜索。`,
    log: `初始化: ${R}×${C} 地形高度矩阵`,
    codeLine: [1, 2, 3],
  });

  // 1. 太平洋搜索 (左边界和上边界)
  const dfsPac = (r: number, c: number, prevH: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || pac[r][c] || heights[r][c] < prevH) return;
    pac[r][c] = true;
    pacCount++;

    steps.push({
      heights: heights.map((row) => [...row]),
      rows: R,
      cols: C,
      pacReachable: pac.map((row) => [...row]),
      atlReachable: atl.map((row) => [...row]),
      currentCell: [r, c],
      stage: '太平洋逆流搜索',
      pacCount,
      atlCount,
      bothCount: 0,
      action: 'pacific',
      statusText: `太平洋逆流登山访问 (${r}, ${c}) [高度=${heights[r][c]}]，标记为太平洋可达。当前太平洋可达: ${pacCount} 格。`,
      log: `太平洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: [20, 21, 22, 23],
    });

    for (const [dr, dc] of DIRS) {
      dfsPac(r + dr, c + dc, heights[r][c]);
    }
  };

  for (let r = 0; r < R; r++) dfsPac(r, 0, heights[r][0]);
  for (let c = 0; c < C; c++) dfsPac(0, c, heights[0][c]);

  // 2. 大西洋搜索 (右边界和下边界)
  const dfsAtl = (r: number, c: number, prevH: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || atl[r][c] || heights[r][c] < prevH) return;
    atl[r][c] = true;
    atlCount++;

    steps.push({
      heights: heights.map((row) => [...row]),
      rows: R,
      cols: C,
      pacReachable: pac.map((row) => [...row]),
      atlReachable: atl.map((row) => [...row]),
      currentCell: [r, c],
      stage: '大西洋逆流搜索',
      pacCount,
      atlCount,
      bothCount: 0,
      action: 'atlantic',
      statusText: `大西洋逆流登山访问 (${r}, ${c}) [高度=${heights[r][c]}]，标记为大西洋可达。当前大西洋可达: ${atlCount} 格。`,
      log: `大西洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: [20, 21, 22, 23],
    });

    for (const [dr, dc] of DIRS) {
      dfsAtl(r + dr, c + dc, heights[r][c]);
    }
  };

  for (let r = 0; r < R; r++) dfsAtl(r, C - 1, heights[r][C - 1]);
  for (let c = 0; c < C; c++) dfsAtl(R - 1, c, heights[R - 1][c]);

  // 3. 求双洋交集
  let bothCount = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (pac[r][c] && atl[r][c]) {
        bothCount++;
        steps.push({
          heights: heights.map((row) => [...row]),
          rows: R,
          cols: C,
          pacReachable: pac.map((row) => [...row]),
          atlReachable: atl.map((row) => [...row]),
          currentCell: [r, c],
          stage: '双洋交集枢纽',
          pacCount,
          atlCount,
          bothCount,
          action: 'intersect',
          statusText: `坐标 (${r}, ${c}) 既能流向太平洋又能流向大西洋！找到第 ${bothCount} 处双洋枢纽。`,
          log: `★ 双洋交集: (${r}, ${c}) [高度=${heights[r][c]}]`,
          codeLine: [14, 15, 16],
        });
      }
    }
  }

  steps.push({
    heights: heights.map((row) => [...row]),
    rows: R,
    cols: C,
    pacReachable: pac.map((row) => [...row]),
    atlReachable: atl.map((row) => [...row]),
    currentCell: null,
    stage: '分析完成',
    pacCount,
    atlCount,
    bothCount,
    action: 'done',
    statusText: `🎉 太平洋大西洋水流分析完成！共发现 ${bothCount} 个格子既可流向太平洋也可流向大西洋。`,
    log: `✓ 分析完成: 双洋连通点共 ${bothCount} 处`,
    codeLine: 18,
  });

  return steps;
}

export class WaterFlowVisualizer extends StepVisualizer<WFStep> {
  protected codeLanguages = WATER_FLOW_CODE_LANGUAGES;
  protected codeLines = WATER_FLOW_CODE_LANGUAGES['java'];
  protected codePanelTitle = '水流问题 (LC 417) 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private gridContainer: HTMLElement | null = null;
  private metricCurCellEl: HTMLElement | null = null;
  private metricStageEl: HTMLElement | null = null;
  private metricPacCountEl: HTMLElement | null = null;
  private metricAtlCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridContainer = this.root.querySelector('#wf-grid-container');
    this.metricCurCellEl = this.root.querySelector('#metric-cur-cell');
    this.metricStageEl = this.root.querySelector('#metric-stage');
    this.metricPacCountEl = this.root.querySelector('#metric-pac-count');
    this.metricAtlCountEl = this.root.querySelector('#metric-atl-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#wf-live-text');
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
      problemHtml: WATER_FLOW_PROBLEM_HTML,
      analysisHtml: WATER_FLOW_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): WFStep[] {
    return buildWaterFlowSteps();
  }

  protected renderStep(step: WFStep): void {
    const { heights, rows, cols, pacReachable, atlReachable, currentCell, stage, pacCount, atlCount, bothCount, statusText, action } = step;

    // 1. 渲染 2D 高度网格
    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      let html = '';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const h = heights[r][c];
          const isPac = pacReachable[r][c];
          const isAtl = atlReachable[r][c];
          const isBoth = isPac && isAtl;
          const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

          let cls = 'wf-cell';
          if (isBoth) cls += ' is-both';
          else if (isPac) cls += ' is-pacific';
          else if (isAtl) cls += ' is-atlantic';

          if (isCurrent) cls += ' is-current';

          let oceanTag = isBoth ? 'P&A' : isPac ? 'P' : isAtl ? 'A' : '';

          html += `<div class="${cls}">
            <span style="font-size:12px; font-weight:800;">${h}</span>
            ${oceanTag ? `<span style="font-size:9px; opacity:0.85;">${oceanTag}</span>` : ''}
          </div>`;
        }
      }
      this.gridContainer.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricCurCellEl) {
      this.metricCurCellEl.textContent = currentCell ? `(${currentCell[0]}, ${currentCell[1]})` : '—';
    }
    if (this.metricStageEl) {
      this.metricStageEl.textContent = stage;
    }
    if (this.metricPacCountEl) {
      this.metricPacCountEl.textContent = `${pacCount}`;
    }
    if (this.metricAtlCountEl) {
      this.metricAtlCountEl.textContent = `${atlCount}`;
    }

    if (this.formulaActionEl) {
      this.formulaActionEl.textContent =
        action === 'pacific'
          ? `太平洋逆流: (${currentCell ? currentCell.join(',') : ''}) >= 边界，pac[r][c]=true`
          : action === 'atlantic'
          ? `大西洋逆流: (${currentCell ? currentCell.join(',') : ''}) >= 边界，atl[r][c]=true`
          : action === 'intersect'
          ? `交集命中: pac[${currentCell ? currentCell[0] : 0}][${currentCell ? currentCell[1] : 0}] && atl == true -> 双洋枢纽`
          : `若 heights[next] >= heights[curr]，则逆流可达`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done' || action === 'intersect'
          ? '#f0fdf4'
          : action === 'pacific'
          ? '#eff6ff'
          : action === 'atlantic'
          ? '#fef2f2'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done' || action === 'intersect'
          ? '#15803d'
          : action === 'pacific'
          ? '#1d4ed8'
          : action === 'atlantic'
          ? '#dc2626'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done' || action === 'intersect'
          ? '#bbf7d0'
          : action === 'pacific'
          ? '#bfdbfe'
          : action === 'atlantic'
          ? '#fecaca'
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

    const badgeBoth = this.root?.querySelector('#badge-both-count');
    if (badgeBoth) badgeBoth.textContent = `双洋交集: ${bothCount} 处`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'water-flow',
  name: '太平洋大西洋水流 (LC 417)',
  viewId: 'algo-water-flow-view',
  category: 'graph',
  description: '逆向思维：分别从太平洋与大西洋边界逆流登山搜索，求双洋可达性交集',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 17,
  learningGoal: '掌握逆向多源 DFS/BFS 搜索与双矩阵交集求解技巧',
  template,
  Visualizer: WaterFlowVisualizer,
});
