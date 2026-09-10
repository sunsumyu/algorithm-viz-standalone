/**
 * Class 155: 动态树 Link-Cut Tree (LCT)
 * Tarjan 发明 / 洛谷 P3690 【模板】动态树 LCT
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { LCT_CODES, LCT_LINES } from './advanced-155-160-stage-codes';
import { Advanced155Step, LCTEdgeView, renderLCTBoard } from './advanced-155-160-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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

  // 1. 演示 access(4)
  // 原树: 1是根，1-2, 1-3, 2-4, 2-5
  // 打通 1 -> 2 -> 4，将 (1,2) 与 (2,4) 设为实边，(2,5) 设为虚边
  const markPreferred = (u: number, v: number, pref: boolean) => {
    edges.forEach(e => {
      if ((e.u === u && e.v === v) || (e.u === v && e.v === u)) {
        e.isPreferred = pref;
      }
    });
  };

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
  // 移除边 (2, 4)
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

export const lctVisualizer = registerDeclarativeAlgorithm<LCTStep>({
  id: 'lct-link-cut-tree-155',
  name: '动态树 Link-Cut Tree (Class 155)',
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 155,
  description: '左程云算法通关课 Class 155：动态树 Link-Cut Tree (LCT)。Tarjan 发明，基于实链剖分与辅助 Splay 树，支持动态加边、动态删边与路径查询。',
  learningGoal: '深刻理解 LCT 实链剖分 Preferred Path 与辅助 Splay 树的对应关系，掌握 access, makeroot, link, cut 核心四操作',
  problemHtml: ADVANCED_155_160_PROBLEMS.lct.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.lct.html,
  inputs: [
    {
      id: 'preset',
      label: '动态树初始图规模',
      type: 'select',
      defaultValue: 'tree_5_nodes',
      options: [
        { label: '5 节点标准树 (边: 1-2, 1-3, 2-4, 2-5)', value: 'tree_5_nodes' },
      ],
    },
  ],
  codeLanguages: LCT_CODES,
  generateSteps: () => {
    return buildLCTSteps(5, [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 2, v: 5 },
    ]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderLCTBoard(step.nodes, step.edges, step.activeNode, step.accessPath, step.actionName)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前操作节点</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              ${step.activeNode > 0 ? `Node ${step.activeNode}` : '就绪'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">动态操作阶段</div>
            <div style="font-size: 16px; font-weight: 700; color: #059669;">${step.actionName}</div>
          </div>
        </div>

        ${renderFormulaCard(
          'LCT 动态树实链引擎',
          `实链准则: 每个节点至多连一条实儿子边 | Access(x): 根到 x 全打通为实链 | 均摊复杂度: O(log N)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
