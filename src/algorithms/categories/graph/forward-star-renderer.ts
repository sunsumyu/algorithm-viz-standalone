/**
 * 链式前向星 (Chained Forward Star) 声明式可视化器
 * 支持：
 * 1. ⚡ 建图加边模式 (addEdge): 单步展示头插法与指针链接
 * 2. 🔍 出边遍历模式 (traverse): 单步展示 head[u] 引导的静态链表跳跃
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  FORWARD_STAR_CODE_LANGUAGES,
  FORWARD_STAR_PROBLEM_HTML,
  FORWARD_STAR_ANALYSIS_HTML,
} from './forward-star-problem-content';

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

export interface ForwardStarStep {
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

// 节点固定预设坐标 (自适应 5~7 个节点圆形分布)
const NODE_COORDINATES: Record<number, { x: number; y: number }> = {
  1: { x: 70, y: 70 },
  2: { x: 190, y: 40 },
  3: { x: 90, y: 190 },
  4: { x: 210, y: 180 },
  5: { x: 140, y: 120 },
  6: { x: 240, y: 100 },
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
    codeLine: 18,
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
        log: `addEdge(${u}, ${v}, ${w}) - 分配槽位 edge[${edgeIdx}]`,
        codeLine: 24,
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
        log: `edge[${edgeIdx}].next = ${oldHead}`,
        codeLine: 26,
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
        log: `head[${u}] = ${edgeIdx} (原 ${oldHead})`,
        codeLine: 27,
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
      codeLine: 28,
    });
  } else {
    // 遍历模式 (Traverse)
    const traversedEdges: number[] = [];

    steps.push({
      mode: 'traverse',
      action: 'traverse_start',
      head: [...head],
      edges: edges.map((e) => ({ ...e })),
      curEdgeIndex: head[startNode] !== -1 ? head[startNode] : null,
      curNode: startNode,
      targetNode: null,
      curWeight: null,
      prevHeadVal: null,
      newHeadVal: null,
      traversedEdges: [],
      allNodes,
      allRawEdges: rawEdges,
      startNode,
      message: `开始遍历顶点 ${startNode} 的出边链：取 e = head[${startNode}] = ${head[startNode] !== -1 ? `#${head[startNode]}` : 'NULL (无出边)'}`,
      log: `开始遍历: 节点 ${startNode}, 表头指针 head[${startNode}] = ${head[startNode]}`,
      codeLine: 32,
    });

    let e = head[startNode];
    while (e !== -1 && e >= 0 && e < edges.length) {
      const edge = edges[e];
      traversedEdges.push(e);

      steps.push({
        mode: 'traverse',
        action: 'visit_edge',
        head: [...head],
        edges: edges.map((ed) => ({ ...ed })),
        curEdgeIndex: e,
        curNode: startNode,
        targetNode: edge.to,
        curWeight: edge.weight,
        prevHeadVal: null,
        newHeadVal: null,
        traversedEdges: [...traversedEdges],
        allNodes,
        allRawEdges: rawEdges,
        startNode,
        message: `访问出边 #${e}：由节点 ${startNode} 指向节点 ${edge.to} (权值: ${edge.weight})`,
        log: `访问出边: edge[${e}] -> 终点 ${edge.to}, 权值 ${edge.weight}`,
        codeLine: 34,
      });

      const nextEdge = edge.next;
      steps.push({
        mode: 'traverse',
        action: 'jump_next',
        head: [...head],
        edges: edges.map((ed) => ({ ...ed })),
        curEdgeIndex: e,
        curNode: startNode,
        targetNode: edge.to,
        curWeight: edge.weight,
        prevHeadVal: null,
        newHeadVal: null,
        traversedEdges: [...traversedEdges],
        allNodes,
        allRawEdges: rawEdges,
        startNode,
        message: `沿静态链表跳链：e = edge[${e}].next = ${nextEdge !== -1 ? `#${nextEdge}` : 'NULL (链尾结束)'}`,
        log: `跳链: e = edge[${e}].next (${nextEdge})`,
        codeLine: 32,
      });

      e = nextEdge;
    }

    steps.push({
      mode: 'traverse',
      action: 'traverse_done',
      head: [...head],
      edges: edges.map((ed) => ({ ...ed })),
      curEdgeIndex: null,
      curNode: startNode,
      targetNode: null,
      curWeight: null,
      prevHeadVal: null,
      newHeadVal: null,
      traversedEdges: [...traversedEdges],
      allNodes,
      allRawEdges: rawEdges,
      startNode,
      message: `🎉 顶点 ${startNode} 出边遍历完成！共访问到 ${traversedEdges.length} 条出边（顺序由于头插法呈现逆序）。`,
      log: `遍历结束: 顶点 ${startNode} 共 ${traversedEdges.length} 条出边 [${traversedEdges.map((idx) => `#${idx}`).join(' -> ')}]`,
      codeLine: 36,
    });
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<ForwardStarStep>({
  id: 'forward-star',
  name: '链式前向星',
  category: 'graph',
  icon: '🕸️',
  badge: {
    mode: 'head[]·next[] 静态链表',
    complexity: '加边 O(1) · 空间 O(V+E)',
  },
  card1Title: '🕸️ 拓扑节点与静态链表数组内存池 (head[] & edge[])',
  card2Title: '🧭 链式前向星指针状态与遍历监视器',
  card2Desc: '当前加边/遍历指针、头插法跳链路径与相邻出边访问跟踪',
  legend: [
    { label: '正在处理/访问边', color: '#2563eb' },
    { label: '头插法新边', color: '#10b981' },
    { label: '原表头前驱 (next)', color: '#d97706' },
  ],
  modes: [
    { id: 'build', label: '⚡ 建图加边 (addEdge)' },
    { id: 'traverse', label: '🔍 出边遍历 (Traverse)' },
  ],
  inputs: [
    {
      id: 'input-edges',
      label: '边集 (u v w)',
      type: 'text',
      defaultValue: '1 2 5, 1 3 2, 2 4 1, 3 2 4, 3 5 3, 4 5 6',
      width: '260px',
      placeholder: '以逗号或换行分隔每条边',
    },
    {
      id: 'input-start-node',
      label: '遍历起点 u',
      type: 'number',
      defaultValue: 1,
      width: '45px',
    },
  ],
  presets: [
    {
      label: '经典有向图 (6边5点)',
      values: {
        'input-edges': '1 2 5, 1 3 2, 2 4 1, 3 2 4, 3 5 3, 4 5 6',
        'input-start-node': 1,
      },
    },
    {
      label: '密集单点多出边',
      values: {
        'input-edges': '1 2 2, 1 3 4, 1 4 6, 1 5 8, 2 5 3',
        'input-start-node': 1,
      },
    },
    {
      label: '环路拓扑',
      values: {
        'input-edges': '1 2 1, 2 3 2, 3 4 3, 4 1 4, 2 4 5',
        'input-start-node': 2,
      },
    },
  ],
  metrics: [
    { id: 'cur-action', label: '当前阶段', color: '#2563eb' },
    { id: 'edge-cnt', label: '已存边数 (cnt)', color: '#10b981' },
    { id: 'cur-pointer', label: '活动指针 (e)', color: '#d97706' },
  ],
  codeLanguages: FORWARD_STAR_CODE_LANGUAGES,
  problemHtml: FORWARD_STAR_PROBLEM_HTML,
  analysisHtml: FORWARD_STAR_ANALYSIS_HTML,
  buildSteps: (inputs, mode) => {
    const edgesRaw = inputs['input-edges'] || '1 2 5, 1 3 2, 2 4 1, 3 2 4, 3 5 3, 4 5 6';
    const startNodeRaw = inputs['input-start-node'] || '1';
    return buildForwardStarSteps(edgesRaw, startNodeRaw, mode || 'build');
  },
  renderCanvas: (container, step) => {
    const {
      head,
      edges,
      curEdgeIndex,
      curNode,
      targetNode,
      traversedEdges,
      allNodes,
      allRawEdges,
      startNode,
      mode,
      action,
    } = step;

    // 1. 生成左侧 SVG 拓扑图
    const svgEdges = allRawEdges
      .map((e, idx) => {
        const from = NODE_COORDINATES[e.u] || { x: 50 + (e.u * 35) % 180, y: 50 + (e.u * 25) % 180 };
        const to = NODE_COORDINATES[e.v] || { x: 50 + (e.v * 35) % 180, y: 50 + (e.v * 25) % 180 };
        const isCurrent = curEdgeIndex !== null && edges[curEdgeIndex] && edges[curEdgeIndex].u === e.u && edges[curEdgeIndex].to === e.v;
        const isTraversed = traversedEdges.some((tIdx) => edges[tIdx] && edges[tIdx].u === e.u && edges[tIdx].to === e.v);
        const isExistingInBuild = mode === 'build' ? idx <= (curEdgeIndex ?? -1) : true;

        if (!isExistingInBuild) {
          return ''; // 尚未加入的边不展示
        }

        let strokeColor = '#94a3b8';
        let strokeWidth = 1.8;
        let marker = 'url(#arrow-default)';

        if (isCurrent) {
          strokeColor = '#2563eb';
          strokeWidth = 3;
          marker = 'url(#arrow-active)';
        } else if (isTraversed) {
          strokeColor = '#10b981';
          strokeWidth = 2.5;
          marker = 'url(#arrow-traversed)';
        }

        // 计算带箭头的连线中点
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;

        return `
          <g>
            <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" stroke-dasharray="${isCurrent ? 'none' : 'none'}" />
            <circle cx="${mx}" cy="${my}" r="8" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />
            <text x="${mx}" y="${my + 3}" font-size="8.5" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle" fill="${strokeColor}">${e.w}</text>
          </g>
        `;
      })
      .join('');

    const svgNodes = allNodes
      .map((u) => {
        const pos = NODE_COORDINATES[u] || { x: 50 + (u * 35) % 180, y: 50 + (u * 25) % 180 };
        const isSource = curNode === u;
        const isTarget = targetNode === u;
        const isStart = startNode === u && mode === 'traverse';

        let fill = '#ffffff';
        let stroke = '#64748b';
        let textFill = '#0f172a';

        if (isSource) {
          fill = '#eff6ff';
          stroke = '#2563eb';
          textFill = '#1d4ed8';
        } else if (isTarget) {
          fill = '#ecfdf5';
          stroke = '#10b981';
          textFill = '#047857';
        } else if (isStart) {
          fill = '#fef3c7';
          stroke = '#d97706';
          textFill = '#b45309';
        }

        return `
          <g>
            <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${fill}" stroke="${stroke}" stroke-width="${isSource || isTarget ? '2.5' : '1.5'}" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
            <text x="${pos.x}" y="${pos.y + 4.5}" font-size="11" font-weight="800" font-family="'JetBrains Mono', monospace" text-anchor="middle" fill="${textFill}">${u}</text>
          </g>
        `;
      })
      .join('');

    // 2. 生成右侧 head[] 数组卡片行
    const headItemsHtml = allNodes
      .map((u) => {
        const headVal = head[u];
        const isCurNode = curNode === u;
        const bg = isCurNode ? '#eff6ff' : '#ffffff';
        const border = isCurNode ? '#2563eb' : '#e2e8f0';
        const valColor = headVal === -1 ? '#94a3b8' : '#2563eb';

        return `
          <div style="display: flex; flex-direction: column; align-items: center; min-width: 44px; padding: 3px; background: ${bg}; border: 1.5px solid ${border}; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <span style="font-size: 8.5px; font-weight: 700; color: ${isCurNode ? '#1d4ed8' : '#64748b'};">u=${u}</span>
            <span style="font-size: 11.5px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${valColor};">${headVal === -1 ? '-1' : `#${headVal}`}</span>
          </div>
        `;
      })
      .join('');

    // 3. 生成右侧 edge[] 结构体数组表格行
    const edgeRowsHtml =
      edges.length === 0
        ? `<tr><td colspan="5" style="padding: 8px; text-align: center; color: #94a3b8; font-style: italic; font-size: 11px;">edge[] 内存池空（等待加边）</td></tr>`
        : edges
            .map((ed, idx) => {
              const isCur = curEdgeIndex === idx;
              const isTraversed = traversedEdges.includes(idx);
              let rowBg = '#ffffff';
              if (isCur) rowBg = '#eff6ff';
              else if (isTraversed) rowBg = '#f0fdf4';

              return `
                <tr style="background: ${rowBg}; border-bottom: 1px solid #f1f5f9; font-size: 10.5px; font-family: 'JetBrains Mono', monospace; ${isCur ? 'font-weight: 800;' : ''}">
                  <td style="padding: 3px 6px; color: ${isCur ? '#2563eb' : '#475569'};">#${idx}</td>
                  <td style="padding: 3px 6px; color: #0f172a;">${ed.u} → <b>${ed.to}</b></td>
                  <td style="padding: 3px 6px; color: ${ed.next === -1 ? '#94a3b8' : '#d97706'}; font-weight: 700;">${ed.next === -1 ? '-1 (NULL)' : `#${ed.next}`}</td>
                  <td style="padding: 3px 6px; color: #059669;">${ed.weight}</td>
                  <td style="padding: 3px 6px; color: #64748b; font-size: 9.5px;">${isCur ? '👉 活动边' : isTraversed ? '✓ 已访问' : '就绪'}</td>
                </tr>
              `;
            })
            .join('');

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 10px; width: 100%; height: 100%; box-sizing: border-box; align-items: stretch;">
        <!-- 左侧：图拓扑网络 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; overflow: hidden; position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>🌐 有向图拓扑</span>
            <span style="font-size: 9.5px; color: #64748b;">${allNodes.length} 顶点 / ${edges.length} 边</span>
          </div>
          <svg style="width: 100%; height: 100%; min-height: 180px; background: #f8fafc; border-radius: 4px;" viewBox="0 0 280 240">
            <defs>
              <marker id="arrow-default" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
              </marker>
              <marker id="arrow-traversed" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 右侧：head[] 数组 + edge[] 静态链表池 -->
        <div style="display: flex; flex-direction: column; gap: 8px; overflow: hidden; min-width: 0;">
          <!-- head[] 表头数组 -->
          <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; flex-shrink: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569; margin-bottom: 4px;">
              <span>📌 head[u] 表头数组 (存储各节点首条出边)</span>
              <span style="font-size: 9.5px; color: #0284c7;">头插法入口</span>
            </div>
            <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
              ${headItemsHtml}
            </div>
          </div>

          <!-- edge[] 结构体内存池 -->
          <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; flex: 1; min-height: 0; overflow: hidden;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569; margin-bottom: 4px;">
              <span>🥞 edge[] 静态链表池 (cnt: 0..${Math.max(0, edges.length - 1)})</span>
              <span style="font-size: 9.5px; color: #d97706;">next 维护出边链</span>
            </div>
            <div style="flex: 1; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 9.5px; font-weight: 700; color: #64748b;">
                    <th style="padding: 3px 6px;">序号</th>
                    <th style="padding: 3px 6px;">有向出边</th>
                    <th style="padding: 3px 6px;">next (前驱边)</th>
                    <th style="padding: 3px 6px;">权值</th>
                    <th style="padding: 3px 6px;">状态</th>
                  </tr>
                </thead>
                <tbody>
                  ${edgeRowsHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // 4. 更新 Card 2 状态监控器
    const root = container.closest('#algo-forward-star-view');
    if (root) {
      const actionEl = root.querySelector('#metric-cur-action');
      const cntEl = root.querySelector('#metric-edge-cnt');
      const pointerEl = root.querySelector('#metric-cur-pointer');

      if (actionEl) {
        actionEl.textContent =
          action === 'init'
            ? '初始化'
            : action === 'add_start'
            ? '加边准备'
            : action === 'link_next'
            ? '头插挂接'
            : action === 'update_head'
            ? '更新表头'
            : action === 'visit_edge'
            ? '访问出边'
            : action === 'jump_next'
            ? '跳链下一边'
            : action === 'traverse_done'
            ? '遍历完成'
            : '就绪';
        actionEl.style.color = action === 'visit_edge' || action === 'update_head' ? '#10b981' : '#2563eb';
      }
      if (cntEl) cntEl.textContent = `${edges.length}`;
      if (pointerEl) pointerEl.textContent = curEdgeIndex !== null ? `#${curEdgeIndex}` : 'NULL';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const curHeadStr = curNode !== null ? `head[${curNode}] = ${head[curNode] !== -1 ? `#${head[curNode]}` : '-1'}` : '无';
        const curEdgeStr =
          curEdgeIndex !== null && edges[curEdgeIndex]
            ? `#${curEdgeIndex}: (${edges[curEdgeIndex].u} → ${edges[curEdgeIndex].to}, w=${edges[curEdgeIndex].weight})`
            : '无活动边';

        customMetricsContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; color: #334155; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px;">
              <span>当前顶点表头:</span>
              <strong style="font-family: monospace; color: #2563eb; font-size: 12px;">${curHeadStr}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px;">
              <span>当前边信息:</span>
              <strong style="font-family: monospace; color: #d97706; font-size: 12px;">${curEdgeStr}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'forward-star',
  name: '链式前向星',
  viewId: 'algo-forward-star-view',
  category: 'graph',
  description: '静态链表存图法，通过 head[] 与 edge[cnt].next 实现 O(1) 头插法建图与快速出边遍历',
  icon: '🕸️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '彻底掌握图论中最经典的静态链表存图法，理解 head[] 表头与 next 前驱指针的头插法跃迁逻辑',
});

export { Visualizer as ForwardStarVisualizer };
