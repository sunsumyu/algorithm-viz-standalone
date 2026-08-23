/**
 * 算法管理器 - 工厂模式 + 单例模式
 * 负责管理所有算法的初始化和渲染
 */

import { templateLoader } from './template-loader';
import { IVisualizer, VisualizerContext } from './interfaces';
import { getAllManifests, AlgorithmMetadata } from './registry';
import { algoNavigation } from './algo-navigation';
import { addRecentAlgorithm } from './recent-algorithms';

// 触发自描述算法的 manifest 注册（必须在单例实例化前执行副作用）。
// batch-1-index 内部 import 各 renderer，renderer 顶层调用 registerAlgorithm()。
import '../algorithms/batch-1-index';
import '../algorithms/batch-2-index';
import '../algorithms/batch-3-index';
import '../algorithms/batch-4-index';
import '../algorithms/batch-5-index';
import '../algorithms/batch-backtracking-index';
import '../algorithms/batch-dynamic-programming-index';
import '../algorithms/batch-6-index';

// 导入模板（仅保留未迁移的算法模板）
// 所有算法已迁移到自描述注册模式，模板由 renderer 通过 registerAlgorithm 提供

// 导入可视化器（仅保留未迁移的渲染器）
// 所有算法已迁移到自描述注册模式，Visualizer 由 renderer 通过 registerAlgorithm 提供

import { viewMountEngine } from './view-mount-engine';

export interface AlgorithmConfig extends AlgorithmMetadata {
  templateContent?: string;
  Visualizer?: new () => IVisualizer;
}

export class AlgorithmManager {
  private static instance: AlgorithmManager;
  private algorithms: Map<string, AlgorithmConfig> = new Map();

  private constructor() {
    this.registerAlgorithms();
  }

  public static getInstance(): AlgorithmManager {
    if (!AlgorithmManager.instance) {
      AlgorithmManager.instance = new AlgorithmManager();
    }
    return AlgorithmManager.instance;
  }

  /**
   * 注册所有算法
   */
  private registerAlgorithms(): void {
    getAllManifests().forEach((manifest) => {
      const config: AlgorithmConfig = {
        ...manifest,
        templateContent: manifest.template,
      };
      this.algorithms.set(config.id, config);
      templateLoader.register(config.viewId, config.templateContent as string);
    });
  }

  /**
   * 显示算法页面
   */
  public async showAlgorithm(algorithmId: string): Promise<void> {
    const config = this.algorithms.get(algorithmId);
    if (!config) {
      console.error(`[AlgorithmManager] Algorithm not found: ${algorithmId}`);
      return;
    }

    console.log(`[AlgorithmManager] Showing algorithm: ${config.name}`);

    // 隐藏选择器（侧边栏 + 卡片网格）
    this.hideMainLayout();

    // 记录到最近访问历史
    addRecentAlgorithm(algorithmId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('algo:recent-updated', { detail: { algorithmId } }));
    }

    // 同步更新全局导航栏与算法目录状态
    algoNavigation.updateActiveAlgorithm(algorithmId);

    // 使用 ViewMountEngine 统一挂载并管理算法生命周期
    await viewMountEngine.mount({
      algorithmId: config.id,
      viewId: config.viewId,
      templateContent: config.templateContent,
      VisualizerClass: config.Visualizer,
      navigateBack: () => this.showAlgorithmSelector(),
      containerParent: document.getElementById('main-layout'),
    });
  }

  /**
   * 返回算法选择器（显示侧边栏 + 卡片网格）
   */
  public showAlgorithmSelector(): void {
    console.log('[AlgorithmManager] Showing algorithm selector (sidebar)');

    // 卸载当前算法并彻底释放 DOM 与定时器资源
    viewMountEngine.unmountCurrent();

    // 隐藏全局算法导航与抽屉
    algoNavigation.hide();

    // 显示主布局（侧边栏 + 内容区）
    this.showMainLayout();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('algo:selector-shown'));
    }
  }

  /**
   * 确保算法视图容器存在。大量专题页面可通过 manifest 动态创建容器。
   */
  private ensureViewContainer(viewId: string): HTMLElement | null {
    let container = document.getElementById(viewId);
    if (container) return container;

    const mainLayout = document.getElementById('main-layout');
    if (!mainLayout) return null;

    container = document.createElement('div');
    container.id = viewId;
    container.className = 'view-container';
    mainLayout.appendChild(container);
    return container;
  }

  /**
   * 清理旧版分散的返回按钮，统一使用 algoNavigation 全局顶栏
   */
  private ensureBackButton(container: HTMLElement): void {
    const existing = container.querySelector('.algo-global-back');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * 隐藏算法选择器（侧边栏 + 卡片网格）
   */
  private hideMainLayout(): void {
    const sidebar = document.querySelector('#main-layout > .sidebar') as HTMLElement | null;
    const contentArea = document.querySelector('#main-layout > .content-area') as HTMLElement | null;
    const splitter = document.querySelector('#main-layout > .algo-sidebar-splitter') as HTMLElement | null;
    if (sidebar) sidebar.style.display = 'none';
    if (contentArea) contentArea.style.display = 'none';
    if (splitter) splitter.style.display = 'none';
  }

  /**
   * 显示算法选择器（侧边栏 + 卡片网格）
   */
  private showMainLayout(): void {
    const mainLayout = document.getElementById('main-layout');
    const sidebar = document.querySelector('#main-layout > .sidebar') as HTMLElement | null;
    const contentArea = document.querySelector('#main-layout > .content-area') as HTMLElement | null;
    const splitter = document.querySelector('#main-layout > .algo-sidebar-splitter') as HTMLElement | null;
    if (mainLayout) mainLayout.style.display = 'flex';
    if (sidebar) sidebar.style.display = 'flex';
    if (contentArea) contentArea.style.display = 'flex';
    if (splitter) splitter.style.display = 'flex';
  }

  /**
   * 获取所有算法配置
   */
  public getAllAlgorithms(): AlgorithmConfig[] {
    return Array.from(this.algorithms.values());
  }

  /**
   * 获取算法配置
   */
  public getAlgorithm(id: string): AlgorithmConfig | undefined {
    return this.algorithms.get(id);
  }
}

// 导出单例实例
export const algorithmManager = AlgorithmManager.getInstance();