/**
 * 领域视图与沙盘呈现解析深模块 (DomainViewPresentationResolver)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 统一根据算法类目、ID 与维度特征，自适应推导沙盘卡片标题、主沙盘 Tab 文案及 FontAwesome 语义化图标。
 */

export interface DomainPresentationParams {
  id: string;
  category?: string;
  name?: string;
  card1Title?: string;
  m?: number;
  n?: number;
}

export interface DomainPresentationMeta {
  primaryTabLabel: string;
  primaryTabIcon: string;
  deductionTabLabel: string;
  deductionTabIcon: string;
  card1TitleHtml: string;
}

const GRID_ALGORITHM_IDS = new Set([
  'unique-paths',
  'unique-paths-ii',
  'min-path-sum',
  'dungeon-game-reverse-dp',
  'a-star',
  'a-star-journey',
  'trapping-water-ii',
  'water-flow',
  'swim-in-rising-water',
  'swim-in-rising-water-064',
  'path-min-effort',
  'path-min-effort-064',
  'path-with-minimum-effort',
  'minimum-effort-path',
  'island-perimeter',
  'islands',
  'island-count',
  'max-area-of-island',
  'making-a-large-island',
  'make-largest-island',
  'as-far-from-land-as-possible',
  'as-far-from-land-062',
  'minimum-obstacle-removal',
  'minimum-obstacles-062',
  'minimum-cost-valid-path',
  'minimum-cost-valid-path-062',
  'sink-islands',
  'total-island-area',
  'island-count-bfs',
  'islands-bfs',
  'closed-islands',
  'sub-islands',
  'distinct-islands',
  'coastline',
]);

const TREE_ALGORITHM_IDS = new Set([
  'binary-tree-cameras',
  'tree-cameras',
  'max-distance-in-tree',
  'largest-bst-subtree',
  'max-path-sum',
  'tree-diameter',
  'course-selection',
  'minimum-fuel-cost',
  'party-without-boss',
]);

export class DomainViewPresentationResolver {
  public static isGridProblem(id?: string): boolean {
    if (!id) return false;
    if (GRID_ALGORITHM_IDS.has(id)) return true;
    return (
      id.includes('island') ||
      id.includes('water') ||
      id.includes('grid') ||
      id.includes('maze') ||
      id.includes('obstacle') ||
      id.includes('coastline') ||
      id.includes('effort') ||
      id.includes('swim')
    );
  }

  public static resolve(params: DomainPresentationParams): DomainPresentationMeta {
    const { id, category = '', card1Title, m, n } = params;

    const deductionTabLabel = '全景推演树';
    const deductionTabIcon = 'fa-diagram-project';

    // 1. 二维网格沙盘族优先拦截 (覆盖 DP 网格与 Graph 类目下的岛屿/水流/障碍物网格图)
    if (this.isGridProblem(id) || (m !== undefined && m > 1 && n !== undefined && n > 1)) {
      const primaryTabLabel = '二维网格';
      const primaryTabIcon = 'fa-table-cells';
      const dimStr = m !== undefined && n !== undefined ? ` (${m}×${n})` : '';
      const defaultTitle = `<i class="fa-solid fa-table-cells text-slate-500"></i> 二维网格沙盘${dimStr}`;
      return {
        primaryTabLabel,
        primaryTabIcon,
        deductionTabLabel,
        deductionTabIcon,
        card1TitleHtml: card1Title || defaultTitle,
      };
    }

    // 2. 树结构算法族
    if (category === 'tree' || TREE_ALGORITHM_IDS.has(id) || id.includes('tree')) {
      const primaryTabLabel = '树形拓扑';
      const primaryTabIcon = 'fa-network-wired';
      const defaultTitle = `<i class="fa-solid fa-network-wired text-emerald-600"></i> 树形拓扑与状态空间`;
      return {
        primaryTabLabel,
        primaryTabIcon,
        deductionTabLabel,
        deductionTabIcon,
        card1TitleHtml: card1Title || defaultTitle,
      };
    }

    // 3. 图论网络与节点边集拓扑沙盘 (DFS, BFS, 拓扑排序, 最短路等)
    if (
      category === 'graph' ||
      id.includes('dijkstra') ||
      id.includes('bellman') ||
      id.includes('spfa') ||
      id.includes('floyd') ||
      id.includes('topo') ||
      id.includes('dfs') ||
      id.includes('bfs')
    ) {
      const primaryTabLabel = '图拓扑沙盘';
      const primaryTabIcon = 'fa-circle-nodes';
      let defaultTitle = `<i class="fa-solid fa-circle-nodes text-sky-500"></i> 图拓扑结构与状态空间沙盘`;
      if (id.includes('dfs')) {
        defaultTitle = `<i class="fa-solid fa-diagram-project text-amber-500"></i> DFS 递归深入与状态染色沙盘`;
      } else if (id.includes('bfs')) {
        defaultTitle = `<i class="fa-solid fa-water text-cyan-500"></i> BFS 层序扩展与水波纹沙盘`;
      } else if (id.includes('topo')) {
        defaultTitle = `<i class="fa-solid fa-arrow-down-wide-short text-indigo-500"></i> 有向无环图与拓扑排序沙盘`;
      } else if (id.includes('dijkstra') || id.includes('bellman') || id.includes('spfa') || id.includes('floyd')) {
        defaultTitle = `<i class="fa-solid fa-circle-nodes text-emerald-500"></i> 图拓扑沙盘与松弛流`;
      }
      return {
        primaryTabLabel,
        primaryTabIcon,
        deductionTabLabel,
        deductionTabIcon,
        card1TitleHtml: card1Title || defaultTitle,
      };
    }

    // 4. 默认通用沙盘
    const primaryTabLabel = '执行沙盘';
    const primaryTabIcon = 'fa-cube';
    const defaultTitle = `<i class="fa-solid fa-cube text-slate-500"></i> 算法执行沙盘`;
    return {
      primaryTabLabel,
      primaryTabIcon,
      deductionTabLabel,
      deductionTabIcon,
      card1TitleHtml: card1Title || defaultTitle,
    };
  }
}
