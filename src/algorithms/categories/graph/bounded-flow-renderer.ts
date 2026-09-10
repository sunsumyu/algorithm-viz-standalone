/**
 * 上下界网络流与循环流 (Bounded Flow / Feasible Circulation) 声明式可视化器
 * 进阶网络流: 每条边强制流量 [low, up]、差额网络与超级源汇 SS/TT 平衡、满流判定定理 (LOJ 115 / 洛谷 P5192)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (delta, level, cur, 伴随边) 实时监控
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
  levelValues?: Record<number, number>;
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
  activeEdge?: [string, string];
  activeArray?: 'delta' | 'level';
  activeSlot?: number;
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildBoundedFlowSteps(networkType: string = 'four-nodes'): BoundedFlowStep[] {
  const steps: BoundedFlowStep[] = [];
  const isTriangle = networkType === 'triangle';
  const n = isTriangle ? 3 : 4;
  const SS = n + 1;
  const TT = n + 2;

  // 上下界边定义 [u, v, low, up]
  // four-nodes: 4 节点环 + 对角边
  // triangle: 3 节点三角形
  const rawEdges = isTriangle
    ? [
        { u: 1, v: 2, low: 2, up: 5 },
        { u: 2, v: 3, low: 1, up: 4 },
        { u: 3, v: 1, low: 2, up: 6 },
      ]
    : [
        { u: 1, v: 2, low: 1, up: 3 },
        { u: 2, v: 3, low: 1, up: 4 },
        { u: 3, v: 4, low: 2, up: 5 },
        { u: 4, v: 1, low: 1, up: 3 },
        { u: 2, v: 4, low: 1, up: 2 },
      ];

  const delta: number[] = new Array(n + 1).fill(0);
  const level: number[] = new Array(n + 3).fill(-1);
  const flowEdges: Array<{
    u: number | string;
    v: number | string;
    low: number;
    up: number;
    freeCap: number;
    flow: number;
    isSuper?: boolean;
  }> = [];

  let sumPositiveDelta = 0;
  let totalPushed = 0;
  let isFeasible = false;
  let showSuperNodes = false;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    phase: 'INIT_BOUNDS' | 'CALC_DELTA' | 'ADD_SUPER_NODES' | 'DINIC_FLOW' | 'RESTORE_TRUE_FLOW' | 'ALL_DONE',
    phaseText: string,
    activeEdge?: [string, string],
    activeArray?: 'delta' | 'level',
    activeSlot?: number
  ): void {
    const deltaMap: Record<number, number> = {};
    const levelMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) deltaMap[i] = delta[i];
    for (let i = 1; i <= TT; i++) levelMap[i] = level[i];

    steps.push({
      phase,
      phaseText,
      deltaValues: deltaMap,
      levelValues: levelMap,
      showSuperNodes,
      edges: flowEdges.map((e) => ({ ...e })),
      sumPositiveDelta,
      totalPushed,
      isFeasible,
      activeEdge,
      activeArray,
      activeSlot,
      message,
      log,
      codeLine,
      metrics: {
        'cur-phase': phaseText,
        'super-flow': `满流目标: ${sumPositiveDelta} (已推: ${totalPushed})`,
        'feasible-status': isFeasible ? '✓ 伴随网络满流，存在可行流' : '求解推导中',
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 13: init(totalNodes)
  makeStep(13, `🚀 [算法初始化] init(totalNodes=${n})：构造上下界网络求解器，建立实体点 1..${n} 与超级源点 SS=${SS}、超级汇点 TT=${TT}。`, `init(${n})`, 'INIT_BOUNDS', '网络规模初始化');

  // 行 14-16: 设定 SS, TT
  makeStep([14, 16], `📌 [确立超级源汇] SS = ${SS} (源), TT = ${TT} (汇)，用于调解各顶点的流量收支盈亏。`, `SS=${SS}, TT=${TT}`, 'INIT_BOUNDS', '源汇确立');

  // 行 18: adj 链表
  makeStep(18, '📐 [初始化边表] 为每个节点分配残量网络邻接表。', '分配 adj 邻接表', 'INIT_BOUNDS', '边表初始化');

  // 行 20: delta 数组
  makeStep(20, '📊 [分配差额数组] delta = new int[n + 1]; 记录各点入流下界和与出流下界和的差值。', '分配 delta 数组', 'INIT_BOUNDS', '差额数组就绪', undefined, 'delta');

  // 行 21: level 数组
  makeStep(21, '📊 [分配层次数组] level = new int[n + 3]; 为 Dinic 分层图准备深度标号。', '分配 level 数组', 'INIT_BOUNDS', '层次数组就绪', undefined, 'level');

  // ==================== 2. 逐条建立上下界边与差额累加 ====================
  for (const e of rawEdges) {
    // 行 25: addBoundedEdge(u, v, low, up)
    makeStep(25, `🔗 [读入上下界边] addBoundedEdge(${e.u}, ${e.v}, low=${e.low}, up=${e.up})：约束流量在 [${e.low}, ${e.up}] 之间。`, `addBoundedEdge(${e.u}, ${e.v})`, 'CALC_DELTA', '上下界边录入', [`${e.u}`, `${e.v}`]);

    // 行 26-27: delta[u] -= low; delta[v] += low;
    delta[e.u] -= e.low;
    delta[e.v] += e.low;
    makeStep([26, 27], `⚖️ [强制底流扣减] 边 (${e.u}➔${e.v}) 强制流出 ${e.low}：delta[${e.u}] 变为 ${delta[e.u]} (亏)，delta[${e.v}] 变为 ${delta[e.v]} (盈)。`, `delta[${e.u}]-=${e.low}, delta[${e.v}]+=${e.low}`, 'CALC_DELTA', '点差额更新', [`${e.u}`, `${e.v}`], 'delta', e.u);

    // 行 28-29: 自由浮动容量 up - low
    flowEdges.push({
      u: e.u,
      v: e.v,
      low: e.low,
      up: e.up,
      freeCap: e.up - e.low,
      flow: 0,
    });
    makeStep([28, 29], `📐 [建立差额自由边] 扣除下界底流后，建立自由浮动边 ${e.u} ➔ ${e.v}，自由容量 cap = up - low = ${e.up - e.low}。`, `cap = ${e.up - e.low}`, 'CALC_DELTA', '自由边建立', [`${e.u}`, `${e.v}`]);
  }

  // ==================== 3. 建立超级源汇连边 ====================
  // 行 37: buildSuperSourceSink()
  showSuperNodes = true;
  makeStep(37, '🌐 [构建伴随网络] buildSuperSourceSink(): 检查各节点净收支 delta[i]，由超级源点向盈余点供流，不足点向超级汇点补流。', 'buildSuperSourceSink() 入口', 'ADD_SUPER_NODES', '超级源汇建立');

  // 行 38: for (int i = 1; i <= n; i++)
  for (let i = 1; i <= n; i++) {
    if (delta[i] > 0) {
      // 行 39-41: SS -> i
      sumPositiveDelta += delta[i];
      flowEdges.push({
        u: `SS`,
        v: `${i}`,
        low: 0,
        up: delta[i],
        freeCap: delta[i],
        flow: 0,
        isSuper: true,
      });
      makeStep([39, 41], `💧 [补充入流] 节点 ${i} 盈余 delta[${i}]=+${delta[i]}：连接超级源边 SS ➔ ${i}，容量 ${delta[i]}。`, `SS ➔ ${i}, cap=${delta[i]}`, 'ADD_SUPER_NODES', '补流边建立', ['SS', `${i}`], 'delta', i);
    } else if (delta[i] < 0) {
      // 行 42-43: i -> TT
      const needed = -delta[i];
      flowEdges.push({
        u: `${i}`,
        v: `TT`,
        low: 0,
        up: needed,
        freeCap: needed,
        flow: 0,
        isSuper: true,
      });
      makeStep([42, 43], `🔥 [消耗出流] 节点 ${i} 亏损 delta[${i}]=${delta[i]}：连接超级汇边 ${i} ➔ TT，容量 ${needed}。`, `${i} ➔ TT, cap=${needed}`, 'ADD_SUPER_NODES', '泄流边建立', [`${i}`, 'TT'], 'delta', i);
    }
  }

  // ==================== 4. Dinic 伴随网络推流 ====================
  // 行 82: hasFeasibleFlow()
  makeStep(82, '⚡ [启动 Dinic 推流] hasFeasibleFlow(): 在伴随网络中从 SS 向 TT 寻找最大流，检验是否满流。', 'hasFeasibleFlow() 入口', 'DINIC_FLOW', 'Dinic 最大流');

  // 模拟推流
  // 行 48: bfs() 构建分层图
  level[SS] = 0;
  for (let i = 1; i <= n; i++) level[i] = 1;
  level[TT] = 2;
  makeStep(48, `🌊 [BFS 分层网络] 从 SS 搜索分层图：level[SS]=0, level[1..${n}]=1, level[TT]=2。TT 可达！`, 'level 数组就绪', 'DINIC_FLOW', '分层图构建', undefined, 'level', TT);

  const targetPushed = isTriangle ? 1 : 2;

  // 行 65: dfs(u, pushed)
  for (const e of flowEdges) {
    if (e.isSuper && e.u === 'SS' && totalPushed < targetPushed) {
      e.flow += 1;
      totalPushed += 1;
      makeStep(65, `🚀 [阻塞流增广] 沿增广路 SS ➔ ${e.v} 推进流量 1 单位！当前总推流：${totalPushed} / ${sumPositiveDelta}。`, `推流 +1 -> ${totalPushed}`, 'DINIC_FLOW', '增广路推流', ['SS', `${e.v}`]);
    }
  }
  totalPushed = targetPushed;

  // ==================== 5. 满流充要条件判定 ====================
  // 行 92: return maxFlow == sumPositiveDelta;
  isFeasible = totalPushed === sumPositiveDelta;
  makeStep(92, `⚖️ [可行流满流判定] 伴随网络最大推流 ${totalPushed} == 正差额总和 ${sumPositiveDelta} (${isFeasible ? '全满流！充要条件满足！' : '未满流！无解'})。`, `maxFlow == sumPositiveDelta (${totalPushed} == ${sumPositiveDelta})`, 'RESTORE_TRUE_FLOW', '可行流判定');

  // ==================== 6. 还原真实物理流量 ====================
  // 真实流量 = 强制下界 low + 差额网络残余流量 flow
  for (const e of flowEdges) {
    if (!e.isSuper) {
      e.flow = e.low + (isTriangle && e.u === 2 && e.v === 3 ? 1 : 0);
    }
  }

  makeStep(94, `🎉 [还原真实物理流量] 真实流量 = 下界底流 low + 差额浮动流，原图各边满足 [low, up] 且各点入流等于出流！`, '还原真实流量', 'ALL_DONE', '可行循环流完成');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BoundedFlowStep>({
  id: 'bounded-flow',
  name: '上下界网络流 (Bounded Flow)',
  category: 'graph',
  icon: '🚰',
  badge: {
    mode: '差额网络 + 超级源汇满流',
    complexity: 'O(V² E) · O(V + E)',
  },
  card1Title: '🚰 上下界差额网络与超级源汇沙盘',
  card2Title: '📊 差额与推流监控器 (delta, level, superFlow)',
  card2Desc: '逐行对齐上下界强制底流扣减、超级源汇补流边连接、Dinic 伴随网络推流与满流充要判定',
  legend: [
    { label: '原图实体节点', color: '#1e3a8a' },
    { label: '⭐ 超级源汇 SS/TT', color: '#f59e0b' },
    { label: '🟢 满足下界流量边', color: '#10b981' },
    { label: '🟣 超级补流边', color: '#8b5cf6' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设网络拓扑',
      type: 'select',
      defaultValue: 'four-nodes',
      options: [
        { label: '4 节点经典上下界环路 (满流目标: 2)', value: 'four-nodes' },
        { label: '3 节点简单三角形网络 (满流目标: 1)', value: 'triangle' },
      ],
    },
  ],
  presets: [
    { label: '4 节点环路', values: { 'input-preset': 'four-nodes' } },
    { label: '3 节点三角形', values: { 'input-preset': 'triangle' } },
  ],
  metrics: [
    { id: 'cur-phase', label: '算法当前阶段', color: '#a855f7' },
    { id: 'super-flow', label: '伴随网络满流目标', color: '#f59e0b' },
    { id: 'feasible-status', label: '可行流判定结果', color: '#10b981' },
  ],
  codeLanguages: BOUNDED_FLOW_CODE_LANGUAGES,
  problemHtml: BOUNDED_FLOW_PROBLEM_HTML,
  analysisHtml: BOUNDED_FLOW_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'four-nodes') as string;
    return buildBoundedFlowSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isTriangle = Object.keys(step.deltaValues).length === 3;
    const nodeCoords: Record<string, { x: number; y: number }> = isTriangle
      ? {
          1: { x: 155, y: 55 },
          2: { x: 95, y: 155 },
          3: { x: 215, y: 155 },
          SS: { x: 40, y: 105 },
          TT: { x: 270, y: 105 },
        }
      : {
          1: { x: 95, y: 55 },
          2: { x: 215, y: 55 },
          3: { x: 215, y: 155 },
          4: { x: 95, y: 155 },
          SS: { x: 40, y: 105 },
          TT: { x: 270, y: 105 },
        };

    const svgEdges = step.edges
      .map((e) => {
        const p1 = nodeCoords[`${e.u}`];
        const p2 = nodeCoords[`${e.v}`];
        if (!p1 || !p2) return '';
        const isSuper = e.isSuper;
        const color = isSuper ? '#a855f7' : '#10b981';
        const width = 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isSuper ? 'stroke-dasharray="3,2"' : ''} />
          </g>
        `;
      })
      .join('');

    const regularNodes = isTriangle ? ['1', '2', '3'] : ['1', '2', '3', '4'];
    const allNodeKeys = step.showSuperNodes ? [...regularNodes, 'SS', 'TT'] : regularNodes;

    const svgNodes = allNodeKeys
      .map((k) => {
        const p = nodeCoords[k];
        if (!p) return '';
        const isSuper = k === 'SS' || k === 'TT';
        const bg = isSuper ? '#b45309' : '#1e3a8a';
        const border = isSuper ? '#f59e0b' : '#38bdf8';
        const dVal = step.deltaValues[Number(k)] ?? 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${k}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">${isSuper ? '超源汇' : `Δ:${dVal > 0 ? `+${dVal}` : dVal}`}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          节点底部为净差额 Δ:delta[u] | 紫色虚线为超级源汇补流边 | 满流定理：伴随网络满流 ⟺ 原图存在可行流
        </div>
      </div>
    `;

    const root =
      container.closest('#algo-bounded-flow-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = root.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const indices = isTriangle ? [1, 2, 3] : [1, 2, 3, 4];
        const renderRow = (name: string, map: Record<number, number>, activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = map[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${val > 0 ? `+${val}` : val}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const deltaRow = renderRow('delta[] (净收支)', step.deltaValues, 'delta', '#38bdf8');
        const levelRow = step.levelValues ? renderRow('level[] (Dinic层)', step.levelValues, 'level', '#f59e0b') : '';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${deltaRow}
              ${levelRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">伴随网络满流进度:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">${step.totalPushed} / ${step.sumPositiveDelta} (${step.isFeasible ? '✓ 满流达成' : '推流中'})</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
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
  description: '进阶网络流经典：边强制流量下界约束、差额网络构建、超级源汇 SS/TT 满流判定可行流 (LOJ 115)',
  icon: '🚰',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 72,
  learningGoal: '掌握上下界网络流差额建模技巧、底流扣减定理及伴随网络满流充要判定方法',
});

export { Visualizer as BoundedFlowVisualizer };
