/**
 * 树算法通用基类
 * 所有树算法可视化器可继承此类，只需实现 buildSteps() 和 renderStep()
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { TreeNode, renderTreeSVG, renderLog } from './tree-template';

export interface TreeStepBase {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  message: string;
  log: string;
  codeLine?: number | number[];
  /** 高亮节点集合 */
  highlight?: Set<number>;
  highlightColor?: string;
  secondaryHighlight?: Set<number>;
  secondaryColor?: string;
  labels?: Map<number, string>;
  result?: string;
}

export abstract class TreeBaseVisualizer<TStep extends TreeStepBase> extends StepVisualizer<TStep> {
  protected prefix = '';

  protected treeEl: HTMLElement | null = null;
  protected logEl: HTMLElement | null = null;
  protected curEl: HTMLElement | null = null;
  protected depthEl: HTMLElement | null = null;
  protected resultEl: HTMLElement | null = null;

  /** 用于去重绑定示例按钮 */
  private _exHandlers = new WeakMap<HTMLElement, () => void>();

  protected initTreeElements(): void {
    if (!this.root) return;
    const p = this.prefix;
    this.treeEl = this.root.querySelector(`#${p}tree`);
    this.logEl = this.root.querySelector(`#${p}log`);
    this.curEl = this.root.querySelector(`#${p}cur`);
    this.depthEl = this.root.querySelector(`#${p}depth`);
    this.resultEl = this.root.querySelector(`#${p}result`);
  }

  protected bindExamples(examples: Record<string, () => void>): void {
    this.root?.querySelectorAll<HTMLButtonElement>('.tv-ex-btn, [class*="-ex-btn"]').forEach((btn) => {
      // 移除旧监听器（如有），防止重复绑定
      const oldHandler = this._exHandlers.get(btn);
      if (oldHandler) btn.removeEventListener('click', oldHandler);
      const handler = () => {
        const id = btn.dataset.id;
        if (id && examples[id]) examples[id]();
      };
      btn.addEventListener('click', handler);
      this._exHandlers.set(btn, handler);
    });
  }

  protected renderTreeBase(step: TStep): void {
    if (!this.treeEl) return;
    renderTreeSVG(
      this.treeEl,
      step.tree,
      step.highlight ?? (step.current != null ? new Set([step.current]) : new Set()),
      step.highlightColor ?? '#fab387',
      step.secondaryHighlight,
      step.secondaryColor,
      step.labels,
    );
  }

  protected renderStatsBase(step: TStep): void {
    if (this.curEl) this.curEl.textContent = step.current != null ? String(step.current) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.resultEl && step.result !== undefined) {
      this.resultEl.textContent = step.result;
    }
  }

  protected renderLogBase(step: TStep, allLogs: string[]): void {
    if (!this.logEl) return;
    renderLog(this.logEl, allLogs, this.currentIndex);
  }
}
