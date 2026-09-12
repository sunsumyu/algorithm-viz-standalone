/**
 * 算法目录生成物门禁测试 (Algorithm Catalog Freshness Gates)
 *
 * 三重断言：
 * 1. 新鲜度：已提交生成物与当前真实注册集合一致（忘跑 meta:sync → 红灯）
 * 2. 唯一性：生成物内无重复 id
 * 3. 完整性：所有 batch 注册的算法均已出现在生成物中
 *
 * 本地开发：npm run meta:sync → npm test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadAllAlgorithmBatches } from './algorithm-loader';
import { ALL_ALGORITHM_METADATA } from './algorithm-catalog.generated';
import { algorithmRegistry } from './algorithm-registry';
import { harvestCatalogMetadata } from './algorithm-catalog-indexer';

beforeAll(async () => {
  await loadAllAlgorithmBatches();
});

describe('AlgorithmCatalog — 新鲜度门禁', () => {
  it('生成物与当前真实注册集合一致（忘跑 meta:sync → 红灯）', () => {
    const fresh = harvestCatalogMetadata();
    const committed = [...ALL_ALGORITHM_METADATA].sort((a, b) => a.id.localeCompare(b.id));
    const freshSorted = [...fresh].sort((a, b) => a.id.localeCompare(b.id));
    expect(committed.map((e) => e.id)).toEqual(freshSorted.map((e) => e.id));
  });

  it('生成物无重复 id', () => {
    const ids = ALL_ALGORITHM_METADATA.map((m) => m.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });
});

describe('AlgorithmCatalog — 完整性门禁', () => {
  it('所有 batch 注册的算法均已出现在生成物中（漏注册 → 红灯）', () => {
    const committedIds = new Set(ALL_ALGORITHM_METADATA.map((m) => m.id));
    const registeredIds = algorithmRegistry.getAllManifests().map((m) => m.id);
    const missing = registeredIds.filter((id) => !committedIds.has(id));
    expect(missing).toEqual([]);
  });
});
