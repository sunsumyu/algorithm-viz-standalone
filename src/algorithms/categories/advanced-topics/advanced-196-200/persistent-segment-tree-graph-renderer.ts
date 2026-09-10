/**
 * Class 197: 主席树/可持久化优化建图 (Persistent Segment Tree Graph Optimization)
 * 解决带有时间前缀限制与历史版本权值区间连边 / 洛谷 P3588 [POI2015] PUS
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { PERSISTENT_GRAPH_CODES, PERSISTENT_GRAPH_LINES } from './advanced-196-200-stage-codes';
import { Advanced196Step, renderPersistentGraphBoard } from './advanced-196-200-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PersistentGraphStep extends Advanced196Step {
  versions: { ver: number; rootId: string; newNodes: string[]; sharedNodes: string[] }[];
  activeVer: number;
  linkedTarget: { fromPoint: number; targetRange: string; hitNodes: string[] } | null;
  statusDesc: string;
}

export function buildPersistentGraphSteps(): PersistentGraphStep[] {
  const steps: PersistentGraphStep[] = [];
  const lines = PERSISTENT_GRAPH_LINES;

  const initialVersions = [
    { ver: 0, rootId: 'Root_0', newNodes: ['Empty'], sharedNodes: [] },
  ];

  // Step 0: 入口帧
  steps.push({
    versions: initialVersions,
    activeVer: 0,
    linkedTarget: null,
    statusDesc: '初始化主席树结构，建立空的初始版本 Root[0]',
    decision: `主函数入口：开始构建可持久化线段树并优化时间前缀区间连边`,
    message: `普通线段树无法区分元素加入的时间先后，主席树通过动态开点与历史版本前缀，天然阻断未来节点的非法流向`,
    log: `enter buildPersistentGraph: n=3, maxVal=10`,
    codeLine: lines.entry,
    metrics: { '当前版本数': 1, '时空目标': 'O(N log V)' },
  });

  // Step 1: 插入点 1 (值 val=3) -> 生成版本 1
  const ver1 = [
    ...initialVersions,
    { ver: 1, rootId: 'Root_1', newNodes: ['N1[1..10]', 'N2[1..5]', 'N3[3..3]'], sharedNodes: ['EmptyRight'] },
  ];
  steps.push({
    versions: ver1,
    activeVer: 1,
    linkedTarget: null,
    statusDesc: '插入元素 P1 (val=3)，开辟一条长为 log V 的全新分支节点',
    decision: `插入元素 P1：权值 3 落在 [1, 10] -> [1, 5] -> [3, 3]，动态开辟 3 个新虚点`,
    message: `生成 Root[1]，其叶子直接桥接原图实体点 P1`,
    log: `version 1 created: added nodes for val=3`,
    codeLine: lines.insertPoint,
    statusBadge: { text: '版本 1 生成', type: 'info' },
    metrics: { '新增节点': 3, '共享节点': 1 },
  });

  // Step 2: 插入点 2 (值 val=7) -> 生成版本 2
  const ver2 = [
    ...ver1,
    { ver: 2, rootId: 'Root_2', newNodes: ['N4[1..10]', 'N5[6..10]', 'N6[7..7]'], sharedNodes: ['N2[1..5]'] },
  ];
  steps.push({
    versions: ver2,
    activeVer: 2,
    linkedTarget: null,
    statusDesc: '插入元素 P2 (val=7)，左子树复用 Root[1] 的 N2[1..5]，仅新建右链',
    decision: `插入元素 P2：权值 7 动态开辟 N4、N5、N6；左子树直接借用版本 1 的历史指针`,
    message: `通过指针复用，极大地节省了虚点数量与内存占用`,
    log: `version 2 created: shared left child N2, added right branch`,
    codeLine: lines.insertPoint,
    statusBadge: { text: '版本 2 生成', type: 'info' },
    metrics: { '复用子树': 'N2[1..5]', '新增节点': 3 },
  });

  // Step 3: 点 3 (时间 3) 带有约束：需向历史时刻 [1..2] 权值处于 [2, 5] 的点连有向边
  steps.push({
    versions: ver2,
    activeVer: 2,
    linkedTarget: { fromPoint: 3, targetRange: '[2, 5]', hitNodes: ['N2[1..5]'] },
    statusDesc: '点 3 查询历史版本 Root[2]，仅连向 N2[1..5] 即可代表所有满足约束的历史点',
    decision: `处理点 3 的时间前缀依赖：向 Root[2] 的历史树上拆分区间 [2, 5]`,
    message: `精确定位至历史虚点 N2[1..5]，点 3 仅需添加 1 条边即可完成与历史点 P1 的依赖绑定`,
    log: `link to historical range: P3 -> N2[1..5] in Root[2]`,
    codeLine: lines.linkHistory,
    statusBadge: { text: '历史前缀连边成功', type: 'warning' },
    metrics: { '目标区间': '[2, 5]', '虚点连接': 'P3 -> N2' },
  });

  // Step 4: 拓扑排序完成全局赋值与验证
  steps.push({
    versions: ver2,
    activeVer: 2,
    linkedTarget: { fromPoint: 3, targetRange: '[2, 5]', hitNodes: ['N2[1..5]'] },
    statusDesc: '在新建立的 DAG 图上运行拓扑排序，求解出满足严格偏序的时间与权值关系',
    decision: `拓扑排序验证通过：DAG 无环，成功求解合法拓扑序 [P1, P2, N2, P3]`,
    message: `主席树优化建图将时间维度的前缀区间依赖优雅降维，避免了暴力建图时 $O(N^2)$ 的边数爆炸`,
    log: `topological sort succeeded: valid assignment found`,
    codeLine: lines.topoSort,
    statusBadge: { text: '求解成功', type: 'success' },
    metrics: { 'DAG状态': '无环', '拓扑规模': 4 },
  });

  return steps;
}

export const persistentSegmentTreeGraphVisualizer = registerDeclarativeAlgorithm<PersistentGraphStep>({
  id: 'persistent-segment-tree-graph-197',
  name: '主席树/可持久化优化建图 (Class 197)',
  category: 'graph',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.persistentSegmentTreeGraph,
  sourceCodes: PERSISTENT_GRAPH_CODES,
  generateSteps: buildPersistentGraphSteps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderPersistentGraphBoard(
          step.versions,
          step.activeVer,
          step.linkedTarget,
          step.statusDesc
        )}
        ${renderFormulaCard(
          '主席树优化建图前缀隔离定理',
          '\\text{Edge}(u \\to \\text{Root}_{t}[l, r]) \\iff \\forall v \\in \\text{Prefix}(t) \\text{ 且 } \\text{val}_v \\in [l, r], \\text{ 连接 } u \\to v',
          '通过直接连向时刻 $t$ 的根节点线段树，自然排除了未来时刻 $t+1 \\dots N$ 的节点污染，实现前缀偏序的单向隔离。'
        )}
      </div>
    `;
  },
});
