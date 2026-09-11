/**
 * 算法目录索引收获器 (AlgorithmCatalogIndexer) — 深模块
 *
 * 单一事实源深化：算法目录元数据的唯一手写源是各 renderer 的注册调用本身
 * （registerDeclarativeAlgorithm / registerAlgorithm / dp-generated 三种方言）。
 * 本模块从真实注册表收获"纯注册视图"并渲染为生成物源码：
 * - `npm run meta:sync`（vite-node scripts/catalog-sync.ts）落盘为 algorithm-catalog.generated.ts（提交入库）
 * - vitest 门禁（algorithm-catalog-indexer.test.ts）断言生成物与真实注册零漂移
 *
 * 约束：仅供同步脚本与门禁测试使用，不进入浏览器运行时链路。
 */

import { algorithmRegistry } from './algorithm-registry';
import type { AlgorithmMetadata, AlgorithmManifest } from './registry';

// eager glob 在模块加载瞬间完成全部 30 个 batch 索引的注册副作用，
// 收获因此天然穷尽所有已接线（wired）的注册，与手工维护的加载清单无关。
const batchIndexModules = import.meta.glob('../algorithms/batch-*-index.ts', { eager: true });

/** 投影：AlgorithmManifest → 9 字段目录元数据（剥离 template / Visualizer） */
export function projectCatalogMetadata(manifest: AlgorithmManifest): AlgorithmMetadata {
  const meta: AlgorithmMetadata = {
    id: manifest.id,
    name: manifest.name ?? manifest.id,
    viewId: manifest.viewId ?? `algo-${manifest.id}-view`,
    category: manifest.category,
    description: manifest.description ?? '',
    icon: manifest.icon ?? '📊',
    difficulty: (manifest.difficulty ?? 2) as AlgorithmMetadata['difficulty'],
    levelOrder: manifest.levelOrder ?? 99,
  };
  if (manifest.learningGoal) {
    meta.learningGoal = manifest.learningGoal;
  }
  if (manifest.aliases && manifest.aliases.length > 0) {
    meta.aliases = [...manifest.aliases];
  }
  return meta;
}

/** 纯码点比较，保证生成物在任何环境下字节级确定（localeCompare 随 ICU 漂移，禁用） */
function compareByCatalogOrder(a: AlgorithmMetadata, b: AlgorithmMetadata): number {
  if (a.category !== b.category) return a.category < b.category ? -1 : 1;
  if (a.levelOrder !== b.levelOrder) return a.levelOrder - b.levelOrder;
  if (a.id !== b.id) return a.id < b.id ? -1 : 1;
  return 0;
}

/** 收获全量目录元数据（纯注册视图，按 类目 → levelOrder → id 全序排列） */
export function harvestCatalogMetadata(): AlgorithmMetadata[] {
  return algorithmRegistry
    .getAllManifests()
    .map(projectCatalogMetadata)
    .sort(compareByCatalogOrder);
}

/** 将收获结果渲染为生成物源码文本 */
export function renderCatalogModule(entries: readonly AlgorithmMetadata[]): string {
  const lines: string[] = [
    '/**',
    ' * 算法目录元数据生成物 (GENERATED FILE) — 请勿手写编辑',
    ' * 唯一手写源是各 renderer 的注册调用；变更后运行 `npm run meta:sync` 重新收获。',
    ' * 门禁：src/core/algorithm-catalog-indexer.test.ts 断言本文件与真实注册零漂移。',
    ' */',
    '',
    "import type { AlgorithmMetadata } from './registry';",
    '',
    'export const ALL_ALGORITHM_METADATA: AlgorithmMetadata[] = [',
  ];
  for (const entry of entries) {
    lines.push('  {');
    lines.push(`    id: ${JSON.stringify(entry.id)},`);
    lines.push(`    name: ${JSON.stringify(entry.name)},`);
    lines.push(`    viewId: ${JSON.stringify(entry.viewId)},`);
    lines.push(`    category: ${JSON.stringify(entry.category)},`);
    lines.push(`    description: ${JSON.stringify(entry.description)},`);
    lines.push(`    icon: ${JSON.stringify(entry.icon)},`);
    lines.push(`    difficulty: ${entry.difficulty},`);
    lines.push(`    levelOrder: ${entry.levelOrder},`);
    if (entry.learningGoal !== undefined) {
      lines.push(`    learningGoal: ${JSON.stringify(entry.learningGoal)},`);
    }
    if (entry.aliases !== undefined) {
      lines.push(`    aliases: ${JSON.stringify(entry.aliases)},`);
    }
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  return lines.join('\n');
}

export interface CatalogFieldDivergence {
  id: string;
  field: keyof AlgorithmMetadata;
  legacy: string | number | undefined;
  harvested: string | number | undefined;
}

export interface CatalogReconciliation {
  /** 旧手写清单内部的重复 id（同一 id 出现多次） */
  duplicateLegacyIds: { id: string; entries: AlgorithmMetadata[] }[];
  /** 旧清单有、真实注册无 —— 死条目（默认删除，git 历史可找回） */
  deadEntries: AlgorithmMetadata[];
  /** 真实注册有、旧清单无 —— 首页目录不可见的漏收条目 */
  unlistedRegistrations: AlgorithmMetadata[];
  /** 共有 id 的字段级分歧（回填工作清单） */
  fieldDivergences: CatalogFieldDivergence[];
}

/** 比对收获结果与旧手写清单，产出调和工作清单 */
export function reconcileCatalog(
  harvested: readonly AlgorithmMetadata[],
  legacy: readonly AlgorithmMetadata[],
): CatalogReconciliation {
  const harvestedById = new Map(harvested.map((m) => [m.id, m] as const));
  const legacyById = new Map<string, AlgorithmMetadata[]>();
  for (const entry of legacy) {
    const bucket = legacyById.get(entry.id) ?? [];
    bucket.push(entry);
    legacyById.set(entry.id, bucket);
  }

  const duplicateLegacyIds = [...legacyById.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([id, entries]) => ({ id, entries }));

  const deadEntries = [...legacyById.entries()]
    .filter(([id]) => !harvestedById.has(id))
    .map(([, entries]) => entries[0]);

  const unlistedRegistrations = harvested.filter((m) => !legacyById.has(m.id));

  const fieldDivergences: CatalogFieldDivergence[] = [];
  const fields: (keyof AlgorithmMetadata)[] = [
    'name', 'viewId', 'category', 'description', 'icon', 'difficulty', 'levelOrder', 'learningGoal',
  ];
  for (const [id, entries] of legacyById) {
    const harvestedEntry = harvestedById.get(id);
    if (!harvestedEntry) continue;
    for (const legacyEntry of entries) {
      for (const field of fields) {
        const legacyValue = legacyEntry[field] as string | number | undefined;
        const harvestedValue = harvestedEntry[field] as string | number | undefined;
        if (legacyValue !== harvestedValue) {
          fieldDivergences.push({ id, field, legacy: legacyValue, harvested: harvestedValue });
        }
      }
    }
  }
  fieldDivergences.sort((a, b) => a.id.localeCompare(b.id) || a.field.localeCompare(b.field));

  return { duplicateLegacyIds, deadEntries, unlistedRegistrations, fieldDivergences };
}

/** 调和工作清单渲染为 Markdown 报告 */
export function renderReconciliationReport(r: CatalogReconciliation): string {
  const lines: string[] = [
    '# 算法目录调和报告 (Catalog Reconciliation Report)',
    '',
    `- 收获（真实注册）：独立 id 数见下文`,
    `- 重复 id：${r.duplicateLegacyIds.length} 组`,
    `- 死条目（旧清单有、注册无）：${r.deadEntries.length} 条`,
    `- 漏收条目（注册有、旧清单无）：${r.unlistedRegistrations.length} 条`,
    `- 字段级分歧：${r.fieldDivergences.length} 处`,
    '',
  ];

  if (r.duplicateLegacyIds.length > 0) {
    lines.push('## 1. 旧清单重复 id', '');
    for (const dup of r.duplicateLegacyIds) {
      lines.push(`### \`${dup.id}\``);
      dup.entries.forEach((e, i) => {
        lines.push(`- 定义 ${i + 1}: name=${JSON.stringify(e.name)} category=${e.category} levelOrder=${e.levelOrder}`);
      });
      lines.push('');
    }
  }

  if (r.deadEntries.length > 0) {
    lines.push('## 2. 死条目（默认删除，需 veto 请列出 id）', '');
    lines.push('| id | name | category | levelOrder |', '| --- | --- | --- | --- |');
    for (const e of r.deadEntries) {
      lines.push(`| ${e.id} | ${e.name} | ${e.category} | ${e.levelOrder} |`);
    }
    lines.push('');
  }

  if (r.unlistedRegistrations.length > 0) {
    lines.push('## 3. 漏收条目（收获后自动进入目录，无需处理）', '');
    lines.push('| id | name | category | levelOrder |', '| --- | --- | --- | --- |');
    for (const e of r.unlistedRegistrations) {
      lines.push(`| ${e.id} | ${e.name} | ${e.category} | ${e.levelOrder} |`);
    }
    lines.push('');
  }

  if (r.fieldDivergences.length > 0) {
    lines.push('## 4. 字段级分歧（回填工作清单：legacy 值写回 renderer spec）', '');
    lines.push('| id | field | legacy | harvested |', '| --- | --- | --- | --- |');
    for (const d of r.fieldDivergences) {
      lines.push(`| ${d.id} | ${d.field} | ${JSON.stringify(d.legacy)} | ${JSON.stringify(d.harvested)} |`);
    }
    lines.push('');
  }

  lines.push('---', '', '_由 `npm run meta:sync` 生成；旧手写清单删除后本报告自动退化为空。_', '');
  return lines.join('\n');
}
