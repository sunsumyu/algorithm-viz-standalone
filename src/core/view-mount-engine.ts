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
import { visualizerHeaderLayoutCoordinator } from './controllers/visualizer-header-layout-coordinator';
import { algorithmRegistry } from './algorithm-registry';

import { addRecentAlgorithm } from './recent-algorithms';

export interface MountRequest {
  algorithmId: string;
  viewId?: string;
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
   * 显示算法页面（折叠主选择器并挂载算法舞台）
   */
  public async showAlgorithm(algorithmId: string): Promise<IVisualizer | null> {
    const entry = await algorithmRegistry.resolve(algorithmId);
    if (!entry) {
      console.error(`[ViewMountEngine] Algorithm not found in registry: ${algorithmId}`);
      return null;
    }

    // 1. 折叠主选择器（侧边栏 + 卡片网格）
    this.hideMainLayout();

    // 2. 记录到最近访问历史并派发更新事件
    addRecentAlgorithm(algorithmId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('algo:recent-updated', { detail: { algorithmId } }));
    }

    // 3. 挂载算法视口
    const visualizer = await this.mount({
      algorithmId: entry.id,
      viewId: entry.viewId,
      templateContent: entry.template,
      VisualizerClass: entry.Visualizer,
      navigateBack: () => this.showSelector(),
      containerParent: typeof document !== 'undefined' ? document.getElementById('main-layout') : null,
    });

    // 4. 广播算法挂载事件，解耦全局导航等观察者
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('algo:mounted', { detail: { algorithmId, entry } }));
    }

    return visualizer;
  }

  /**
   * 返回算法选择器（清空舞台并恢复大纲选择器）
   */
  public showSelector(): void {
    // 1. 卸载当前活动算法
    this.unmountCurrent();

    // 2. 恢复主选择器布局
    this.showMainLayout();

    // 3. 广播选择器展开事件，解耦全局导航关闭抽屉
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('algo:selector-shown'));
    }
  }

  /**
   * 隐藏主选择器（侧边栏 + 卡片网格）
   */
  public hideMainLayout(): void {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;
    const sidebar = document.querySelector('#main-layout > .sidebar') as HTMLElement | null;
    const contentArea = document.querySelector('#main-layout > .content-area') as HTMLElement | null;
    const splitter = document.querySelector('#main-layout > .algo-sidebar-splitter') as HTMLElement | null;
    if (sidebar) sidebar.style.display = 'none';
    if (contentArea) contentArea.style.display = 'none';
    if (splitter) splitter.style.display = 'none';
  }

  /**
   * 显示主选择器（侧边栏 + 卡片网格）
   */
  public showMainLayout(): void {
    if (typeof document === 'undefined') return;
    const mainLayout = typeof document.getElementById === 'function' ? document.getElementById('main-layout') : null;
    const sidebar = typeof document.querySelector === 'function' ? document.querySelector('#main-layout > .sidebar') as HTMLElement | null : null;
    const contentArea = typeof document.querySelector === 'function' ? document.querySelector('#main-layout > .content-area') as HTMLElement | null : null;
    const splitter = typeof document.querySelector === 'function' ? document.querySelector('#main-layout > .algo-sidebar-splitter') as HTMLElement | null : null;
    if (mainLayout) mainLayout.style.display = 'flex';
    if (sidebar) sidebar.style.display = 'flex';
    if (contentArea) contentArea.style.display = 'flex';
    if (splitter) splitter.style.display = 'flex';
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

    let viewId = req.viewId;
    let templateContent = req.templateContent;
    let VisualizerClass = req.VisualizerClass;

    // 若调用方未显式传入模板或类，由 AlgorithmRegistry 深模块自动按需解析
    if (!viewId || !templateContent || !VisualizerClass) {
      const entry = await algorithmRegistry.resolve(req.algorithmId);
      if (entry) {
        viewId = viewId || entry.viewId;
        templateContent = templateContent || entry.template;
        VisualizerClass = VisualizerClass || entry.Visualizer;
      }
    }

    const effectiveViewId = viewId || `algo-${req.algorithmId}-view`;

    // 2. 查找或创建专用的活动容器
    const parent = req.containerParent || (typeof document !== 'undefined' ? document.getElementById('main-layout') || document.body : null);
    let container = typeof document !== 'undefined' ? document.getElementById(effectiveViewId) : null;

    if (!container && typeof document !== 'undefined' && parent) {
      container = document.createElement('div');
      container.id = effectiveViewId;
      container.className = 'view-container';
      parent.appendChild(container);
    } else if (container) {
      container.innerHTML = '';
    }

    this.activeContainer = container;
    if (container) {
      container.classList.add('active');
    }

    // 3. 注入模板内容
    if (templateContent && container) {
      container.innerHTML = templateContent;
      this.ensureBackButton(container, req.navigateBack);
      visualizerHeaderLayoutCoordinator.normalizeHeaderControls(container);
    }

    // 4. 实例化并挂载 Visualizer
    if (VisualizerClass) {
      const visualizer = new VisualizerClass();
      const context: VisualizerContext = {
        algorithmId: req.algorithmId,
        viewId: effectiveViewId,
        root: container || ({} as HTMLElement),
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
