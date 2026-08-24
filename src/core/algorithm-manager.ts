/**
 * 算法管理器 - 工厂模式 + 单例模式 + 按需懒加载架构
 * 负责管理所有算法的元数据、动态按需加载和视图生命周期
 */

import { templateLoader } from './template-loader';
import { IVisualizer } from './interfaces';
import { getManifest, getAllManifests, AlgorithmMetadata } from './registry';
import { algoNavigation } from './algo-navigation';
import { addRecentAlgorithm } from './recent-algorithms';
import { ALL_ALGORITHM_METADATA } from './algorithm-manifests-meta';
import { loadAlgorithmBatch, loadAllAlgorithmBatches } from './algorithm-loader';
import { viewMountEngine } from './view-mount-engine';

export interface AlgorithmConfig extends AlgorithmMetadata {
  templateContent?: string;
  Visualizer?: new () => IVisualizer;
}

export class AlgorithmManager {
  private static instance: AlgorithmManager;
  private algorithms: Map<string, AlgorithmConfig> = new Map();

  private constructor() {
    this.initMetadata();
  }

  public static getInstance(): AlgorithmManager {
    if (!AlgorithmManager.instance) {
      AlgorithmManager.instance = new AlgorithmManager();
    }
    return AlgorithmManager.instance;
  }

  /**
   * 初始化轻量元数据（首屏毫秒级就绪，不加载任何模板与代码）
   */
  private initMetadata(): void {
    ALL_ALGORITHM_METADATA.forEach((meta) => {
      this.algorithms.set(meta.id, { ...meta });
    });
  }

  /**
   * 预热加载所有算法模块（用于测试或全量审计）
   */
  public async ensureAllLoaded(): Promise<void> {
    await loadAllAlgorithmBatches();
    getAllManifests().forEach((manifest) => {
      const config = this.algorithms.get(manifest.id) || { ...manifest };
      config.templateContent = manifest.template;
      config.Visualizer = manifest.Visualizer;
      this.algorithms.set(manifest.id, config);
      templateLoader.register(config.viewId, config.templateContent);
    });
  }

  /**
   * 确保单个算法已动态加载
   */
  public async ensureAlgorithmLoaded(algorithmId: string): Promise<AlgorithmConfig | undefined> {
    const config = this.algorithms.get(algorithmId);
    if (!config) {
      return undefined;
    }

    if (!config.Visualizer || !config.templateContent) {
      // 触发对应专题的动态 import
      await loadAlgorithmBatch(config.category);
      const manifest = getManifest(algorithmId);
      if (manifest) {
        config.templateContent = manifest.template;
        config.Visualizer = manifest.Visualizer;
        templateLoader.register(config.viewId, config.templateContent);
      }
    }

    return config;
  }

  /**
   * 显示算法页面
   */
  public async showAlgorithm(algorithmId: string): Promise<void> {
    const config = await this.ensureAlgorithmLoaded(algorithmId);
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