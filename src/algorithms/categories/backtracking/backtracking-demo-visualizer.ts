/**
 * 回溯专题通用步进可视化器
 */

import { StepVisualizer, StepBase } from '../../../core/step-visualizer';

export type BacktrackingChipState = 'normal' | 'available' | 'used' | 'current' | 'skip' | 'prune' | 'fixed';

export interface BacktrackingDemoStep extends StepBase {
  source: string[];
  sourceStates?: BacktrackingChipState[];
  path: string[];
  results: string[][];
  metrics?: Record<string, string | number>;
  action: 'start' | 'choose' | 'collect' | 'skip' | 'prune' | 'backtrack' | 'done';
  log: string;
}

export interface BacktrackingDemoConfig<TParams> {
  codeLines: string[];
  codePanelTitle: string;
  parseParams(root: HTMLElement): TParams;
  buildSteps(params: TParams): BacktrackingDemoStep[];
}

export function createBacktrackingDemoVisualizer<TParams>(config: BacktrackingDemoConfig<TParams>) {
  return class BacktrackingDemoVisualizer extends StepVisualizer<BacktrackingDemoStep> {
    protected codeLines = config.codeLines;
    protected codePanelTitle = config.codePanelTitle;

    private sourceEl: HTMLElement | null = null;
    private pathEl: HTMLElement | null = null;
    private resultsEl: HTMLElement | null = null;
    private logEl: HTMLElement | null = null;

    protected initDOMElements(): void {
      if (!this.root) return;
      this.sourceEl = this.root.querySelector('#bt-source');
      this.pathEl = this.root.querySelector('#bt-path');
      this.resultsEl = this.root.querySelector('#bt-results');
      this.logEl = this.root.querySelector('#bt-log');
      this.bindPlaybackControls({ message: 'step-message' });
      this.root.querySelector('#bt-start')?.addEventListener('click', () => this.start());
      this.root.querySelectorAll<HTMLButtonElement>('.bt-example').forEach((button) => {
        button.addEventListener('click', () => {
          Object.entries(button.dataset).forEach(([key, value]) => {
            if (key === 'label' || value == null) return;
            const input = this.root?.querySelector(`#bt-${toKebab(key)}`) as HTMLInputElement | null;
            if (input) input.value = value;
          });
          this.start();
        });
      });
    }

    protected buildSteps(): BacktrackingDemoStep[] {
      if (!this.root) return [];
      return config.buildSteps(config.parseParams(this.root));
    }

    protected renderStep(step: BacktrackingDemoStep): void {
      this.renderSource(step);
      this.renderPath(step);
      this.renderResults(step);
      this.renderMetrics(step);
      this.renderLogLine();
    }

    private renderSource(step: BacktrackingDemoStep): void {
      if (!this.sourceEl) return;
      this.sourceEl.innerHTML = '';
      step.source.forEach((item, index) => {
        const chip = document.createElement('span');
        chip.className = `bt-chip ${step.sourceStates?.[index] || 'normal'}`;
        chip.textContent = item;
        this.sourceEl!.appendChild(chip);
      });
    }

    private renderPath(step: BacktrackingDemoStep): void {
      if (!this.pathEl) return;
      this.pathEl.innerHTML = '';
      if (step.path.length === 0) {
        this.pathEl.innerHTML = '<span class="bt-empty">（空）</span>';
        return;
      }
      step.path.forEach((item) => {
        const chip = document.createElement('span');
        chip.className = 'bt-path-chip';
        chip.textContent = item;
        this.pathEl!.appendChild(chip);
      });
    }

    private renderResults(step: BacktrackingDemoStep): void {
      if (!this.resultsEl) return;
      this.resultsEl.innerHTML = '';
      if (step.results.length === 0) {
        this.resultsEl.innerHTML = '<span class="bt-empty">（暂无）</span>';
        return;
      }
      step.results.forEach((result) => {
        const chip = document.createElement('span');
        chip.className = 'bt-result-chip';
        chip.textContent = result.length === 1 ? result[0] : `[${result.join(', ')}]`;
        this.resultsEl!.appendChild(chip);
      });
    }

    private renderMetrics(step: BacktrackingDemoStep): void {
      if (!this.root || !step.metrics) return;
      Object.entries(step.metrics).forEach(([key, value]) => {
        const el = this.root?.querySelector(`[data-metric="${key}"]`);
        if (el) el.textContent = String(value);
      });
    }

    private renderLogLine(): void {
      if (!this.logEl) return;
      this.logEl.innerHTML = '';
      this.steps.slice(0, this.currentIndex + 1).forEach((step, index) => {
        const line = document.createElement('div');
        line.className = index === this.currentIndex ? `active ${step.action}` : step.action;
        line.textContent = `${String(index + 1).padStart(2, '0')}. ${step.log}`;
        this.logEl!.appendChild(line);
      });
      this.logEl.scrollTop = this.logEl.scrollHeight;
    }
  };
}

function toKebab(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function parseNumberList(value: string, fallback: number[], limit = 8): number[] {
  const nums = value
    .split(/[,，\s]+/)
    .map((item) => parseInt(item.trim(), 10))
    .filter((item) => Number.isFinite(item));
  return (nums.length ? nums : fallback).slice(0, limit);
}

export function clampInt(value: string, fallback: number, min: number, max: number): number {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export function chipStates(length: number, fill: BacktrackingChipState = 'normal'): BacktrackingChipState[] {
  return Array.from({ length }, () => fill);
}
