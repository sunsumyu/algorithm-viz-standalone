/**
 * 静态文章类算法页面的通用可视化器
 */

import type { IVisualizer, VisualizerContext } from './interfaces';

export class ArticleVisualizer implements IVisualizer {
  private root: HTMLElement | null = null;
  private backButtons: HTMLElement[] = [];
  private navigateBack: (() => void) | null = null;

  public async init(context?: VisualizerContext): Promise<void> {
    this.root = context?.root || null;
    this.navigateBack = context?.navigateBack ?? null;
    this.backButtons = Array.from(this.root?.querySelectorAll('[data-back-selector]') || []) as HTMLElement[];

    this.backButtons.forEach((button) => {
      button.onclick = () => {
        this.navigateBack?.();
      };
    });
  }

  public destroy(): void {
    this.backButtons.forEach((button) => {
      button.onclick = null;
    });
    this.backButtons = [];
    this.root = null;
  }
}
