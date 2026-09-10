/**
 * 算法分批按需动态加载器 (Lazy Batch Loader)
 * 将 218 个算法按所属专题模块分片，首屏仅加载元数据，进入具体算法时动态 import 对应专题 chunk
 */

const BATCH_LOADERS: Record<string, () => Promise<unknown>> = {
  stack: () => import('../algorithms/batch-1-index'),
  array: () => Promise.all([import('../algorithms/batch-2-index'), import('../algorithms/batch-6-index'), import('../algorithms/batch-25-index')]),
  'linked-list': () => Promise.all([import('../algorithms/batch-2-index'), import('../algorithms/batch-22-index')]),
  'hash-table': () => import('../algorithms/batch-2-index'),
  string: () => Promise.all([import('../algorithms/batch-2-index'), import('../algorithms/batch-7-index')]),
  'monotonic-stack': () => Promise.all([import('../algorithms/batch-2-index'), import('../algorithms/batch-4-index'), import('../algorithms/batch-25-index')]),
  graph: () => Promise.all([import('../algorithms/batch-2-index'), import('../algorithms/batch-12-index'), import('../algorithms/batch-17-index'), import('../algorithms/batch-19-index'), import('../algorithms/batch-20-index'), import('../algorithms/batch-21-index')]),
  game: () => Promise.all([import('../algorithms/batch-2-index'), import('../algorithms/batch-6-index')]),
  tree: () => Promise.all([import('../algorithms/batch-3-index'), import('../algorithms/batch-8-index'), import('../algorithms/batch-9-index'), import('../algorithms/batch-10-index'), import('../algorithms/batch-12-index'), import('../algorithms/batch-13-index'), import('../algorithms/batch-14-index'), import('../algorithms/batch-18-index'), import('../algorithms/batch-19-index'), import('../algorithms/batch-21-index'), import('../algorithms/batch-23-index')]),
  search: () => Promise.all([import('../algorithms/batch-4-index'), import('../algorithms/batch-14-index'), import('../algorithms/batch-18-index'), import('../algorithms/batch-28-index')]),
  sort: () => Promise.all([import('../algorithms/batch-4-index'), import('../algorithms/batch-24-index')]),
  greedy: () => Promise.all([import('../algorithms/batch-5-index'), import('../algorithms/batch-11-index')]),
  backtracking: () => import('../algorithms/batch-backtracking-index'),
  'dynamic-programming': () => Promise.all([import('../algorithms/batch-dynamic-programming-index'), import('../algorithms/batch-10-index'), import('../algorithms/batch-26-index'), import('../algorithms/batch-27-index')]),
  math: () => Promise.all([import('../algorithms/batch-4-index'), import('../algorithms/batch-6-index'), import('../algorithms/batch-10-index'), import('../algorithms/batch-11-index'), import('../algorithms/batch-12-index'), import('../algorithms/batch-14-index'), import('../algorithms/batch-15-index'), import('../algorithms/batch-16-index')]),
  bit: () => Promise.all([import('../algorithms/batch-4-index'), import('../algorithms/batch-6-index')]),
  'bit-manipulation': () => import('../algorithms/batch-4-index'),
  heap: () => import('../algorithms/batch-4-index'),
  queue: () => import('../algorithms/batch-2-index'),
  'two-pointers': () => import('../algorithms/batch-7-index'),
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
