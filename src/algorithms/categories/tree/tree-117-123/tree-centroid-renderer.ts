/**
 * Class 120: 树的重心 (Tree Centroid)
 * POJ 1655 / 洛谷 P1395
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import { TREE_CENTROID_CODES, TREE_CENTROID_LINES } from './tree-117-123-stage-codes';
import { Tree117Step, TreeNodeData, renderTreeTopology } from './tree-117-123-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface TreeCentroidStep extends Tree117Step {
  nodes: TreeNodeData[];
  edges: [number, number][];
  activeNodeId: number;
  bestMaxPart: number;
  currentCentroid: number;
  nodeSizeMap: Record<number, number>;
  maxPartMap: Record<number, number>;
}

export function buildTreeCentroidSteps(rawEdges: [number, number][]): TreeCentroidStep[] {
  const steps: TreeCentroidStep[] = [];
  const lines = TREE_CENTROID_LINES;

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

  const root = 1;
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

  const size = new Map<number, number>();
  allNodeIds.forEach(id => size.set(id, 0));
  const maxPartMap: Record<number, number> = {};
  const nodeSizeMap: Record<number, number> = {};

  let bestMaxPart = Infinity;
  let centroid = -1;

  const getSnapshot = (): TreeNodeData[] => {
    return allNodeIds.map(id => ({
      id,
      depth: depth.get(id) ?? 0,
      parent: parent.get(id) ?? 0,
      size: size.get(id) || undefined,
    }));
  };

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot(),
    edges: [...rawEdges],
    activeNodeId: root,
    bestMaxPart: 9999,
    currentCentroid: -1,
    nodeSizeMap: {},
    maxPartMap: {},
    decision: `主函数入口：开始在包含 ${n} 个节点的树中寻找重心（删除后最大连通块最小的节点）`,
    message: `树的总节点数 N = ${n}，重心的最大连通块必定 <= floor(${n}/2) = ${Math.floor(n / 2)}`,
    log: `findCentroid(u=${root}, p=0)`,
    codeLine: lines.entry,
    metrics: { '总节点数 N': n, '当前最佳分量': '未确定', '重心节点': '计算中' },
  });

  function dfs(u: number, p: number) {
    size.set(u, 1);
    let maxSub = 0;
    nodeSizeMap[u] = 1;

    for (const v of adj.get(u)!) {
      if (v === p) continue;

      steps.push({
        nodes: getSnapshot(),
        edges: [...rawEdges],
        activeNodeId: v,
        bestMaxPart: bestMaxPart === Infinity ? 9999 : bestMaxPart,
        currentCentroid: centroid,
        nodeSizeMap: { ...nodeSizeMap },
        maxPartMap: { ...maxPartMap },
        decision: `递归向下探索子树：从父节点 #${u} 访问子节点 #${v}`,
        message: `准备计算以 #${v} 为根的子树大小`,
        log: `dfsChild(v=${v}, p=${u})`,
        codeLine: lines.dfsChild,
        metrics: { '当前节点': `#${v}`, '父节点': `#${u}` },
        highlightNodes: [u, v],
      });

      dfs(v, u);

      const subSize = size.get(v)!;
      size.set(u, size.get(u)! + subSize);
      maxSub = Math.max(maxSub, subSize);
      nodeSizeMap[u] = size.get(u)!;

      steps.push({
        nodes: getSnapshot(),
        edges: [...rawEdges],
        activeNodeId: u,
        bestMaxPart: bestMaxPart === Infinity ? 9999 : bestMaxPart,
        currentCentroid: centroid,
        nodeSizeMap: { ...nodeSizeMap },
        maxPartMap: { ...maxPartMap },
        decision: `子树 #${v} 计算完毕返回 #${u}：累加子树节点数 +${subSize}`,
        message: `更新节点 #${u} 子树大小为 size[${u}] = ${size.get(u)}，子树最大分支 maxSub = ${maxSub}`,
        log: `calcSize(u=${u}, size=${size.get(u)})`,
        codeLine: lines.calcSize,
        metrics: { '节点大小': size.get(u)!, '子分支最大': maxSub },
        highlightNodes: [u],
      });
    }

    const upPart = n - size.get(u)!;
    const finalMaxPart = Math.max(maxSub, upPart);
    maxPartMap[u] = finalMaxPart;

    steps.push({
      nodes: getSnapshot(),
      edges: [...rawEdges],
      activeNodeId: u,
      bestMaxPart: bestMaxPart === Infinity ? 9999 : bestMaxPart,
      currentCentroid: centroid,
      nodeSizeMap: { ...nodeSizeMap },
      maxPartMap: { ...maxPartMap },
      decision: `考量上方连通块：若删除 #${u}，上方剩余连通块大小为 N - size[${u}] = ${upPart}`,
      message: `因此删除 #${u} 后的最大连通块 = max(下方子树 ${maxSub}, 上方块 ${upPart}) = ${finalMaxPart}`,
      log: `calcUpPart(u=${u}, maxPart=${finalMaxPart})`,
      codeLine: lines.calcUpPart,
      metrics: { '上方块大小': upPart, '最大连通块': finalMaxPart },
      highlightNodes: [u],
    });

    if (finalMaxPart < bestMaxPart) {
      bestMaxPart = finalMaxPart;
      centroid = u;

      steps.push({
        nodes: getSnapshot(),
        edges: [...rawEdges],
        activeNodeId: u,
        bestMaxPart,
        currentCentroid: centroid,
        nodeSizeMap: { ...nodeSizeMap },
        maxPartMap: { ...maxPartMap },
        decision: `🎯 发现更优重心候选：节点 #${u} 的最大分裂块为 ${finalMaxPart}，刷新最优记录！`,
        message: `当前重心暂定为 #${u}，剩余最大连通块大小为 ${finalMaxPart}`,
        log: `updateCentroid(u=${u}, best=${bestMaxPart})`,
        codeLine: lines.updateAns,
        metrics: { '新重心': `#${u}`, '最佳最大块': bestMaxPart },
        highlightNodes: [u],
        statusBadge: { text: `当前最优重心 #${u}`, type: 'success' },
      });
    }
  }

  dfs(root, 0);

  // 终态
  steps.push({
    nodes: getSnapshot(),
    edges: [...rawEdges],
    activeNodeId: centroid,
    bestMaxPart,
    currentCentroid: centroid,
    nodeSizeMap: { ...nodeSizeMap },
    maxPartMap: { ...maxPartMap },
    decision: `✅ 搜索完毕！树的重心为节点 #${centroid}，删除后最大连通块仅为 ${bestMaxPart} (<= N/2)`,
    message: `树形 DP 成功定位重心，时间复杂度严格 O(N)`,
    log: `centroid result: #${centroid}, maxPart=${bestMaxPart}`,
    codeLine: lines.updateAns,
    metrics: { '最终重心': `#${centroid}`, '最大连通块': bestMaxPart, '复杂度': 'O(N)' },
    highlightNodes: [centroid],
    statusBadge: { text: `重心确定: #${centroid}`, type: 'success' },
  });

  return steps;
}

export const treeCentroidVisualizer = registerDeclarativeAlgorithm<TreeCentroidStep>({
  id: 'tree-centroid-120',
  name: '树的重心 (Class 120)',
  category: 'tree',
  icon: '⚖️',
  difficulty: 2,
  levelOrder: 120,
  learningGoal: '掌握树形 DP 统计子树大小与上方连通块，确定删除后最大连通块最小的重心节点',
  problemHtml: TREE_117_123_PROBLEMS.treeCentroid.html,
  analysisHtml: TREE_117_123_PROBLEMS.treeCentroid.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
  ],
  codeLanguages: TREE_CENTROID_CODES,
  generateSteps: (input) => {
    const raw = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = raw.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });
    return buildTreeCentroidSteps(edges);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || [])}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前重心候选</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">#${step.currentCentroid > 0 ? step.currentCentroid : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">删除后最大连通块</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.bestMaxPart < 9999 ? step.bestMaxPart : '-'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '树重心树形 DP 评估',
          `当前考察点: #${step.activeNodeId} | size: ${step.nodeSizeMap[step.activeNodeId] || 1} | 最大连通块: ${step.maxPartMap[step.activeNodeId] || '-'}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
