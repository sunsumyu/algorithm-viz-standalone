/**
 * 动态规划专题通用步进可视化器
 */

import { StepVisualizer, StepBase } from '../../../core/step-visualizer';
import { DpActionMeta, DpStoryMeta, DpBacktrackStep } from '../../../core/interfaces';
import { SplitterEngine } from '../../../core/splitter-engine';
import { CodePanel } from '../../../core/code-panel';
import {
  EvolutionModeId,
  EVOLUTION_MODES,
  getEvolutionCodeForAlgorithm,
  buildUniversalEvolutionSteps,
} from './dp-universal-evolution';
import { renderThematicStage, DpThematicMeta } from './dp-thematic-stages';
import { DpStepEngine } from './engine/dp-step-engine';
import { renderStaircaseSVG } from './views/staircase-stage';
import { renderDp1d, renderDp2d } from './views/table-stage';
import { renderWorkshopHUD, renderStory, renderBacktrack } from './views/workshop-stage';
import { renderLectureHUD } from './views/lecture-hud';
import { setupHandbookModal } from './views/handbook-modal';
import { renderDpTreeSVG } from './engine/visual-adapter';

export type DpCell = string | number | null;

export interface DpTreeNode {
  id: number | string;
  val: number | string;
  left?: DpTreeNode | null;
  right?: DpTreeNode | null;
  children?: DpTreeNode[];
  /** 边上的决策标注，如 "✓ A" 或 "✗ A" */
  edgeLabel?: string;
  /** 节点形状: 'circle' (默认) | 'rect' (矩形决策块 i/cap) */
  shape?: 'circle' | 'rect';
  /** 节点底部的辅助数值/价值 */
  subVal?: string | number;
  /** 后序 DP 或状态推导计算出的文本 */
  tag?: string;
  /** 节点状态: 'current' | 'dependency' | 'visited' | 'selected' | 'normal' */
  status?: 'current' | 'dependency' | 'visited' | 'selected' | 'normal';
}

export interface DpDecisionBranch {
  title: string;
  tag: string;
  action: string;
  formula: string;
  val: number | string;
  depIdx?: number;
}

export interface DpDecisionBreakdown {
  currentCap: number;
  itemWeight: number;
  notTake: DpDecisionBranch;
  take: DpDecisionBranch;
  winner: 'take' | 'notTake' | 'same';
  conclusion: string;
}

export interface DpStaircaseStepInfo {
  totalSteps: number;
  costs?: number[];
  dp?: (number | string | null)[];
  currentStep: number;
  fromSteps?: number[];
  bestFromStep?: number;
  characterPosition?: number;
  isGoal?: boolean;
}

export interface DpDemoStep extends StepBase {
  source?: string[];
  target?: string[];
  dp1d?: DpCell[];
  dp2d?: DpCell[][];
  tree?: DpTreeNode | null;
  staircase?: DpStaircaseStepInfo | null;
  rowLabels?: string[];
  colLabels?: string[];
  current?: { i?: number; j?: number; index?: number; sourceIndex?: number | number[] };
  dependencies?: Array<{ i?: number; j?: number; index?: number; sourceIndex?: number }>;
  formula?: string;
  formulaSubstituted?: string;
  breakdown?: DpDecisionBreakdown | null;
  metrics?: Record<string, string | number>;
  message: string;
  log: string;
  actionMeta?: DpActionMeta;
  storyMeta?: DpStoryMeta;
  backtrackPath?: DpBacktrackStep[];
  thematicMeta?: DpThematicMeta;
  rollingVars?: {
    prev2: number | string;
    prev1: number | string;
    curr: number | string;
    activeCard?: 'prev2' | 'prev1' | 'curr' | 'none';
    rule?: string;
  };
}

export interface DpInputDef {
  id: string;
  label: string;
  value: string;
  width?: number;
  type?: 'text' | 'select' | 'number';
  options?: Array<{ value: string; label: string }>;
}

export interface DpDemoConfig<TParams> {
  title: string;
  description: string;
  inputs: DpInputDef[];
  examples?: Array<{ label: string; values: Record<string, string> }>;
  metrics: Array<{ key: string; label: string }>;
  codeLines: string[];
  codeLanguages?: Record<string, string[]>;
  codePanelTitle: string;
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  keyPoints?: import('../../../core/code-panel').KeyPointsData | string;
  problemDetail?: import('../../../core/code-panel').ProblemDetail;
  faqList?: Array<{ question: string; answer: string; tag?: string }>;
  parseParams(root: HTMLElement): TParams;
  buildSteps(params: TParams, mode?: import('../../../core/interfaces').ExecutionStepMode): DpDemoStep[];
}

export function createDpDemoVisualizer<TParams>(config: DpDemoConfig<TParams>) {
  return class DpDemoVisualizer extends StepVisualizer<DpDemoStep> {
    protected codeLines = config.codeLines;
    protected codeLanguages = config.codeLanguages || {};
    protected codePanelTitle = config.codePanelTitle;
    protected lineExplanations = config.lineExplanations;
    protected keyPoints = config.keyPoints;

    private titleEl: HTMLElement | null = null;
    private descEl: HTMLElement | null = null;
    private controlsEl: HTMLElement | null = null;
    private metricsEl: HTMLElement | null = null;
    private sourceEl: HTMLElement | null = null;
    private treeEl: HTMLElement | null = null;
    private dp1dEl: HTMLElement | null = null;
    private dp2dEl: HTMLElement | null = null;
    private staircaseEl: HTMLElement | null = null;
    private thematicStageEl: HTMLElement | null = null;
    private breakdownEl: HTMLElement | null = null;
    private formulaEl: HTMLElement | null = null;
    private logEl: HTMLElement | null = null;
    private faqEl: HTMLElement | null = null;

    private rollingStageEl: HTMLElement | null = null;
    private valPrev2El: HTMLElement | null = null;
    private valPrev1El: HTMLElement | null = null;
    private valCurrEl: HTMLElement | null = null;
    private cardPrev2El: HTMLElement | null = null;
    private cardPrev1El: HTMLElement | null = null;
    private cardCurrEl: HTMLElement | null = null;
    private rollingRuleCodeEl: HTMLElement | null = null;
    private bottomTitleEl: HTMLElement | null = null;

    private workshopSourceEl: HTMLElement | null = null;
    private workshopTargetEl: HTMLElement | null = null;
    private workshopHudEl: HTMLElement | null = null;
    private storyGoalEl: HTMLElement | null = null;
    private storyBranchesEl: HTMLElement | null = null;
    private storyConclusionEl: HTMLElement | null = null;
    private backtrackSummaryEl: HTMLElement | null = null;
    private backtrackTimelineEl: HTMLElement | null = null;

    private lecturePhaseEl: HTMLElement | null = null;
    private lectureCoordsEl: HTMLElement | null = null;
    private lectureVarsBoxEl: HTMLElement | null = null;
    private lectureVarsListEl: HTMLElement | null = null;
    private handbookModalEl: HTMLElement | null = null;

    protected initDOMElements(): void {
      if (!this.root) return;
      this.titleEl = this.root.querySelector('#dp-title');
      this.descEl = this.root.querySelector('#dp-desc');
      this.controlsEl = this.root.querySelector('#dp-controls');
      this.metricsEl = this.root.querySelector('#dp-metrics');
      this.sourceEl = this.root.querySelector('#dp-source');
      this.treeEl = this.root.querySelector('#dp-tree');
      this.dp1dEl = this.root.querySelector('#dp-1d');
      this.dp2dEl = this.root.querySelector('#dp-2d');
      this.staircaseEl = this.root.querySelector('#dp-staircase');
      this.thematicStageEl = this.root.querySelector('#dp-thematic-stage');
      this.breakdownEl = this.root.querySelector('#dp-breakdown');
      this.formulaEl = this.root.querySelector('#dp-formula');
      this.logEl = this.root.querySelector('#dp-log');
      this.faqEl = this.root.querySelector('#dp-faq');

      this.rollingStageEl = this.root.querySelector('#dp-rolling-stage');
      this.valPrev2El = this.root.querySelector('#dp-val-prev2');
      this.valPrev1El = this.root.querySelector('#dp-val-prev1');
      this.valCurrEl = this.root.querySelector('#dp-val-curr');
      this.cardPrev2El = this.root.querySelector('#dp-card-prev2');
      this.cardPrev1El = this.root.querySelector('#dp-card-prev1');
      this.cardCurrEl = this.root.querySelector('#dp-card-curr');
      this.rollingRuleCodeEl = this.root.querySelector('#dp-rolling-rule-code');
      this.bottomTitleEl = this.root.querySelector('.dp-bottom-stage-container .dp-panel-title');

      this.workshopSourceEl = this.root.querySelector('#dp-workshop-source');
      this.workshopTargetEl = this.root.querySelector('#dp-workshop-target');
      this.workshopHudEl = this.root.querySelector('#dp-workshop-action-hud');
      this.storyGoalEl = this.root.querySelector('#dp-story-goal');
      this.storyBranchesEl = this.root.querySelector('#dp-story-branches');
      this.storyConclusionEl = this.root.querySelector('#dp-story-conclusion');
      this.backtrackSummaryEl = this.root.querySelector('#dp-backtrack-summary');
      this.backtrackTimelineEl = this.root.querySelector('#dp-backtrack-timeline');

      this.lecturePhaseEl = this.root.querySelector('#dp-lecture-phase');
      this.lectureCoordsEl = this.root.querySelector('#dp-lecture-coords');
      this.lectureVarsBoxEl = this.root.querySelector('#dp-lecture-vars-box');
      this.lectureVarsListEl = this.root.querySelector('#dp-lecture-vars-list');
      this.handbookModalEl = this.root.querySelector('#dp-handbook-modal');

      const isStringDp = config.inputs.some((inp) => inp.id === 's') && config.inputs.some((inp) => inp.id === 't');
      const isStaircaseAlgo = config.title.includes('楼梯') || config.codePanelTitle.includes('楼梯') || config.description.includes('楼梯') || config.description.includes('台阶');
      const algoId = (this.algorithmId || '').toLowerCase();
      const isThematicAlgo = !isStaircaseAlgo && !isStringDp && (
        algoId.includes('bag') || algoId.includes('knapsack') || algoId.includes('partition') ||
        algoId.includes('stone') || algoId.includes('target-sum') || algoId.includes('ones-and-zeroes') ||
        algoId.includes('coin') || algoId.includes('combination-sum') || algoId.includes('perfect-square') ||
        algoId.includes('unique-paths') || algoId.includes('min-path-sum') || algoId.includes('triangle') ||
        algoId.includes('house-robber') || algoId.includes('robber') || algoId.includes('stock') ||
        algoId.includes('integer-break') || algoId.includes('cut') || algoId.includes('num-trees') ||
        config.title.includes('背包') || config.title.includes('零钱') || config.title.includes('路径') ||
        config.title.includes('打家劫舍') || config.title.includes('股票') || config.title.includes('拆分')
      );

      if (isStaircaseAlgo) {
        this.viewportMode = 'staircase';
      } else if (isThematicAlgo) {
        this.viewportMode = 'thematic';
      }

      this.renderStaticShell();
      this.setupHandbookModal();
      this.setupStageSplitter();
      this.setupEvolutionSelector();
      this.bindPlaybackControls({ message: 'step-message' });
      if (this.root) {
        this.root.dataset.viewportMode = this.viewportMode;
        const page = this.root.querySelector<HTMLElement>('.dp-demo-page');
        if (page) page.dataset.viewportMode = this.viewportMode;
      }
    }

    protected evolutionStage: EvolutionModeId = 'tabulation-bottomup';

    private setupEvolutionSelector(): void {
      if (!this.root) return;
      const evoBtns = this.root.querySelectorAll<HTMLButtonElement>('.dp-evo-btn');
      evoBtns.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.stage === this.evolutionStage);
        btn.addEventListener('click', () => {
          const stage = btn.dataset.stage as EvolutionModeId;
          if (stage && stage !== this.evolutionStage) {
            this.switchEvolutionStage(stage);
          }
        });
      });
    }

    public async switchEvolutionStage(stage: EvolutionModeId): Promise<void> {
      this.pause();
      this.evolutionStage = stage;

      // 1. 更新顶部演化选择器按钮的高亮
      const evoBtns = this.root?.querySelectorAll<HTMLButtonElement>('.dp-evo-btn');
      evoBtns?.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.stage === stage);
      });

      // 2. 重新初始化 CodePanel
      this.initCodePanel();

      // 3. 重新构建演化步进并渲染
      await this.start();
    }

    private getDirectionParam(): 'backward' | 'forward' {
      if (!this.root) return 'backward';
      const dirEl = this.root.querySelector<HTMLSelectElement | HTMLInputElement>('#dp-input-direction');
      if (dirEl && dirEl.value) {
        return dirEl.value === 'forward' ? 'forward' : 'backward';
      }
      const rawParams = config.parseParams(this.root) as any;
      if (rawParams && typeof rawParams === 'object' && rawParams.direction) {
        return rawParams.direction === 'forward' ? 'forward' : 'backward';
      }
      return 'backward';
    }

    protected override initCodePanel(): void {
      const container = this.root?.querySelector('[data-code-panel]') as HTMLElement | null;
      if (!container) return;

      this.codePanel?.destroy();
      this.codePanel = null;

      const spec = this.algorithmId ? DpStepEngine.get(this.algorithmId) : undefined;
      const codeLanguages = spec?.code?.languages || config.codeLanguages;
      const codeLines = codeLanguages
        ? (codeLanguages.javascript || codeLanguages.java || Object.values(codeLanguages)[0])
        : config.codeLines;
      const lineExplanations = spec?.code?.lineExplanations || config.lineExplanations;
      const keyPoints = spec?.code?.keyPoints || config.keyPoints;
      const problemDetail = spec?.problem || config.problemDetail;

      const direction = this.getDirectionParam();

      const stageConfig = getEvolutionCodeForAlgorithm(
        config.title,
        codeLines,
        codeLanguages,
        lineExplanations,
        keyPoints,
        this.evolutionStage,
        this.algorithmId || '',
        direction
      );

      const stageMeta = EVOLUTION_MODES.find((m) => m.id === this.evolutionStage);
      const title = `${config.codePanelTitle || (spec ? `${spec.name} 完整解题代码` : config.title)} (${stageMeta?.label || ''})`;

      this.codePanel = new CodePanel(container, {
        lines: stageConfig.lines,
        languages: stageConfig.languages,
        title,
        lineExplanations: stageConfig.lineExplanations,
        keyPoints: stageConfig.keyPoints,
        problemDetail,
        scope: this.algorithmId || undefined,
      });
    }

    private stageSplitter: SplitterEngine | null = null;

    private setupStageSplitter(): void {
      if (!this.root) return;
      const topStage = this.root.querySelector('.dp-top-stage-container') as HTMLElement | null;
      const dpMain = this.root.querySelector('.dp-main') as HTMLElement | null;
      if (!topStage || !dpMain) return;

      this.stageSplitter?.destroy();
      this.stageSplitter = new SplitterEngine({
        id: 'stage-top-height',
        direction: 'vertical',
        targetElement: topStage,
        containerElement: dpMain,
        defaultSize: 310,
        minSize: 180,
        maxRatio: 0.80,
        minRatio: 0.15,
        scope: this.algorithmId || undefined,
        mode: 'flex',
        attachPosition: 'after',
        invert: false,
        className: 'dp-stage-splitter',
        title: '上下拖拽调整动画与状态表格高度分配，双击恢复默认',
        onResize: () => {
          if (this.viewportMode === 'staircase') {
            const step = this.steps[this.currentIndex];
            if (step) this.renderStaircase(step);
          }
        },
      });
    }

    public override destroy(): void {
      super.destroy();
      this.stageSplitter?.destroy();
      this.stageSplitter = null;
    }

    protected onViewportModeChanged(mode: import('../../../core/interfaces').DpViewportMode): void {
      const isStaircaseAlgo = config.title.includes('楼梯') || config.codePanelTitle.includes('楼梯') || config.description.includes('楼梯') || config.description.includes('台阶');
      const finalMode = isStaircaseAlgo ? 'staircase' : mode;
      if (this.root) {
        this.root.dataset.viewportMode = finalMode;
        const page = this.root.querySelector<HTMLElement>('.dp-demo-page');
        if (page) page.dataset.viewportMode = finalMode;
      }
    }

    protected buildSteps(): DpDemoStep[] {
      if (!this.root) return [];
      const rawParams = config.parseParams(this.root);
      const direction = this.getDirectionParam();
      const resolvedParams =
        typeof HTMLElement !== 'undefined' && rawParams instanceof HTMLElement
          ? { root: rawParams, direction }
          : { ...(typeof rawParams === 'object' && rawParams ? rawParams : {}), direction };

      return buildUniversalEvolutionSteps(
        this.algorithmId,
        (params, mode) => {
          const root = typeof HTMLElement !== 'undefined' && params instanceof HTMLElement
            ? params
            : params?.root instanceof HTMLElement
            ? params.root
            : this.root;
          return config.buildSteps(root as any, mode);
        },
        resolvedParams,
        this.stepMode,
        this.evolutionStage
      );
    }

    protected renderStep(step: DpDemoStep): void {
      this.updateStageVisibility(step);
      this.renderSource(step);
      this.renderTree(step);
      this.renderRollingVars(step);
      this.renderStaircase(step);
      this.renderThematic(step);
      this.renderDp1d(step);
      this.renderDp2d(step);
      this.renderBreakdown(step);
      this.renderFormula(step);
      this.renderMetrics(step);
      this.renderWorkshop(step);
      this.renderStory(step);
      this.renderBacktrack(step);
      this.renderLectureHUD(step);
      this.renderLogLine();
    }

    private renderThematic(step: DpDemoStep): void {
      if (!this.thematicStageEl) return;
      renderThematicStage(this.thematicStageEl, this.algorithmId, step);
    }

    private updateStageVisibility(step: DpDemoStep): void {
      const isTreeMode = this.evolutionStage === 'naive-recursive' || this.evolutionStage === 'memo-topdown' || Boolean(step.tree);
      const isRollingMode = this.evolutionStage === 'space-optimized' || Boolean(step.rollingVars);
      const isStringDp = config.inputs.some((inp) => inp.id === 's') && config.inputs.some((inp) => inp.id === 't');
      const isStaircaseAlgo = config.title.includes('楼梯') || config.codePanelTitle.includes('楼梯') || config.description.includes('楼梯') || config.description.includes('台阶');
      const algoId = (this.algorithmId || '').toLowerCase();
      const isThematicAlgo = !isStaircaseAlgo && !isStringDp && (
        algoId.includes('bag') || algoId.includes('knapsack') || algoId.includes('partition') ||
        algoId.includes('stone') || algoId.includes('target-sum') || algoId.includes('ones-and-zeroes') ||
        algoId.includes('coin') || algoId.includes('combination-sum') || algoId.includes('perfect-square') ||
        algoId.includes('unique-paths') || algoId.includes('min-path-sum') || algoId.includes('triangle') ||
        algoId.includes('house-robber') || algoId.includes('robber') || algoId.includes('stock') ||
        algoId.includes('integer-break') || algoId.includes('cut') || algoId.includes('num-trees') ||
        config.title.includes('背包') || config.title.includes('零钱') || config.title.includes('路径') ||
        config.title.includes('打家劫舍') || config.title.includes('股票') || config.title.includes('拆分')
      );

      const hasTopStage = isStringDp || isStaircaseAlgo || isThematicAlgo || Boolean(step.thematicMeta) || Boolean(step.staircase);
      const topStage = this.root?.querySelector('.dp-top-stage-container') as HTMLElement | null;
      if (topStage) {
        topStage.style.display = hasTopStage ? 'flex' : 'none';
      }

      if (this.bottomTitleEl) {
        if (isTreeMode) {
          this.bottomTitleEl.textContent = this.evolutionStage === 'naive-recursive'
            ? '🌲 1. 朴素递归 · 自顶向下调用树与重叠子问题分析'
            : '⚡ 2. 记忆化搜索 · 备忘录缓存与 O(1) 查表剪枝';
        } else if (isRollingMode) {
          this.bottomTitleEl.textContent = '💾 4. 空间状态压缩 · 滚动变量滑动更新 (O(1) 常数空间)';
        } else {
          this.bottomTitleEl.textContent = isStringDp
            ? '📊 3. 递推填表 · 二维 DP 状态转移表格 (DP Matrix)'
            : isStaircaseAlgo
            ? '📊 3. 递推填表 · 一维 DP 状态数组与花费 (DP Array & Cost)'
            : '📊 3. 递推填表 · 动态规划推导状态 (DP Array & Decision Matrix)';
        }
      }
    }

    private renderRollingVars(step: DpDemoStep): void {
      if (!this.rollingStageEl) return;
      if (!step.rollingVars) {
        this.rollingStageEl.style.display = 'none';
        return;
      }
      this.rollingStageEl.style.display = 'flex';
      if (this.valPrev2El) this.valPrev2El.textContent = String(step.rollingVars.prev2 ?? 0);
      if (this.valPrev1El) this.valPrev1El.textContent = String(step.rollingVars.prev1 ?? 0);
      if (this.valCurrEl) this.valCurrEl.textContent = String(step.rollingVars.curr ?? '-');

      const active = step.rollingVars.activeCard || 'curr';
      this.cardPrev2El?.classList.toggle('is-active', active === 'prev2');
      this.cardPrev1El?.classList.toggle('is-active', active === 'prev1');
      this.cardCurrEl?.classList.toggle('is-active', active === 'curr');

      if (this.rollingRuleCodeEl && step.rollingVars.rule) {
        this.rollingRuleCodeEl.textContent = step.rollingVars.rule;
      }
    }

    private setupHandbookModal(): void {
      setupHandbookModal(this.root, this.handbookModalEl, config);
    }

    private renderLectureHUD(step: DpDemoStep): void {
      renderLectureHUD(
        {
          phaseEl: this.lecturePhaseEl,
          coordsEl: this.lectureCoordsEl,
          varsBoxEl: this.lectureVarsBoxEl,
          varsListEl: this.lectureVarsListEl,
        },
        step,
        this.codePanel
      );
    }

    private renderStaticShell(): void {
      if (this.titleEl) this.titleEl.textContent = config.title;
      if (this.descEl) this.descEl.textContent = config.description;
      if (this.controlsEl) {
        this.controlsEl.innerHTML = '';
        config.inputs.forEach((input) => {
          const label = document.createElement('span');
          label.className = 'dp-label';
          label.textContent = input.label;

          if (input.type === 'select' || (input.options && input.options.length > 0)) {
            const sel = document.createElement('select');
            sel.id = `dp-input-${input.id}`;
            sel.className = 'dp-input dp-select';
            if (input.width) sel.style.width = `${input.width}px`;
            (input.options || []).forEach((opt) => {
              const optEl = document.createElement('option');
              optEl.value = opt.value;
              optEl.textContent = opt.label;
              if (opt.value === input.value) optEl.selected = true;
              sel.appendChild(optEl);
            });
            sel.addEventListener('change', () => {
              this.initCodePanel();
              this.start();
            });
            this.controlsEl!.append(label, sel);
          } else {
            const el = document.createElement('input');
            el.id = `dp-input-${input.id}`;
            el.className = 'dp-input';
            el.value = input.value;
            if (input.width) el.style.width = `${input.width}px`;
            this.controlsEl!.append(label, el);
          }
        });
        const start = document.createElement('button');
        start.id = 'dp-start';
        start.className = 'dp-btn';
        start.textContent = '开始计算';
        start.onclick = () => this.start();
        this.controlsEl.appendChild(start);

        config.examples?.forEach((example) => {
          const btn = document.createElement('button');
          btn.className = 'dp-example';
          btn.textContent = example.label;
          btn.onclick = () => {
            Object.entries(example.values).forEach(([key, value]) => {
              const input = this.root?.querySelector(`#dp-input-${key}`) as HTMLInputElement | HTMLSelectElement | null;
              if (input) input.value = value;
            });
            this.initCodePanel();
            this.start();
          };
          this.controlsEl!.appendChild(btn);
        });
      }

      if (this.metricsEl) {
        this.metricsEl.innerHTML = '';
        config.metrics.forEach((metric) => {
          const card = document.createElement('div');
          card.className = 'dp-stat';
          card.innerHTML = `<span class="dp-stat-label">${metric.label}:</span><span class="dp-stat-val" data-metric="${metric.key}">-</span>`;
          this.metricsEl!.appendChild(card);
        });
      }

      const isStringDp = config.inputs.some((inp) => inp.id === 's') && config.inputs.some((inp) => inp.id === 't');
      const isStaircaseAlgo = config.title.includes('楼梯') || config.codePanelTitle.includes('楼梯') || config.description.includes('楼梯') || config.description.includes('台阶');
      const hasTopStage = isStringDp || isStaircaseAlgo;

      if (this.root && isStaircaseAlgo) {
        this.root.dataset.viewportMode = 'staircase';
      }

      const viewPills = this.root?.querySelector('#dp-viewport-selector') as HTMLElement | null;
      if (viewPills) {
        viewPills.style.display = isStringDp ? 'flex' : 'none';
      }
      const topStage = this.root?.querySelector('.dp-top-stage-container') as HTMLElement | null;
      if (topStage) {
        topStage.style.display = hasTopStage ? 'flex' : 'none';
      }
      const bottomTitle = this.root?.querySelector('.dp-bottom-stage-container .dp-panel-title') as HTMLElement | null;
      if (bottomTitle) {
        bottomTitle.textContent = isStringDp
          ? '📊 二维 DP 状态转移表格 (DP Matrix)'
          : isStaircaseAlgo
          ? '📊 一维 DP 状态数组与花费 (DP Array & Cost)'
          : '📊 动态规划推导状态 (DP Array & Decision Tree)';
      }

      this.renderFAQ();
    }

    private renderSource(step: DpDemoStep): void {
      if (!this.sourceEl) return;
      const panel = this.sourceEl.closest('.dp-panel') as HTMLElement | null;
      if (!step.source || step.source.length === 0) {
        this.sourceEl.style.display = 'none';
        if (panel) panel.style.display = 'none';
        return;
      }
      this.sourceEl.style.display = 'flex';
      if (panel) panel.style.display = '';
      this.sourceEl.innerHTML = '';

      const srcIdx = step.current?.sourceIndex;
      const curIndices = new Set<number>();
      if (typeof srcIdx === 'number') curIndices.add(srcIdx);
      else if (Array.isArray(srcIdx)) srcIdx.forEach((idx) => curIndices.add(idx));
      else if (step.current?.index != null && step.current.index < step.source.length) {
        curIndices.add(step.current.index);
      } else if (step.current?.i != null && step.current.i < step.source.length) {
        curIndices.add(step.current.i);
      }

      const depIndices = new Set((step.dependencies || []).map((d) => d.sourceIndex).filter((v): v is number => typeof v === 'number'));

      step.source.forEach((item, index) => {
        const chip = document.createElement('span');
        chip.className = 'dp-chip';
        if (curIndices.has(index)) chip.classList.add('current');
        if (depIndices.has(index)) chip.classList.add('dependency');
        chip.textContent = item;
        this.sourceEl!.appendChild(chip);
      });
    }

    private renderTree(step: DpDemoStep): void {
      if (!this.treeEl) return;
      const panel = this.treeEl.closest('.dp-panel') as HTMLElement | null;
      if (!step.tree) {
        this.treeEl.style.display = 'none';
        if (panel) panel.style.display = 'none';
        this.treeEl.innerHTML = '';
        return;
      }
      this.treeEl.style.display = 'flex';
      if (panel) panel.style.display = '';
      renderDpTreeSVG(this.treeEl, step.tree || null);
    }

    private renderStaircase(step: DpDemoStep): void {
      if (!this.staircaseEl) return;
      if (!step.staircase) {
        this.staircaseEl.style.display = 'none';
        this.staircaseEl.innerHTML = '';
        return;
      }
      this.staircaseEl.style.display = 'block';
      renderStaircaseSVG(this.staircaseEl, step.staircase);
    }

    private renderDp1d(step: DpDemoStep): void {
      renderDp1d(this.dp1dEl, step);
    }

    private renderDp2d(step: DpDemoStep): void {
      renderDp2d(this.dp2dEl, step);
    }

    private renderBreakdown(step: DpDemoStep): void {
      if (!this.breakdownEl) return;
      const bd = step.breakdown;
      if (!bd) {
        this.breakdownEl.style.display = 'none';
        this.breakdownEl.innerHTML = '';
        return;
      }
      this.breakdownEl.style.display = '';
      const isTakeWin = bd.winner === 'take';
      const isNotTakeWin = bd.winner === 'notTake';

      this.breakdownEl.innerHTML = `
        <div class="dp-bd-header">
          <span>📋 状态决策思维拆解 (容量 j = ${bd.currentCap}, 物品重量 = ${bd.itemWeight})</span>
          <span style="font-family: ui-monospace, monospace; color: #6ee7b7; font-weight: 700;">决策对比: max(${bd.notTake.val}, ${bd.take.val})</span>
        </div>
        <div class="dp-bd-grid">
          <div class="dp-branch-card ${isNotTakeWin ? 'is-winner' : isTakeWin ? 'is-not-winner' : ''}">
            <div class="dp-branch-title-row">
              <span class="dp-branch-title">${bd.notTake.title}</span>
              <span class="dp-branch-badge">${bd.notTake.tag}</span>
            </div>
            <div class="dp-branch-action">${bd.notTake.action}</div>
            <div class="dp-branch-val">${bd.notTake.formula}</div>
          </div>
          <div class="dp-branch-card ${isTakeWin ? 'is-winner' : isNotTakeWin ? 'is-not-winner' : ''}">
            <div class="dp-branch-title-row">
              <span class="dp-branch-title">${bd.take.title}</span>
              <span class="dp-branch-badge">${bd.take.tag}</span>
            </div>
            <div class="dp-branch-action">${bd.take.action}</div>
            <div class="dp-branch-val">${bd.take.formula}</div>
          </div>
        </div>
        <div class="dp-bd-conclusion">
          <strong>🎯 决策推导结论：</strong> ${bd.conclusion}
        </div>
      `;
    }

    private renderFAQ(): void {
      if (!this.faqEl) return;
      const faqs = config.faqList;
      if (!faqs || faqs.length === 0) {
        this.faqEl.style.display = 'none';
        this.faqEl.innerHTML = '';
        return;
      }
      this.faqEl.style.display = '';
      this.faqEl.innerHTML = `
        <div class="dp-faq-header">
          <span>💡 新手避坑与核心考点解惑 (${faqs.length})</span>
          <span class="dp-faq-toggle">▼ 点击展开/收起</span>
        </div>
        <div class="dp-faq-list">
          ${faqs
            .map(
              (f) => `
            <div class="dp-faq-item">
              <div class="dp-faq-q">
                ${f.tag ? `<span class="dp-faq-q-tag">${f.tag}</span>` : ''}
                <span>${f.question}</span>
              </div>
              <div class="dp-faq-a">${f.answer}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
      const header = this.faqEl.querySelector('.dp-faq-header');
      header?.addEventListener('click', () => {
        this.faqEl?.classList.toggle('is-collapsed');
      });
    }

    private renderFormula(step: DpDemoStep): void {
      if (!this.formulaEl) return;
      if (step.formulaSubstituted) {
        this.formulaEl.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="font-size: 13.5px; font-weight: 700; color: #fcd34d;">🔍 实时代入：${step.formulaSubstituted}</div>
            <div style="font-size: 11.5px; color: #94a3b8; font-family: ui-monospace, monospace;">抽象方程：${step.formula || ''}</div>
          </div>
        `;
      } else {
        this.formulaEl.textContent = step.formula || '等待状态转移...';
      }
    }

    private renderMetrics(step: DpDemoStep): void {
      if (!this.metricsEl || !step.metrics) return;
      const entries = Object.entries(step.metrics);
      if (entries.length === 0) return;

      this.metricsEl.innerHTML = '';
      entries.forEach(([key, value]) => {
        const card = document.createElement('div');
        card.className = 'dp-stat';
        card.innerHTML = `<span class="dp-stat-label">${key}:</span><span class="dp-stat-val" data-metric="${key}">${value ?? '-'}</span>`;
        this.metricsEl!.appendChild(card);
      });
    }

    private renderWorkshop(step: DpDemoStep): void {
      renderWorkshopHUD(
        {
          workshopSourceEl: this.workshopSourceEl,
          workshopTargetEl: this.workshopTargetEl,
          workshopHudEl: this.workshopHudEl,
        },
        step
      );
    }

    private renderStory(step: DpDemoStep): void {
      renderStory(
        {
          storyGoalEl: this.storyGoalEl,
          storyBranchesEl: this.storyBranchesEl,
          storyConclusionEl: this.storyConclusionEl,
        },
        step
      );
    }

    private renderBacktrack(step: DpDemoStep): void {
      renderBacktrack(
        {
          backtrackSummaryEl: this.backtrackSummaryEl,
          backtrackTimelineEl: this.backtrackTimelineEl,
          dp2dEl: this.dp2dEl,
          goToStep: (idx) => this.goToStep(idx),
          currentIndex: this.currentIndex,
          steps: this.steps,
        },
        step
      );
    }

    private renderLogLine(): void {
      if (!this.logEl) return;
      this.logEl.innerHTML = '';
      this.steps.slice(0, this.currentIndex + 1).forEach((step, index) => {
        const line = document.createElement('div');
        if (index === this.currentIndex) line.className = 'active';
        line.textContent = `${String(index + 1).padStart(2, '0')}. ${step.log}`;
        this.logEl!.appendChild(line);
      });
      this.logEl.scrollTop = this.logEl.scrollHeight;
    }
  };
}

function headerCell(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'dp-table-header';
  el.textContent = text;
  return el;
}

export function parseNums(value: string, fallback: number[], limit = 12): number[] {
  const nums = value.split(/[,，\s]+/).map((v) => parseInt(v.trim(), 10)).filter(Number.isFinite);
  return (nums.length ? nums : fallback).slice(0, limit);
}

export function parseWords(value: string, fallback: string[], limit = 10): string[] {
  const words = value.split(/[,，\s]+/).map((v) => v.trim()).filter(Boolean);
  return (words.length ? words : fallback).slice(0, limit);
}

export function intInput(root: HTMLElement, id: string, fallback: number, min: number, max: number): number {
  const el = root.querySelector(`#dp-input-${id}`) as HTMLInputElement | null;
  const parsed = parseInt(el?.value || String(fallback), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export function strInput(root: HTMLElement, id: string, fallback: string): string {
  const el = root.querySelector(`#dp-input-${id}`) as HTMLInputElement | null;
  return (el?.value || fallback).trim() || fallback;
}

export function clone1d<T>(arr: T[]): T[] { return [...arr]; }
export function clone2d<T>(arr: T[][]): T[][] { return arr.map((row) => [...row]); }

export { renderDpTreeSVG } from './engine/visual-adapter';

export function buildDpTree(vals: number[]): DpTreeNode | null {
  if (vals.length === 0 || vals[0] === 0) return null;
  const root: DpTreeNode = { id: 0, val: vals[0] };
  const queue: DpTreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < vals.length) {
    const parent = queue.shift()!;
    if (i < vals.length) {
      if (vals[i] !== 0) {
        parent.left = { id: i, val: vals[i] };
        queue.push(parent.left);
      }
      i++;
    }
    if (i < vals.length) {
      if (vals[i] !== 0) {
        parent.right = { id: i, val: vals[i] };
        queue.push(parent.right);
      }
      i++;
    }
  }
  return root;
}

export function cloneDpTree(
  root: DpTreeNode | null,
  tags: Map<number | string, string>,
  statuses: Map<number | string, 'current' | 'dependency' | 'visited' | 'normal'>
): DpTreeNode | null {
  if (!root) return null;
  const children = root.children?.map((c) => cloneDpTree(c, tags, statuses)).filter(Boolean) as DpTreeNode[] | undefined;
  return {
    id: root.id,
    val: root.val,
    tag: tags.get(root.id) || root.tag,
    status: statuses.get(root.id) || root.status || 'normal',
    left: cloneDpTree(root.left || null, tags, statuses),
    right: cloneDpTree(root.right || null, tags, statuses),
    ...(children && children.length > 0 ? { children } : {}),
  };
}

export { renderStaircaseSVG } from './views/staircase-stage';

