/**
 * Class 123: 树的直径 (Tree Diameter - 两遍 BFS/DFS)
 * SP1437 / LeetCode 1245
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import { TREE_DIAMETER_CODES, TREE_DIAMETER_LINES } from './tree-117-123-stage-codes';
import { Tree117Step, TreeNodeData, renderTreeTopology } from './tree-117-123-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface TreeDiameterStep extends Tree117Step {
  nodes: TreeNodeData[];
  edges: [number, number][];
  activeNodeId: number;
  farthestX?: number;
  farthestY?: number;
  diameter?: number;
  diameterPath?: number[];
  distMap: Record<number, number>;
  bfsRound: 1 | 2;
}

export function buildTreeDiameterSteps(
  rawEdges: [number, number][],
  startRoot: number = 1
): TreeDiameterStep[] {
  const steps: TreeDiameterStep[] = [];
  const lines = TREE_DIAMETER_LINES;

  const nodeSet = new Set<number>();
  rawEdges.forEach(([a, b]) => { nodeSet.add(a); nodeSet.add(b); });
  const allNodeIds = Array.from(nodeSet).sort((a, b) => a - b);
  const n = allNodeIds.length;
  const adj = new Map<number, number[]>();
  allNodeIds.forEach(id => adj.set(id, []));
  rawEdges.forEach(([a, b]) => {
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  });

  const root = allNodeIds.includes(startRoot) ? startRoot : allNodeIds[0];

  // 计算节点层级用于静态拓扑展示
  const depth = new Map<number, number>();
  const parent = new Map<number, number>();
  function initDepth(u: number, p: number, d: number) {
    depth.set(u, d);
    parent.set(u, p);
    for (const v of adj.get(u)!) {
      if (v !== p) initDepth(v, u, d + 1);
    }
  }
  initDepth(root, 0, 0);

  const getSnapshot = (distMap: Record<number, number>): TreeNodeData[] => {
    return allNodeIds.map(id => ({
      id,
      depth: depth.get(id) ?? 0,
      parent: parent.get(id) ?? 0,
      val: distMap[id],
    }));
  };

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot({}),
    edges: [...rawEdges],
    activeNodeId: root,
    distMap: {},
    bfsRound: 1,
    decision: `主函数入口：开始在包含 ${n} 个节点的树中求解树的直径（最长简单路径）`,
    message: `准备执行两遍 BFS：第一遍从任选点 #${root} 寻找最远点 x，第二遍从 x 寻找最远点 y`,
    log: `enter getDiameter(root=${root})`,
    codeLine: lines.entry,
    metrics: { '总节点数': n, '当前阶段': '初始就绪' },
  });

  // BFS 函数
  function runBfs(
    start: number,
    round: 1 | 2
  ): { farNode: number; maxDist: number; prevMap: Map<number, number>; dists: Record<number, number> } {
    const queue: number[] = [start];
    const dist = new Map<number, number>();
    const prev = new Map<number, number>();
    dist.set(start, 0);
    prev.set(start, 0);

    let farNode = start;
    let maxDist = 0;

    const curDistMap: Record<number, number> = { [start]: 0 };

    steps.push({
      nodes: getSnapshot(curDistMap),
      edges: [...rawEdges],
      activeNodeId: start,
      distMap: { ...curDistMap },
      bfsRound: round,
      decision: `第 ${round} 遍 BFS 开始：从节点 #${start} 出发，探索全树最远端点`,
      message: `初始化节点 #${start} 距离为 0 入队`,
      log: `start bfs round ${round} from ${start}`,
      codeLine: round === 1 ? lines.firstBfs : lines.secondBfs,
      metrics: { '起点': `#${start}`, '当前轮次': `第 ${round} 遍 BFS` },
      highlightNodes: [start],
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const d = dist.get(u)!;

      if (d > maxDist) {
        maxDist = d;
        farNode = u;
      }

      for (const v of adj.get(u)!) {
        if (!dist.has(v)) {
          dist.set(v, d + 1);
          prev.set(v, u);
          curDistMap[v] = d + 1;
          queue.push(v);

          steps.push({
            nodes: getSnapshot(curDistMap),
            edges: [...rawEdges],
            activeNodeId: v,
            distMap: { ...curDistMap },
            bfsRound: round,
            decision: `广搜扩展节点 #${v}：从 #${u} 沿边到达，距离起点 #${start} 为 ${d + 1}`,
            message: `更新 dist[${v}] = ${d + 1}，当前发现的最大距离 = ${Math.max(maxDist, d + 1)}`,
            log: `bfs visit #${v}, dist=${d + 1}`,
            codeLine: round === 1 ? lines.firstBfs : lines.secondBfs,
            metrics: { '当前节点': `#${v}`, '距离起点': d + 1, '暂定最远点': `#${farNode}` },
            highlightNodes: [u, v],
          });
        }
      }
    }

    return { farNode, maxDist, prevMap: prev, dists: curDistMap };
  }

  // 第一遍 BFS
  const res1 = runBfs(root, 1);
  const x = res1.farNode;

  steps.push({
    nodes: getSnapshot(res1.dists),
    edges: [...rawEdges],
    activeNodeId: x,
    farthestX: x,
    distMap: res1.dists,
    bfsRound: 1,
    decision: `🎯 第一遍 BFS 结束：从 #${root} 出发的最远节点为 x = #${x}（距离 ${res1.maxDist}）`,
    message: `定理证明：树中任意节点出发的最远点，必定是树直径的一个端点！故 #${x} 必为直径端点之一`,
    log: `first bfs finished: x=${x}`,
    codeLine: lines.firstBfs,
    metrics: { '第一端点 x': `#${x}`, '最大距离': res1.maxDist },
    highlightNodes: [x],
    statusBadge: { text: `定位直径端点 x: #${x}`, type: 'warning' },
  });

  // 第二遍 BFS
  const res2 = runBfs(x, 2);
  const y = res2.farNode;
  const diameter = res2.maxDist;

  // 重构直径路径
  const path: number[] = [];
  let curr = y;
  while (curr !== 0 && curr !== undefined) {
    path.push(curr);
    curr = res2.prevMap.get(curr)!;
  }
  path.reverse();

  // 终态
  steps.push({
    nodes: getSnapshot(res2.dists),
    edges: [...rawEdges],
    activeNodeId: y,
    farthestX: x,
    farthestY: y,
    diameter,
    diameterPath: path,
    distMap: res2.dists,
    bfsRound: 2,
    decision: `🎉 第二遍 BFS 结束！从 #${x} 出发的最远节点为 y = #${y}，树的直径为 ${diameter}`,
    message: `直径路径：${path.map(n => `#${n}`).join(' -> ')}，两遍 BFS 完美以 O(N) 时间完成求解！`,
    log: `second bfs finished: y=${y}, diameter=${diameter}`,
    codeLine: lines.returnAns,
    metrics: { '端点 x': `#${x}`, '端点 y': `#${y}`, '直径长度': diameter, '复杂度': 'O(N)' },
    highlightNodes: path,
    statusBadge: { text: `树的直径 = ${diameter}`, type: 'success' },
  });

  return steps;
}

export const treeDiameterVisualizer = registerDeclarativeAlgorithm<TreeDiameterStep>({
  id: 'tree-diameter-123',
  name: '树的直径 (Class 123)',
  category: 'tree',
  icon: '📏',
  difficulty: 2,
  levelOrder: 123,
  learningGoal: '深刻理解两遍 BFS 求解无权/非负权树直径的数学证明与线性复杂度实现',
  problemHtml: TREE_117_123_PROBLEMS.treeDiameter.html,
  analysisHtml: TREE_117_123_PROBLEMS.treeDiameter.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
    {
      id: 'root',
      label: '第一遍搜索起点',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 20,
    },
  ],
  codeLanguages: TREE_DIAMETER_CODES,
  generateSteps: (input) => {
    const rawEdges = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = rawEdges.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });
    const root = Number(input.root) || 1;
    return buildTreeDiameterSteps(edges, root);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || [])}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">第一遍最远点 x</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">#${step.farthestX ?? '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">第二遍最远点 y</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">#${step.farthestY ?? '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">树的直径长度</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.diameter ?? '-'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '树的直径两遍 BFS 进度',
          `当前 BFS 阶段: 第 ${step.bfsRound} 遍 | 距离起点最大: ${Math.max(...Object.values(step.distMap), 0)} ${step.diameterPath ? `| 直径路径: [${step.diameterPath.join(' -> ')}]` : ''}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
