/**
 * 可调分栏包装器 (PanelSplitter)
 * 基于 SplitterEngine 构建，兼容旧版构造并扩展支持单页面 scope 覆盖
 */

import { SplitterEngine, SplitterStorage } from './splitter-engine';

export interface PanelSplitterOptions {
  scope?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxRatio?: number;
  onResize?: (width: number) => void;
}

export class PanelSplitter {
  public static readonly DEFAULT_WIDTH = 420;
  public static readonly MIN_WIDTH = 280;

  private engine: SplitterEngine | null = null;
  private aside: HTMLElement;
  private grid: HTMLElement;

  constructor(container: HTMLElement, options?: PanelSplitterOptions) {
    // 1. 尝试寻找明确的 aside 或右侧代码列
    let aside: HTMLElement | null =
      (container.closest('aside') as HTMLElement | null) ??
      (container.closest('.dp-right') as HTMLElement | null) ??
      (container.closest('.tt-right') as HTMLElement | null) ??
      (container.closest('.col-code') as HTMLElement | null);

    if (!aside) {
      // 遍历向上查找双栏容器（grid 或 flex）的右侧子栏目
      let curr: HTMLElement | null = container;
      while (curr && curr.parentElement && curr.parentElement !== document.body) {
        const parentNode: HTMLElement = curr.parentElement;
        const display = getComputedStyle(parentNode).display;
        if (display === 'grid' || display === 'flex') {
          if (parentNode.children.length >= 2 && curr !== parentNode.firstElementChild) {
            aside = curr;
            break;
          }
        }
        curr = parentNode;
      }
    }

    if (!aside) {
      aside = container.parentElement;
    }

    const grid = aside?.parentElement;
    if (!aside || !grid) {
      throw new Error('PanelSplitter: cannot find aside or grid ancestor');
    }
    this.aside = aside;
    this.grid = grid;

    const scope = options?.scope;
    const defaultWidth = options?.defaultWidth ?? PanelSplitter.DEFAULT_WIDTH;
    const minWidth = options?.minWidth ?? PanelSplitter.MIN_WIDTH;
    const maxRatio = options?.maxRatio ?? 0.72;

    const display = getComputedStyle(this.grid).display;
    const isGrid = display === 'grid' || display === 'inline-grid';

    this.engine = new SplitterEngine({
      id: 'code-aside-width',
      direction: 'horizontal',
      targetElement: this.aside,
      containerElement: this.grid,
      defaultSize: defaultWidth,
      minSize: minWidth,
      maxRatio,
      scope,
      invert: true,
      mode: isGrid ? 'grid' : 'flex',
      attachPosition: 'before',
      className: 'algo-code-splitter',
      title: '左右拖拽调整代码面板宽度，双击恢复默认',
      onResize: options?.onResize,
    });
  }

  public setScope(scope: string): void {
    this.engine?.setScope(scope);
  }

  public resetWidth(): void {
    this.engine?.resetSize();
  }

  public getCurrentWidth(): number {
    return this.engine?.getCurrentSize() ?? PanelSplitter.DEFAULT_WIDTH;
  }

  public destroy(): void {
    this.engine?.destroy();
    this.engine = null;
  }
}
