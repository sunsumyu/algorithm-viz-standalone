import { StepBase } from '../../../core/step-visualizer';

export interface RawEdge {
  u: number;
  v: number;
  w: number;
}

export interface EdgeStruct {
  to: number;
  next: number;
  weight: number;
  u: number;
  index: number;
}

export interface ForwardStarStep extends StepBase {
  mode: 'build' | 'traverse';
  action:
    | 'init'
    | 'add_start'
    | 'link_next'
    | 'update_head'
    | 'edge_added'
    | 'build_done'
    | 'traverse_start'
    | 'visit_edge'
    | 'jump_next'
    | 'traverse_done';
  head: number[];
  edges: EdgeStruct[];
  curEdgeIndex: number | null;
  curNode: number | null;
  targetNode: number | null;
  curWeight: number | null;
  prevHeadVal: number | null;
  newHeadVal: number | null;
  traversedEdges: number[];
  allNodes: number[];
  allRawEdges: RawEdge[];
  startNode: number;
  message: string;
  log: string;
  codeLine: number;
}

/** 代码面板高亮行号锚点（1-based，与源码逐行对应） */
const lines: Record<string, number> = {
  init: 18,
  buildAddstart: 24,
  buildLinknext: 26,
  buildUpdatehead: 27,
  buildBuilddone: 28,
  traverseTraversestart: 32,
  traverseVisitedge: 34,
  traverseJumpnext: 32,
  traverseTraversedone: 36,
};

function parseEdgesInput(raw: string): RawEdge[] {
  const list: RawEdge[] = [];
  const parts = raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const nums = part.split(/[\s\t]+/).map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    if (nums.length >= 2) {
      list.push({
        u: nums[0],
        v: nums[1],
        w: nums[2] !== undefined ? nums[2] : 1,
      });
    }
  }

  if (list.length === 0) {
    return [
      { u: 1, v: 2, w: 5 },
      { u: 1, v: 3, w: 2 },
      { u: 2, v: 4, w: 1 },
      { u: 3, v: 2, w: 4 },
      { u: 3, v: 5, w: 3 },
      { u: 4, v: 5, w: 6 },
    ];
  }
  return list;
}

export function buildForwardStarSteps(
  rawEdgesStr: string,
  startNodeStr: string,
  mode: string = 'build'
): ForwardStarStep[] {
  const rawEdges = parseEdgesInput(rawEdgesStr);
  const startNode = parseInt(startNodeStr, 10) || 1;

  // 收集所有节点 ID
  const nodeSet = new Set<number>();
  rawEdges.forEach((e) => {
    nodeSet.add(e.u);
    nodeSet.add(e.v);
  });
  nodeSet.add(startNode);
  const allNodes = Array.from(nodeSet).sort((a, b) => a - b);
  const maxNode = Math.max(...allNodes, 5);

  const steps: ForwardStarStep[] = [];
  const head: number[] = new Array(maxNode + 1).fill(-1);
  const edges: EdgeStruct[] = [];

  // 初始步骤
  steps.push({
    mode: mode === 'traverse' ? 'traverse' : 'build',
    action: 'init',
    head: [...head],
    edges: [],
    curEdgeIndex: null,
    curNode: null,
    targetNode: null,
    curWeight: null,
    prevHeadVal: null,
    newHeadVal: null,
    traversedEdges: [],
    allNodes,
    allRawEdges: rawEdges,
    startNode,
    message: `初始化：创建 head 数组（默认全为 -1，表示无出边）与空 edge[] 静态链表池`,
    log: `初始化: head[1..${maxNode}] = -1, cnt = 0`,
    codeLine: lines.init,
  });

  // 执行建图 (addEdge)
  for (let i = 0; i < rawEdges.length; i++) {
    const { u, v, w } = rawEdges[i];
    const edgeIdx = edges.length;
    const oldHead = head[u];

    if (mode === 'build') {
      // 步骤 1: 准备加边
      steps.push({
        mode: 'build',
        action: 'add_start',
        head: [...head],
        edges: edges.map((e) => ({ ...e })),
        curEdgeIndex: edgeIdx,
        curNode: u,
        targetNode: v,
        curWeight: w,
        prevHeadVal: oldHead,
        newHeadVal: null,
        traversedEdges: [],
        allNodes,
        allRawEdges: rawEdges,
        startNode,
        message: `准备加边 #${edgeIdx}：从节点 ${u} 指向节点 ${v}，权值为 ${w}`,
        log: `加边 addEdge(${u}, ${v}, ${w}) - 分配槽位 edge[${edgeIdx}]`,
        codeLine: lines.buildAddstart,
      });

      // 步骤 2: 绑定 next 指针 (头插法核心)
      edges.push({ to: v, next: oldHead, weight: w, u, index: edgeIdx });
      steps.push({
        mode: 'build',
        action: 'link_next',
        head: [...head],
        edges: edges.map((e) => ({ ...e })),
        curEdgeIndex: edgeIdx,
        curNode: u,
        targetNode: v,
        curWeight: w,
        prevHeadVal: oldHead,
        newHeadVal: null,
        traversedEdges: [],
        allNodes,
        allRawEdges: rawEdges,
        startNode,
        message: `【头插法】edge[${edgeIdx}].next = head[${u}] (${oldHead === -1 ? 'NULL' : `#${oldHead}`})，新边链接到原出边表头`,
        log: `链接前驱 edge[${edgeIdx}].next = ${oldHead}`,
        codeLine: lines.buildLinknext,
      });

      // 步骤 3: 更新 head[u] = edgeIdx
      head[u] = edgeIdx;
      steps.push({
        mode: 'build',
        action: 'update_head',
        head: [...head],
        edges: edges.map((e) => ({ ...e })),
        curEdgeIndex: edgeIdx,
        curNode: u,
        targetNode: v,
        curWeight: w,
        prevHeadVal: oldHead,
        newHeadVal: edgeIdx,
        traversedEdges: [],
        allNodes,
        allRawEdges: rawEdges,
        startNode,
        message: `【更新表头】head[${u}] = ${edgeIdx}，顶点 ${u} 的最新首条出边更新为边 #${edgeIdx}`,
        log: `更新表头 head[${u}] = ${edgeIdx} (原 ${oldHead})`,
        codeLine: lines.buildUpdatehead,
      });
    } else {
      // 遍历模式下静默建图
      edges.push({ to: v, next: oldHead, weight: w, u, index: edgeIdx });
      head[u] = edgeIdx;
    }
  }

  if (mode === 'build') {
    steps.push({
      mode: 'build',
      action: 'build_done',
      head: [...head],
      edges: edges.map((e) => ({ ...e })),
      curEdgeIndex: null,
      curNode: null,
      targetNode: null,
      curWeight: null,
      prevHeadVal: null,
      newHeadVal: null,
      traversedEdges: [],
      allNodes,
      allRawEdges: rawEdges,
      startNode,
      message: `🎉 建图完成！共存入 ${edges.length} 条有向边。每个节点的 head[u] 均已指向其首条出边链。`,
      log: `建图成功: 总边数 ${edges.length}, 节点数 ${allNodes.length}`,
      codeLine: lines.buildBuilddone,
    });
    return steps;
  }

  // 遍历模式 (traverse)
  const traversed: number[] = [];
  let ePtr = head[startNode];

  steps.push({
    mode: 'traverse',
    action: 'traverse_start',
    head: [...head],
    edges: edges.map((e) => ({ ...e })),
    curEdgeIndex: ePtr !== -1 ? ePtr : null,
    curNode: startNode,
    targetNode: ePtr !== -1 ? edges[ePtr].to : null,
    curWeight: ePtr !== -1 ? edges[ePtr].weight : null,
    prevHeadVal: null,
    newHeadVal: null,
    traversedEdges: [],
    allNodes,
    allRawEdges: rawEdges,
    startNode,
    message: `🔍 开始遍历顶点 ${startNode} 的所有出边：取入口指针 e = head[${startNode}] = ${ePtr === -1 ? 'NULL (-1 无出边)' : `#${ePtr}`}`,
    log: `开始遍历顶点 ${startNode} 的出边链`,
    codeLine: lines.traverseTraversestart,
  });

  while (ePtr !== -1 && ePtr < edges.length) {
    const curEdge = edges[ePtr];
    traversed.push(ePtr);

    steps.push({
      mode: 'traverse',
      action: 'visit_edge',
      head: [...head],
      edges: edges.map((e) => ({ ...e })),
      curEdgeIndex: ePtr,
      curNode: curEdge.u,
      targetNode: curEdge.to,
      curWeight: curEdge.weight,
      prevHeadVal: null,
      newHeadVal: null,
      traversedEdges: [...traversed],
      allNodes,
      allRawEdges: rawEdges,
      startNode,
      message: `访问边 #${ePtr}：${curEdge.u} ➔ ${curEdge.to} (权值 ${curEdge.weight})`,
      log: `访问边 #${ePtr} (${curEdge.u} ➔ ${curEdge.to})`,
      codeLine: lines.traverseVisitedge,
    });

    const nextEdgeIdx = curEdge.next;
    steps.push({
      mode: 'traverse',
      action: 'jump_next',
      head: [...head],
      edges: edges.map((e) => ({ ...e })),
      curEdgeIndex: nextEdgeIdx !== -1 ? nextEdgeIdx : null,
      curNode: curEdge.u,
      targetNode: nextEdgeIdx !== -1 ? edges[nextEdgeIdx].to : null,
      curWeight: nextEdgeIdx !== -1 ? edges[nextEdgeIdx].weight : null,
      prevHeadVal: null,
      newHeadVal: null,
      traversedEdges: [...traversed],
      allNodes,
      allRawEdges: rawEdges,
      startNode,
      message:
        nextEdgeIdx !== -1
          ? `沿静态链表跳跃：e = edge[${ePtr}].next ➔ 跳转至上一条出边 #${nextEdgeIdx}`
          : `edge[${ePtr}].next = -1 (NULL)，顶点 ${startNode} 的所有出边遍历完毕`,
      log: `链表跳跃: 下一条边为 ${nextEdgeIdx === -1 ? 'NULL' : `#${nextEdgeIdx}`}`,
      codeLine: lines.traverseJumpnext,
    });

    ePtr = nextEdgeIdx;
  }

  steps.push({
    mode: 'traverse',
    action: 'traverse_done',
    head: [...head],
    edges: edges.map((e) => ({ ...e })),
    curEdgeIndex: null,
    curNode: startNode,
    targetNode: null,
    curWeight: null,
    prevHeadVal: null,
    newHeadVal: null,
    traversedEdges: [...traversed],
    allNodes,
    allRawEdges: rawEdges,
    startNode,
    message: `✅ 遍历完成！顶点 ${startNode} 共扫描了 ${traversed.length} 条出边 (访问顺序：${traversed.map((i) => `#${i}`).join(' ➔ ') || '无'})`,
    log: `遍历结束: 访问顺序为 [${traversed.join(', ')}]`,
    codeLine: lines.traverseTraversedone,
  });

  return steps;
}
