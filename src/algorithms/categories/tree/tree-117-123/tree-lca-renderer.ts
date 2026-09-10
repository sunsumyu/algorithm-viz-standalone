/**
 * Class 118: 树上倍增求最近公共祖先 (LCA)
 * 洛谷 P3379 【模板】最近公共祖先
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import { TREE_LCA_CODES, TREE_LCA_LINES } from './tree-117-123-stage-codes';
import { Tree117Step, TreeNodeData, renderTreeTopology } from './tree-117-123-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface TreeLcaStep extends Tree117Step {
  nodes: TreeNodeData[];
  edges: [number, number][];
  u: number;
  v: number;
  curU: number;
  curV: number;
  lcaResult?: number;
}

export function buildTreeLcaSteps(
  rawEdges: [number, number][],
  u: number,
  v: number
): TreeLcaStep[] {
  const steps: TreeLcaStep[] = [];
  const lines = TREE_LCA_LINES;

  // 构建邻接表
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
  const maxK = Math.floor(Math.log2(n)) + 1;
  const up = new Map<number, number[]>();
  allNodeIds.forEach(id => up.set(id, new Array(maxK).fill(0)));

  // DFS 预处理
  function dfs(cur: number, p: number, d: number) {
    depth.set(cur, d);
    parent.set(cur, p);
    up.get(cur)![0] = p;
    for (let k = 1; k < maxK; k++) {
      const midAnc = up.get(cur)![k - 1];
      up.get(cur)![k] = midAnc > 0 ? up.get(midAnc)![k - 1] : 0;
    }
    for (const nxt of adj.get(cur)!) {
      if (nxt !== p) dfs(nxt, cur, d + 1);
    }
  }

  dfs(root, 0, 0);

  const getTreeSnapshot = (): TreeNodeData[] => {
    return allNodeIds.map(id => ({
      id,
      depth: depth.get(id) ?? 0,
      parent: parent.get(id) ?? 0,
    }));
  };

  // Step 0: 入口
  steps.push({
    nodes: getTreeSnapshot(),
    edges: [...rawEdges],
    u,
    v,
    curU: u,
    curV: v,
    decision: `主函数入口：查询节点 #${u} (深度 ${depth.get(u)}) 与节点 #${v} (深度 ${depth.get(v)}) 的最近公共祖先 (LCA)`,
    message: '准备启动倍增算法：先对齐深度，再同步向上跳跃逼近 LCA',
    log: `enter lca(u=${u}, v=${v})`,
    codeLine: lines.entry,
    metrics: { '节点 u 深度': depth.get(u) ?? 0, '节点 v 深度': depth.get(v) ?? 0 },
    highlightNodes: [u, v],
  });

  let curU = u;
  let curV = v;

  // 1. 深度对齐
  if (depth.get(curU)! < depth.get(curV)!) {
    const t = curU;
    curU = curV;
    curV = t;
  }

  const diffD = depth.get(curU)! - depth.get(curV)!;
  if (diffD > 0) {
    for (let k = maxK - 1; k >= 0; k--) {
      if (depth.get(curU)! - (1 << k) >= depth.get(curV)!) {
        const oldU = curU;
        curU = up.get(curU)![k];
        steps.push({
          nodes: getTreeSnapshot(),
          edges: [...rawEdges],
          u,
          v,
          curU,
          curV,
          decision: `⚡ 深度对齐跳跃：当前 u=#${oldU} 向上倍增跳跃 2^${k}=${1 << k} 层 ➔ 到达 #${curU} (深度 ${depth.get(curU)})`,
          message: `目标对齐到深度 ${depth.get(curV)}`,
          log: `align depth: jump #${oldU} -> #${curU}`,
          codeLine: lines.alignDepth,
          metrics: { '当前 u': curU, '当前 v': curV, 'u 深度': depth.get(curU) ?? 0, 'v 深度': depth.get(curV) ?? 0 },
          highlightNodes: [curU, curV],
          statusBadge: { text: `提升至 #${curU}`, type: 'info' },
        });
      }
    }
  }

  // 2. 特判重合
  if (curU === curV) {
    steps.push({
      nodes: getTreeSnapshot(),
      edges: [...rawEdges],
      u,
      v,
      curU,
      curV,
      lcaResult: curU,
      decision: `🏆 深度对齐后两点重合：节点 #${curU} 自身即为 LCA！返回 #${curU}`,
      message: '说明原两点本身即具备直接祖孙关系',
      log: `lca found: #${curU}`,
      codeLine: lines.checkSame,
      metrics: { 'LCA 结果': `#${curU}` },
      highlightNodes: [curU],
      statusBadge: { text: `LCA = #${curU}`, type: 'success' },
    });
    return steps;
  }

  // 3. 同时倍增向上逼近
  for (let k = maxK - 1; k >= 0; k--) {
    const ancU = up.get(curU)![k];
    const ancV = up.get(curV)![k];
    if (ancU !== ancV && ancU > 0 && ancV > 0) {
      const oldU = curU;
      const oldV = curV;
      curU = ancU;
      curV = ancV;

      steps.push({
        nodes: getTreeSnapshot(),
        edges: [...rawEdges],
        u,
        v,
        curU,
        curV,
        decision: `⚡ 同步倍增跳跃：跳跃 2^${k}=${1 << k} 步后两点祖先仍不同 (#${ancU} != #${ancV})，说明 LCA 还在更高处！u=#${oldU} ➔ #${curU}, v=#${oldV} ➔ #${curV}`,
        message: '安全提升两点深度，逼近 LCA 的正下方',
        log: `simultaneous jump 2^${k}: u->#${curU}, v->#${curV}`,
        codeLine: lines.jumpSimul,
        metrics: { '当前 u': curU, '当前 v': curV, '共同深度': depth.get(curU) ?? 0 },
        highlightNodes: [curU, curV],
        statusBadge: { text: `同步跳跃 2^${k}`, type: 'info' },
      });
    }
  }

  // 最终父节点即为 LCA
  const lcaAns = up.get(curU)![0];
  steps.push({
    nodes: getTreeSnapshot(),
    edges: [...rawEdges],
    u,
    v,
    curU,
    curV,
    lcaResult: lcaAns,
    decision: `🏆 逼近完成：当前点 u=#${curU} 和 v=#${curV} 的直接父节点 up[${curU}][0] = #${lcaAns} 即为最近公共祖先 (LCA)！返回 #${lcaAns}`,
    message: '全流程在 O(log N) 时间内完成查询',
    log: `return lca=#${lcaAns}`,
    codeLine: lines.returnAns,
    metrics: { '最终 LCA': `#${lcaAns}` },
    highlightNodes: [lcaAns],
    statusBadge: { text: `LCA = #${lcaAns}`, type: 'success' },
  });

  return steps;
}

export const treeLcaVisualizer = registerDeclarativeAlgorithm<TreeLcaStep>({
  id: 'tree-lca-binary-lifting-118',
  name: '树上倍增求 LCA (Class 118)',
  category: 'tree',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 118,
  learningGoal: '深刻理解树上倍增深度二进制对齐与同步倍增逼近 LCA 的核心原理与 O(log N) 复杂度证明',
  problemHtml: TREE_117_123_PROBLEMS.treeLca.html,
  analysisHtml: TREE_117_123_PROBLEMS.treeLca.html,
  inputs: [
    {
      id: 'edges',
      label: '树边集合 (u-v 逗号分隔)',
      type: 'text',
      defaultValue: '1-2,1-3,2-4,2-5,3-6,3-7,5-8',
      placeholder: '格式如 1-2,1-3,2-4,2-5',
    },
    {
      id: 'u',
      label: '查询节点 u',
      type: 'number',
      defaultValue: 8,
      min: 1,
      max: 20,
    },
    {
      id: 'v',
      label: '查询节点 v',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 20,
    },
  ],
  codeLanguages: TREE_LCA_CODES,
  generateSteps: (input) => {
    const raw = String(input.edges || '1-2,1-3,2-4,2-5,3-6,3-7,5-8');
    const edges: [number, number][] = raw.split(',').map(pair => {
      const [a, b] = pair.split('-').map(Number);
      return [a || 1, b || 2];
    });
    const u = Number(input.u) || 8;
    const v = Number(input.v) || 4;
    return buildTreeLcaSteps(edges, u, v);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderTreeTopology(step.nodes, step.edges, -1, step.highlightNodes || [])}

        ${renderFormulaCard(
          'LCA 倍增搜索进度',
          `目标点: #${step.u} 与 #${step.v} | 当前游标: u=#${step.curU}, v=#${step.curV} ${step.lcaResult ? `| 最终 LCA = #${step.lcaResult}` : ''}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
