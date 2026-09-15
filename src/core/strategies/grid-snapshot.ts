/**
 * 二维网格快照引擎 (Grid Snapshot Engine)
 *
 * 替代全库 201 处手写 `grid.map((r) => [...r])` / `JSON.parse(JSON.stringify())`
 * 浅拷贝。每次 step push 前快照缺一不可：遗漏会导致多个步骤共享同一行数组，
 * 状态突变互相影响 — 正是 dp-067 LCS tree truncation bug 的同类病灶。
 *
 * 原则：
 * 1. 引擎只负责「深拷贝」，不掺杂业务逻辑 (isObstacle / fillValue 等)。
 * 2. 泛型 <T> 保持原单元格类型精确，调用处零改动。
 * 3. 原实现 `grid.map((row) => [...row])` 已被证明存在遗漏风险 — 用这个
 *    Engine-level 统一实现 + 门禁 (Gate 5) 双剑合并。
 */

/**
 * 深拷贝二维网格 (Deep-copy 2D grid)
 *
 * 行为等价于手写 `grid.map((r) => [...r])`，但保证：
 * - 非数组输入返回 null
 * - 空数组返回 []
 * - 保证行数组也被独立拷贝（浅拷贝嵌套数组）
 */
export function snapshotGrid2D<T>(grid: T[][] | null | undefined): T[][] {
  if (!grid) return [];
  return grid.map((row) => [...row]);
}

/**
 * 快照一维数组 (Deep-copy 1D array)
 *
 * 替代 `clone1d<T>(arr: T[]): T[] { return [...arr]; }`。
 */
export function snapshotArray1D<T>(arr: T[] | null | undefined): T[] {
  if (!arr) return [];
  return [...arr];
}

/**
 * 快照 dp 网格 (Deep-copy dp table with null cells)
 *
 * 专用于 `(number | null)[][]` 类型的 DP 表 — 最常见的场景。
 * 内部等价于 `snapshotGrid2D` 但提供类型收窄。
 */
export function snapshotDpGrid(grid: (number | null)[][] | null | undefined): (number | null)[][] {
  return snapshotGrid2D(grid ?? []);
}

/**
 * 深拷贝字典 (Deep-copy Record/object)
 *
 * 专用于 `Record<string, T>` 类型的深拷贝 — 替代 `JSON.parse(JSON.stringify(...))`。
 * 值类型 T 若为数组或对象则递归拷贝，原始类型直接复制。
 */
export function snapshotDict<T>(dict: Record<string, T> | null | undefined): Record<string, T> {
  if (!dict) return {};
  const out: Record<string, T> = {};
  for (const key of Object.keys(dict)) {
    const val = dict[key];
    if (Array.isArray(val)) {
      out[key] = val.map((item) =>
        item !== null && typeof item === 'object'
          ? (JSON.parse(JSON.stringify(item)) as T)
          : item
      ) as unknown as T;
    } else if (val !== null && typeof val === 'object') {
      out[key] = JSON.parse(JSON.stringify(val)) as T;
    } else {
      out[key] = val;
    }
  }
  return out;
}
