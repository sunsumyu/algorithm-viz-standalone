/**
 * 上下界网络流与循环流 (Bounded Flow / Feasible Circulation) 声明式可视化器
 * 进阶网络流: 每条边强制流量 [low, up]、差额网络与超级源汇 SS/TT 平衡、满流判定定理 (LOJ 115 / 洛谷 P5192)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BOUNDED_FLOW_CODE_LANGUAGES,
  BOUNDED_FLOW_PROBLEM_HTML,
  BOUNDED_FLOW_ANALYSIS_HTML,
} from './bounded-flow-problem-content';

export interface BoundedFlowStep {
  phase: 'INIT_BOUNDS' | 'CALC_DELTA' | 'ADD_SUPER_NODES' | 'DINIC_FLOW' | 'RESTORE_TRUE_FLOW' | 'ALL_DONE';
  phaseText: string;
  deltaValues: Record<number, number>;
  showSuperNodes: boolean;
  edges: Array<{
    u: number | string;
    v: number | string;
    low: number;
    up: number;
    freeCap: number;
    flow: number;
    isSuper?: boolean;
  }>;
  sumPositiveDelta: number;
  totalPushed: number;
  isFeasible: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBoundedFlowSteps(networkType: string): BoundedFlowStep[] {
  const steps: BoundedFlowStep[] = [];

  if (networkType === 'triangle') {
    // 3 节点
    const rawEdges = [
      { u: 1, v: 2, low: 2, up: 5, freeCap: 3, flow: 0 },
      { u: 2, v: 3, low: 1, up: 4, freeCap: 3, flow: 0 },
      { u: 3, v: 1, low: 2, up: 6, freeCap: 4, flow: 0 },
    ];
    // delta: 1:(2-2=0), 2:(2-1=+1), 3:(1-2=-1)
    const deltas: Record<number, number> = { 1: 0, 2: 1, 3: -1 };

    steps.push({
      phase: 'INIT_BOUNDS',
      phaseText: '原图上下界约束',
      deltaValues: { 1: 0, 2: 0, 3: 0 },
      showSuperNodes: false,
      edges: rawEdges.map((e) => ({ ...e })),
      sumPositiveDelta: 1,
      totalPushed: 0,
      isFeasible: false,
      message: '初始网络：各边存在强制下界 low 与上界 up，自由容量 freeCap = up - low。',
      log: '初始网络加载：3 节点三角形上下界',
      codeLine: [10, 15],
    });

    steps.push({
      phase: 'CALC_DELTA',
      phaseText: '计算点差额 delta[u]',
      deltaValues: deltas,
      showSuperNodes: false,
      edges: rawEdges.map((e) => ({ ...e })),
      sumPositiveDelta: 1,
      totalPushed: 0,
      isFeasible: false,
      message: '统计入流下界与出流下界差额：delta[2] = +1 (缺流), delta[3] = -1 (盈余)。',
      log: '计算点差额 delta: N2=+1, N3=-1',
      codeLine: [23, 27],
    });

    const superEdges = [
      ...rawEdges,
      { u: 'SS', v: 2, low: 0, up: 1, freeCap: 1, flow: 0, isSuper: true },
      { u: 3, v: 'TT', low: 0, up: 1, freeCap: 1, flow: 0, isSuper: true },
    ];

    steps.push({
      phase: 'ADD_SUPER_NODES',
      phaseText: '建立超级源汇 SS/TT',
      deltaValues: deltas,
      showSuperNodes: true,
      edges: superEdges.map((e) => ({ ...e })),
      sumPositiveDelta: 1,
      totalPushed: 0,
      isFeasible: false,
      message: '引入超级源点 SS 与超级汇点 TT：连边 SS ➔ 2(cap=1), 3 ➔ TT(cap=1)。',
      log: '加边连接超级源汇 SS/TT',
      codeLine: [31, 36],
    });

    const flowedEdges = superEdges.map((e) => {
      if (e.isSuper) return { ...e, flow: 1 };
      if (e.u === 1 && e.v === 2) return { ...e, flow: 0 };
      if (e.u === 2 && e.v === 3) return { ...e, flow: 1 };
      if (e.u === 3 && e.v === 1) return { ...e, flow: 0 };
      return { ...e };
    });

    steps.push({
      phase: 'DINIC_FLOW',
      phaseText: 'Dinic 最大流推流',
      deltaValues: deltas,
      showSuperNodes: true,
      edges: flowedEdges,
      sumPositiveDelta: 1,
      totalPushed: 1,
      isFeasible: true,
      message: 'Dinic 算法在差额网络上求得最大流 = 1，从 SS 流出的边全部满流！',
      log: 'Dinic 最大流完成：推流 1 满流',
      codeLine: [40, 48],
    });

    const trueFlowEdges = [
      { u: 1, v: 2, low: 2, up: 5, freeCap: 3, flow: 2 },
      { u: 2, v: 3, low: 1, up: 4, freeCap: 3, flow: 2 },
      { u: 3, v: 1, low: 2, up: 6, freeCap: 4, flow: 2 },
    ];

    steps.push({
      phase: 'ALL_DONE',
      phaseText: '还原真实可行流',
      deltaValues: deltas,
      showSuperNodes: false,
      edges: trueFlowEdges,
      sumPositiveDelta: 1,
      totalPushed: 1,
      isFeasible: true,
      message: '🎉 真实流量 flow = low + flow_free 还原完毕！原网络存在可行循环流！',
      log: '✓ 可行循环流判定成功，流量守恒成立',
      codeLine: [52, 58],
    });

    return steps;
  }

  // 4 节点经典用例
  const rawEdges4 = [
    { u: 1, v: 2, low: 1, up: 3, freeCap: 2, flow: 0 },
    { u: 2, v: 3, low: 1, up: 2, freeCap: 1, flow: 0 },
    { u: 3, v: 4, low: 2, up: 4, freeCap: 2, flow: 0 },
    { u: 4, v: 1, low: 1, up: 3, freeCap: 2, flow: 0 },
    { u: 2, v: 4, low: 1, up: 2, freeCap: 1, flow: 0 },
  ];
  // 1: low_in=1, low_out=1 -> 0
  // 2: low_in=1, low_out=2 -> -1
  // 3: low_in=1, low_out=2 -> -1
  // 4: low_in=3, low_out=1 -> +2
  const deltas4: Record<number, number> = { 1: 0, 2: -1, 3: -1, 4: 2 };

  steps.push({
    phase: 'INIT_BOUNDS',
    phaseText: '原图上下界约束',
    deltaValues: { 1: 0, 2: 0, 3: 0, 4: 0 },
    showSuperNodes: false,
    edges: rawEdges4.map((e) => ({ ...e })),
    sumPositiveDelta: 2,
    totalPushed: 0,
    isFeasible: false,
    message: '初始 4 节点网络：每条边标注强制流量范围 [low, up] 与自由容量 freeCap = up - low。',
    log: '加载 4 节点无源汇上下界网络',
    codeLine: [10, 15],
  });

  steps.push({
    phase: 'CALC_DELTA',
    phaseText: '计算点差额 delta[u]',
    deltaValues: deltas4,
    showSuperNodes: false,
    edges: rawEdges4.map((e) => ({ ...e })),
    sumPositiveDelta: 2,
    totalPushed: 0,
    isFeasible: false,
    message: '点差额 delta[u] = ∑low_in - ∑low_out：delta[4] = +2 (需补流), delta[2] = -1, delta[3] = -1。',
    log: '计算点差额: N4=+2, N2=-1, N3=-1, N1=0',
    codeLine: [23, 27],
  });

  const superEdges4 = [
    ...rawEdges4,
    { u: 'SS', v: 4, low: 0, up: 2, freeCap: 2, flow: 0, isSuper: true },
    { u: 2, v: 'TT', low: 0, up: 1, freeCap: 1, flow: 0, isSuper: true },
    { u: 3, v: 'TT', low: 0, up: 1, freeCap: 1, flow: 0, isSuper: true },
  ];

  steps.push({
    phase: 'ADD_SUPER_NODES',
    phaseText: '建立超级源汇 SS/TT',
    deltaValues: deltas4,
    showSuperNodes: true,
    edges: superEdges4.map((e) => ({ ...e })),
    sumPositiveDelta: 2,
    totalPushed: 0,
    isFeasible: false,
    message: '向差额网络注入超级源汇：SS ➔ 4 (cap=2), 2 ➔ TT (cap=1), 3 ➔ TT (cap=1)。',
    log: '建立超级源 SS 与超级汇 TT 补流边',
    codeLine: [31, 36],
  });

  const flowedEdges4 = superEdges4.map((e) => {
    if (e.isSuper) return { ...e, flow: e.freeCap };
    if (e.u === 4 && e.v === 1) return { ...e, flow: 1 };
    if (e.u === 1 && e.v === 2) return { ...e, flow: 1 };
    if (e.u === 2 && e.v === 3) return { ...e, flow: 1 };
    return { ...e, flow: 0 };
  });

  steps.push({
    phase: 'DINIC_FLOW',
    phaseText: 'Dinic 最大流推流',
    deltaValues: deltas4,
    showSuperNodes: true,
    edges: flowedEdges4,
    sumPositiveDelta: 2,
    totalPushed: 2,
    isFeasible: true,
    message: '差额网络上运行 Dinic 最大流，推送流量 2 = ∑max(0, delta)，所有超级源出边满流！',
    log: 'Dinic 最大流完成：推流 2/2，超级源满流',
    codeLine: [40, 48],
  });

  const trueFlowEdges4 = [
    { u: 1, v: 2, low: 1, up: 3, freeCap: 2, flow: 2 },
    { u: 2, v: 3, low: 1, up: 2, freeCap: 1, flow: 2 },
    { u: 3, v: 4, low: 2, up: 4, freeCap: 2, flow: 2 },
    { u: 4, v: 1, low: 1, up: 3, freeCap: 2, flow: 2 },
    { u: 2, v: 4, low: 1, up: 2, freeCap: 1, flow: 1 },
  ];

  steps.push({
    phase: 'ALL_DONE',
    phaseText: '还原真实可行循环流',
    deltaValues: deltas4,
    showSuperNodes: false,
    edges: trueFlowEdges4,
    sumPositiveDelta: 2,
    totalPushed: 2,
    isFeasible: true,
    message: '🎉 真实流量 flow = low + flow_free 计算完毕！原图每个点入流等于出流，满足上下界可行循环流！',
    log: '✓ 判定成功：存在满足上下界的可行循环流',
    codeLine: [52, 58],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BoundedFlowStep>({
  id: 'bounded-flow',
  name: '上下界网络流 (Bounded Flow)',
  category: 'graph',
  icon: '🌊',
  badge: {
    mode: '无源汇可行流 / 满流判定',
    complexity: 'O(V² · E) · O(V + E)',
  },
  card1Title: '🌐 上下界残量网络与超级源汇沙盘',
  card2Title: '🧭 点差额 delta[u] 与满流平衡监视器',
  card2Desc: '入流下界 - 出流下界、超级源汇 SS/TT 满流与真实流量映射',
  legend: [
    { label: '原图节点 (1..4)', color: '#0284c7' },
    { label: '⭐ 超级源点 SS', color: '#f59e0b' },
    { label: '🟣 超级汇点 TT', color: '#8b5cf6' },
    { label: '🌊 可行流充盈边', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-network',
      label: '网络用例',
      type: 'select',
      defaultValue: 'four-nodes',
      options: [
        { label: '4 节点可行循环流 (LOJ 115)', value: 'four-nodes' },
        { label: '3 节点三角形上下界', value: 'triangle' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '4 节点可行流 (LOJ 115)', values: { 'input-network': 'four-nodes' } },
    { label: '3 节点三角形上下界', values: { 'input-network': 'triangle' } },
  ],
  metrics: [
    { id: 'cur-phase', label: '算法阶段', color: '#2563eb' },
    { id: 'super-flow', label: '超级源流量 / 需补流', color: '#16a34a' },
    { id: 'feasible-status', label: '可行流判定', color: '#0d9488' },
  ],
  codeLanguages: BOUNDED_FLOW_CODE_LANGUAGES,
  problemHtml: BOUNDED_FLOW_PROBLEM_HTML,
  analysisHtml: BOUNDED_FLOW_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const net = inputs['input-network'] || 'four-nodes';
    return buildBoundedFlowSteps(net);
  },
  renderCanvas: (container, step) => {
    const is3Node = step.edges.some((e) => e.u === 3 && e.v === 1 && !e.isSuper && step.edges.length <= 5);

    // 节点坐标定义
    const nodeCoords: Record<string, { x: number; y: number }> = is3Node
      ? {
          1: { x: 80, y: 150 },
          2: { x: 220, y: 150 },
          3: { x: 150, y: 50 },
          SS: { x: 220, y: 220 },
          TT: { x: 80, y: 50 },
        }
      : {
          1: { x: 75, y: 65 },
          2: { x: 235, y: 65 },
          3: { x: 235, y: 195 },
          4: { x: 75, y: 195 },
          SS: { x: 25, y: 130 },
          TT: { x: 285, y: 130 },
        };

    // 渲染 SVG 边
    const svgEdges = step.edges
      .map((e) => {
        const p1 = nodeCoords[String(e.u)];
        const p2 = nodeCoords[String(e.v)];
        if (!p1 || !p2) return '';

        const isSuper = e.isSuper;
        const color = isSuper ? '#d97706' : e.flow > 0 ? '#10b981' : '#64748b';
        const strokeWidth = e.flow > 0 || isSuper ? 2.5 : 1.5;
        const strokeDash = isSuper ? 'stroke-dasharray="4,4"' : '';

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;
        const label =
          step.phase === 'ALL_DONE'
            ? `flow: ${e.flow} [${e.low}, ${e.up}]`
            : isSuper
            ? `cap: ${e.freeCap} (flow:${e.flow})`
            : `[${e.low}, ${e.up}] cap:${e.freeCap}`;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" ${strokeDash} marker-end="url(#arrow-${isSuper ? 'super' : 'default'})" />
            <rect x="${midX - 35}" y="${midY - 8}" width="70" height="14" rx="3" fill="#0f172a" fill-opacity="0.85" />
            <text x="${midX}" y="${midY + 3}" fill="${color}" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">${label}</text>
          </g>
        `;
      })
      .join('');

    // 渲染 SVG 节点
    const nodesToRender = is3Node ? ['1', '2', '3'] : ['1', '2', '3', '4'];
    if (step.showSuperNodes) {
      nodesToRender.push('SS', 'TT');
    }

    const svgNodes = nodesToRender
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const isSuper = id === 'SS' || id === 'TT';
        const bg = id === 'SS' ? '#f59e0b' : id === 'TT' ? '#8b5cf6' : '#0284c7';
        const delta = step.deltaValues[Number(id)];
        const deltaLabel = !isSuper && delta !== undefined ? `<text x="${p.x}" y="${p.y + 26}" fill="${delta > 0 ? '#34d399' : delta < 0 ? '#f87171' : '#94a3b8'}" font-size="9" font-weight="700" text-anchor="middle">Δ:${delta >= 0 ? '+' : ''}${delta}</text>` : '';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="#ffffff" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            ${deltaLabel}
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box; position: relative;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 230">
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-super" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 2px;">
          ⭐ SS/TT 负责平衡各节点差额流量 Δ[u] | 差额网络满流 ⟺ 原图存在满足 [low, up] 的可行流
        </div>
      </div>
    `;

    // 更新 Card 2 监控器
    const root = container.closest('#algo-bounded-flow-view');
    if (root) {
      const phaseEl = root.querySelector('#metric-cur-phase');
      const superEl = root.querySelector('#metric-super-flow');
      const featEl = root.querySelector('#metric-feasible-status');

      if (phaseEl) phaseEl.textContent = step.phaseText;
      if (superEl) superEl.textContent = `${step.totalPushed} / ${step.sumPositiveDelta}`;
      if (featEl) {
        featEl.textContent = step.isFeasible ? '✓ 满流可行' : '判定中...';
        featEl.style.color = step.isFeasible ? '#10b981' : '#d97706';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const deltaItems = Object.entries(step.deltaValues)
          .map(([u, d]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px;">N${u}: <strong style="color: ${d > 0 ? '#10b981' : d < 0 ? '#ef4444' : '#64748b'};">${d >= 0 ? '+' : ''}${d}</strong></span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>各节点差额 Δ[u] = ∑in - ∑out:</span>
              <div style="display: flex; gap: 4px;">${deltaItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 满流平衡定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">maxFlow(SS ➔ TT) == ∑max(0, Δ)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'bounded-flow',
  name: '上下界网络流 (Bounded Flow)',
  viewId: 'algo-bounded-flow-view',
  category: 'graph',
  description: '进阶网络流经典：无源汇可行循环流、每条边强制 [low, up]、点差额 delta 与超级源汇满流判定 (LOJ 115)',
  icon: '🌊',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 77,
  learningGoal: '掌握上下界网络流转化为差额网络与超级源汇的建模技巧、满流判定定理与真实流量还原',
});

export { Visualizer as BoundedFlowVisualizer };
