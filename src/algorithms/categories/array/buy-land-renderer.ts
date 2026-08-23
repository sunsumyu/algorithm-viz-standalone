/**
 * 开发商购买土地可视化器（二维前缀和）
 * 在矩阵中寻找和 ≤ 预算的最大面积连续区域
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './buy-land.html?raw';

interface BLStep {
  grid: number[][];
  budget: number;
  phase: 'prefix' | 'scan';
  r1: number; c1: number; r2: number; c2: number;
  currentSum: number;
  currentArea: number;
  bestArea: number;
  bestRect: [number, number, number, number] | null;
  prefix: number[][];
  status: 'init' | 'build-prefix' | 'scan-rect' | 'update-best' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export class BuyLandVisualizer extends StepVisualizer<BLStep> {
  protected codeLines = [
    'public int[] buyLand(int[][] grid, int budget) {',
    '    int m = grid.length, n = grid[0].length;',
    '    // 构建二维前缀和',
    '    int[][] prefix = new int[m + 1][n + 1];',
    '    for (int i = 0; i < m; i++)',
    '        for (int j = 0; j < n; j++)',
    '            prefix[i + 1][j + 1] = grid[i][j]',
    '                + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];',
    '    int bestArea = 0; int[] bestRect = null;',
    '    // 枚举所有子矩阵',
    '    for (int r1 = 0; r1 < m; r1++)',
    '      for (int c1 = 0; c1 < n; c1++)',
    '        for (int r2 = r1; r2 < m; r2++)',
    '          for (int c2 = c1; c2 < n; c2++) {',
    '            int sum = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1]',
    '                      - prefix[r2 + 1][c1] + prefix[r1][c1];',
    '            if (sum <= budget) {',
    '                int area = (r2 - r1 + 1) * (c2 - c1 + 1);',
    '                if (area > bestArea) {',
    '                    bestArea = area;',
    '                    bestRect = new int[]{r1, c1, r2, c2};',
    '                }',
    '            }',
    '    return new int[]{bestArea, bestRect[0], bestRect[1], bestRect[2], bestRect[3]};',
    '}',
  ];
  protected codePanelTitle = '购买土地 Java 实现';

  private gridInput: HTMLInputElement | null = null;
  private budgetInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private gridArea: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private rc1El: HTMLElement | null = null;
  private rc2El: HTMLElement | null = null;
  private sumEl: HTMLElement | null = null;
  private bestEl: HTMLElement | null = null;
  private phaseLabel: HTMLElement | null = null;
  private maxLabel: HTMLElement | null = null;

  /** 持久化结构：phase + 维度变化时才重建，否则复用、增量 toggle class */
  private curPhase: 'none' | 'prefix' | 'scan' = 'none';
  private curRows = 0;
  private curCols = 0;
  private gridWrapEl: HTMLElement | null = null;
  private prefixLabelEl: HTMLElement | null = null;
  private sumInfoEl: HTMLElement | null = null;
  /** cellGrid[row][col]：二维复用 */
  private cellGrid: HTMLElement[][] = [];
  /** 覆盖层：前缀阶段为单格扫描指针，扫描阶段为当前矩形 */
  private overlayEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.gridInput = this.root.querySelector('#bl-grid-input');
    this.budgetInput = this.root.querySelector('#bl-budget-input');
    this.btnStart = this.root.querySelector('#bl-start');
    this.exampleButtons = this.root.querySelectorAll('.bl-example-btn');
    this.gridArea = this.root.querySelector('#bl-grid-area');
    this.logEl = this.root.querySelector('#bl-log');
    this.rc1El = this.root.querySelector('#bl-rc1');
    this.rc2El = this.root.querySelector('#bl-rc2');
    this.sumEl = this.root.querySelector('#bl-sum');
    this.bestEl = this.root.querySelector('#bl-best');
    this.phaseLabel = this.root.querySelector('#bl-phase-label');
    this.maxLabel = this.root.querySelector('#bl-max-label');
    this.bindPlaybackControls({ message: 'step-message' });

    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.gridInput) this.gridInput.value = btn.dataset.grid || '';
        if (this.budgetInput) this.budgetInput.value = btn.dataset.budget || '';
        this.start();
      };
    });
  }

  private parseGrid(input: string): number[][] {
    return input.split(/[;\n]+/).map((row) =>
      row.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n))
    ).filter((row) => row.length > 0);
  }

  protected buildSteps(): BLStep[] {
    const grid = this.parseGrid(this.gridInput?.value || '1,2,3;4,5,6;7,8,9');
    const budget = parseInt(this.budgetInput?.value || '20', 10);
    const m = grid.length;
    const n = grid[0]?.length || 0;
    const steps: BLStep[] = [];

    if (m === 0 || n === 0) {
      steps.push({
        grid: [], budget, phase: 'scan', r1: 0, c1: 0, r2: 0, c2: 0,
        currentSum: 0, currentArea: 0, bestArea: 0, bestRect: null, prefix: [],
        status: 'init', message: '矩阵为空，无法计算。', log: '错误：空矩阵。', codeLine: 0,
      });
      return steps;
    }

    // Init step
    steps.push({
      grid, budget, phase: 'prefix', r1: -1, c1: -1, r2: -1, c2: -1,
      currentSum: 0, currentArea: 0, bestArea: 0, bestRect: null,
      prefix: Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0)),
      status: 'init',
      message: `初始化：${m}×${n} 矩阵，预算=${budget}。准备构建二维前缀和。`,
      log: `矩阵 ${m}×${n}，预算 ${budget}。`,
      codeLine: [0, 1],
    });

    // Build 2D prefix sum
    const prefix: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        prefix[i + 1][j + 1] = grid[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];
        const snapPrefix = prefix.map((r) => [...r]);
        steps.push({
          grid, budget, phase: 'prefix', r1: i, c1: j, r2: -1, c2: -1,
          currentSum: prefix[i + 1][j + 1], currentArea: 0, bestArea: 0, bestRect: null,
          prefix: snapPrefix,
          status: 'build-prefix',
          message: `构建前缀和：prefix[${i + 1}][${j + 1}] = grid[${i}][${j}](${grid[i][j]}) + prefix[${i}][${j + 1}] + prefix[${i + 1}][${j}] - prefix[${i}][${j}] = ${prefix[i + 1][j + 1]}`,
          log: `prefix[${i + 1}][${j + 1}] = ${prefix[i + 1][j + 1]}`,
          codeLine: [3, 4, 5, 6, 7],
        });
      }
    }

    // Enumerate all rectangles
    let bestArea = 0;
    let bestRect: [number, number, number, number] | null = null;

    for (let r1 = 0; r1 < m; r1++) {
      for (let c1 = 0; c1 < n; c1++) {
        for (let r2 = r1; r2 < m; r2++) {
          for (let c2 = c1; c2 < n; c2++) {
            const sum = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1];
            const area = (r2 - r1 + 1) * (c2 - c1 + 1);
            const snapPrefix = prefix.map((r) => [...r]);
            const inBudget = sum <= budget;

            if (inBudget && area > bestArea) {
              bestArea = area;
              bestRect = [r1, c1, r2, c2];
              steps.push({
                grid, budget, phase: 'scan', r1, c1, r2, c2,
                currentSum: sum, currentArea: area, bestArea, bestRect: [...bestRect] as [number, number, number, number],
                prefix: snapPrefix,
                status: 'update-best',
                message: `矩形 (${r1},${c1})→(${r2},${c2})：sum=${sum} ≤ budget=${budget}，area=${area} > bestArea=${bestArea - area}，更新最优！bestArea=${bestArea}`,
                log: `✓ (${r1},${c1})→(${r2},${c2}) sum=${sum} area=${area} → 新最优`,
                codeLine: [14, 15, 16, 17, 18, 19, 20],
              });
            } else {
              steps.push({
                grid, budget, phase: 'scan', r1, c1, r2, c2,
                currentSum: sum, currentArea: area, bestArea, bestRect: bestRect ? [...bestRect] as [number, number, number, number] : null,
                prefix: snapPrefix,
                status: 'scan-rect',
                message: inBudget
                  ? `矩形 (${r1},${c1})→(${r2},${c2})：sum=${sum} ≤ budget=${budget}，area=${area}，但 area ≤ bestArea=${bestArea}，不更新。`
                  : `矩形 (${r1},${c1})→(${r2},${c2})：sum=${sum} > budget=${budget}，超出预算，跳过。`,
                log: inBudget
                  ? `(${r1},${c1})→(${r2},${c2}) sum=${sum} area=${area} ≤ best=${bestArea}`
                  : `✗ (${r1},${c1})→(${r2},${c2}) sum=${sum} > ${budget}`,
                codeLine: inBudget ? [14, 15, 16, 17] : [14, 15, 16],
              });
            }
          }
        }
      }
    }

    // Done step
    steps.push({
      grid, budget, phase: 'scan', r1: -1, c1: -1, r2: -1, c2: -1,
      currentSum: 0, currentArea: 0, bestArea, bestRect: bestRect ? [...bestRect] as [number, number, number, number] : null,
      prefix: prefix.map((r) => [...r]),
      status: 'done',
      message: bestRect
        ? `搜索完成！最优区域 (${bestRect[0]},${bestRect[1]})→(${bestRect[2]},${bestRect[3]})，面积=${bestArea}。`
        : `搜索完成！未找到满足预算的区域。`,
      log: bestRect
        ? `结果：(${bestRect[0]},${bestRect[1]})→(${bestRect[2]},${bestRect[3]})，面积=${bestArea}。`
        : '无可行区域。',
      codeLine: 23,
    });

    return steps;
  }

  protected renderStep(step: BLStep): void {
    // Stats
    if (this.rc1El) {
      this.rc1El.textContent = step.r1 >= 0 ? `${step.r1},${step.c1}` : '-';
    }
    if (this.rc2El) {
      this.rc2El.textContent = step.r2 >= 0 ? `${step.r2},${step.c2}` : '-';
    }
    if (this.sumEl) {
      this.sumEl.textContent = step.status !== 'init' ? String(step.currentSum) : '-';
    }
    if (this.bestEl) {
      this.bestEl.textContent = String(step.bestArea);
    }
    if (this.phaseLabel) {
      this.phaseLabel.textContent = step.phase === 'prefix' ? '阶段一：构建二维前缀和' : '阶段二：枚举所有子矩阵';
    }
    if (this.maxLabel) {
      this.maxLabel.textContent = step.bestArea > 0 ? `最优面积: ${step.bestArea}` : '';
    }

    if (!this.gridArea || step.grid.length === 0) return;

    // 决定本步网格维度与数据源
    const m = step.grid.length;
    const n = step.grid[0].length;
    const isPrefix = step.phase === 'prefix';
    const rows = isPrefix && step.status !== 'init' ? m + 1 : m;
    const cols = isPrefix && step.status !== 'init' ? n + 1 : n;

    // 结构变化时重建（phase 切换 / 维度变化）
    this.ensureGridStructure(step, rows, cols);

    // 更新 label 文案
    if (this.prefixLabelEl) {
      this.prefixLabelEl.textContent = isPrefix
        ? (step.status === 'init' ? '原始矩阵' : '二维前缀和矩阵')
        : '枚举子矩阵';
    }

    // 更新每个 cell 的内容与 class
    if (isPrefix) {
      this.renderPrefixCells(step, rows, cols);
    } else {
      this.renderScanCells(step, m, n);
    }

    // 更新覆盖层位置（平滑滑动）
    this.updateOverlay(step, rows, cols);

    // sum 信息行
    if (!isPrefix && step.status !== 'done') {
      if (this.sumInfoEl) {
        const overBudget = step.currentSum > step.budget;
        this.sumInfoEl.innerHTML = `sum = ${step.currentSum} ${overBudget ? '>' : '≤'} budget(${step.budget})` +
          ` | area = ${step.currentArea} | best = ${step.bestArea}`;
        this.sumInfoEl.style.color = overBudget ? '#f87171' : '#34d399';
        this.sumInfoEl.style.display = '';
      }
    } else if (this.sumInfoEl) {
      this.sumInfoEl.style.display = 'none';
    }

    this.renderLogLine(step);
  }

  /** 确保网格结构存在且维度匹配；不匹配则重建。复用时保留 DOM，只 toggle class */
  private ensureGridStructure(step: BLStep, rows: number, cols: number): void {
    const area = this.gridArea;
    if (!area) return;
    const wantPhase: 'prefix' | 'scan' = step.phase === 'prefix' ? 'prefix' : 'scan';
    const needRebuild =
      !this.gridWrapEl ||
      this.curPhase !== wantPhase ||
      this.curRows !== rows ||
      this.curCols !== cols ||
      this.cellGrid.length !== rows ||
      (rows > 0 && (this.cellGrid[0]?.length ?? 0) !== cols);

    if (!needRebuild) {
      // 仍要保证 overlay 存在
      this.ensureOverlay();
      return;
    }

    // 重建：清空 gridArea
    area.innerHTML = '';
    this.cellGrid = [];
    this.overlayEl = null;
    this.prefixLabelEl = null;
    this.sumInfoEl = null;

    this.prefixLabelEl = document.createElement('div');
    this.prefixLabelEl.className = 'bl-phase-label';
    area.appendChild(this.prefixLabelEl);

    this.gridWrapEl = document.createElement('div');
    this.gridWrapEl.className = 'bl-grid-wrap';
    for (let i = 0; i < rows; i++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'bl-grid-row';
      const rowCells: HTMLElement[] = [];
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'bl-cell';
        rowDiv.appendChild(cell);
        rowCells.push(cell);
      }
      this.gridWrapEl.appendChild(rowDiv);
      this.cellGrid.push(rowCells);
    }
    area.appendChild(this.gridWrapEl);

    // sum 信息行（扫描阶段显示在网格下方）
    this.sumInfoEl = document.createElement('div');
    this.sumInfoEl.className = 'bl-phase-label';
    this.sumInfoEl.style.marginTop = '8px';
    this.sumInfoEl.style.display = 'none';
    area.appendChild(this.sumInfoEl);

    this.ensureOverlay();
    this.curPhase = wantPhase;
    this.curRows = rows;
    this.curCols = cols;
  }

  private ensureOverlay(): void {
    if (this.overlayEl || !this.gridWrapEl) return;
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'bl-overlay';
    this.gridWrapEl.appendChild(this.overlayEl);
  }

  /** 前缀阶段：渲染前缀和矩阵，高亮当前构建位置 */
  private renderPrefixCells(step: BLStep, rows: number, cols: number): void {
    const m = step.grid.length;
    const n = step.grid[0].length;
    const data = step.status === 'init' ? step.grid : step.prefix;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = this.cellGrid[i]?.[j];
        if (!cell) continue;
        const val = data[i]?.[j] ?? 0;
        const intensity = Math.min(val / 30, 1);
        const isCurrent = step.status === 'build-prefix' && i === step.r1 + 1 && j === step.c1 + 1;
        cell.classList.toggle('prefix-cell', step.status === 'build-prefix');
        cell.classList.toggle('prefix-current', isCurrent);
        if (isCurrent) {
          cell.style.background = 'rgba(52, 211, 153, 0.25)';
        } else if (step.status === 'init') {
          cell.style.background = `rgba(52, 211, 153, ${0.05 + intensity * 0.3})`;
        } else {
          cell.style.background = `rgba(52, 211, 153, ${0.03 + intensity * 0.15})`;
        }
        cell.innerHTML = `<span class="val">${val}</span><span class="coord">[${i},${j}]</span>`;
      }
    }
  }

  /** 扫描阶段：渲染原始网格，高亮当前矩形与最优矩形 */
  private renderScanCells(step: BLStep, m: number, n: number): void {
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const cell = this.cellGrid[i]?.[j];
        if (!cell) continue;
        const val = step.grid[i][j];
        const intensity = Math.min(val / 15, 1);
        cell.style.background = `rgba(52, 211, 153, ${0.05 + intensity * 0.2})`;

        const inCurrentRect = step.r1 >= 0 && step.r2 >= 0 &&
          i >= step.r1 && i <= step.r2 && j >= step.c1 && j <= step.c2;
        const inBestRect = step.bestRect !== null &&
          i >= step.bestRect[0] && i <= step.bestRect[2] &&
          j >= step.bestRect[1] && j <= step.bestRect[3];

        cell.classList.toggle('in-rect', inCurrentRect && step.currentSum <= step.budget);
        cell.classList.toggle('over-budget', inCurrentRect && step.currentSum > step.budget);
        cell.classList.toggle('best', inBestRect && step.status === 'update-best');
        cell.innerHTML = `<span class="val">${val}</span><span class="coord">${i},${j}</span>`;
      }
    }
  }

  /** 覆盖层定位：前缀阶段为单格扫描指针，扫描阶段为当前矩形 */
  private updateOverlay(step: BLStep, rows: number, cols: number): void {
    if (!this.overlayEl) return;
    const m = step.grid.length;
    const n = step.grid[0].length;

    if (step.phase === 'prefix') {
      // 前缀阶段：覆盖当前构建的格子 (r1+1, c1+1)；init/done 时隐藏
      if (step.status !== 'build-prefix') {
        this.overlayEl.style.opacity = '0';
        return;
      }
      const r = step.r1 + 1;
      const c = step.c1 + 1;
      const cell = this.cellGrid[r]?.[c];
      if (!cell) { this.overlayEl.style.opacity = '0'; return; }
      this.positionOverlayToRect(cell, cell, 'bl-overlay-scan');
    } else {
      // 扫描阶段：覆盖 (r1,c1)-(r2,c2) 矩形；done 时隐藏
      if (step.r1 < 0 || step.r2 < 0 || step.status === 'done') {
        this.overlayEl.style.opacity = '0';
        return;
      }
      const tl = this.cellGrid[step.r1]?.[step.c1];
      const br = this.cellGrid[step.r2]?.[step.c2];
      if (!tl || !br) { this.overlayEl.style.opacity = '0'; return; }
      this.positionOverlayToRect(tl, br, step.currentSum > step.budget ? 'bl-overlay-over' : 'bl-overlay-rect');
    }
  }

  /** 把覆盖层定位到由左上 cell 与右下 cell 围成的矩形区域，整体平移 */
  private positionOverlayToRect(
    tlCell: HTMLElement, brCell: HTMLElement, variantClass: string
  ): void {
    if (!this.overlayEl || !this.gridWrapEl) return;
    const x = tlCell.offsetLeft;
    const y = tlCell.offsetTop;
    const w = brCell.offsetLeft + brCell.offsetWidth - tlCell.offsetLeft;
    const h = brCell.offsetTop + brCell.offsetHeight - tlCell.offsetTop;
    // 切换矩形/超额的视觉变体 class
    this.overlayEl.classList.remove('bl-overlay-scan', 'bl-overlay-rect', 'bl-overlay-over');
    this.overlayEl.classList.add(variantClass);
    this.overlayEl.style.transform = `translate(${x}px, ${y}px)`;
    this.overlayEl.style.width = `${w}px`;
    this.overlayEl.style.height = `${h}px`;
    this.overlayEl.style.opacity = '1';
  }

  private renderLogLine(step: BLStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(3, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'buy-land',
  name: '开发商购买土地（二维前缀和）',
  viewId: 'algo-buy-land-view',
  category: 'array',
  description: '在矩阵中寻找和 ≤ 预算的最大面积连续区域',
  icon: '🏞️',
  template,
  Visualizer: BuyLandVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握二维前缀和与子矩阵枚举',
});

export {};
