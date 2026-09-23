/**
 * 状态空间与多看板统一表现呈现器 (StateSpacePresenter Deep Module)
 * 遵循单一职责与深模块原则：
 * 统合 Card 1 (主执行沙盘/网格/一维槽位/3D透视) 与 Card 2 (状态数组/DP转移表/递归调用树) 的多态视觉呈现。
 * 外部控制器无需关注底层 DOM 结构与多看板分支条件，提供高杠杆极简调用接口。
 */

import type { UniversalStep } from '../universal-stage-engine';
import { GridVisualAdapter, RecursionTreeAdapter, MemoSlotVisualAdapter } from './grid-visual-adapter';
import { SequenceAlignmentPresenter } from './sequence-alignment-adapter';
import { ThreeGridVisualAdapter } from './three-grid-visual-adapter';
import { ThreeLayeredVoxelAdapter } from './three-layered-voxel-adapter';
import { LayeredVoxelStepAdapter } from './layered-voxel-step-adapter';
import { ProblemDimensionResolver } from '../resolvers/problem-dimension-resolver';
import { ThreeViewControlsAdapter } from './three-view-controls-adapter';
import { AlgorithmModelRepository } from '../model-repository';
import { parseTreeArray, buildRawTree, toUniversalTree } from '../strategies/tree-dp-shared';

export interface StateSpacePresentationOptions {
  currentStage: string;
  stage3SubView?: 'matrix' | 'tree' | 'alignment';
  stage4SubView?: 'memo' | 'alignment';
  card2SubView?: 'tree' | 'alignment' | 'stack' | 'matrix' | 'memo';
  step: UniversalStep;
  m: number;
  n: number;
  isReverse?: boolean;
  is3DMode?: boolean;
  is3DLayered?: boolean;
  modelId: string;
  isGridProblem?: boolean;
}

export class StateSpacePresenter {
  /**
   * 局部容器查询辅助方法 (Scoped Locality Query)
   * 优先在局部挂载根/当前容器层级内查找部件，避免全局 ID 冲突；
   * 若局部无匹配且在浏览器环境中，才降级查找 document。
   */
  private static queryScoped(scope: HTMLElement | null, selector: string): HTMLElement | null {
    if (!scope) {
      if (typeof document !== 'undefined') {
        try {
          if (selector.startsWith('#') && typeof document.getElementById === 'function') {
            const el = document.getElementById(selector.slice(1));
            if (el) return el as HTMLElement;
          }
          return document.querySelector ? (document.querySelector(selector) as HTMLElement | null) : null;
        } catch {}
      }
      return null;
    }
    try {
      const fromScope = scope.querySelector?.(selector) as HTMLElement | null;
      if (fromScope) return fromScope;
    } catch {}
    try {
      const parent = ((scope as any).closest?.('.view-container') || scope.parentElement) as HTMLElement | null;
      if (parent) {
        const fromParent = parent.querySelector?.(selector) as HTMLElement | null;
        if (fromParent) return fromParent;
      }
    } catch {}
    if (typeof document !== 'undefined') {
      try {
        if (selector.startsWith('#') && typeof document.getElementById === 'function') {
          const el = document.getElementById(selector.slice(1));
          if (el) return el as HTMLElement;
        }
        return document.querySelector ? (document.querySelector(selector) as HTMLElement | null) : null;
      } catch {}
    }
    return null;
  }

  /**
   * 统合渲染 Card 1 (沙盘/网格看板)
   */
  public static renderCard1(
    container: HTMLElement | null,
    options: StateSpacePresentationOptions
  ): void {
    if (!container) return;
    const { step, m, n, isReverse = false, is3DMode = false, modelId, isGridProblem = false, currentStage } = options;

    const isTreeProblem = ProblemDimensionResolver.isTreeProblem(modelId, { m, n });
    if (isTreeProblem) {
      // 树型题目：卡片 1 作为主视图展示二叉树拓扑结构图与子树剪枝
      const threeContainer = this.queryScoped(container, '#three-canvas-container');
      if (threeContainer) threeContainer.classList.add('hidden');
      const threeControls = this.queryScoped(container, '#three-controls-bar');
      if (threeControls) {
        threeControls.classList.add('hidden');
        threeControls.classList.remove('flex');
      }
      const boardWrapper = this.queryScoped(container, '#grid-board-wrapper');
      if (boardWrapper) {
        boardWrapper.classList.remove('hidden');
        boardWrapper.className = 'w-full h-full flex flex-col items-center justify-start relative overflow-auto';
      }

      const arrowsSvg = this.queryScoped(container, '#grid-arrows-svg');
      if (arrowsSvg) arrowsSvg.style.display = 'none';
      const riverBarrier = this.queryScoped(container, '#grid-river-barrier');
      if (riverBarrier) riverBarrier.style.display = 'none';

      container.className = 'w-full h-full flex items-center justify-center relative';
      container.style.border = 'none';
      container.style.boxShadow = 'none';
      container.style.background = 'transparent';

      let activeTree = step.treeRoot;
      if (!activeTree && AlgorithmModelRepository.hasModel(modelId)) {
        const model = AlgorithmModelRepository.getModel(modelId);
        const rawRoot = (model.defaultParams as any)?.root ?? '[0,0,null,0,0]';
        try {
          const arr = parseTreeArray(rawRoot);
          const rawTree = buildRawTree(arr);
          if (rawTree) {
            activeTree = toUniversalTree(rawTree, rawTree.id);
          }
        } catch {}
      }

      if (activeTree) {
        RecursionTreeAdapter.renderRecursionTree(
          container,
          activeTree,
          step.activeNodeId,
          currentStage === 'stage-2'
        );
      }
      return;
    }

    const isPureGrid = isGridProblem || ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(modelId);
    const effectiveM = isPureGrid ? ((step.grid && step.grid.length > 1) ? step.grid.length : m) : (m > 1 ? m : 1);
    const effectiveN = (step.grid && step.grid[0] && step.grid[0].length > 0) ? step.grid[0].length : n;

    // 1. 3D WebGL 立体透视沙盘更新
    if (is3DMode) {
      const threeContainer = this.queryScoped(container, '#three-canvas-container');
      if (threeContainer && !threeContainer.classList.contains('hidden')) {
        const is3DLayered = options.is3DLayered ?? (['out-of-boundary-paths', 'knight-probability', 'paths-divisible-by-k', 'profitable-schemes', 'scramble-string'].includes(modelId));
        if (is3DLayered) {
          const adapter = ThreeLayeredVoxelAdapter.getInstance();
          adapter.mount(threeContainer);
          const kLayers = Math.max(3, (step as any).maxMove ? (step as any).maxMove + 1 : 4);
          const stepData = LayeredVoxelStepAdapter.adapt(step, {
            layers: kLayers,
            rows: effectiveM,
            cols: effectiveN
          });
          adapter.render(stepData, {
            layers: kLayers,
            rows: effectiveM,
            cols: effectiveN
          });
        } else {
          ThreeGridVisualAdapter.getInstance().updateStep(step, {
            m: effectiveM,
            n: effectiveN,
            isReverse,
            modelId,
            isGridProblem
          });
        }
      }
    }

    let rowLabels: string[] | undefined;
    let colLabels: string[] | undefined;
    let isMatch: ((r: number, c: number) => boolean) | undefined;
    let cornerLabel: string | undefined;

    let sStr: string | undefined = typeof (step as any).s === 'string'
      ? (step as any).s
      : ((step as any).s1 || (step as any).word1 || (step as any).text1);
    let tStr: string | undefined = typeof (step as any).t === 'string'
      ? (step as any).t
      : ((step as any).s2 || (step as any).word2 || (step as any).text2);

    if (!sStr || !tStr) {
      if (AlgorithmModelRepository.hasModel(modelId)) {
        const model = AlgorithmModelRepository.getModel(modelId);
        const params = model.defaultParams as any;
        if (params) {
          sStr = typeof params.s === 'string'
            ? params.s
            : (typeof params.s1 === 'string'
                ? params.s1
                : (typeof params.word1 === 'string'
                    ? params.word1
                    : params.text1));
          tStr = typeof params.t === 'string'
            ? params.t
            : (typeof params.s2 === 'string'
                ? params.s2
                : (typeof params.word2 === 'string'
                    ? params.word2
                    : params.text2));
        }
      }
    }

    if (sStr && tStr && effectiveM === sStr.length + 1 && effectiveN === tStr.length + 1) {
      // 判定序列语义坐标轴模式：
      // 1. Stage 1/2 顺推递归：从 dfs(0, 0) 开始向后探索后缀，0..m-1 对应字符，终点 m/n 对应空串 Ø（后缀模式）
      // 2. Stage 3 逆推填表：从右下角向左上角逆向填表，末尾对应空串 Ø（后缀模式）
      // 3. Stage 3 顺推填表 或 Stage 1/2 逆推递归：以空前缀 Ø 为基底，0 对应 Ø，1..m 对应字符（前缀模式）
      const isSuffixMode = ((currentStage === 'stage-1' || currentStage === 'stage-2') && !isReverse) ||
                           ((currentStage === 'stage-3' || currentStage === 'stage-4') && isReverse);

      if (isSuffixMode) {
        rowLabels = [...sStr.split(''), 'Ø'];
        colLabels = [...tStr.split(''), 'Ø'];
        isMatch = (r, c) => r < sStr!.length && c < tStr!.length && sStr![r] === tStr![c];
      } else {
        rowLabels = ['Ø', ...sStr.split('')];
        colLabels = ['Ø', ...tStr.split('')];
        isMatch = (r, c) => r > 0 && c > 0 && sStr![r - 1] === tStr![c - 1];
      }
      const lbl1 = (step as any).label1 || 's';
      const lbl2 = (step as any).label2 || 't';
      cornerLabel = `${lbl1}(i) \\ ${lbl2}(j)`;
    } else if (!rowLabels && AlgorithmModelRepository.hasModel(modelId)) {
      const model = AlgorithmModelRepository.getModel(modelId);
      const params = model.defaultParams as any;
      if (params && params.weights && (params.bagWeight !== undefined || params.target !== undefined)) {
        const weights = Array.isArray(params.weights) ? params.weights : [];
        const values = Array.isArray(params.values) ? params.values : [];
        if (weights.length > 0 && effectiveM === weights.length) {
          rowLabels = weights.map((w: number | string, idx: number) => `物${idx}(w:${w},v:${values[idx] ?? w})`);
          colLabels = Array.from({ length: effectiveN }, (_, c) => `容${c}`);
          cornerLabel = '物品(i) \\ 容量(j)';
        }
      }
    }

    if (!colLabels && (step.colLabels || step.slotLabels)) {
      colLabels = step.colLabels || step.slotLabels;
    }

    // 2. 2D 平面网格/槽位沙盘渲染
    // 强防御：若非 2D 网格问题且 effectiveM === 1，Card 1 作为一维沙盘，绝不接受多行决策矩阵污染与二维行列标！
    let stepForCard1 = step;
    let card1RowLabels = rowLabels;
    let card1CornerLabel = cornerLabel;
    let card1ColLabels = colLabels;

    if (!isPureGrid && effectiveM === 1) {
      stepForCard1 = {
        ...step,
        grid: step.grid && step.grid.length > 0 ? [step.grid[0]] : undefined,
        rowLabels: undefined,
      };
      card1RowLabels = undefined;
      card1CornerLabel = '槽位(i)';
      // 彻底隔离：若存在 step.grid 说明原 colLabels 是二维决策表的属性标头（初始距离/速度等），Card 1 只能使用真实槽位标号
      if (step.grid && step.grid.length > 1) {
        card1ColLabels = step.slotLabels || Array.from({ length: effectiveN }, (_, c) => `槽${c}`);
      }
    }

    GridVisualAdapter.renderGrid(container, stepForCard1, {
      m: effectiveM,
      n: effectiveN,
      isReverse,
      modelId,
      isGridProblem,
      rowLabels: card1RowLabels,
      colLabels: card1ColLabels,
      isMatch,
      cornerLabel: card1CornerLabel,
      deps: (step as any).deps,
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

    const isTreeProblem = ProblemDimensionResolver.isTreeProblem(options.modelId, { m, n });
    if (isTreeProblem) {
      // 树型题目：卡片 1 已作为主视图呈现二叉树拓扑结构，卡片 2 专注于展示一维/多维 DP 状态转移监视器
      if (Array.isArray(step.stateArrays) && step.stateArrays.length > 0) {
        MemoSlotVisualAdapter.renderStateArrays(container, step.stateArrays, step);
        return;
      }
      GridVisualAdapter.renderLiteMemoSlots(container, step, effectiveN);
      return;
    }

    if (currentStage === 'stage-4' || currentStage === 'stage-5') {
      // 阶段 4 / 阶段 5: 一维滚动数组压缩槽位 vs 串比对
      if (options.stage4SubView === 'alignment' || options.card2SubView === 'alignment') {
        this.renderSequenceAlignmentCard2(container, step, options);
      } else {
        GridVisualAdapter.renderLiteMemoSlots(container, step, effectiveN);
      }
    } else if (currentStage === 'stage-3') {
      // 阶段 3: 状态转移表 vs 状态依赖树 vs 串比对
      if (stage3SubView === 'alignment' || options.card2SubView === 'alignment') {
        this.renderSequenceAlignmentCard2(container, step, options);
      } else {
        const is2DGrid = (effectiveM > 1 || (step.grid && step.grid.length > 1));
        let rowLabels: string[] | undefined;
        let colLabels: string[] | undefined;
        let cornerLabel: string | undefined;
        const currentModel = AlgorithmModelRepository.hasModel(options.modelId) ? AlgorithmModelRepository.getModel(options.modelId) : null;
        const currentCategory = currentModel?.category;

        if (currentModel) {
          const params = currentModel.defaultParams as any;
          if (params && params.weights && (params.bagWeight !== undefined || params.target !== undefined)) {
            const weights = Array.isArray(params.weights) ? params.weights : [];
            const values = Array.isArray(params.values) ? params.values : [];
            if (weights.length > 0 && effectiveM === weights.length) {
              rowLabels = weights.map((w: number | string, idx: number) => `物${idx}(w:${w},v:${values[idx] ?? w})`);
              colLabels = Array.from({ length: effectiveN }, (_, c) => `容${c}`);
              cornerLabel = '物品(i) \\ 容量(j)';
            }
          }
        }

        if ((stage3SubView === 'tree' || (!is2DGrid && !step.grid && step.treeRoot)) && step.treeRoot) {
          RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId, true);
        } else if (is2DGrid && step.grid && step.grid.length > 1) {
          GridVisualAdapter.renderStage3DPTable(container, step, { m: effectiveM, n: effectiveN, isReverse, rowLabels, colLabels, cornerLabel, category: currentCategory });
        } else if (step.dp1d && step.dp1d.length > 0) {
          GridVisualAdapter.renderLiteMemoSlots(container, step, effectiveN);
        } else {
          GridVisualAdapter.renderStage3DPTable(container, step, { m: effectiveM, n: effectiveN, isReverse, rowLabels, colLabels, cornerLabel, category: currentCategory });
        }
      }
    } else if (currentStage === 'stage-1' || currentStage === 'stage-2') {
      // 阶段 1 / 阶段 2: 复合子视图调度 (递归树 / 双串比对 / 调用栈与变量 / 状态槽位)
      const subView = options.card2SubView || 'tree';
      if (subView === 'alignment') {
        this.renderSequenceAlignmentCard2(container, step, options);
      } else if (subView === 'stack') {
        this.renderCallStackCard2(container, step, options);
      } else if (!step.treeRoot && (step.stateArrays || step.decisions || step.dp1d)) {
        GridVisualAdapter.renderLiteMemoSlots(container, step, effectiveN);
      } else {
        const activeTree = step.treeRoot || ((step as any).treeNodes && (step as any).treeNodes[0]);
        RecursionTreeAdapter.renderRecursionTree(
          container,
          activeTree,
          step.activeNodeId,
          currentStage === 'stage-2'
        );
      }
    }
  }

  /**
   * Lite 模式完整视觉渲染编排 (卡片1沙盘 + 卡片2状态 + 图例 + 日志流)
   */
  public static renderLiteVisuals(
    options: StateSpacePresentationOptions,
    steps: UniversalStep[],
    currentIndex: number,
    rootScope?: HTMLElement | null
  ): void {
    if (typeof document === 'undefined' && !rootScope) return;

    const isTreeProblem = ProblemDimensionResolver.isTreeProblem(options.modelId);
    const isGridProblem = ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(options.modelId);
    const fullOptions = { ...options, isGridProblem };

    const card1El = (this.queryScoped(rootScope || null, '#card1-wrapper') ||
      this.queryScoped(rootScope || null, '#card1-title')?.parentElement?.parentElement ||
      this.queryScoped(rootScope || null, '#card1-title')?.parentElement) as HTMLElement | null;
    const btnToggle3d = this.queryScoped(rootScope || null, '#btn-toggle-3d');

    if (card1El) card1El.style.display = '';
    if (btnToggle3d) btnToggle3d.style.display = isTreeProblem ? 'none' : '';

    // 图例同步
    const legendRefEl = this.queryScoped(rootScope || null, '#legend-ref');
    if (legendRefEl) {
      if (isTreeProblem) {
        legendRefEl.style.display = 'none';
      } else {
        legendRefEl.style.display = '';
        legendRefEl.innerHTML = options.isReverse ? '🐱 参考下方/右方' : '🐱 参考上方/左方';
      }
    }

    // 卡片 1: 树型题目展示二叉树拓扑结构图，网格/线性题目展示沙盘看板
    const gridContainer = this.queryScoped(rootScope || null, '#grid-container');
    this.renderCard1(gridContainer, fullOptions);

    // 卡片 2: 状态展示区 (树型题目展示 DP 状态转移数组)
    const memoContainer = this.queryScoped(rootScope || null, '#memo-array-container') || this.queryScoped(rootScope || null, '#memo-slots-container');
    this.renderCard2(memoContainer, fullOptions);

    // 执行日志渲染
    const logContainer = this.queryScoped(rootScope || null, '#log-container');
    const logCountEl = this.queryScoped(rootScope || null, '#log-count');
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

    if (logCountEl) {
      logCountEl.textContent = `${currentIndex + 1} / ${steps.length} 记录`;
    }

    const doc = container.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    const logList = doc.createElement('div');
    logList.className = 'space-y-1 font-mono-code text-xs';

    for (let idx = 0; idx <= currentIndex; idx++) {
      const s = steps[idx];
      const line = doc.createElement('div');
      const isCurrent = idx === currentIndex;

      line.className = isCurrent
        ? 'px-2 py-1 rounded bg-blue-50 text-blue-900 font-bold border-l-2 border-blue-500 shadow-2xs flex items-center justify-between'
        : 'px-2 py-0.5 text-slate-500 text-[11px] flex items-center justify-between hover:bg-slate-50 rounded transition';

      const logText = s.log || s.decision || s.message || s.msg || (s.type ? `步骤 ${idx + 1}: ${s.type}` : `步骤 ${idx + 1}`);
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
    if (varMemoj) varMemoj.textContent = (step.i !== undefined && step.j !== undefined && step.grid?.[step.i]?.[step.j] !== undefined) ? String(step.grid[step.i][step.j]) : '-';
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

    const isTreeProblem = ProblemDimensionResolver.isTreeProblem(modelId, { m, n });
    if (isTreeProblem) {
      if (threeContainer) threeContainer.classList.add('hidden');
      if (threeControls) {
        threeControls.classList.add('hidden');
        threeControls.classList.remove('flex');
      }
      if (boardWrapper) {
        boardWrapper.classList.remove('hidden');
        boardWrapper.className = 'w-full h-full flex flex-col items-center justify-start relative overflow-auto';
      }
      if (btnToggle) btnToggle.style.display = 'none';
      return;
    }

    const isGridProblem = ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(modelId);
    const is3DLayered = ['out-of-boundary-paths', 'knight-probability', 'paths-divisible-by-k', 'profitable-schemes', 'scramble-string'].includes(modelId);

    if (is3DMode) {
      if (threeContainer) {
        threeContainer.classList.remove('hidden');
        if (is3DLayered) {
          ThreeLayeredVoxelAdapter.getInstance().mount(threeContainer);
          if (currentStep) {
            const kLayers = Math.max(3, (currentStep as any).maxMove ? (currentStep as any).maxMove + 1 : 4);
            const stepData = LayeredVoxelStepAdapter.adapt(currentStep, {
              layers: kLayers,
              rows: m,
              cols: n
            });
            ThreeLayeredVoxelAdapter.getInstance().render(stepData, {
              layers: kLayers,
              rows: m,
              cols: n
            });
          }
        } else {
          ThreeGridVisualAdapter.getInstance().mount(threeContainer);
          if (currentStep) {
            ThreeGridVisualAdapter.getInstance().updateStep(currentStep, {
              m, n, modelId, isGridProblem
            });
          }
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
        ThreeLayeredVoxelAdapter.getInstance().dispose();
        ThreeGridVisualAdapter.getInstance().dispose();
      }
      if (threeControls) {
        threeControls.classList.add('hidden');
        threeControls.classList.remove('flex');
      }
      if (boardWrapper) boardWrapper.classList.remove('hidden');
    }

    if (btnToggle) {
      ThreeViewControlsAdapter.syncToggleButtonState(btnToggle, is3DMode);
    }
  }
  /**
   * 重置 3D WebGL 镜头位姿到默认位置
   */
  public static reset3DCamera(): void {
    ThreeGridVisualAdapter.getInstance().resetCameraPosition();
  }

  /**
   * 渲染 Card 2 【🔤 字符串比对】复合子视图
   */
  public static renderSequenceAlignmentCard2(
    container: HTMLElement,
    step: UniversalStep,
    options: StateSpacePresentationOptions
  ): void {
    if (!container) return;

    let s1 = (step as any).s1 || (step as any).s || (step as any).word1 || (step as any).text1 || '';
    let s2 = (step as any).s2 || (step as any).t || (step as any).word2 || (step as any).text2 || '';

    if ((!s1 || !s2) && options?.modelId && AlgorithmModelRepository.hasModel(options.modelId)) {
      const model = AlgorithmModelRepository.getModel(options.modelId);
      const params = model.defaultParams as any;
      if (params) {
        if (!s1) {
          s1 = typeof params.s === 'string' ? params.s : (params.s1 || params.word1 || params.text1 || '');
        }
        if (!s2) {
          s2 = typeof params.t === 'string' ? params.t : (params.s2 || params.word2 || params.text2 || '');
        }
      }
    }

    if (!s1 || !s2) {
      container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 select-none">
          <i class="fa-solid fa-code-compare text-3xl mb-2 text-slate-300 dark:text-slate-600"></i>
          <div class="text-xs font-bold text-slate-600 dark:text-slate-300">非双字符串比对问题</div>
          <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">当前题目不具备双序列指针，请切换为【状态转移】或【滚动数组】视图。</div>
        </div>
      `;
      return;
    }

    const isStage3or4 = options.currentStage === 'stage-3' || options.currentStage === 'stage-4' || options.currentStage === 'stage-5';
    const curI = (step as any).curI !== undefined
      ? (step as any).curI
      : (isStage3or4 && step.i !== undefined && step.i > 0 ? step.i - 1 : (step.i !== undefined ? step.i : 0));
    const curJ = (step as any).curJ !== undefined
      ? (step as any).curJ
      : (isStage3or4 && step.j !== undefined && step.j > 0 ? step.j - 1 : (step.j !== undefined ? step.j : 0));

    SequenceAlignmentPresenter.render(container, {
      s1,
      s2,
      curI,
      curJ,
      label1: (step as any).label1 || '母串 S',
      label2: (step as any).label2 || '目标 T',
      matchedIndices1: (step as any).matchedIndices1,
      matchedIndices2: (step as any).matchedIndices2,
      isComparing: (step as any).isComparing !== undefined ? (step as any).isComparing : true,
      statusDescription: step.msg || step.log || step.tag
    });
  }

  /**
   * 渲染 Card 2 【📋 调用栈与变量】复合子视图
   */
  public static renderCallStackCard2(
    container: HTMLElement,
    step: UniversalStep,
    options: StateSpacePresentationOptions
  ): void {
    if (!container) return;

    const rawStack: Array<{ label: string; coord?: string }> = (step as any).callStack ||
      (step.activeStack && step.activeStack.length > 0
        ? step.activeStack.map((item: string) => ({ label: `dfs(${item})`, coord: item }))
        : [{ label: `dfs(${step.i ?? 0}, ${step.j ?? 0})`, coord: `${step.i ?? 0},${step.j ?? 0}` }]);

    const currentCall = (step as any).currentCall ||
      rawStack[rawStack.length - 1]?.label ||
      `dfs(${step.i ?? 0}, ${step.j ?? 0})`;

    const stackItemsHtml = rawStack.length > 0
      ? rawStack
          .slice(-8)
          .reverse()
          .map((item, idx) => {
            const isTop = idx === 0;
            const frameNum = rawStack.length - idx;
            return `
              <div class="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono transition-all ${
                isTop
                  ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }">
                <span class="flex items-center gap-1.5">
                  <span class="inline-block w-1.5 h-1.5 rounded-full ${isTop ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}"></span>
                  <span class="${isTop ? 'font-black' : 'font-semibold'}">${isTop ? '👉 TOP (栈顶)' : `FRAME #${frameNum}`}</span>
                </span>
                <span class="font-bold">${item.label}</span>
              </div>
            `;
          })
          .join('')
      : `<div class="text-slate-400 text-xs text-center py-4">调用栈为空 (未进入递归)</div>`;

    // 提取局部变量信息
    const s1 = (step as any).s1 || (step as any).s;
    const s2 = (step as any).s2 || (step as any).t;
    const curI = step.i !== undefined ? step.i : 0;
    const curJ = step.j !== undefined ? step.j : 0;
    const char1 = (s1 && curI >= 0 && curI < s1.length) ? `"${s1[curI]}"` : '-';
    const char2 = (s2 && curJ >= 0 && curJ < s2.length) ? `"${s2[curJ]}"` : '-';
    const isCacheHit = step.type === 'cache-hit';

    container.innerHTML = `
      <div class="w-full h-full flex flex-col gap-2 p-2 box-border overflow-hidden select-none">
        <!-- 头部：当前递归与栈深 -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 flex items-center justify-between shadow-2xs flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">当前探查:</span>
            <span class="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">${currentCall}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10.5px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono">
              深度: ${rawStack.length}
            </span>
            ${isCacheHit ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 px-1.5 py-0.5 rounded">🎯 命中缓存</span>` : ''}
          </div>
        </div>

        <!-- 局部变量实时监视板 -->
        <div class="grid grid-cols-4 gap-1.5 flex-shrink-0">
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded p-1.5 text-center">
            <div class="text-[9.5px] text-slate-400 font-medium">指标 i</div>
            <div class="text-xs font-bold font-mono text-slate-700 dark:text-slate-200">${curI}</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded p-1.5 text-center">
            <div class="text-[9.5px] text-slate-400 font-medium">指标 j</div>
            <div class="text-xs font-bold font-mono text-slate-700 dark:text-slate-200">${curJ}</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded p-1.5 text-center">
            <div class="text-[9.5px] text-slate-400 font-medium">s[i]</div>
            <div class="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">${char1}</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded p-1.5 text-center">
            <div class="text-[9.5px] text-slate-400 font-medium">t[j]</div>
            <div class="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">${char2}</div>
          </div>
        </div>

        <!-- 运行时刻调用栈列表 -->
        <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 flex-1 min-h-[90px] flex flex-col gap-1.5 overflow-hidden">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700/60 flex-shrink-0">
            <span>📚 运行时刻调用栈 (Call Stack)</span>
            <span class="text-[10px] text-slate-400 font-normal">最近 8 帧</span>
          </div>
          <div class="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-0.5">
            ${stackItemsHtml}
          </div>
        </div>

        <!-- 步骤说明栏 -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-600 dark:text-slate-300 shadow-2xs flex-shrink-0">
          <div class="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
            <i class="fa-solid fa-circle-info text-blue-500 text-[10px]"></i>
            <span>动作决策:</span>
          </div>
          <div class="text-[11.5px] leading-relaxed">${step.msg || step.log || step.tag || '递归探索中...'}</div>
        </div>
      </div>
    `;
  }
}


