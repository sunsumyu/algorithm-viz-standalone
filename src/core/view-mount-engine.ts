/**
 * ViewMountEngine (算法视图挂载与生命周期引擎深模块)
 * 
 * 核心职责：
 * 1. 管理单一活动算法视口（Single Active Stage Container）的完整生命周期 (mount / unmount)
 * 2. 彻底销毁上一个算法的实例、定时器、事件监听器并清理 DOM 树，杜绝内存泄漏与 ID 冲突
 * 3. 干净注入新算法模板并实例化挂载对应的 Visualizer
 * 4. 统一处理布局自适应与 Resize 触发
 */

import { IVisualizer, VisualizerContext } from './interfaces';

export interface MountRequest {
  algorithmId: string;
  viewId: string;
  templateContent?: string;
  VisualizerClass?: new () => IVisualizer;
  navigateBack?: () => void;
  containerParent?: HTMLElement | null;
}

export class ViewMountEngine {
  private static instance: ViewMountEngine;
  private currentAlgorithmId: string | null = null;
  private currentVisualizer: IVisualizer | null = null;
  private activeContainer: HTMLElement | null = null;
  private mountSeq = 0;

  public static getInstance(): ViewMountEngine {
    if (!ViewMountEngine.instance) {
      ViewMountEngine.instance = new ViewMountEngine();
    }
    return ViewMountEngine.instance;
  }

  /**
   * 卸载当前正在运行的算法，彻底释放 DOM 和资源
   */
  public unmountCurrent(): void {
    if (this.currentVisualizer) {
      try {
        if (typeof this.currentVisualizer.pause === 'function') {
          this.currentVisualizer.pause();
        }
        if (typeof this.currentVisualizer.destroy === 'function') {
          this.currentVisualizer.destroy();
        }
      } catch (err) {
        console.warn('[ViewMountEngine] Error during visualizer destroy:', err);
      }
      this.currentVisualizer = null;
    }

    if (this.activeContainer) {
      this.activeContainer.innerHTML = '';
      this.activeContainer.classList.remove('active');
      this.activeContainer = null;
    }

    this.currentAlgorithmId = null;
  }

  /**
   * 挂载新的算法到活动视口
   */
  public async mount(req: MountRequest): Promise<IVisualizer | null> {
    const seq = ++this.mountSeq;

    // 1. 卸载前一个算法
    this.unmountCurrent();

    this.currentAlgorithmId = req.algorithmId;

    // 2. 查找或创建专用的活动容器
    const parent = req.containerParent || document.getElementById('main-layout') || document.body;
    let container = document.getElementById(req.viewId);

    if (!container) {
      container = document.createElement('div');
      container.id = req.viewId;
      container.className = 'view-container';
      parent.appendChild(container);
    } else {
      container.innerHTML = '';
    }

    this.activeContainer = container;
    container.classList.add('active');

    // 3. 注入模板内容
    if (req.templateContent) {
      container.innerHTML = req.templateContent;
      this.ensureBackButton(container, req.navigateBack);
    }

    // 4. 实例化并挂载 Visualizer
    if (req.VisualizerClass) {
      const visualizer = new req.VisualizerClass();
      const context: VisualizerContext = {
        algorithmId: req.algorithmId,
        viewId: req.viewId,
        root: container,
        navigateBack: req.navigateBack,
      };

      await visualizer.init(context);

      // 防竞态并发检查
      if (this.mountSeq !== seq) {
        if (typeof visualizer.destroy === 'function') visualizer.destroy();
        return null;
      }

      this.currentVisualizer = visualizer;
      return visualizer;
    }

    return null;
  }

  /**
   * 确保返回按钮存在且绑定正确回调
   */
  private ensureBackButton(container: HTMLElement, navigateBack?: () => void): void {
    const backButtons = container.querySelectorAll('.btn-back, [data-action="back"]');
    backButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigateBack) {
          navigateBack();
        }
      });
    });
  }

  public getCurrentAlgorithmId(): string | null {
    return this.currentAlgorithmId;
  }

  public getCurrentVisualizer(): IVisualizer | null {
    return this.currentVisualizer;
  }

  public getActiveContainer(): HTMLElement | null {
    return this.activeContainer;
  }
}

export const viewMountEngine = ViewMountEngine.getInstance();
