/**
 * Class 155: 动态树 Link-Cut Tree (LCT) 步进推演编译器
 * 核心：实链剖分 Preferred Path、access 打通路径、makeRoot 翻转换根、cut 动态断边与 link 动态加边
 */

import { Advanced155Step, LCTEdgeView } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { LCT_LINES } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-stage-codes';

export interface LCTStep extends Advanced155Step {
  nodes: number[];
  edges: LCTEdgeView[];
  activeNode: number;
  accessPath: number[];
  actionName: string;
}

export function buildLCTSteps(n: number, initialEdges: { u: number; v: number }[]): LCTStep[] {
  const steps: LCTStep[] = [];
  const lines = LCT_LINES;

  const nodes = Array.from({ length: n }, (_, i) => i + 1);
  const edges: LCTEdgeView[] = initialEdges.map(e => ({ ...e, isPreferred: false }));
  const cloneEdges = (): LCTEdgeView[] => edges.map(e => ({ ...e }));

  // Step 0: 入口
  steps.push({
    nodes: [...nodes],
    edges: cloneEdges(),
    activeNode: -1,
    accessPath: [],
    actionName: '初始森林就绪',
    decision: `主函数入口：开始构建包含 ${n} 个节点的动态树 Link-Cut Tree (LCT)`,
    message: `LCT 基于实链剖分与辅助 Splay 树，能够在均摊 O(log N) 内支持动态加边、动态删边与路径查询`,
    log: `enter LCT(n=${n})`,
    codeLine: lines.entry,
    metrics: { '节点数 N': n, '初始边数': edges.length, '根节点': 1 },
  });

  const markPreferred = (u: number, v: number, pref: boolean) => {
    edges.forEach(e => {
      if ((e.u === u && e.v === v) || (e.u === v && e.v === u)) {
        e.isPreferred = pref;
      }
    });
  };

  // 1. 演示 access(4)
  steps.push({
    nodes: [...nodes],
    edges: cloneEdges(),
    activeNode: 4,
    accessPath: [4],
    actionName: '执行 access(4)',
    decision: `开始执行 access(4)：将原树根节点 1 到节点 4 的路径彻底打通为一条独立实链`,
    message: `在辅助树中将 4 旋转至 Splay 根，切换其虚实儿子指针`,
    log: `access: target=4`,
    codeLine: lines.accessPath,
    metrics: { '当前操作': 'access(4)', '活跃节点': 4 },
  });

  markPreferred(2, 4, true);
  steps.push({
    nodes: [...nodes],
    edges: cloneEdges(),
    activeNode: 2,
    accessPath: [2, 4],
    actionName: 'access: 向上跳至父节点 2',
    decision: `沿虚边向上跳转至父节点 2：将实边 (2, 5) 降级为虚边，将 (2, 4) 升级为实边`,
    message: `满足每个节点在辅助树中至多拥有一个实链儿子的严格单调性`,
    log: `accessStep: parent=2`,
    codeLine: lines.accessPath,
    statusBadge: { text: '打通边 (2, 4)', type: 'info' },
    metrics: { '升级实边': '2-4', '降级虚边': '2-5' },
  });

  markPreferred(1, 2, true);
  steps.push({
    nodes: [...nodes],
    edges: cloneEdges(),
    activeNode: 1,
    accessPath: [1, 2, 4],
    actionName: 'access(4) 顺利打通至原树根 1',
    decision: `跳转至原树根 1：整条路径 1 -> 2 -> 4 完整连入同一棵 Splay 辅助树中`,
    message: `此后对节点 4 执行 splay(4) 即可在 O(log N) 内求得整条路径的点权聚合值`,
    log: `accessComplete: 1-2-4 preferred`,
    codeLine: lines.accessPath,
    statusBadge: { text: '实链打通完毕', type: 'success' },
    metrics: { '实链路径': '1 -> 2 -> 4', 'Splay根': 4 },
  });

  // 2. 演示 makeRoot(4) 换根
  steps.push({
    nodes: [...nodes],
    edges: cloneEdges(),
    activeNode: 4,
    accessPath: [1, 2, 4],
    actionName: '执行 makeRoot(4) 换根',
    decision: `执行 makeRoot(4)：在 access(4) 并 splay(4) 后打上反转标记 pushRev(4)`,
    message: `深度最深的节点 4 翻转成为原树的新根节点，所有路径深度顺逆颠倒`,
    log: `makeRoot: newRoot=4`,
    codeLine: lines.makeRoot,
    statusBadge: { text: '新树根: 4', type: 'warning' },
    metrics: { '原树新根': 4, '换根复杂度': 'O(log N)' },
  });

  // 3. 演示 cut(2, 4) 动态删边
  const cutIdx = edges.findIndex(e => (e.u === 2 && e.v === 4) || (e.u === 4 && e.v === 2));
  if (cutIdx >= 0) edges.splice(cutIdx, 1);

  steps.push({
    nodes: [...nodes],
    edges: cloneEdges(),
    activeNode: 4,
    accessPath: [],
    actionName: '执行 cut(2, 4) 动态断边',
    decision: `执行 cut(2, 4)：将树根 4 与节点 2 的连边彻底断开，原树分裂为两个独立连通块`,
    message: `断开辅助树的左儿子指针与父指针，fa[2] = rc[4] = 0`,
    log: `cutEdge: (2, 4)`,
    codeLine: lines.cutEdge,
    statusBadge: { text: '已切断边 (2, 4)', type: 'danger' },
    metrics: { '切断边': '2-4', '当前连通块数': 2 },
  });

  // 4. 演示 link(4, 5) 动态加边
  edges.push({ u: 4, v: 5, isPreferred: false });
  steps.push({
    nodes: [...nodes],
    edges: cloneEdges(),
    activeNode: 4,
    accessPath: [],
    actionName: '执行 link(4, 5) 动态加边',
    decision: `执行 link(4, 5)：将节点 4 作为子节点连接至节点 5，形成新的动态连通树`,
    message: `虚边赋值 fa[4] = 5，森林再次合并为一个整连通图，全过程耗时严格 O(log N)`,
    log: `linkEdge: (4, 5)`,
    codeLine: lines.linkEdge,
    statusBadge: { text: '已连边 (4, 5)', type: 'success' },
    metrics: { '新建边': '4-5', '连通块数': 1 },
  });

  return steps;
}
