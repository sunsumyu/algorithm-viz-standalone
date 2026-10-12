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
  stepSummaryBadge?: string;
  activeCodeLineKey?: 'to' | 'next' | 'head' | 'traverse_loop' | 'traverse_visit' | 'traverse_next';
  selectedPerspectiveNode?: number;
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
      { u: 2, v: 1, w: 5 },
      { u: 2, v: 3, w: 2 },
      { u: 3, v: 4, w: 4 },
      { u: 2, v: 4, w: 9 },
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
  const startNode = parseInt(startNodeStr, 10) || (rawEdges[0] ? rawEdges[0].u : 1);

  // 收集所有节点 ID
  const nodeSet = new Set<number>();
  rawEdges.forEach((e) => {
    nodeSet.add(e.u);
    nodeSet.add(e.v);
  });
  nodeSet.add(startNode);
  const allNodes = Array.from(nodeSet).sort((a, b) => a - b);
  const maxNode = Math.max(...allNodes, 4);

  // 计算出度最多的节点作为默认透视节点
  const outDegreeMap: Record<number, number> = {};
  allNodes.forEach((n) => (outDegreeMap[n] = 0));
  rawEdges.forEach((e) => {
    outDegreeMap[e.u] = (outDegreeMap[e.u] || 0) + 1;
  });
  let maxDegreeNode = allNodes[0] || 1;
  let maxDeg = -1;
  for (const n of allNodes) {
    if ((outDegreeMap[n] || 0) > maxDeg) {
      maxDeg = outDegreeMap[n] || 0;
      maxDegreeNode = n;
    }
  }

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
    message: `初始化：创建 head 数组（默认全为 0/NULL，表示无出边）与空 edge[] 静态链表池`,
    log: `初始化: head[1..${maxNode}] = -1, cnt = 0`,
    codeLine: lines.init,
    stepSummaryBadge: '初始化 head 数组与边池',
    selectedPerspectiveNode: maxDegreeNode,
  });

  // 执行建图 (addEdge)
  for (let i = 0; i < rawEdges.length; i++) {
    const { u, v, w } = rawEdges[i];
    const edgeIdx = edges.length;
    const oldHead = head[u];
    const displayE = edgeIdx + 1;
    const displayOldHead = oldHead === -1 ? 0 : oldHead + 1;

    if (mode === 'build') {
      // 步骤 1: 准备加边与存储目标点及权值
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
        message: `第一步：边编号自增为 ${displayE}。记录终点 to[${displayE}] = ${v}，权重 weight[${displayE}] = ${w}`,
        log: `加边 addEdge(${u}, ${v}, ${w}) - 分配边号 e=${displayE}`,
        codeLine: lines.buildAddstart,
        stepSummaryBadge: `边的编号自增: to[${displayE}] = ${v}, w = ${w}`,
        activeCodeLineKey: 'to',
        selectedPerspectiveNode: u,
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
        message: `第二步：继承旧表头指针。令 next[${displayE}] = head[${u}] (${displayOldHead})。新边将原有出边链条继承至其后！`,
        log: `链接前驱 edge[${edgeIdx}].next = ${oldHead}`,
        codeLine: lines.buildLinknext,
        stepSummaryBadge: `继承旧表头: next[${displayE}] = head[${u}] (${displayOldHead})`,
        activeCodeLineKey: 'next',
        selectedPerspectiveNode: u,
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
        message: `第三步：更新顶点头指针 head[${u}] = ${displayE}。边 ${displayE} 正式成为节点 ${u} 的最新出边链表头！`,
        log: `更新表头 head[${u}] = ${edgeIdx} (原 ${oldHead})`,
        codeLine: lines.buildUpdatehead,
        stepSummaryBadge: `更新表头指针: head[${u}] = ${displayE}`,
        activeCodeLineKey: 'head',
        selectedPerspectiveNode: u,
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
      message: `🎉 建图完成！共存入 ${edges.length} 条有向边。每个节点的 head[u] 均已指向其最新出边链表头。`,
      log: `建图成功: 总边数 ${edges.length}, 节点数 ${allNodes.length}`,
      codeLine: lines.buildBuilddone,
      stepSummaryBadge: `建图加边完成 (共 ${edges.length} 条边)`,
      selectedPerspectiveNode: maxDegreeNode,
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
    message: `🔍 开始遍历顶点 ${startNode} 的所有出边：取入口指针 e = head[${startNode}] = ${ePtr === -1 ? '0 (无出边)' : `#${ePtr + 1}`}`,
    log: `开始遍历顶点 ${startNode} 的出边链`,
    codeLine: lines.traverseTraversestart,
    stepSummaryBadge: `取入口表头: e = head[${startNode}]`,
    activeCodeLineKey: 'traverse_loop',
    selectedPerspectiveNode: startNode,
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
      message: `访问边 #${ePtr + 1}：${curEdge.u} ➔ ${curEdge.to} (权值 ${curEdge.weight})`,
      log: `访问边 #${ePtr} (${curEdge.u} ➔ ${curEdge.to})`,
      codeLine: lines.traverseVisitedge,
      stepSummaryBadge: `访问出边: [边 ${ePtr + 1}] ${curEdge.u} ➔ ${curEdge.to} (权: ${curEdge.weight})`,
      activeCodeLineKey: 'traverse_visit',
      selectedPerspectiveNode: startNode,
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
          ? `沿静态链表单向跳跃：e = next[${ePtr + 1}] ➔ 跳转至更早加入的出边 #${nextEdgeIdx + 1}`
          : `next[${ePtr + 1}] = 0 (链表尾)，顶点 ${startNode} 的所有出边遍历完毕`,
      log: `链表跳跃: 下一条边为 ${nextEdgeIdx === -1 ? '0' : `#${nextEdgeIdx + 1}`}`,
      codeLine: lines.traverseJumpnext,
      stepSummaryBadge: nextEdgeIdx !== -1 ? `链表跳跃: e = next[${ePtr + 1}] ➔ #${nextEdgeIdx + 1}` : '到达链表尾: next = 0',
      activeCodeLineKey: 'traverse_next',
      selectedPerspectiveNode: startNode,
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
    message: `✅ 遍历完成！顶点 ${startNode} 共扫描了 ${traversed.length} 条出边 (逆序访问：${traversed.map((i) => `#${i + 1}`).join(' ➔ ') || '无'})`,
    log: `遍历结束: 访问顺序为 [${traversed.join(', ')}]`,
    codeLine: lines.traverseTraversedone,
    stepSummaryBadge: `遍历完毕 (逆序访问 ${traversed.length} 条出边)`,
    selectedPerspectiveNode: startNode,
  });

  return steps;
}
