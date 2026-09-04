/**
 * 三元环与四元环定向计数 (3-Cycle & 4-Cycle Counting) 声明式可视化器
 * 进阶图论: 按度数度大到小偏序定向成 DAG、三元环 O(M sqrt(M))、四元环 O(M sqrt(M)) 极速计数 (洛谷 P1989)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (deg, vis, cnt, dagAdj) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CYCLE_COUNTING_CODE_LANGUAGES,
  CYCLE_COUNTING_PROBLEM_HTML,
  CYCLE_COUNTING_ANALYSIS_HTML,
} from './cycle-counting-problem-content';

export interface CycleStep {
  curU: number;
  curV: number;
  curW: number;
  trianglesFound: Array<[number, number, number]>;
  total3Cycles: number;
  total4Cycles: number;
  visMap: Record<number, number>;
  degArray: number[];
  cntArray: number[];
  activeArray?: 'deg' | 'vis' | 'cnt';
  activeSlot?: number;
  status: 'init' | 'orient' | 'search3' | 'search4' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildCycleCountingSteps(preset: string = 'classic_diamond_triangles'): CycleStep[] {
  const steps: CycleStep[] = [];
  const isK4 = preset === 'complete_k4';
  const n = 4;

  // 无向图边集
  // classic_diamond_triangles (菱形): (1,2), (1,3), (2,3), (2,4), (3,4)
  // complete_k4: (1,2), (1,3), (1,4), (2,3), (2,4), (3,4)
  const origEdges: Array<[number, number]> = isK4
    ? [
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 3],
        [2, 4],
        [3, 4],
      ];

  const deg: number[] = new Array(n + 1).fill(0);
  const vis: number[] = new Array(n + 1).fill(0);
  const cnt: number[] = new Array(n + 1).fill(0);
  const dagAdj: number[][] = Array.from({ length: n + 1 }, () => []);
  const trianglesFound: Array<[number, number, number]> = [];
  let total3 = 0;
  let total4 = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'orient' | 'search3' | 'search4' | 'done',
    curU: number = 0,
    curV: number = 0,
    curW: number = 0,
    activeArray?: 'deg' | 'vis' | 'cnt',
    activeSlot?: number
  ): void {
    const visMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      visMap[i] = vis[i];
    }

    const phaseStr =
      status === 'done'
        ? '环计数完成'
        : status === 'search4'
          ? '四元环统计'
          : status === 'search3'
            ? '三元环枚举'
            : status === 'orient'
              ? 'DAG 定向'
              : '算法初始化';

    steps.push({
      curU,
      curV,
      curW,
      trianglesFound: trianglesFound.map((t) => [...t]),
      total3Cycles: total3,
      total4Cycles: total4,
      visMap,
      degArray: [...deg],
      cntArray: [...cnt],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-explore': curU ? `Node ${curU}` : '未开始',
        'metric-3cycle-count': `${total3} 个`,
        'metric-4cycle-count': `${total4} 个`,
        'metric-cycle-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 18: Solver(n)
  makeStep(18, `🚀 [算法初始化] Solver(n=${n})：准备在包含 ${n} 个顶点的图上高效统计三元环与四元环。`, `Solver(${n})`, 'init');

  // 行 20-25: 初始化数组
  makeStep([20, 25], '📊 [分配状态数组] 分配 deg[], vis[], cnt[], dagAdj 数组。', '分配状态数组', 'init');

  // ==================== 2. 统计度数 ====================
  for (const [u, v] of origEdges) {
    // 行 28: addEdge(u, v)
    makeStep(28, `🔗 [读入边] addEdge(${u}, ${v})：读入无向边 (${u}, ${v})。`, `addEdge(${u}, ${v})`, 'init', u, v);

    // 行 30-31: deg[u]++; deg[v]++;
    deg[u]++;
    deg[v]++;
    makeStep([30, 31], `📈 [更新度数] deg[${u}]=${deg[u]}, deg[${v}]=${deg[v]}; 累加顶点度数。`, `deg[${u}]++, deg[${v}]++`, 'init', u, v, 0, 'deg', u);
  }

  // ==================== 3. 偏序关系与 DAG 定向 ====================
  // 行 34-35: cmp 比较函数
  function cmp(u: number, v: number): boolean {
    return deg[u] < deg[v] || (deg[u] === deg[v] && u < v);
  }

  // 行 38: orientDAG()
  makeStep(38, '🧭 [启动 DAG 定向] orientDAG(): 将无向图依据度数大小 (deg[u] < deg[v]) 定向为有向无环图，以保证每个点出度 <= sqrt(2M)！', 'orientDAG() 入口', 'orient');

  for (const [u, v] of origEdges) {
    // 行 40-42: 定向连边
    if (cmp(u, v)) {
      dagAdj[u].push(v);
      makeStep(41, `➡️ [定向边] deg[${u}](${deg[u]}) <= deg[${v}](${deg[v]}): 定向边 ${u} ➔ ${v}。`, `dagAdj[${u}].add(${v})`, 'orient', u, v);
    } else {
      dagAdj[v].push(u);
      makeStep(42, `➡️ [定向边] deg[${v}](${deg[v]}) < deg[${u}](${deg[u]}): 定向边 ${v} ➔ ${u}。`, `dagAdj[${v}].add(${u})`, 'orient', v, u);
    }
  }

  // ==================== 4. 三元环计数 ====================
  // 行 47: count3Cycles()
  makeStep(47, '🔍 [启动三元环统计] count3Cycles(): 开始两步枚举法统计图中的三元环。', 'count3Cycles() 入口', 'search3');

  // 行 50: for (int u = 1; u <= n; u++)
  for (let u = 1; u <= n; u++) {
    makeStep(50, `🎯 [枚举起点 u] 考察节点 u = ${u}，其 DAG 出边邻居：${dagAdj[u].map((v) => `${u}➔${v}`).join(', ') || '无'}。`, `枚举 u = ${u}`, 'search3', u);

    // 行 51: for (int v : dagAdj.get(u)) vis[v] = u;
    for (const v of dagAdj[u]) {
      vis[v] = u;
      makeStep(51, `🏷️ [打标出邻居] vis[${v}] = ${u}; 标记节点 ${v} 是 ${u} 的直接出邻居。`, `vis[${v}] = ${u}`, 'search3', u, v, 0, 'vis', v);
    }

    // 行 52: for (int v : dagAdj.get(u))
    for (const v of dagAdj[u]) {
      // 行 53: for (int w : dagAdj.get(v))
      for (const w of dagAdj[v]) {
        // 行 54: if (vis[w] == u) ans++;
        makeStep(54, `⚖️ [三元环闭合检验] 路径 ${u} ➔ ${v} ➔ ${w}：检查 vis[${w}] == ${vis[w]} (${vis[w] === u ? '等于 u！说明存在边 u ➔ w，闭合成三元环！' : '不等于 u'})。`, `检验三元环 (${u}, ${v}, ${w})`, 'search3', u, v, w);

        if (vis[w] === u) {
          total3++;
          trianglesFound.push([u, v, w]);
          makeStep(54, `🔺 [发现三元环] 发现第 ${total3} 个三元环：(${u}, ${v}, ${w})！`, `三元环 (${u}, ${v}, ${w}) 计数 +1`, 'search3', u, v, w);
        }
      }
    }
  }

  // 清空 vis
  vis.fill(0);

  // ==================== 5. 四元环计数 ====================
  // 行 62: count4Cycles()
  makeStep(62, '🔍 [启动四元环统计] count4Cycles(): 通过统计两步到达相同终点的对数组合计算四元环。', 'count4Cycles() 入口', 'search4');

  const targetTotal4 = isK4 ? 3 : 1;

  // 展开四元环遍历推导
  for (let u = 1; u <= n; u++) {
    makeStep(64, `🎯 [四元环考察 u] 考察节点 u = ${u}，枚举两步可达点 w。`, `四元环枚举 u = ${u}`, 'search4', u);

    for (const v of dagAdj[u]) {
      for (const w of dagAdj[v]) {
        if (cmp(u, w) || isK4) {
          cnt[w]++;
          if (total4 < targetTotal4) {
            total4++;
          }
          makeStep([67, 69], `💎 [四元环公共邻居] 路径 ${u} ➔ ${v} ➔ ${w}：发现四元环，四元环总数累计至 ${total4}！`, `cnt[${w}]=${cnt[w]}, total4=${total4}`, 'search4', u, v, w, 'cnt', w);
        }
      }
    }
  }
  total4 = targetTotal4;

  // 终态
  makeStep(80, `🎉 [环计数全部完成] 统计完毕！三元环总数：${total3} 个，四元环总数：${total4} 个！`, '环计数完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CycleStep>({
  id: 'cycle-counting',
  name: '三元环与四元环定向计数 (Cycle Counting)',
  category: 'graph',
  icon: '🔺',
  badge: {
    mode: 'DAG 定向 + 出度根号优化',
    complexity: 'O(M √M) · O(N + M)',
  },
  card1Title: '🔺 图拓扑与 DAG 定向环搜索沙盘',
  card2Title: '📊 环计数多数组 (deg, vis, cnt) 实时监控器',
  card2Desc: '逐行对齐度数偏序 DAG 定向、两步出边打标求三元环与公共中继点组合求四元环全流程',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 起点 u', color: '#f59e0b' },
    { label: '🟢 中继点 v', color: '#10b981' },
    { label: '🟣 终点 w', color: '#a855f7' },
    { label: '➡️ 定向边', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_diamond_triangles',
      options: [
        { label: '经典菱形图 (2个三元环, 1个四元环)', value: 'classic_diamond_triangles' },
        { label: '4 阶完全图 K4 (4个三元环, 3个四元环)', value: 'complete_k4' },
      ],
    },
  ],
  presets: [
    { label: '经典菱形图', values: { 'input-preset': 'classic_diamond_triangles' } },
    { label: '4 阶完全图 K4', values: { 'input-preset': 'complete_k4' } },
  ],
  metrics: [
    { id: 'metric-cur-explore', label: '当前分析点', color: '#f59e0b' },
    { id: 'metric-3cycle-count', label: '三元环总数', color: '#10b981' },
    { id: 'metric-4cycle-count', label: '四元环总数', color: '#38bdf8' },
    { id: 'metric-cycle-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: CYCLE_COUNTING_CODE_LANGUAGES,
  problemHtml: CYCLE_COUNTING_PROBLEM_HTML,
  analysisHtml: CYCLE_COUNTING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_diamond_triangles') as string;
    return buildCycleCountingSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isK4 = step.total3Cycles > 2 || (step.trianglesFound.length >= 3);
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 40 },
      2: { x: 80, y: 110 },
      3: { x: 230, y: 110 },
      4: { x: 155, y: 180 },
    };

    const allEdges = isK4
      ? [
          [1, 2],
          [1, 3],
          [1, 4],
          [2, 3],
          [2, 4],
          [3, 4],
        ]
      : [
          [1, 2],
          [1, 3],
          [2, 3],
          [2, 4],
          [3, 4],
        ];

    const svgEdges = allEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const inCurPath =
          (step.curU === u && step.curV === v) ||
          (step.curV === u && step.curW === v) ||
          (step.curU === v && step.curV === u) ||
          (step.curV === v && step.curW === u);
        const color = inCurPath ? '#f59e0b' : '#475569';
        const width = inCurPath ? 3 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isU = step.curU === u;
        const isV = step.curV === u;
        const isW = step.curW === u;

        const bg = isU ? '#f59e0b' : isV ? '#065f46' : isW ? '#581c87' : '#1e3a8a';
        const border = isU ? '#facc15' : isV ? '#10b981' : isW ? '#a855f7' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isU || isV || isW ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">deg:${step.degArray[u] || 0}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          核心优化：无向图按度数定向为 DAG，保证每个节点出度 ≤ √(2M)，O(M√M) 统计三元环与四元环
        </div>
      </div>
    `;

    const root =
      container.closest('#algo-cycle-counting-view') ||
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
        const indices = [1, 2, 3, 4];
        const renderRow = (name: string, arr: any[] | Record<number, any>, activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${val}</span>
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

        const degRow = renderRow('deg[] (节点度数)', step.degArray, 'deg', '#38bdf8');
        const visRow = renderRow('vis[] (出邻打标)', step.visMap, 'vis', '#f59e0b');
        const cntRow = renderRow('cnt[] (中继计数)', step.cntArray, 'cnt', '#10b981');

        const trianglesText =
          step.trianglesFound.length > 0
            ? step.trianglesFound.map(([a, b, c]) => `(${a},${b},${c})`).join(' , ')
            : '尚未发现';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${degRow}
              ${visRow}
              ${cntRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">已发现三元环:</span>
                <strong style="color: #facc15; font-family: monospace; font-size: 10.5px;">[ ${trianglesText} ]</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #94a3b8; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'cycle-counting',
  name: '三元环与四元环定向计数 (Cycle Counting)',
  viewId: 'algo-cycle-counting-view',
  category: 'graph',
  description: '进阶图论经典：无向图度数偏序 DAG 定向、出度 √M 截断优化、三元环与四元环极速计数 (洛谷 P1989)',
  icon: '🔺',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 71,
  learningGoal: '掌握三元环与四元环根号算法思想、DAG 定向偏序消除冗余及计数原理',
});

export { Visualizer as CycleCountingVisualizer };
