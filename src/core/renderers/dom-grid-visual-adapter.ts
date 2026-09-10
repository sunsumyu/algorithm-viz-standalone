import type { IVisualRenderer, VisualRendererContext } from './visual-renderer';
import type { UniversalStep } from '../universal-stage-engine';
import { GridVisualAdapter } from './grid-visual-adapter';

/**
 * 2D DOM 视觉表现适配器 (DOM Grid Visual Adapter)
 * 遵循桥接模式 (Bridge Pattern)，实现 IVisualRenderer 统一接口契约
 */
export class DOMGridVisualAdapter implements IVisualRenderer {
  public readonly id = 'dom-2d-grid-renderer';
  private container: HTMLElement | null = null;
  private currentStep: UniversalStep | null = null;
  private isDisposed = false;

  public mount(container: HTMLElement): void {
    this.container = container;
    this.isDisposed = false;
  }

  public updateStep(step: UniversalStep, context?: VisualRendererContext): void {
    if (this.isDisposed || !this.container) return;
    this.currentStep = step;

    const m = context?.m ?? 3;
    const n = context?.n ?? 3;
    const isReverse = context?.direction === 'reverse' || context?.isReverse;
    const modelId = context?.modelId;

    // 渲染或更新网格/树形 DOM 视图
    const gridContainer = this.container.querySelector('.grid-container') as HTMLElement | null;
    if (gridContainer && step.grid) {
      GridVisualAdapter.renderGrid(gridContainer, step.grid, {
        m,
        n,
        isReverse,
        modelId
      });
    }
  }

  public resize(_width?: number, _height?: number): void {
    // 2D DOM 布局依赖 CSS flex/grid 响应式自动流式自适应
  }

  public dispose(): void {
    this.isDisposed = true;
    this.container = null;
    this.currentStep = null;
  }
}
