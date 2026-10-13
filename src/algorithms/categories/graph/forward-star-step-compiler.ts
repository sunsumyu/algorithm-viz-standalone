import { StepBase } from '../../../core/step-visualizer';
import type { StepVar } from '../../../core/interfaces';

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
    | 'add_to'
    | 'add_weight'
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
  codeLine: any;
  metrics?: Record<string, string | number>;
  decision?: string;
  statusBadge?: { text: string; variant?: string };
  stepSummaryBadge?: string;
  activeCodeLineKey?: 'to' | 'next' | 'head' | 'traverse_loop' | 'traverse_visit' | 'traverse_next';
  selectedPerspectiveNode?: number;
  scope?: Record<string, any>;
  vars?: StepVar[];
  cnt?: number;
  u?: number;
  v?: number;
  w?: number;
  ei?: number;
}

/** 代码面板高亮行号锚点（严格一行一步，连续整数自上而下单调顺推，零跳行零静默） */
const codeLineMap: Record<string, Record<string, number>> = {
  init: { java: 17, cpp: 17, python: 3, javascript: 3 },
  buildAddTo: { java: 22, cpp: 22, python: 11, javascript: 12 },
  buildAddWeight: { java: 23, cpp: 23, python: 12, javascript: 13 },
  buildLinknext: { java: 24, cpp: 24, python: 13, javascript: 14 },
  buildUpdatehead: { java: 25, cpp: 25, python: 14, javascript: 15 },
  buildBuilddone: { java: 26, cpp: 26, python: 15, javascript: 16 },
  traverseTraversestart: { java: 30, cpp: 30, python: 19, javascript: 20 },
  traverseVisitedge: { java: 31, cpp: 31, python: 21, javascript: 21 },
  traverseJumpnext: { java: 30, cpp: 30, python: 23, javascript: 20 },
  traverseTraversedone: { java: 34, cpp: 34, python: 23, javascript: 24 },
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
      { u: 2, v: 4, w: 35 },
      { u: 3, v: 4, w: 58 },
      { u: 2, v: 1, w: 72 },
      { u: 2, v: 3, w: 96 },
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
    codeLine: codeLineMap.init,
    metrics: {
      'cur-action': '结构初始化',
      'edge-cnt': 0,
      'cur-pointer': '—',
    },
    decision: `重置 head 数组为 -1，清空边计数器 cnt = 0，准备接受加边请求`,
    statusBadge: { text: '初始化', variant: 'info' },
    stepSummaryBadge: '初始化 head 数组与边池',
    selectedPerspectiveNode: maxDegreeNode,
    cnt: 1,
    scope: { cnt: 1 },
    vars: [{ name: 'cnt', value: '1', type: 'number' }],
  });

  // 执行建图 (addEdge)
  for (let i = 0; i < rawEdges.length; i++) {
    const { u, v, w } = rawEdges[i];
    const edgeIdx = edges.length;
    const oldHead = head[u];
    const displayE = edgeIdx + 1;
    const displayOldHead = oldHead === -1 ? 0 : oldHead + 1;

    if (mode === 'build') {
      // 步骤 1: 记录终点 to[cnt] = v
      steps.push({
        mode: 'build',
        action: 'add_start',
        head: [...head],
        edges: edges.map((e) => ({ ...e })),
        curEdgeIndex: edgeIdx,
        curNode: u,
        targetNode: v,
        curWeight: null,
        prevHeadVal: oldHead,
        newHeadVal: null,
        traversedEdges: [],
        allNodes,
        allRawEdges: rawEdges,
        startNode,
        message: `第 1 步：分配边号 #${displayE}。记录终点：边 #${displayE} 的终点为点 ${v}（to[${displayE}] = ${v}）`,
        log: `加边 addEdge(点 ${u}, 点 ${v}, 权 ${w}) - 写入 to[边 #${displayE}] = 点 ${v}`,
        codeLine: codeLineMap.buildAddTo,
        metrics: {
          'cur-action': `写入终点 (点 ${u} ➔ 点 ${v})`,
          'edge-cnt': edgeIdx,
          'cur-pointer': `to[边 #${displayE}] = 点 ${v}`,
        },
        decision: `分配边空间 #${displayE}，写入目标顶点 to[${displayE}] = 点 ${v}`,
        statusBadge: { text: `记录终点 #${displayE}`, variant: 'info' },
        stepSummaryBadge: `记录终点: to[边 #${displayE}] = 点 ${v}`,
        activeCodeLineKey: 'to',
        selectedPerspectiveNode: u,
        cnt: displayE,
        u,
        v,
        w,
        scope: {
          cnt: displayE,
          u,
          v,
          w,
          to: v,
          head: displayOldHead,
          'to[cnt]': v,
          'head[u]': displayOldHead,
        },
        vars: [
          { name: 'cnt', value: String(displayE), type: 'number' },
          { name: 'u', value: String(u), type: 'number' },
          { name: 'v', value: String(v), type: 'number' },
          { name: 'w', value: String(w), type: 'number' },
          { name: 'to', value: String(v), type: 'number' },
          { name: 'head', value: String(displayOldHead), type: 'number' },
        ],
      });

      // 步骤 2: 记录边权 weight[cnt] = w
      steps.push({
        mode: 'build',
        action: 'add_weight',
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
        message: `第 2 步：记录边权：边 #${displayE} 的路径权值赋值为 ${w}（weight[${displayE}] = ${w}）`,
        log: `写入 weight[边 #${displayE}] = 权 ${w}`,
        codeLine: codeLineMap.buildAddWeight,
        metrics: {
          'cur-action': `写入边权 (权值 ${w})`,
          'edge-cnt': edgeIdx,
          'cur-pointer': `w[边 #${displayE}] = ${w}`,
        },
        decision: `写入边权参数 weight[${displayE}] = ${w}`,
        statusBadge: { text: `记录边权 w=${w}`, variant: 'info' },
        stepSummaryBadge: `记录边权: weight[边 #${displayE}] = ${w}`,
        activeCodeLineKey: 'to',
        selectedPerspectiveNode: u,
        cnt: displayE,
        u,
        v,
        w,
        scope: {
          cnt: displayE,
          u,
          v,
          w,
          to: v,
          weight: w,
          head: displayOldHead,
          'weight[cnt]': w,
          'to[cnt]': v,
          'head[u]': displayOldHead,
        },
        vars: [
          { name: 'cnt', value: String(displayE), type: 'number' },
          { name: 'u', value: String(u), type: 'number' },
          { name: 'v', value: String(v), type: 'number' },
          { name: 'w', value: String(w), type: 'number' },
          { name: 'to', value: String(v), type: 'number' },
          { name: 'weight', value: String(w), type: 'number' },
          { name: 'head', value: String(displayOldHead), type: 'number' },
        ],
      });

      // 步骤 3: 绑定 next 指针 (头插法核心)
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
        message: `第 3 步：继承旧表头。令边 #${displayE} 的下条边指针 next[${displayE}] = head[点 ${u}] (${displayOldHead === 0 ? '0/无' : `边 #${displayOldHead}`})。头插法核心：新边把已有出边挂在自己身后！`,
        log: `链接前驱 edge[${edgeIdx}].next = ${oldHead === -1 ? 0 : oldHead + 1}`,
        codeLine: codeLineMap.buildLinknext,
        metrics: {
          'cur-action': `头插链接 (点 ${u} ➔ 点 ${v})`,
          'edge-cnt': edgeIdx + 1,
          'cur-pointer': `next = ${displayOldHead === 0 ? '0' : `边 #${displayOldHead}`}`,
        },
        decision: `【头插法关键】令 next[边 #${displayE}] 指向旧表头 head[点 ${u}] (${displayOldHead === 0 ? 0 : `边 #${displayOldHead}`})，实现 O(1) 挂接`,
        statusBadge: { text: '头插继承', variant: 'warning' },
        stepSummaryBadge: `继承旧表头: next[边 #${displayE}] = head[点 ${u}] (${displayOldHead === 0 ? '0' : `边 #${displayOldHead}`})`,
        activeCodeLineKey: 'next',
        selectedPerspectiveNode: u,
        cnt: displayE,
        u,
        v,
        w,
        scope: {
          cnt: displayE,
          u,
          v,
          w,
          to: v,
          weight: w,
          next: displayOldHead,
          head: displayOldHead,
          'next[cnt]': displayOldHead,
          'head[u]': displayOldHead,
          'to[cnt]': v,
          'weight[cnt]': w,
        },
        vars: [
          { name: 'cnt', value: String(displayE), type: 'number' },
          { name: 'u', value: String(u), type: 'number' },
          { name: 'v', value: String(v), type: 'number' },
          { name: 'w', value: String(w), type: 'number' },
          { name: 'to', value: String(v), type: 'number' },
          { name: 'weight', value: String(w), type: 'number' },
          { name: 'next', value: String(displayOldHead), type: 'number' },
          { name: 'head', value: String(displayOldHead), type: 'number' },
        ],
      });

      // 步骤 4: 更新 head[u] = edgeIdx
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
        message: `第 4 步：更新顶点头指针。令点 ${u} 的表头 head[${u}] = ${displayE}（指向边 #${displayE}）。后加入的边正式成为点 ${u} 的最新出边链表头！`,
        log: `更新表头 head[点 ${u}] = 边 #${displayE} (原 ${displayOldHead === 0 ? '0' : `边 #${displayOldHead}`})`,
        codeLine: codeLineMap.buildUpdatehead,
        metrics: {
          'cur-action': `更新表头 head[点 ${u}]`,
          'edge-cnt': edgeIdx + 1,
          'cur-pointer': `head[点 ${u}] = 边 #${displayE}`,
        },
        decision: `更新顶点头指针 head[点 ${u}] = 边 #${displayE}，后加入的边成功变为链表新起点`,
        statusBadge: { text: '更新表头', variant: 'success' },
        stepSummaryBadge: `更新表头指针: head[点 ${u}] = 边 #${displayE}`,
        activeCodeLineKey: 'head',
        selectedPerspectiveNode: u,
        cnt: displayE,
        u,
        v,
        w,
        scope: {
          cnt: displayE,
          u,
          v,
          w,
          to: v,
          weight: w,
          next: displayOldHead,
          head: displayE,
          'head[u]': displayE,
          'next[cnt]': displayOldHead,
          'to[cnt]': v,
          'weight[cnt]': w,
        },
        vars: [
          { name: 'cnt', value: String(displayE), type: 'number' },
          { name: 'u', value: String(u), type: 'number' },
          { name: 'v', value: String(v), type: 'number' },
          { name: 'w', value: String(w), type: 'number' },
          { name: 'to', value: String(v), type: 'number' },
          { name: 'weight', value: String(w), type: 'number' },
          { name: 'next', value: String(displayOldHead), type: 'number' },
          { name: 'head', value: String(displayE), type: 'number' },
        ],
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
      codeLine: codeLineMap.buildBuilddone,
      metrics: {
        'cur-action': '建图全部完成',
        'edge-cnt': edges.length,
        'cur-pointer': '就绪',
      },
      decision: `全量 ${edges.length} 条有向边建立完毕，各顶点出边逆序链条构建完成，可直接开展遍历或图算法`,
      statusBadge: { text: '建图完成', variant: 'success' },
      stepSummaryBadge: `建图加边完成 (共 ${edges.length} 条边)`,
      selectedPerspectiveNode: maxDegreeNode,
      cnt: edges.length + 1,
      scope: {
        cnt: edges.length + 1,
        totalEdges: edges.length,
      },
      vars: [{ name: 'cnt', value: String(edges.length + 1), type: 'number' }],
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
    message: `🔍 开始遍历点 ${startNode} 的所有出边：取入口指针 e = head[点 ${startNode}] = ${ePtr === -1 ? '0 (无出边)' : `边 #${ePtr + 1}`}`,
    log: `开始遍历点 ${startNode} 的出边链`,
    codeLine: codeLineMap.traverseTraversestart,
    metrics: {
      'cur-action': `出边遍历开始(起点 ${startNode})`,
      'edge-cnt': edges.length,
      'cur-pointer': ePtr !== -1 ? `e = 边 #${ePtr + 1}` : '0',
    },
    decision: `从点 ${startNode} 的表头 head[点 ${startNode}] = ${ePtr === -1 ? 0 : `边 #${ePtr + 1}`} 启动逆序出边遍历`,
    statusBadge: { text: '启动遍历', variant: 'info' },
    stepSummaryBadge: `取入口表头: e = head[点 ${startNode}]`,
    activeCodeLineKey: 'traverse_loop',
    selectedPerspectiveNode: startNode,
    u: startNode,
    ei: ePtr !== -1 ? ePtr + 1 : 0,
    scope: {
      u: startNode,
      ei: ePtr !== -1 ? ePtr + 1 : 0,
      e: ePtr !== -1 ? ePtr + 1 : 0,
      head: ePtr !== -1 ? ePtr + 1 : 0,
      'head[u]': ePtr !== -1 ? ePtr + 1 : 0,
    },
    vars: [
      { name: 'u', value: String(startNode), type: 'number' },
      { name: 'ei', value: String(ePtr !== -1 ? ePtr + 1 : 0), type: 'number' },
      { name: 'e', value: String(ePtr !== -1 ? ePtr + 1 : 0), type: 'number' },
      { name: 'head', value: String(ePtr !== -1 ? ePtr + 1 : 0), type: 'number' },
    ],
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
      message: `访问边 #${ePtr + 1}：点 ${curEdge.u} ➔ 点 ${curEdge.to} (边权 w = ${curEdge.weight})`,
      log: `访问边 #${ePtr + 1} (点 ${curEdge.u} ➔ 点 ${curEdge.to})`,
      codeLine: codeLineMap.traverseVisitedge,
      metrics: {
        'cur-action': `访问出边 #${ePtr + 1}`,
        'edge-cnt': edges.length,
        'cur-pointer': `e = #${ePtr + 1} ➔ 点 ${curEdge.to}`,
      },
      decision: `到达边 #${ePtr + 1}：读取终点 ${curEdge.to} 与权值 ${curEdge.weight} 并执行业务逻辑`,
      statusBadge: { text: `访问边 #${ePtr + 1}`, variant: 'success' },
      stepSummaryBadge: `访问出边: [边 #${ePtr + 1}] 点 ${curEdge.u} ➔ 点 ${curEdge.to} (权: ${curEdge.weight})`,
      activeCodeLineKey: 'traverse_visit',
      selectedPerspectiveNode: startNode,
      u: curEdge.u,
      v: curEdge.to,
      w: curEdge.weight,
      ei: ePtr + 1,
      scope: {
        u: curEdge.u,
        v: curEdge.to,
        w: curEdge.weight,
        ei: ePtr + 1,
        e: ePtr + 1,
        to: curEdge.to,
        weight: curEdge.weight,
        next: curEdge.next !== -1 ? curEdge.next + 1 : 0,
        'to[ei]': curEdge.to,
        'weight[ei]': curEdge.weight,
        'next[ei]': curEdge.next !== -1 ? curEdge.next + 1 : 0,
      },
      vars: [
        { name: 'u', value: String(curEdge.u), type: 'number' },
        { name: 'v', value: String(curEdge.to), type: 'number' },
        { name: 'w', value: String(curEdge.weight), type: 'number' },
        { name: 'ei', value: String(ePtr + 1), type: 'number' },
        { name: 'e', value: String(ePtr + 1), type: 'number' },
        { name: 'to', value: String(curEdge.to), type: 'number' },
        { name: 'weight', value: String(curEdge.weight), type: 'number' },
        { name: 'next', value: String(curEdge.next !== -1 ? curEdge.next + 1 : 0), type: 'number' },
      ],
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
      codeLine: codeLineMap.traverseJumpnext,
      metrics: {
        'cur-action': nextEdgeIdx !== -1 ? '链表单向跳跃' : '抵达链表尾',
        'edge-cnt': edges.length,
        'cur-pointer': nextEdgeIdx !== -1 ? `e = ${nextEdgeIdx + 1}` : '0 (终止)',
      },
      decision: nextEdgeIdx !== -1
        ? `沿静态链指针读取 next[${ePtr + 1}] = ${nextEdgeIdx + 1}，准备访问下一条更早插入的出边`
        : `读取 next[${ePtr + 1}] 为 0（-1），触达链表尾部，出边遍历终止`,
      statusBadge: { text: nextEdgeIdx !== -1 ? '指针后移' : '触尾终止', variant: 'warning' },
      stepSummaryBadge: nextEdgeIdx !== -1 ? `链表跳跃: e = next[${ePtr + 1}] ➔ #${nextEdgeIdx + 1}` : '到达链表尾: next = 0',
      activeCodeLineKey: 'traverse_next',
      selectedPerspectiveNode: startNode,
      u: curEdge.u,
      ei: ePtr + 1,
      scope: {
        u: curEdge.u,
        ei: ePtr + 1,
        e: nextEdgeIdx !== -1 ? nextEdgeIdx + 1 : 0,
        next: nextEdgeIdx !== -1 ? nextEdgeIdx + 1 : 0,
        'next[ei]': nextEdgeIdx !== -1 ? nextEdgeIdx + 1 : 0,
      },
      vars: [
        { name: 'u', value: String(curEdge.u), type: 'number' },
        { name: 'ei', value: String(ePtr + 1), type: 'number' },
        { name: 'e', value: String(nextEdgeIdx !== -1 ? nextEdgeIdx + 1 : 0), type: 'number' },
        { name: 'next', value: String(nextEdgeIdx !== -1 ? nextEdgeIdx + 1 : 0), type: 'number' },
      ],
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
    codeLine: codeLineMap.traverseTraversedone,
    metrics: {
      'cur-action': '遍历完全结束',
      'edge-cnt': edges.length,
      'cur-pointer': 'NULL (遍历终点)',
    },
    decision: `完成顶点 ${startNode} 所有出边遍历，逆序输出结果共计 ${traversed.length} 条边`,
    statusBadge: { text: '遍历结束', variant: 'success' },
    stepSummaryBadge: `遍历完毕 (逆序访问 ${traversed.length} 条出边)`,
    selectedPerspectiveNode: startNode,
    u: startNode,
    ei: 0,
    scope: {
      u: startNode,
      ei: 0,
    },
    vars: [
      { name: 'u', value: String(startNode), type: 'number' },
      { name: 'ei', value: '0', type: 'number' },
    ],
  });

  return steps;
}
