import type { UniversalStep } from '../universal-stage-engine';
import { GridVisualAdapter } from './grid-visual-adapter';
import { RecursionTreeAdapter } from './recursion-tree-adapter';

export interface StagePresentationOptions {
  currentStage: string;
  stage3SubView: 'matrix' | 'tree';
  step: UniversalStep;
  m: number;
  n: number;
  isReverse: boolean;
}

/**
 * 阶段视觉呈现调度器 (StageViewPresenter Deep Module) - 策略与表现中介模式
 * 遵循深模块原则 (Deep Module) 与单一职责原则 (SRP)：
 * 封装演化阶段 Card 2（一维槽位 / 状态转移表 / 递归分支树）的策略路由呈现与步骤日志流调度。
 */
export class StageViewPresenter {
  /**
   * 根据当前阶段与子视图偏好，策略化呈现 Card 2 视觉内容
   */
  public static presentStageCard2(
    container: HTMLElement,
    options: StagePresentationOptions
  ): void {
    const { currentStage, stage3SubView, step, m, n, isReverse } = options;

    if (currentStage === 'stage-4') {
      // 阶段 4: 一维滚动数组压缩槽位
      GridVisualAdapter.renderLiteMemoSlots(container, step, n);
    } else if (currentStage === 'stage-3') {
      // 阶段 3: 二维状态转移表 / 状态依赖树
      if (stage3SubView === 'tree') {
        RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId, true);
      } else {
        GridVisualAdapter.renderStage3DPTable(container, step, { m, n, isReverse });
      }
    } else if (currentStage === 'stage-1' || currentStage === 'stage-2') {
      // 阶段 1 / 阶段 2: 递归分支搜索树 (阶段 2 开启记忆化剪枝标识)
      RecursionTreeAdapter.renderRecursionTree(
        container,
        step.treeRoot,
        step.activeNodeId,
        currentStage === 'stage-2'
      );
    }
  }

  /**
   * 渲染动态执行日志流 (Step Log Stream)
   */
  public static renderStepLogStream(
    container: HTMLElement,
    steps: UniversalStep[],
    currentIndex: number,
    logCountEl?: HTMLElement | null
  ): void {
    container.innerHTML = '';
    const total = steps.length;

    for (let k = 0; k <= currentIndex && k < total; k++) {
      const logStep = steps[k];
      const isLatest = k === currentIndex;
      const lineEl = document.createElement('div');
      lineEl.className = isLatest
        ? 'text-blue-700 font-bold bg-blue-50/80 px-2 py-1 rounded border-l-2 border-blue-500'
        : 'text-slate-600 px-2 py-0.5';
      lineEl.textContent = logStep.log || logStep.msg || '';
      container.appendChild(lineEl);
    }

    container.scrollTop = container.scrollHeight;
    if (logCountEl) {
      logCountEl.textContent = `${currentIndex + 1} / ${total} 记录`;
    }
  }
}
