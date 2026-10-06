/**
 * Class 121: 树链剖分 / 重链剖分 (Heavy-Light Decomposition, HLD) 步骤编译器
 * 洛谷 P3384 【模板】重链剖分
 * 深模块核心编译器 (Deep Module)
 */

import { HLD_CODES, HLD_LINES } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-stage-codes';
import { Tree117Step, TreeNodeData } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';

export interface HldStep extends Tree117Step {
  nodes: TreeNodeData[];
  edges: [number, number][];
  heavyEdges: [number, number][];
  heavyChildMap: Record<number, number>;
  topMap: Record<number, number>;
  dfnMap: Record<number, number>;
  activeNodeId: number;
}

export { HLD_CODES, HLD_LINES };

export function buildHldSteps(rawEdges: [number, number][]): HldStep[] {
  const steps: HldStep[] = [];
  const lines = HLD_LINES;

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
  const size = new Map<number, number>();
  const heavyChild = new Map<number, number>();
  const top = new Map<number, number>();
  const dfn = new Map<number, number>();

  allNodeIds.forEach(id => {
    depth.set(id, 0);
    parent.set(id, 0);
    size.set(id, 0);
    heavyChild.set(id, 0);
    top.set(id, 0);
    dfn.set(id, 0);
  });

  const heavyEdges: [number, number][] = [];
  const heavyChildMap: Record<number, number> = {};
  const topMap: Record<number, number> = {};
  const dfnMap: Record<number, number> = {};

  const getSnapshot = (): TreeNodeData[] => {
    return allNodeIds.map(id => ({
      id,
      depth: depth.get(id) ?? 0,
      parent: parent.get(id) ?? 0,
      size: size.get(id) || undefined,
      heavyChild: heavyChild.get(id) || undefined,
      top: top.get(id) || undefined,
      dfn: dfn.get(id) || undefined,
    }));
  };

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot(),
    edges: [...rawEdges],
    heavyEdges: [],
    heavyChildMap: {},
    topMap: {},
    dfnMap: {},
    activeNodeId: root,
    decision: `主函数入口：开始对包含 ${n} 个节点的树执行轻重链剖分 (HLD)`,
    message: '第一遍 DFS: 统计每个节点的深度 depth、父节点 parent、子树大小 size，并找出其重儿子 heavyChild',
    log: `dfs1(u=${root}, p=0, d=1)`,
    codeLine: lines.entry,
    metrics: { '总节点数': n, '当前阶段': 'DFS 1 搜寻重儿子' },
  });

  // DFS 1
  function dfs1(u: number, p: number, d: number) {
    depth.set(u, d);
    parent.set(u, p);
    size.set(u, 1);

    steps.push({
      nodes: getSnapshot(),
      edges: [...rawEdges],
      heavyEdges: [...heavyEdges],
      heavyChildMap: { ...heavyChildMap },
      topMap: { ...topMap },
      dfnMap: { ...dfnMap },
      activeNodeId: u,
      decision: `初始化节点 #${u}：深度 depth=${d}, 父节点 parent=${p}, 初始大小 size=1`,
      message: `遍历节点 #${u} 的所有子邻接点`,
      log: `initNode(u=${u}, depth=${d}, p=${p})`,
      codeLine: lines.initNode,
      metrics: { '节点': `#${u}`, '深度': d, '初始 size': 1 },
      highlightNodes: [u],
    });

    for (const v of adj.get(u)!) {
      if (v === p) continue;

      dfs1(v, u, d + 1);

      size.set(u, size.get(u)! + size.get(v)!);

      steps.push({
        nodes: getSnapshot(),
        edges: [...rawEdges],
        heavyEdges: [...heavyEdges],
        heavyChildMap: { ...heavyChildMap },
        topMap: { ...topMap },
        dfnMap: { ...dfnMap },
        activeNodeId: u,
        decision: `子节点 #${v} 回溯：将子树大小 size[${v}]=${size.get(v)} 累加至 #${u}`,
        message: `节点 #${u} 当前累计 size = ${size.get(u)}`,
        log: `dfsChild(v=${v}, size=${size.get(v)})`,
        codeLine: lines.dfsChild,
        metrics: { '当前 size': size.get(u)!, '回溯子树': `#${v}` },
        highlightNodes: [u, v],
      });

      const currentHeavy = heavyChild.get(u) || 0;
      if (currentHeavy === 0 || size.get(v)! > size.get(currentHeavy)!) {
        heavyChild.set(u, v);
        heavyChildMap[u] = v;
        heavyEdges.push([u, v]);

        steps.push({
          nodes: getSnapshot(),
          edges: [...rawEdges],
          heavyEdges: [...heavyEdges],
          heavyChildMap: { ...heavyChildMap },
          topMap: { ...topMap },
          dfnMap: { ...dfnMap },
          activeNodeId: u,
          decision: `🔥 确定重儿子：子节点 #${v} 大小为 ${size.get(v)}，成为 #${u} 的新重儿子！`,
          message: `连接边 (${u} -> ${v}) 成为重边 (Heavy Edge)`,
          log: `markHeavy(u=${u}, heavyChild=${v})`,
          codeLine: lines.markHeavy,
          metrics: { '重儿子': `#${v}`, '重子树大小': size.get(v)! },
          highlightNodes: [u, v],
          statusBadge: { text: `#${u} 的重儿子为 #${v}`, type: 'success' },
        });
      }
    }
  }

  dfs1(root, 0, 1);

  // DFS 2: 分配 top 与 dfn
  let dfnOrder = 0;
  function dfs2(u: number, t: number) {
    top.set(u, t);
    topMap[u] = t;
    dfnOrder++;
    dfn.set(u, dfnOrder);
    dfnMap[u] = dfnOrder;

    const hc = heavyChild.get(u) || 0;
    if (hc !== 0) {
      // 优先走重链
      dfs2(hc, t);
    }
    for (const v of adj.get(u)!) {
      if (v !== parent.get(u) && v !== hc) {
        // 轻儿子新开重链
        dfs2(v, v);
      }
    }
  }

  dfs2(root, root);

  // 终态
  steps.push({
    nodes: getSnapshot(),
    edges: [...rawEdges],
    heavyEdges: [...heavyEdges],
    heavyChildMap: { ...heavyChildMap },
    topMap: { ...topMap },
    dfnMap: { ...dfnMap },
    activeNodeId: root,
    decision: `✅ 树链剖分完成！整棵树被切分为若干重链，重链上所有点的 DFS 序完全连续！`,
    message: `任意树上路径被切分为不超过 O(log N) 条重链，可直接接入线段树进行区间加和与区间求和`,
    log: `hld finished, heavy edges count: ${heavyEdges.length}`,
    codeLine: lines.markHeavy,
    metrics: { '重边数': heavyEdges.length, '路径剖分段数': 'O(log N)', '线段树区间': '连续 DFN' },
    highlightNodes: [root],
    statusBadge: { text: '重链剖分构建完毕', type: 'success' },
  });

  return steps;
}
