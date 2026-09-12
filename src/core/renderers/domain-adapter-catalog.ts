/**
 * 领域画布适配器目录 (Domain Adapter Catalog)
 *
 * 集中收编全库所有领域专属画板适配器的元信息，供开发者快速查阅可用适配器。
 * 适配器本身是静态工具类，各自拥有独立的状态类型和渲染签名，
 * 不强制统一接口——因为不同领域的视觉形态差异巨大，
 * 统一接口会抹平二叉树 SVG 拓扑、数组双指针轨道、DP 网格体素等本质差异。
 *
 * 使用方式：算法 renderer 按需直接导入具体适配器，例如：
 * ```ts
 * import { TreeCanvasAdapter } from '../core/renderers/adapters/tree-canvas-adapter';
 * TreeCanvasAdapter.renderTree(container, { tree, current: nodeVal });
 * ```
 */

// ── 适配器元信息注册 ──────────────────────────────────────

export interface DomainAdapterEntry {
  /** 适配器唯一标识 */
  id: string;
  /** 中文名称 */
  name: string;
  /** 适用算法领域 */
  domain: string;
  /** 适配器类（静态方法） */
  adapter: any;
  /** 入口渲染方法名 */
  renderMethod: string;
  /** 已知使用该适配器的算法数量（近似） */
  usageCount: number;
}

/**
 * 全库适配器目录——穷举所有已知领域画布适配器
 *
 * 维护规范：新增适配器时在此追加条目，保持按 domain 字母序排列
 */
export const DOMAIN_ADAPTER_CATALOG: readonly DomainAdapterEntry[] = [
  {
    id: 'array-track',
    name: '数组多轨适配器',
    domain: 'array / two-pointers / sliding-window',
    adapter: null as any, // 懒引用，避免循环依赖
    renderMethod: 'renderTrack',
    usageCount: 5,
  },
  {
    id: 'dual-structure',
    name: '双结构交互适配器',
    domain: 'stack / queue (双栈实现队列等)',
    adapter: null as any,
    renderMethod: 'renderDualStack',
    usageCount: 2,
  },
  {
    id: 'tree-canvas',
    name: '树拓扑画板适配器',
    domain: 'binary-tree / BST / LCA',
    adapter: null as any,
    renderMethod: 'renderTree',
    usageCount: 10,
  },
  {
    id: 'dp-grid',
    name: 'DP 网格体素适配器',
    domain: 'dynamic-programming (2D/3D 网格)',
    adapter: null as any,
    renderMethod: 'renderGrid',
    usageCount: 30,
  },
  {
    id: 'recursion-tree',
    name: '递归树适配器',
    domain: 'backtracking / recursion / divide-conquer',
    adapter: null as any,
    renderMethod: 'renderRecursionTree',
    usageCount: 8,
  },
  {
    id: 'spatial-flow',
    name: '空间流场适配器',
    domain: 'DP (路径/空间压缩)',
    adapter: null as any,
    renderMethod: 'renderSpatialFlow',
    usageCount: 5,
  },
  {
    id: 'memo-slot',
    name: 'Memo 槽位适配器',
    domain: 'DP (记忆化/递推)',
    adapter: null as any,
    renderMethod: 'renderMemoSlots',
    usageCount: 15,
  },
  {
    id: 'sequence-alignment',
    name: '序列比对适配器',
    domain: 'DP (编辑距离/LCS)',
    adapter: null as any,
    renderMethod: 'renderAlignment',
    usageCount: 4,
  },
  {
    id: 'bars-canvas',
    name: '排序柱状沙盘适配器',
    domain: 'sort (冒泡/选择/插入/希尔/快排/堆排)',
    adapter: null as any, // 懒引用，避免循环依赖
    renderMethod: 'render',
    usageCount: 6,
  },
  {
    id: 'three-graph',
    name: '3D 图拓扑适配器',
    domain: 'graph (最短路/Dijkstra)',
    adapter: null as any,
    renderMethod: 'updateScene',
    usageCount: 6,
  },
  {
    id: 'three-voxel',
    name: '3D 体素适配器',
    domain: 'DP (三维网格)',
    adapter: null as any,
    renderMethod: 'updateScene',
    usageCount: 2,
  },
] as const;

/**
 * 按领域快速查找适配器
 */
export function findAdapterByDomain(domainKeyword: string): DomainAdapterEntry | undefined {
  return DOMAIN_ADAPTER_CATALOG.find((a) =>
    a.domain.toLowerCase().includes(domainKeyword.toLowerCase()),
  );
}

/**
 * 按 ID 查找适配器
 */
export function findAdapterById(id: string): DomainAdapterEntry | undefined {
  return DOMAIN_ADAPTER_CATALOG.find((a) => a.id === id);
}
