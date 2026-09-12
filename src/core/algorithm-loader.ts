/**
 * 算法分批按需动态加载器 (Convention-Based Lazy Loader)
 *
 * 约定优于配置：Vite glob 按 categories/** 目录路径自动发现全部 renderer，
 * 消除手工维护的 batch-N-index.ts 与 BATCH_LOADERS 类目映射。
 * 509 个 renderer 文件的 import 副作用自动注册到 AlgorithmRegistry。
 */

const rendererModules = import.meta.glob('../algorithms/categories/**/*-renderer.ts', { eager: false });

/**
 * dp-generated-renderers.ts 不符合 *-renderer.ts 命名约定，
 * 但它注册了 68 个 DP 算法（registerDemo / registerArticle），
 * 需要显式引入以触发其注册副作用。
 */
const dpGeneratedModule = import('../algorithms/categories/dynamic-programming/dp-generated-renderers');

const loadedCategories = new Set<string>();

/**
 * 按需加载指定类目的算法模块（glob 约定，无需手工映射）
 * 首次调用时触发全部 renderer 的 side-effect import + dp-generated 注册；
 * 后续调用命中 loadedCategories 去重，零开销。
 */
export async function loadAlgorithmBatch(category: string): Promise<void> {
  if (loadedCategories.has(category)) return;
  await Promise.all([
    ...Object.values(rendererModules).map((loader) => loader()),
    dpGeneratedModule,
  ]);
  loadedCategories.add(category);
}

/**
 * 预热加载所有算法模块（用于测试环境或全量保真度审计）
 */
export async function loadAllAlgorithmBatches(): Promise<void> {
  if (loadedCategories.size > 0) return;
  await Promise.all([
    ...Object.values(rendererModules).map((loader) => loader()),
    dpGeneratedModule,
  ]);
  loadedCategories.add('__all__');
}
