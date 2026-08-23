import { IVisualizer, VisualizerContext } from '../../../core/interfaces';
import { CodePanel } from '../../../core/code-panel';
import { registerAlgorithm } from '../../../core/registry';
import template from './fibonacci.html?raw';
import {
  EvolutionModeId,
  EVOLUTION_MODES,
  FIB_EVOLUTION_CODES,
  FibEvolutionStep,
  buildEvolutionSteps,
} from './fib-evolution-steps';
import { renderDpTreeSVG } from './dp-demo-visualizer';

export class FibonacciVisualizer implements IVisualizer {
  private steps: FibEvolutionStep[] = [];
  private currentStepIndex: number = 0;
  private currentMode: EvolutionModeId = 'memo-topdown';
  private isPlaying: boolean = false;
  private playbackSpeed: number = 800;
  private timer: number | null = null;
  private inputValue: number = 6;

  // 作用域根元素
  private root: HTMLElement | null = null;
  private codePanel: CodePanel | null = null;
  private navigateBack: (() => void) | null = null;

  // DOM 容器与元素
  private inputField: HTMLInputElement | null = null;
  private btnStart: HTMLButtonElement | null = null;
  private btnPrev: HTMLButtonElement | null = null;
  private btnNext: HTMLButtonElement | null = null;
  private btnPlayPause: HTMLButtonElement | null = null;
  private btnReset: HTMLButtonElement | null = null;
  private speedSlider: HTMLInputElement | null = null;
  private speedLabel: HTMLElement | null = null;

  private stageTitleEl: HTMLElement | null = null;
  private stageBadgeEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  private treeContainer: HTMLElement | null = null;
  private treeSvg: SVGSVGElement | null = null;
  private dpTableContainer: HTMLElement | null = null;
  private rollingContainer: HTMLElement | null = null;
  private cardPrev2: HTMLElement | null = null;
  private cardPrev1: HTMLElement | null = null;
  private cardCurr: HTMLElement | null = null;
  private valPrev2: HTMLElement | null = null;
  private valPrev1: HTMLElement | null = null;
  private valCurr: HTMLElement | null = null;

  // 指标统计元素
  private statDirectionEl: HTMLElement | null = null;
  private statTimeCompEl: HTMLElement | null = null;
  private statSpaceCompEl: HTMLElement | null = null;
  private statCallsEl: HTMLElement | null = null;
  private statHitsEl: HTMLElement | null = null;
  private statNaiveCallsEl: HTMLElement | null = null;

  public async init(context?: VisualizerContext): Promise<void> {
    if (context && context.root) {
      this.root = context.root;
      this.navigateBack = context.navigateBack ?? null;
    } else {
      this.root = document.getElementById('algo-fibonacci-view') as HTMLElement | null;
    }
    this.initDOMElements();
    this.setupEventListeners();
    this.initCodePanel();
    await this.start();
  }

  private initDOMElements(): void {
    if (!this.root) return;
    const root = this.root;

    this.inputField = root.querySelector('#fib-input') as HTMLInputElement;
    this.btnStart = root.querySelector('#fib-start') as HTMLButtonElement;
    this.btnPrev = root.querySelector('#fib-prev') as HTMLButtonElement;
    this.btnNext = root.querySelector('#fib-next') as HTMLButtonElement;
    this.btnPlayPause = root.querySelector('#fib-play') as HTMLButtonElement;
    this.btnReset = root.querySelector('#fib-reset') as HTMLButtonElement;
    this.speedSlider = root.querySelector('#fib-speed') as HTMLInputElement;
    this.speedLabel = root.querySelector('#fib-speed-label') as HTMLElement;

    this.stageTitleEl = root.querySelector('#stage-title-text') as HTMLElement;
    this.stageBadgeEl = root.querySelector('#stage-badge-info') as HTMLElement;
    this.statusEl = root.querySelector('#fib-status') as HTMLElement;

    this.treeContainer = root.querySelector('#tree-container') as HTMLElement;
    this.treeSvg = root.querySelector('#tree-svg') as SVGSVGElement;
    this.dpTableContainer = root.querySelector('#dp-table-container') as HTMLElement;
    this.rollingContainer = root.querySelector('#rolling-vars-container') as HTMLElement;

    this.cardPrev2 = root.querySelector('#card-prev2') as HTMLElement;
    this.cardPrev1 = root.querySelector('#card-prev1') as HTMLElement;
    this.cardCurr = root.querySelector('#card-curr') as HTMLElement;
    this.valPrev2 = root.querySelector('#val-prev2') as HTMLElement;
    this.valPrev1 = root.querySelector('#val-prev1') as HTMLElement;
    this.valCurr = root.querySelector('#val-curr') as HTMLElement;

    this.statDirectionEl = root.querySelector('#stat-direction') as HTMLElement;
    this.statTimeCompEl = root.querySelector('#stat-time-comp') as HTMLElement;
    this.statSpaceCompEl = root.querySelector('#stat-space-comp') as HTMLElement;
    this.statCallsEl = root.querySelector('#stat-calls') as HTMLElement;
    this.statHitsEl = root.querySelector('#stat-hits') as HTMLElement;
    this.statNaiveCallsEl = root.querySelector('#stat-naive-calls') as HTMLElement;
  }

  private initCodePanel(): void {
    const codeContainer = this.root?.querySelector('[data-code-panel]') as HTMLElement | null;
    if (!codeContainer) return;

    const config = FIB_EVOLUTION_CODES[this.currentMode];
    const modeMeta = EVOLUTION_MODES.find(m => m.id === this.currentMode);

    this.codePanel = new CodePanel(codeContainer, {
      lines: config.languages.java,
      languages: config.languages,
      title: `${modeMeta?.label || '演化阶段'} 多语言源码`,
      lineExplanations: config.lineExplanations,
      keyPoints: config.keyPoints,
    });
  }

  private setupEventListeners(): void {
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    if (this.btnPrev) this.btnPrev.onclick = () => this.prevStep();
    if (this.btnNext) this.btnNext.onclick = () => this.nextStep();
    if (this.btnPlayPause) this.btnPlayPause.onclick = () => this.togglePlay();
    if (this.btnReset) this.btnReset.onclick = () => this.reset();

    if (this.speedSlider && this.speedLabel) {
      this.speedSlider.oninput = (e) => {
        this.playbackSpeed = parseInt((e.target as HTMLInputElement).value);
        this.speedLabel!.textContent = (this.playbackSpeed / 1000).toFixed(1) + 's';
      };
    }

    // 4 阶段演化药丸切换
    const stageBtns = this.root?.querySelectorAll<HTMLButtonElement>('.stage-btn');
    stageBtns?.forEach((btn) => {
      btn.onclick = () => {
        const stage = btn.dataset.stage as EvolutionModeId;
        if (stage && stage !== this.currentMode) {
          this.switchEvolutionMode(stage);
        }
      };
    });
  }

  public switchEvolutionMode(mode: EvolutionModeId): void {
    this.pause();
    this.currentMode = mode;

    // 1. 更新顶部药丸按钮的高亮
    const stageBtns = this.root?.querySelectorAll<HTMLButtonElement>('.stage-btn');
    stageBtns?.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.stage === mode);
    });

    // 2. 重新初始化 CodePanel（包括代码、多语言、逐行讲解、要点）
    const codeContainer = this.root?.querySelector('[data-code-panel]') as HTMLElement | null;
    if (codeContainer) {
      if (this.codePanel) {
        this.codePanel.destroy();
        this.codePanel = null;
      }
      this.initCodePanel();
    }

    // 3. 重建步进生成器并从第 0 步渲染
    this.start();
  }

  private async start(): Promise<void> {
    this.pause();

    if (this.inputField) {
      const input = this.inputField.value.trim();
      const n = parseInt(input);
      if (!isNaN(n) && n >= 1 && n <= 10) {
        this.inputValue = n;
      }
    }

    // 构建演化步进
    this.steps = buildEvolutionSteps(this.inputValue, this.currentMode);
    this.currentStepIndex = 0;

    // 更新演化模式标题与复杂性徽章
    const meta = EVOLUTION_MODES.find(m => m.id === this.currentMode);
    if (meta) {
      if (this.stageTitleEl) this.stageTitleEl.textContent = `${meta.label} · ${meta.desc}`;
      if (this.stageBadgeEl) this.stageBadgeEl.textContent = `时间: ${meta.timeComplexity} | 空间: ${meta.spaceComplexity}`;
      if (this.statDirectionEl) this.statDirectionEl.textContent = meta.direction;
      if (this.statTimeCompEl) this.statTimeCompEl.textContent = meta.timeComplexity;
      if (this.statSpaceCompEl) this.statSpaceCompEl.textContent = meta.spaceComplexity;
    }

    // 视口容器切换
    this.switchStageViewports();

    // 渲染初始步
    this.renderCurrentStep();
    this.updateButtons();
    this.updateStats();
  }

  private switchStageViewports(): void {
    if (!this.treeContainer || !this.dpTableContainer || !this.rollingContainer) return;

    if (this.currentMode === 'naive-recursive' || this.currentMode === 'memo-topdown') {
      this.treeContainer.style.display = 'flex';
      this.dpTableContainer.style.display = 'none';
      this.rollingContainer.style.display = 'none';
    } else if (this.currentMode === 'tabulation-bottomup') {
      this.treeContainer.style.display = 'none';
      this.dpTableContainer.style.display = 'flex';
      this.rollingContainer.style.display = 'none';
    } else {
      this.treeContainer.style.display = 'none';
      this.dpTableContainer.style.display = 'none';
      this.rollingContainer.style.display = 'flex';
    }
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play(): void {
    if (this.steps.length === 0) return;
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.currentStepIndex = 0;
    }

    this.isPlaying = true;
    this.tick();
    this.updateButtons();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateButtons();
  }

  private tick = () => {
    if (!this.isPlaying) return;

    this.timer = window.setTimeout(() => {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.nextStep();
        if (this.isPlaying) this.tick();
      } else {
        this.pause();
      }
    }, this.playbackSpeed);
  };

  private nextStep(): void {
    if (this.currentStepIndex >= this.steps.length - 1) return;
    this.currentStepIndex++;
    this.renderCurrentStep();
    this.updateButtons();
    this.updateStats();
  }

  private prevStep(): void {
    if (this.currentStepIndex <= 0) return;
    this.currentStepIndex--;
    this.renderCurrentStep();
    this.updateButtons();
    this.updateStats();
  }

  private reset(): void {
    this.pause();
    this.currentStepIndex = 0;
    this.renderCurrentStep();
    this.updateButtons();
    this.updateStats();
  }

  private renderCurrentStep(): void {
    const step = this.steps[this.currentStepIndex];
    if (!step) return;

    // 1. 状态消息
    if (this.statusEl) {
      this.statusEl.textContent = step.message;
    }

    // 2. 代码高亮
    if (this.codePanel && step.codeLine) {
      this.codePanel.highlight(step.codeLine);
    }

    // 3. 各视口分流渲染
    if (this.currentMode === 'naive-recursive' || this.currentMode === 'memo-topdown') {
      this.renderCallTree(step);
    } else if (this.currentMode === 'tabulation-bottomup') {
      this.renderTabulationTable(step);
    } else {
      this.renderRollingVars(step);
    }
  }

  private renderCallTree(step: FibEvolutionStep): void {
    if (!this.treeContainer) return;
    if (!step.tree) return;
    renderDpTreeSVG(this.treeContainer, step.tree);
  }

  private renderTabulationTable(step: FibEvolutionStep): void {
    if (!this.dpTableContainer || !step.dp1d) return;

    // Build the table wrapper (only once)
    let wrapper = this.dpTableContainer.querySelector<HTMLElement>('.dp-tab-wrapper');
    if (!wrapper) {
      this.dpTableContainer.innerHTML = '';
      wrapper = document.createElement('div');
      wrapper.className = 'dp-tab-wrapper';
      wrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:0; width:100%; position:relative;';
      this.dpTableContainer.appendChild(wrapper);

      // SVG overlay for arc arrows (positioned above the cells)
      const arcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arcSvg.setAttribute('class', 'dp-arc-svg');
      arcSvg.style.cssText = 'width:100%; height:70px; overflow:visible; flex-shrink:0;';
      wrapper.appendChild(arcSvg);

      // The actual table
      const table = document.createElement('div');
      table.className = 'dp-table';
      wrapper.appendChild(table);

      // Formula breakdown card
      const formulaCard = document.createElement('div');
      formulaCard.className = 'dp-formula-card';
      formulaCard.style.cssText = `
        margin-top: 16px;
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        background: rgba(0,0,0,0.35); border: 1px solid rgba(251,191,36,0.25);
        border-radius: 12px; padding: 12px 20px; width: fit-content;
        font-family: 'JetBrains Mono', Consolas, monospace;
        transition: all 0.3s ease;
      `;
      wrapper.appendChild(formulaCard);
    }

    const n = this.inputValue;
    const dpArr = step.dp1d;
    const table = wrapper.querySelector<HTMLElement>('.dp-table')!;
    const arcSvg = wrapper.querySelector<SVGSVGElement>('.dp-arc-svg')!;
    const formulaCard = wrapper.querySelector<HTMLElement>('.dp-formula-card')!;

    // Build index row (once)
    let indexRow = table.querySelector<HTMLElement>('.dp-row.dp-index-row');
    if (!indexRow) {
      table.innerHTML = '';
      indexRow = document.createElement('div');
      indexRow.className = 'dp-row dp-index-row';
      const emptyLabel = document.createElement('div');
      emptyLabel.className = 'dp-label';
      emptyLabel.textContent = '下标 i';
      indexRow.appendChild(emptyLabel);
      for (let i = 0; i <= n; i++) {
        const indexCell = document.createElement('div');
        indexCell.className = 'dp-cell';
        indexCell.style.background = 'transparent';
        indexCell.style.border = 'none';
        indexCell.innerHTML = `<span class="index" style="color: #94a3b8; font-size: 0.8rem; font-weight: 700;">${i}</span>`;
        indexRow.appendChild(indexCell);
      }
      table.appendChild(indexRow);
    }

    // Build value row (once)
    let valueRow = table.querySelector<HTMLElement>('.dp-row.dp-value-row');
    if (!valueRow) {
      valueRow = document.createElement('div');
      valueRow.className = 'dp-row dp-value-row';
      const valueLabel = document.createElement('div');
      valueLabel.className = 'dp-label';
      valueLabel.textContent = 'dp[i]';
      valueRow.appendChild(valueLabel);
      for (let i = 0; i <= n; i++) {
        const cell = document.createElement('div');
        cell.className = 'dp-cell';
        cell.dataset.idx = String(i);
        const valSpan = document.createElement('span');
        valSpan.className = 'value';
        cell.appendChild(valSpan);
        valueRow.appendChild(cell);
      }
      table.appendChild(valueRow);
    }

    const currentIdx = step.current?.index ?? -1;
    const depIndices = new Set((step.dependencies || []).map(d => d.index));

    // Update cell values and styles
    const cells = valueRow.querySelectorAll<HTMLElement>('.dp-cell[data-idx]');
    cells.forEach((cell) => {
      const idx = Number(cell.dataset.idx);
      const valueEl = cell.querySelector<HTMLElement>('.value');
      const val = idx < dpArr.length ? dpArr[idx] : '-';
      if (valueEl) valueEl.textContent = String(val);

      const isCurrent = idx === currentIdx;
      const isDep = depIndices.has(idx);
      const isComputed = idx < currentIdx && val !== '-';

      cell.classList.toggle('current', isCurrent);
      cell.classList.toggle('depends', isDep);
      cell.classList.toggle('computed', isComputed && !isCurrent && !isDep);
    });

    // Draw dependency arc arrows (SVG)
    this.drawDependencyArcs(arcSvg, valueRow, currentIdx, step.dependencies || []);

    // Update formula breakdown card
    this.updateFormulaCard(formulaCard, step, currentIdx, dpArr);
  }

  /** Draw curved arc arrows from dependency cells to the current cell */
  private drawDependencyArcs(
    svg: SVGSVGElement,
    valueRow: HTMLElement,
    currentIdx: number,
    deps: Array<{ index?: number }>,
  ): void {
    // Clear previous arcs
    svg.innerHTML = '';

    if (currentIdx < 2 || deps.length === 0) {
      svg.style.height = '20px';
      return;
    }

    svg.style.height = '70px';

    // Get cell positions relative to valueRow
    const allCells = valueRow.querySelectorAll<HTMLElement>('.dp-cell[data-idx]');
    const cellMap = new Map<number, HTMLElement>();
    allCells.forEach(c => cellMap.set(Number(c.dataset.idx), c));

    const currentCell = cellMap.get(currentIdx);
    if (!currentCell) return;

    // Compute positions relative to the SVG (both are inside the same wrapper)
    const svgRect = svg.getBoundingClientRect();
    const getCellCenterX = (cell: HTMLElement): number => {
      const r = cell.getBoundingClientRect();
      return r.left + r.width / 2 - svgRect.left;
    };

    const targetX = getCellCenterX(currentCell);
    const svgH = 70;
    const arrowY = svgH - 4; // bottom of SVG = just above cells

    // Add defs for arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    const makeMarker = (id: string, color: string) => {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', id);
      marker.setAttribute('markerWidth', '8');
      marker.setAttribute('markerHeight', '8');
      marker.setAttribute('refX', '6');
      marker.setAttribute('refY', '4');
      marker.setAttribute('orient', 'auto');
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', '0 1, 7 4, 0 7');
      poly.setAttribute('fill', color);
      marker.appendChild(poly);
      defs.appendChild(marker);
    };

    makeMarker('arc-arrow-amber', '#fbbf24');
    makeMarker('arc-arrow-emerald', '#34d399');
    svg.appendChild(defs);

    // Sort deps by index so i-2 draws first (taller arc), i-1 draws second (shorter arc)
    const sortedDeps = [...deps].filter(d => d.index != null).sort((a, b) => a.index! - b.index!);

    sortedDeps.forEach((dep, dIdx) => {
      const depCell = cellMap.get(dep.index!);
      if (!depCell) return;

      const sourceX = getCellCenterX(depCell);
      // Arc height: farther dep = taller arc
      const distance = Math.abs(currentIdx - dep.index!);
      const arcPeak = arrowY - (distance === 2 ? 52 : 30);

      const color = distance === 2 ? '#fbbf24' : '#34d399';
      const markerId = distance === 2 ? 'arc-arrow-amber' : 'arc-arrow-emerald';

      // Quadratic bezier curve
      const midX = (sourceX + targetX) / 2;
      const d = `M ${sourceX} ${arrowY} Q ${midX} ${arcPeak} ${targetX} ${arrowY}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '2.2');
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', `url(#${markerId})`);
      path.setAttribute('opacity', '0.85');
      path.style.filter = `drop-shadow(0 0 4px ${color}40)`;

      // Animate arc drawing
      const len = path.getTotalLength?.() ?? 200;
      path.setAttribute('stroke-dasharray', String(len));
      path.setAttribute('stroke-dashoffset', String(len));
      path.style.animation = `fib-arc-draw 0.5s ${dIdx * 0.15}s ease-out forwards`;

      svg.appendChild(path);

      // Label on the arc midpoint
      const labelX = midX + (distance === 2 ? -8 : 8);
      const labelY = arcPeak + 14;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(labelX));
      label.setAttribute('y', String(labelY));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '11');
      label.setAttribute('font-weight', '700');
      label.setAttribute('font-family', 'JetBrains Mono, Consolas, monospace');
      label.setAttribute('fill', color);
      label.textContent = `dp[${dep.index}]`;
      label.style.opacity = '0';
      label.style.animation = `fib-arc-label 0.3s ${0.3 + dIdx * 0.15}s ease-out forwards`;
      svg.appendChild(label);
    });
  }

  /** Update the formula breakdown card below the table */
  private updateFormulaCard(
    card: HTMLElement,
    step: FibEvolutionStep,
    currentIdx: number,
    dpArr: (number | string | null)[],
  ): void {
    if (currentIdx < 2) {
      // Base case initialization
      card.innerHTML = `
        <div style="font-size: 13px; color: #60a5fa; font-weight: 700;">🎬 边界初始化 (Base Case)</div>
        <div style="font-size: 14px; color: #e2e8f0;">
          dp[0] = <span style="color: #6ee7b7; font-weight: 800;">0</span>，
          dp[1] = <span style="color: #6ee7b7; font-weight: 800;">1</span>
        </div>
        <div style="font-size: 11px; color: #94a3b8;">递推的基底，所有后续状态由此而来。</div>
      `;
      card.style.borderColor = 'rgba(96, 165, 250, 0.35)';
      return;
    }

    const prev2 = currentIdx - 2 >= 0 ? dpArr[currentIdx - 2] : '?';
    const prev1 = currentIdx - 1 >= 0 ? dpArr[currentIdx - 1] : '?';
    const result = dpArr[currentIdx] ?? '?';

    card.innerHTML = `
      <div style="font-size: 13px; color: #fbbf24; font-weight: 700;">⚡ 状态转移方程</div>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 15px; color: #e2e8f0;">
        <span>dp[<span style="color:#60a5fa; font-weight:800;">${currentIdx}</span>]</span>
        <span style="color:#94a3b8;">=</span>
        <span style="color: #fbbf24;">dp[${currentIdx - 2}]</span>
        <span style="color:#94a3b8;">+</span>
        <span style="color: #34d399;">dp[${currentIdx - 1}]</span>
        <span style="color:#94a3b8;">=</span>
        <span style="color: #fbbf24; font-weight:800;">${prev2}</span>
        <span style="color:#94a3b8;">+</span>
        <span style="color: #34d399; font-weight:800;">${prev1}</span>
        <span style="color:#94a3b8;">=</span>
        <span style="color: #60a5fa; font-weight: 900; font-size: 17px;">${result}</span>
      </div>
      <div style="font-size: 11px; color: #94a3b8;">
        读取 <span style="color:#fbbf24;">前两项 dp[${currentIdx - 2}]=${prev2}</span> 与
        <span style="color:#34d399;">前一项 dp[${currentIdx - 1}]=${prev1}</span>，
        求和填入当前格。
      </div>
    `;
    card.style.borderColor = 'rgba(251, 191, 36, 0.35)';
  }

  private renderRollingVars(step: FibEvolutionStep): void {
    if (!this.rollingContainer) return;
    const vars = step.rollingVars;
    if (!vars) return;

    if (this.valPrev2) this.valPrev2.textContent = String(vars.prev2);
    if (this.valPrev1) this.valPrev1.textContent = String(vars.prev1);
    if (this.valCurr) this.valCurr.textContent = String(vars.curr);

    if (this.cardCurr) {
      this.cardCurr.classList.add('active');
    }
    if (this.cardPrev1) {
      this.cardPrev1.classList.toggle('highlight', step.codeLine === 6 || (Array.isArray(step.codeLine) && step.codeLine.includes(6)));
    }
    if (this.cardPrev2) {
      this.cardPrev2.classList.toggle('highlight', step.codeLine === 6 || (Array.isArray(step.codeLine) && step.codeLine.includes(6)));
    }
  }

  private updateStats(): void {
    const step = this.steps[this.currentStepIndex];
    if (!step) return;

    const metrics = step.metrics || {};
    if (this.statCallsEl) this.statCallsEl.textContent = String(metrics.calls ?? (this.currentStepIndex + 1));
    if (this.statHitsEl) this.statHitsEl.textContent = String(metrics.hits ?? '0');
    
    if (this.statNaiveCallsEl) {
      const naiveTotal = this.calculateNaiveCalls(this.inputValue);
      this.statNaiveCallsEl.textContent = String(naiveTotal);
    }
  }

  private calculateNaiveCalls(n: number): number {
    if (n <= 1) return 1;
    let a = 1, b = 1;
    for (let i = 2; i <= n; i++) {
      const c = a + b + 1;
      a = b;
      b = c;
    }
    return b;
  }

  private updateButtons(): void {
    if (!this.btnPrev || !this.btnNext || !this.btnPlayPause) return;

    this.btnPrev.disabled = this.currentStepIndex === 0;
    this.btnNext.disabled = this.currentStepIndex >= this.steps.length - 1;

    const isFinished = this.currentStepIndex >= this.steps.length - 1;
    this.btnPlayPause.textContent = this.isPlaying ? '暂停' : (isFinished ? '完成' : '播放');
  }

  public destroy(): void {
    this.pause();
    this.steps = [];
    this.currentStepIndex = 0;
    if (this.codePanel) {
      this.codePanel.destroy();
      this.codePanel = null;
    }
    if (this.btnStart) this.btnStart.onclick = null;
    if (this.btnPrev) this.btnPrev.onclick = null;
    if (this.btnNext) this.btnNext.onclick = null;
    if (this.btnPlayPause) this.btnPlayPause.onclick = null;
    if (this.btnReset) this.btnReset.onclick = null;
    if (this.speedSlider) this.speedSlider.oninput = null;
    this.root = null;
  }
}

registerAlgorithm({
  id: 'fibonacci',
  name: '斐波那契数',
  viewId: 'algo-fibonacci-view',
  category: 'dynamic-programming',
  description: '自顶向下到自底向上 4 阶段演化：1. 朴素递归 ➔ 2. 记忆化搜索 ➔ 3. 递推填表 ➔ 4. 空间滚动压缩',
  icon: '🔢',
  template,
  Visualizer: FibonacciVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解从自顶向下递归分治一步步演化到常数空间滚动动态规划的全部思维脉络',
});