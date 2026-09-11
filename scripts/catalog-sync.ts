/**
 * 算法目录元数据同步脚本 (meta:sync)
 *
 * 运行：npm run meta:sync（vite-node）
 * 1. 收获真实注册表全量元数据 → 写入 src/core/algorithm-catalog.generated.ts（提交入库）
 * 2. 若旧手写清单 algorithm-manifests-meta.ts 仍存在，额外产出调和报告至
 *    scratch/catalog-reconciliation-report.md（死条目 / 漏收 / 重复 id / 字段分歧）
 */

import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AlgorithmMetadata } from '../src/core/registry';
import {
  harvestCatalogMetadata,
  reconcileCatalog,
  renderCatalogModule,
  renderReconciliationReport,
} from '../src/core/algorithm-catalog-indexer';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const generatedPath = resolve(root, 'src/core/algorithm-catalog.generated.ts');
const legacyMetaPath = resolve(root, 'src/core/algorithm-manifests-meta.ts');
const reportPath = resolve(root, 'scratch/catalog-reconciliation-report.md');

const entries = harvestCatalogMetadata();
writeFileSync(generatedPath, renderCatalogModule(entries));
console.log(`[meta:sync] 已收获 ${entries.length} 条目录元数据 → ${generatedPath}`);

if (existsSync(legacyMetaPath)) {
  try {
    const legacyModule = (await import('../src/core/algorithm-manifests-meta')) as {
      ALL_ALGORITHM_METADATA: AlgorithmMetadata[];
    };
    const report = renderReconciliationReport(reconcileCatalog(entries, legacyModule.ALL_ALGORITHM_METADATA));
    writeFileSync(reportPath, report);
    console.log(`[meta:sync] 旧手写清单仍在，调和报告已更新 → ${reportPath}`);
  } catch (err) {
    console.warn('[meta:sync] 调和报告生成失败（不影响生成物）:', err);
  }
} else {
  console.log('[meta:sync] 旧手写清单已删除，跳过调和报告。');
}
