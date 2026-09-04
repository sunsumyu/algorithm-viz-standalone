/**
 * 算法注册中心与惰性解析深模块 (AlgorithmRegistry Deep Module)
 *
 * 遵循深模块原则 (Deep Module & Single Source of Truth)：
 * 1. 唯一事实来源：彻底收拢原先分散在 registry.ts、template-loader.ts 与 algorithm-manager.ts 的三份浅 Map。
 * 2. 深度封装分包加载：将 loadAlgorithmBatch 动态分包调度封装在 resolve(id) 之后，对 UI 调用方完全透明。
 * 3. 极窄接口与高杠杆：对外仅暴露元数据查询、清单注册与一步解析方法，消除了样板式的模板/类引用二次搬运。
 * 4. 零 DOM 依赖：纯数据与工厂构造器管理，可无缝运行在测试环境与全量保真度审计中。
 */

import type { IVisualizer } from './interfaces';
import type { AlgorithmMetadata, AlgorithmManifest } from './registry';
import { ALL_ALGORITHM_METADATA } from './algorithm-manifests-meta';
import { loadAlgorithmBatch } from './algorithm-loader';

export interface ResolvedAlgorithmEntry extends AlgorithmMetadata {
  template: string;
  Visualizer: new () => IVisualizer;
  createVisualizer(): IVisualizer;
}

export interface AlgorithmRegistryOptions {
  /** 初始算法元数据列表 */
  initialMetadata?: AlgorithmMetadata[];
  /** 动态分包加载器函数（用于按需加载专题 chunk） */
  batchLoader?: (category: string) => Promise<void>;
}

export class AlgorithmRegistry {
  private static instance: AlgorithmRegistry;

  private readonly metadataMap: Map<string, AlgorithmMetadata> = new Map();
  private readonly manifestsMap: Map<string, AlgorithmManifest> = new Map();
  private readonly templatesMap: Map<string, string> = new Map();
  private readonly batchLoader: (category: string) => Promise<void>;

  constructor(options: AlgorithmRegistryOptions = {}) {
    this.batchLoader = options.batchLoader ?? loadAlgorithmBatch;

    const initial = options.initialMetadata ?? ALL_ALGORITHM_METADATA ?? [];
    initial.forEach((meta) => {
      this.metadataMap.set(meta.id, meta);
    });
  }

  public static getInstance(): AlgorithmRegistry {
    if (!AlgorithmRegistry.instance) {
      AlgorithmRegistry.instance = new AlgorithmRegistry();
    }
    return AlgorithmRegistry.instance;
  }

  /**
   * 注册自描述算法清单。
   * 自动完成元数据补充、模板索引以及构造器映射。
   */
  public register(manifest: AlgorithmManifest): void {
    if (this.manifestsMap.has(manifest.id)) {
      return;
    }

    this.manifestsMap.set(manifest.id, manifest);
    this.metadataMap.set(manifest.id, manifest);
    if (manifest.viewId && manifest.template) {
      this.templatesMap.set(manifest.viewId, manifest.template);
    }
  }

  /**
   * 获取算法元数据（无需等待分包加载，首屏立即可用）
   */
  public getMetadata(id: string): AlgorithmMetadata | undefined {
    return this.metadataMap.get(id);
  }

  /**
   * 获取全量算法元数据列表
   */
  public getAllMetadata(): AlgorithmMetadata[] {
    return Array.from(this.metadataMap.values());
  }

  /**
   * 判断算法清单是否已注册（即对应 chunk 已被加载）
   */
  public hasManifest(id: string): boolean {
    return this.manifestsMap.has(id);
  }

  /**
   * 获取已注册的算法清单
   */
  public getManifest(id: string): AlgorithmManifest | undefined {
    return this.manifestsMap.get(id);
  }

  /**
   * 获取所有已注册的算法清单
   */
  public getAllManifests(): AlgorithmManifest[] {
    return Array.from(this.manifestsMap.values());
  }

  /**
   * 根据 viewId 查询模板 HTML 内容
   */
  public getTemplate(viewId: string): string | undefined {
    return this.templatesMap.get(viewId);
  }

  /**
   * 显式注册或覆盖模板内容（主要用于兼容遗留 templateLoader 接口）
   */
  public registerTemplate(viewId: string, content: string): void {
    this.templatesMap.set(viewId, content);
  }

  /**
   * 解析并确保指定算法可用（按需动态拉取分包并返回完整条目）
   */
  public async resolve(algorithmId: string): Promise<ResolvedAlgorithmEntry | undefined> {
    const existing = this.manifestsMap.get(algorithmId);
    if (existing) {
      return this.wrapEntry(existing);
    }

    const meta = this.metadataMap.get(algorithmId);
    if (!meta) {
      return undefined;
    }

    // 触发所属专题分包的动态加载
    try {
      await this.batchLoader(meta.category);
    } catch (err) {
      console.error(`[AlgorithmRegistry] Failed to load batch for category: ${meta.category}`, err);
      return undefined;
    }

    const loaded = this.manifestsMap.get(algorithmId);
    if (!loaded) {
      return undefined;
    }

    return this.wrapEntry(loaded);
  }

  /**
   * 工厂快捷方式：解析算法并直接构造其实例
   */
  public async createVisualizer(algorithmId: string): Promise<IVisualizer | undefined> {
    const entry = await this.resolve(algorithmId);
    return entry?.createVisualizer();
  }

  private wrapEntry(manifest: AlgorithmManifest): ResolvedAlgorithmEntry {
    return {
      ...manifest,
      createVisualizer: () => new manifest.Visualizer(),
    };
  }
}

export const algorithmRegistry = AlgorithmRegistry.getInstance();
