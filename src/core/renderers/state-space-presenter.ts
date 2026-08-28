/**
 * 状态空间与多看板统一表现呈现器 (StateSpacePresenter Deep Module)
 * 遵循单一职责与深模块原则：
 * 统合 Card 1 (主执行沙盘/网格/一维槽位/3D透视) 与 Card 2 (状态数组/DP转移表/递归调用树) 的多态视觉呈现。
 * 外部控制器无需关注底层 DOM 结构与多看板分支条件，提供高杠杆极简调用接口。
 */

import type { UniversalStep } from '../universal-stage-engine';
import { GridVisualAdapter, RecursionTreeAdapter } from './grid-visual-adapter';
import { ThreeGridVisualAdapter } from './three-grid-visual-adapter';

export interface StateSpacePresentationOptions {
  currentStage: string;
  stage3SubView?: 'matrix' | 'tree';
  step: UniversalStep;
  m: number;
  n: number;
  isReverse?: boolean;
  is3DMode?: boolean;
  modelId: string;
  isGridProblem?: boolean;
}

export class StateSpacePresenter {
  /**
   * 统合渲染 Card 1 (沙盘/网格看板)
   */
  public static renderCard1(
    container: HTMLElement | null,
    options: StateSpacePresentationOptions
  ): void {
    if (!container) return;
    const { step, m, n, isReverse = false, is3DMode = false, modelId, isGridProblem = false } = options;

    const effectiveM = (step.grid && step.grid.length > 1) ? step.grid.length : m;
    const effectiveN = (step.grid && step.grid[0] && step.grid[0].length > 0) ? step.grid[0].length : n;

    // 1. 3D WebGL 立体透视沙盘更新
    if (is3DMode && typeof document !== 'undefined') {
      const threeContainer = document.getElementById('three-canvas-container');
      if (threeContainer && !threeContainer.classList.contains('hidden')) {
        ThreeGridVisualAdapter.getInstance().updateStep(step, {
          m: effectiveM,
          n: effectiveN,
          isReverse,
          modelId,
          isGridProblem
        });
      }
    }

    // 2. 2D 平面网格/槽位沙盘渲染
    GridVisualAdapter.renderGrid(container, step, {
      m: effectiveM,
      n: effectiveN,
      isReverse,
      modelId,
      isGridProblem
    });
  }

  /**
   * 统合渲染 Card 2 (状态转移表/记忆化树/滚动数组看板)
   */
  public static renderCard2(
    container: HTMLElement | null,
    options: StateSpacePresentationOptions
  ): void {
    if (!container) return;
    const { currentStage, stage3SubView, step, m, n, isReverse = false } = options;

    const effectiveM = (step.grid && step.grid.length > 1) ? step.grid.length : m;
    const effectiveN = (step.grid && step.grid[0] && step.grid[0].length > 0) ? step.grid[0].length : n;

    if (currentStage === 'stage-4' || currentStage === 'stage-5') {
      // 阶段 4 / 阶段 5: 一维滚动数组压缩槽位
      GridVisualAdapter.renderLiteMemoSlots(container, step, effectiveN);
    } else if (currentStage === 'stage-3') {
      // 阶段 3: 状态转移表 vs 状态依赖树
      const is2DGrid = (effectiveM > 1 || (step.grid && step.grid.length > 1));
      if (stage3SubView === 'tree' && step.treeRoot) {
        RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId, true);
      } else if (is2DGrid && step.grid && step.grid.length > 1) {
        GridVisualAdapter.renderStage3DPTable(container, step, { m: effectiveM, n: effectiveN, isReverse });
      } else if (step.dp1d && step.dp1d.length > 0) {
        GridVisualAdapter.renderLiteMemoSlots(container, step, effectiveN);
      } else {
        GridVisualAdapter.renderStage3DPTable(container, step, { m: effectiveM, n: effectiveN, isReverse });
      }
    } else if (currentStage === 'stage-1' || currentStage === 'stage-2') {
      // 阶段 1 / 阶段 2: 递归分支搜索树 / 记忆化剪枝树
      RecursionTreeAdapter.renderRecursionTree(
        container,
        step.treeRoot,
        step.activeNodeId,
        currentStage === 'stage-2'
      );
    }
  }

  /**
   * Lite 模式完整视觉渲染编排 (卡片1沙盘 + 卡片2状态 + 图例 + 日志流)
   */
  public static renderLiteVisuals(
    options: StateSpacePresentationOptions,
    steps: UniversalStep[],
    currentIndex: number
  ): void {
    if (typeof document === 'undefined') return;

    const isGridProblem = ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(options.modelId);
    const fullOptions = { ...options, isGridProblem };

    const card1El = (document.getElementById('card1-wrapper') || document.getElementById('card1-title')?.parentElement?.parentElement || document.getElementById('card1-title')?.parentElement) as HTMLElement | null;
    const btnToggle3d = document.getElementById('btn-toggle-3d');

    if (card1El) card1El.style.display = '';
    if (btnToggle3d) btnToggle3d.style.display = '';

    // 图例同步
    const legendRefEl = document.getElementById('legend-ref');
    if (legendRefEl) {
      legendRefEl.innerHTML = options.isReverse ? '🐱 参考下方/右方' : '🐱 参考上方/左方';
    }

    // 卡片 1: 沙盘 / 网格看板
    const gridContainer = document.getElementById('grid-container');
    this.renderCard1(gridContainer, fullOptions);

    // 卡片 2: 状态展示区
    const memoContainer = document.getElementById('memo-array-container') || document.getElementById('memo-slots-container');
    this.renderCard2(memoContainer, fullOptions);

    // 执行日志渲染
    const logContainer = document.getElementById('log-container');
    const logCountEl = document.getElementById('log-count');
    this.renderStepLogStream(logContainer, steps, currentIndex, logCountEl);
  }

  /**
   * 渲染动态执行日志流 (Step Log Stream)
   */
  public static renderStepLogStream(
    container: HTMLElement | null,
    steps: UniversalStep[],
    currentIndex: number,
    logCountEl?: HTMLElement | null
  ): void {
    if (!container || !steps || steps.length === 0) return;
    container.innerHTML = '';

    const currentStep = steps[currentIndex];
    if (logCountEl) {
      logCountEl.textContent = `${currentIndex + 1} / ${steps.length} 记录`;
    }

    const logList = document.createElement('div');
    logList.className = 'space-y-1 font-mono-code text-xs';

    for (let idx = 0; idx <= currentIndex; idx++) {
      const s = steps[idx];
      const line = document.createElement('div');
      const isCurrent = idx === currentIndex;

      line.className = isCurrent
        ? 'px-2 py-1 rounded bg-blue-50 text-blue-900 font-bold border-l-2 border-blue-500 shadow-2xs flex items-center justify-between'
        : 'px-2 py-0.5 text-slate-500 text-[11px] flex items-center justify-between hover:bg-slate-50 rounded transition';

      const logText = s.log || s.msg || `步骤 ${idx + 1}: ${s.type}`;
      line.innerHTML = `<span>${logText}</span><span class="text-[10px] text-slate-400 font-normal">#${idx + 1}</span>`;
      logList.appendChild(line);
    }

    container.appendChild(logList);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * 渲染 Full 全景模式视觉单元格、一维槽位与实时变量监视器
   */
  public static renderFullVisuals(
    step: UniversalStep,
    m: number,
    n: number,
    currentStage: string
  ): void {
    if (typeof document === 'undefined') return;

    const explainer = document.getElementById('step-explainer-content');
    if (explainer) explainer.textContent = step.log || step.msg || '';
    const badge = document.getElementById('step-action-tag') || document.getElementById('step-action-badge');
    if (badge) {
      badge.textContent = step.type || '执行计算';
    }

    // 二维网格单元格着色与状态同步
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const cell = document.getElementById(`grid-cell-${r}-${c}`);
        if (!cell) continue;

        const isCurrent = step.i === r && step.j === c;
        const isTop = step.topI === r && step.topJ === c;
        const isLeft = step.leftI === r && step.leftJ === c;
        const val = step.grid?.[r]?.[c] ?? null;

        const valEl = cell.querySelector('.cell-val');
        const indEl = cell.querySelector('.cell-indicator');

        if (valEl) valEl.textContent = val !== null ? String(val) : '-';

        cell.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex flex-col items-center justify-between p-1 relative transition-all duration-200';
        if (isCurrent) {
          cell.className += ' bg-blue-50/90 border-blue-500 shadow-md scale-105 z-10';
          if (indEl) indEl.className = 'h-1.5 w-8 rounded-full bg-blue-500';
        } else if (isTop) {
          cell.className += ' bg-purple-50/90 border-purple-400 shadow-xs';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-purple-400';
        } else if (isLeft) {
          cell.className += ' bg-amber-50/90 border-amber-400 shadow-xs';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-amber-400';
        } else if (val !== null) {
          cell.className += ' bg-slate-50 border-slate-200';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-emerald-400';
        } else {
          cell.className += ' bg-white border-slate-200';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-slate-100';
        }
      }
    }

    // 阶段 4: 一维数组槽位更新
    if (currentStage === 'stage-4' && step.memo) {
      const slotsContainer = document.getElementById('one-d-array-slots');
      GridVisualAdapter.updateFullMemoSlots(slotsContainer, step, n);
    }

    // Live variables watch 更新
    const varI = document.getElementById('var-i');
    const varJ = document.getElementById('var-j');
    const varDown = document.getElementById('var-down');
    const varRight = document.getElementById('var-right');
    const varMemoj = document.getElementById('var-memoj');
    const varReturn = document.getElementById('var-return');

    if (varI) varI.textContent = step.i !== undefined && step.i >= 0 ? String(step.i) : '-';
    if (varJ) varJ.textContent = step.j !== undefined && step.j >= 0 ? String(step.j) : '-';
    if (varDown) varDown.textContent = step.topI !== undefined ? String(step.grid?.[step.topI]?.[step.topJ || 0] ?? '-') : '-';
    if (varRight) varRight.textContent = step.leftI !== undefined ? String(step.grid?.[step.leftI]?.[step.leftJ || 0] ?? '-') : '-';
    if (varMemoj) varMemoj.textContent = step.grid?.[step.i]?.[step.j] !== undefined ? String(step.grid[step.i][step.j]) : '-';
    if (varReturn) varReturn.textContent = step.grid?.[m - 1]?.[n - 1] !== undefined ? String(step.grid[m - 1][n - 1]) : '-';
  }

  /**
   * 统合同步 Lite 与 Full 模式的步数计数器与滑块
   */
  public static updateStepCounters(index: number, totalSteps: number): void {
    if (typeof document === 'undefined') return;

    // Lite mode 计数器
    const curEl = document.getElementById('step-cur');
    const totEl = document.getElementById('step-total');
    if (curEl) curEl.textContent = String(index + 1);
    if (totEl) totEl.textContent = String(totalSteps);
    const slider = document.getElementById('slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(Math.max(0, totalSteps - 1));
      slider.value = String(index);
    }

    // Full mode 计数器
    const fullCurEl = document.getElementById('current-step-num');
    const fullTotEl = document.getElementById('total-steps-num');
    if (fullCurEl) fullCurEl.textContent = String(index + 1);
    if (fullTotEl) fullTotEl.textContent = String(totalSteps);
  }

  /**
   * 重构 Full 模式初始网格布局与槽位结构
   */
  public static rebuildFullLayout(
    gridContainer: HTMLElement | null,
    m: number,
    n: number,
    isReverse: boolean,
    currentStage: string
  ): void {
    if (typeof document === 'undefined') return;

    const oneDSection = document.getElementById('one-d-array-section');
    const slotsContainer = document.getElementById('one-d-array-slots');

    if (currentStage === 'stage-4') {
      if (oneDSection) oneDSection.classList.remove('hidden');
      if (slotsContainer) GridVisualAdapter.build1DSlots(slotsContainer, n, 'dp');
    } else {
      if (oneDSection) oneDSection.classList.add('hidden');
    }

    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const cell = document.createElement('div');
        cell.id = `grid-cell-${r}-${c}`;
        cell.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border-2 border-slate-200 flex flex-col items-center justify-between p-1 relative transition-all duration-200 shadow-xs';

        let marker = '';
        if (r === 0 && c === 0) marker = isReverse ? '<span class="absolute -top-2 -left-2 px-1 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-xs">🏆 Finish</span>' : '<span class="absolute -top-2 -left-2 px-1 py-0.2 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-xs">🚩 Start</span>';
        if (r === m - 1 && c === n - 1) marker = isReverse ? '<span class="absolute -bottom-2 -right-2 px-1 py-0.2 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-xs">🚩 Start</span>' : '<span class="absolute -bottom-2 -right-2 px-1 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-xs">🏆 Finish</span>';

        cell.innerHTML = `
          ${marker}
          <span class="text-[10px] font-mono-code text-slate-400">(${r},${c})</span>
          <span class="text-sm sm:text-base font-mono-code font-bold text-slate-700 cell-val">-</span>
          <div class="h-1.5 w-6 rounded-full bg-slate-100 cell-indicator"></div>
        `;
        gridContainer.appendChild(cell);
      }
    }
  }

  /**
   * 3D/2D 透视模式切换的 DOM 同步 (容器显隐、WebGL 挂载/卸载、按钮样式)
   */
  public static update3DPerspectiveUI(options: {
    is3DMode: boolean;
    modelId: string;
    m: number;
    n: number;
    currentStep?: UniversalStep;
  }): void {
    if (typeof document === 'undefined') return;
    const { is3DMode, modelId, m, n, currentStep } = options;

    const boardWrapper = document.getElementById('grid-board-wrapper');
    const threeContainer = document.getElementById('three-canvas-container');
    const threeControls = document.getElementById('three-controls-bar');
    const btnToggle = document.getElementById('btn-toggle-3d');
    const labelToggle = document.getElementById('label-toggle-3d');

    const isGridProblem = ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(modelId);

    if (is3DMode) {
      if (threeContainer) {
        threeContainer.classList.remove('hidden');
        ThreeGridVisualAdapter.getInstance().mount(threeContainer);
        if (currentStep) {
          ThreeGridVisualAdapter.getInstance().updateStep(currentStep, {
            m, n, modelId, isGridProblem
          });
        }
      }
      if (threeControls) {
        threeControls.classList.remove('hidden');
        threeControls.classList.add('flex');
      }
      if (boardWrapper) boardWrapper.classList.add('hidden');
    } else {
      if (threeContainer) {
        threeContainer.classList.add('hidden');
        ThreeGridVisualAdapter.getInstance().dispose();
      }
      if (threeControls) {
        threeControls.classList.add('hidden');
        threeControls.classList.remove('flex');
      }
      if (boardWrapper) boardWrapper.classList.remove('hidden');
    }

    if (btnToggle) {
      if (is3DMode) {
        btnToggle.className = 'px-2 py-0.5 rounded-lg border border-indigo-500 bg-indigo-600 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs';
        if (labelToggle) labelToggle.textContent = '3D立体';
      } else {
        btnToggle.className = 'px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition flex items-center gap-1 shadow-2xs';
        if (labelToggle) labelToggle.textContent = '2D平面';
      }
    }
  }
  /**
   * 重置 3D WebGL 镜头位姿到默认位置
   */
  public static reset3DCamera(): void {
    ThreeGridVisualAdapter.getInstance().resetCameraPosition();
  }
}


