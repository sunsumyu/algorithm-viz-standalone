/**
 * 算法分批按需动态加载器 (Lazy Batch Loader)
 * 将 218 个算法按所属专题模块分片，首屏仅加载元数据，进入具体算法时动态 import 对应专题 chunk
 */

const BATCH_LOADERS: Record<string, () => Promise<unknown>> = {
  stack: () => import('../algorithms/batch-1-index'),
  array: () => import('../algorithms/batch-2-index'),
  'linked-list': () => import('../algorithms/batch-2-index'),
  'hash-table': () => import('../algorithms/batch-2-index'),
  string: () => import('../algorithms/batch-2-index'),
  'monotonic-stack': () => import('../algorithms/batch-2-index'),
  graph: () => import('../algorithms/batch-2-index'),
  tree: () => import('../algorithms/batch-3-index'),
  search: () => import('../algorithms/batch-4-index'),
  sort: () => import('../algorithms/batch-4-index'),
  greedy: () => import('../algorithms/batch-5-index'),
  backtracking: () => import('../algorithms/batch-backtracking-index'),
  'dynamic-programming': () => import('../algorithms/batch-dynamic-programming-index'),
};

const loadedBatches = new Set<string>();

/**
 * 按需加载指定分类的算法模块
 */
export async function loadAlgorithmBatch(category: string): Promise<void> {
  if (loadedBatches.has(category)) return;
  const loader = BATCH_LOADERS[category];
  if (loader) {
    await loader();
    loadedBatches.add(category);
  }
}

/**
 * 预热加载所有算法模块（用于测试环境或全量保真度审计）
 */
export async function loadAllAlgorithmBatches(): Promise<void> {
  const categories = Object.keys(BATCH_LOADERS);
  await Promise.all(categories.map((cat) => loadAlgorithmBatch(cat)));
}
