/**
 * Class 189: 割边与边双连通分量 e-BCC (Bridges & 2-Edge-Connected Components)
 * low[v] > dfn[u] 判定割边 + 树形缩点 / 洛谷 P8436 【模板】边双连通分量
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { EDGE_BCC_CODES, EDGE_BCC_LINES } from './advanced-185-190-stage-codes';
import { Advanced185Step, BridgeEdgeView, renderEdgeBCCBoard } from './advanced-185-190-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface EdgeBCCStep extends Advanced185Step {
  nodes: number[];
  edges: BridgeEdgeView[];
  ebccs: number[][];
  stage: string;
}

export function buildEdgeBCCSteps(): EdgeBCCStep[] {
  const steps: EdgeBCCStep[] = [];
  const lines = EDGE_BCC_LINES;

  const nodes = [1, 2, 3, 4, 5];
  // 拓扑：三元环 (1-2-3-1) 通过桥 (3-4) 连接二元环 (4-5-4)
  const edges: BridgeEdgeView[] = [
    { u: 1, v: 2, isBridge: false },
    { u: 2, v: 3, isBridge: false },
    { u: 3, v: 1, isBridge: false },
    { u: 3, v: 4, isBridge: false }, // 桥！
    { u: 4, v: 5, isBridge: false },
  ];

  // Step 0: 入口帧
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    ebccs: [],
    stage: '边双初始化与 DFS 准备',
    decision: `主函数入口：开始在包含 5 个节点与 5 条边的无向连通图中检测割边 (桥) 并划分边双连通分量`,
    message: `利用成对存储技巧 (e 与 e^1) 忽略反向父边，防止将无向树边误认为双向环`,
    log: `enter edge bcc: n=5, m=5`,
    codeLine: lines.entry,
    metrics: { '顶点数': 5, '边数': 5, '割边数': 0 },
  });

  // Step 1: 扫描三元环 (1-2-3-1)，无割边
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    ebccs: [],
    stage: '遍历三元环 1-2-3-1',
    decision: `DFS 遍历环 1 -> 2 -> 3，并通过返祖边 3 -> 1 回溯：low[2]=1, low[3]=1 <= dfn[1]`,
    message: `三元环内各边均有替代回路，不满足 low[v] > dfn[u]，均非割边`,
    log: `cycle 1-2-3 processed, low<=dfn`,
    codeLine: lines.exploreDFS,
    statusBadge: { text: '环内无割边', type: 'info' },
    metrics: { '环内顶点': '1, 2, 3', '当前最小 low': 1 },
  });

  // Step 2: 遍历边 (3-4)，发现满足 low[4] > dfn[3]，锁定割边！
  const edgesWithBridge = edges.map(e => ({ ...e }));
  edgesWithBridge[3].isBridge = true; // (3-4) 是桥
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: [],
    stage: '发现割边 (3-4)',
    decision: `DFS 递归遍历至节点 4，4 无法通过其他后向边回溯至 3 或其上方祖先：low[4] = 4 > dfn[3] = 3`,
    message: `命中割边判定定理：边 (3-4) 删去后原图必不连通，成功标记为桥 (Bridge)！`,
    log: `bridge detected: (3-4) since low[4]=4 > dfn[3]=3`,
    codeLine: lines.bridgeHit,
    statusBadge: { text: '锁定割边: (3-4)', type: 'danger' },
    metrics: { '割边': '3 - 4', '判定条件': 'low[4] > dfn[3]' },
  });

  // Step 3: 遍历剩余子连通块 {4, 5}
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: [],
    stage: '遍历子块 4-5',
    decision: `DFS 遍历边 (4-5)，整张图遍历完毕，全图唯一割边为 (3-4)`,
    message: `割边将图无损撕裂成相互独立的极大边双连通分量`,
    log: `all nodes visited, bridges=1`,
    codeLine: lines.exploreDFS,
    statusBadge: { text: '全图搜索完毕', type: 'info' },
    metrics: { '割边总数': 1, '连通分量预估': 2 },
  });

  // Step 4: 删去割边，划分极大边双分量
  const finalEbccs = [
    [1, 2, 3],
    [4, 5],
  ];
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: finalEbccs,
    stage: '划分边双连通分量 (e-BCC)',
    decision: `删去割边 (3-4)，DFS 收集剩余连通块：成功划分出 e-BCC #1: {1, 2, 3} 与 e-BCC #2: {4, 5}`,
    message: `每个边双连通分量内部任意两点间都存在至少两条边不相交的路径`,
    log: `ebccs extracted: {1, 2, 3} and {4, 5}`,
    codeLine: lines.bridgeHit,
    statusBadge: { text: '划分 2 个 e-BCC', type: 'success' },
    metrics: { 'e-BCC 数量': 2, '缩点结果': 'BCC_1 -- BCC_2' },
  });

  // Step 5: 终态缩点成树
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: finalEbccs,
    stage: '边双缩点成树完成',
    decision: `🎉 边双连通分量求解完毕：缩点后无向图退化为由桥连接的无向树`,
    message: `割边与边双缩点是无向网络鲁棒性分析、加最少边将图变为双连通图等竞赛压轴题的标准第一步`,
    log: `edge bcc finished: tree built`,
    codeLine: lines.entry,
    statusBadge: { text: '求解完成', type: 'success' },
    metrics: { '割边数': 1, '缩点后拓扑': '树 (Tree)', '状态': '求解完成' },
  });

  return steps;
}

export const edgeBCCVisualizer = registerDeclarativeAlgorithm<EdgeBCCStep>({
  id: 'edge-biconnected-components-189',
  name: '割边与边双连通分量 e-BCC (Class 189)',
  category: 'graph',
  icon: '🌉',
  difficulty: 3,
  levelOrder: 189,
  description: '左程云算法通关课 Class 189：割边与边双连通分量 e-BCC。low[v] > dfn[u] 判定桥，忽略反向重边，非割边划分极大边双分量并缩点成树。',
  learningGoal: '深刻理解桥与边双连通的定义、成对存储反向边技巧以及无向图缩点成树的结构特性',
  problemHtml: ADVANCED_185_190_PROBLEMS.edgeBCC.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.edgeBCC.html,
  inputs: [
    {
      id: 'preset',
      label: '无向图拓扑预设',
      type: 'select',
      defaultValue: 'bridge_dumbbell',
      options: [
        { label: '哑铃图 (环 1-2-3 -- 桥 3-4 -- 边 4-5)', value: 'bridge_dumbbell' },
      ],
    },
  ],
  codeLanguages: EDGE_BCC_CODES,
  generateSteps: () => buildEdgeBCCSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderEdgeBCCBoard(
          step.nodes,
          step.edges,
          step.ebccs,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #1d4ed8;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">缩点拓扑性质</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">边双缩点后必然退化为树或森林</div>
          </div>
        </div>

        ${renderFormulaCard(
          '割边 (桥) 判定定理',
          'low[v] > dfn[u] <=> 无向边 (u, v) 为割边 (删除后图分裂为两个连通块)',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
