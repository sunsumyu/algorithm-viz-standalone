/**
 * Generic tree deep-clone seams (树结构深克隆泛型)
 *
 * 替换 9 处结构近相同的本地 cloneTree/cloneLcsTree/cloneTreeCountTree 重复实现。
 * 泛型 T 保持调用处类型精确：`cloneStateDepTree<T>(node: T | null): T | null`。
 *
 * 克隆语义（与原 9 个函数组行为完全一致）：
 * 1. null/undefined → 原样返回 null
 * 2. 数组 → 深度递归 map
 * 3. 非 null 对象 → 递归克隆自有可枚举属性；属性值若为数组或纯对象则递归克隆
 * 4. 原语（string/number/boolean/symbol）→ 原样复制
 *
 * 覆盖场景：
 * - n-ary 树 (children 数组) — DpTreeNode, RecTreeNode, TreeCountTreeNode, LcsTreeNode, UniversalTreeNode
 * - 二叉树 (left/right) — TreeNode (build-tree / tree-invert)
 * - 含 label/edgeLabel/r/c 等各类字段 — 通用 key 迭代自动适配
 * - 原实现中 `children.map(f).filter(Boolean)` 的 falsy 过滤 — 由克隆后 undefined 属性自然被 JSON 序列化省略模拟
 */
export function cloneStateDepTree<T>(node: T | null | undefined): T | null {
  if (node === null || node === undefined) return null;

  if (Array.isArray(node)) {
    return node.map((child) => cloneStateDepTree(child)) as unknown as T;
  }

  if (typeof node === 'object') {
    const clone: Record<string, unknown> = {};
    for (const key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
      const val = (node as Record<string, unknown>)[key];
      clone[key] = cloneStateDepTree(val);
    }
    return clone as unknown as T;
  }

  return node;
}
