/**
 * Prufer 序列双向转换 (Prufer Sequence & Cayley) 声明式可视化器
 * 组合图论: 树到 Prufer 序列的双向一一双射、O(N) 线性双指针编解码、Cayley 定理 (洛谷 P6086)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (parent, deg, prufer) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PRUFER_CODE_LANGUAGES,
  PRUFER_PROBLEM_HTML,
  PRUFER_ANALYSIS_HTML,
} from './prufer-sequence-problem-content';

export interface PruferStep {
  curLeaf: number;
  pruferSequence: number[];
  degMap: Record<number, number>;
  parentMap: Record<number, number>;
  activeEdge?: [number, number];
  removedEdges: Array<{ u: number; v: number }>;
  degArray: number[];
  parentArray: number[];
  activeArray?: 'deg' | 'parent' | 'prufer';
  activeSlot?: number;
  status: 'init' | 'deg_calc' | 'find_leaf' | 'append' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildPruferSteps(preset: string = 'star_4node'): PruferStep[] {
  const steps: PruferStep[] = [];
  const isLine = preset === 'line_4node';
  const n = 4;

  // 树结构定义 (以 n=4 为根建立有向父子关系)
  // star_4node: 节点 1 为中心，连接 2, 3, 4；以 4 为根则 parent[1]=4, parent[2]=1, parent[3]=1
  // 标准题目设定：若树有 4 点，Prufer 长度为 2
  // star_4node: 删 2 记 1，删 3 记 1 -> prufer = [1, 1]
  // line_4node: 1-2-3-4 -> 删 1 记 2，删 2 记 3 -> prufer = [2, 3]
  const parent = isLine ? [0, 2, 3, 4, 0] : [0, 4, 1, 1, 0];
  const deg = new Array(n + 1).fill(0);
  const prufer: number[] = [];
  const removedEdges: Array<{ u: number; v: number }> = [];

  let curLeaf = 1;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'deg_calc' | 'find_leaf' | 'append' | 'done',
    activeEdge?: [number, number],
    activeArray?: 'deg' | 'parent' | 'prufer',
    activeSlot?: number
  ): void {
    const degRecord: Record<number, number> = {};
    const parentRecord: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      degRecord[i] = deg[i];
      parentRecord[i] = parent[i];
    }

    const pSeqStr = prufer.length > 0 ? `[${prufer.join(', ')}]` : '[]';
    const phaseStr =
      status === 'done'
        ? 'Prufer 序列生成完毕'
        : status === 'append'
          ? '记录父节点至 Prufer'
          : status === 'find_leaf'
            ? '扫描最小编号叶子'
            : status === 'deg_calc'
              ? '统计各点度数'
              : '编解码器初始化';

    steps.push({
      curLeaf,
      pruferSequence: [...prufer],
      degMap: degRecord,
      parentMap: parentRecord,
      activeEdge,
      removedEdges: removedEdges.map((e) => ({ ...e })),
      degArray: [...deg],
      parentArray: [...parent],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-leaf': `Leaf ${curLeaf}`,
        'metric-prufer-seq': pSeqStr,
        'metric-cayley-count': `Cayley 计数: n^(n-2) = ${Math.pow(n, n - 2)}`,
        'metric-prufer-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 16: Codec(int n)
  makeStep(16, `🚀 [算法初始化] Codec(n=${n})：构造 Prufer 编解码器，设置节点总数 n = ${n}。`, `Codec(${n})`, 'init');

  // 行 17: parent 数组
  makeStep(17, '📊 [分配父节点数组] parent = new int[n + 1]; 记录树中各节点的父指针。', '分配 parent 数组', 'init', undefined, 'parent');

  // 行 18: deg 数组
  makeStep(18, '📊 [分配度数数组] deg = new int[n + 1]; 维护无根树中各节点的剩余连边度数。', '分配 deg 数组', 'init', undefined, 'deg');

  // 行 19: prufer 数组
  makeStep(19, `📊 [分配 Prufer 数组] prufer = new int[n - 2] (长度为 ${n - 2}); 准备容纳消除序列。`, '分配 prufer 数组', 'init', undefined, 'prufer');

  // ==================== 2. 统计各点出度/儿子数 ====================
  // 行 24: treeToPrufer(int[] p)
  makeStep(24, '⚡ [启动树转 Prufer] treeToPrufer(): 双指针线性扫描度数为 0 的最小编号叶节点。', 'treeToPrufer() 入口', 'deg_calc');

  // 行 25: 拷贝父节点
  makeStep(25, '📋 [拷贝原树父节点] 载入原树父节点拓扑结构。', '载入 parent[]', 'deg_calc', undefined, 'parent');

  // 行 26: Arrays.fill(deg, 0);
  makeStep(26, '🧹 [度数清零] deg 数组初始化清空。', 'Arrays.fill(deg, 0)', 'deg_calc');

  // 行 27: for (int i = 1; i < n; i++) deg[parent[i]]++;
  for (let i = 1; i < n; i++) {
    const fa = parent[i];
    deg[fa]++;
    makeStep(27, `✏️ [度数累加] 节点 ${i} 的父亲是 ${fa}：deg[${fa}]++ -> ${deg[fa]}。`, `deg[${fa}]++`, 'deg_calc', [i, fa], 'deg', fa);
  }

  // ==================== 3. 线性双指针删除叶节点并输出 Prufer ====================
  // 行 29: int pIdx = 0;
  makeStep(29, '📍 [初始化序列写入指针] pIdx = 0; 准备向 Prufer 数组写入元素。', 'pIdx = 0', 'find_leaf');

  // 行 30: for (int i = 1, ptr = 1; i <= n - 2; i++)
  makeStep(30, '👉 [初始化双指针扫描位置] ptr = 1; 从编号为 1 的最小节点开始扫描度数。', 'ptr = 1', 'find_leaf');
  let ptr = 1;
  for (let i = 1; i <= n - 2; i++) {
    // 行 31: while (deg[ptr] > 0) ptr++;
    while (deg[ptr] > 0) {
      makeStep(31, `🔍 [寻找叶子] 节点 ${ptr} 当前 deg[${ptr}]=${deg[ptr]} > 0 (非叶子)，双指针推进 ptr++。`, `ptr=${ptr} 非叶子`, 'find_leaf', undefined, 'deg', ptr);
      ptr++;
    }

    curLeaf = ptr;
    makeStep(31, `🍃 [定位最小叶子] 找到当前编号最小的叶节点：Node ${ptr} (deg=0)！`, `找到叶子 ${ptr}`, 'find_leaf', undefined, 'deg', ptr);

    // 行 32: int fa = parent[ptr];
    let fa = parent[ptr];
    makeStep(32, `📌 [获取父节点] 叶节点 ${ptr} 的父节点为 fa = parent[${ptr}] = ${fa}。`, `fa = parent[${ptr}] = ${fa}`, 'append', [ptr, fa], 'parent', ptr);

    // 行 33: prufer[pIdx++] = fa;
    prufer.push(fa);
    removedEdges.push({ u: ptr, v: fa });
    makeStep(33, `📝 [追加序列] 删去叶节点 ${ptr}，将其父节点 ${fa} 写入 Prufer 序列：${JSON.stringify(prufer)}！`, `写入 prufer: ${fa}`, 'append', [ptr, fa], 'prufer', prufer.length - 1);

    // 行 34: while (i <= n - 2 && --deg[fa] == 0 && fa < ptr)
    deg[fa]--;
    makeStep(34, `📉 [父节点度数减 1] --deg[${fa}] -> ${deg[fa]}。`, `--deg[${fa}] = ${deg[fa]}`, 'append', undefined, 'deg', fa);

    if (prufer.length < n - 2 && deg[fa] === 0 && fa < ptr) {
      curLeaf = fa;
      prufer.push(parent[fa]);
      removedEdges.push({ u: fa, v: parent[fa] });
      makeStep([35, 37], `🔄 [级联产生更小叶子] fa=${fa} < ptr=${ptr} 且 deg[${fa}] 归零！直接删去 ${fa} 并写入 parent[${fa}]=${parent[fa]}！`, `写入 prufer: ${parent[fa]}`, 'append', [fa, parent[fa]]);
      fa = parent[fa];
      i++;
    }

    ptr++;
  }

  // 行 41: return prufer;
  makeStep(41, `🎉 [Prufer 序列构建完成] 最终生成的 Prufer 序列为：${JSON.stringify(prufer)} (长度严格为 n-2 = ${n - 2})！`, 'Prufer 序列生成完毕', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PruferStep>({
  id: 'prufer-sequence',
  name: 'Prufer 序列与 Cayley 公式 (Prufer Sequence)',
  viewId: 'algo-prufer-sequence-view',
  category: 'graph',
  icon: '🔤',
  badge: {
    mode: 'O(N) 线性双指针双向编解码',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🔤 树形拓扑、叶节点消除与 Prufer 序列沙盘',
  card2Title: '📊 编码多数组 (parent, deg, prufer) 监控器',
  card2Desc: '逐行对齐度数统计 deg[]、双指针定位最小叶节点、消除叶节点与父节点推入 Prufer 序列',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 当前最小叶子', color: '#10b981' },
    { label: '📌 父节点 (写入 Prufer)', color: '#f59e0b' },
    { label: '⚪ 树边', color: '#38bdf8' },
    { label: '❌ 已删除边 (红虚线)', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树结构',
      type: 'select',
      defaultValue: 'star_4node',
      options: [
        { label: '4 节点星型图 (Prufer: [1, 1])', value: 'star_4node' },
        { label: '4 节点单链 (Prufer: [2, 3])', value: 'line_4node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点星型图', values: { 'input-preset': 'star_4node' } },
    { label: '4 节点单链', values: { 'input-preset': 'line_4node' } },
  ],
  metrics: [
    { id: 'metric-cur-leaf', label: '当前删除叶子', color: '#10b981' },
    { id: 'metric-prufer-seq', label: '当前 Prufer 序列', color: '#f59e0b' },
    { id: 'metric-cayley-count', label: 'Cayley 生成树数', color: '#38bdf8' },
    { id: 'metric-prufer-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: PRUFER_CODE_LANGUAGES,
  problemHtml: PRUFER_PROBLEM_HTML,
  analysisHtml: PRUFER_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'star_4node') as string;
    return buildPruferSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isLine = step.parentMap[1] === 2;
    const nodeCoords: Record<number, { x: number; y: number }> = isLine
      ? {
          1: { x: 60, y: 105 },
          2: { x: 125, y: 105 },
          3: { x: 190, y: 105 },
          4: { x: 255, y: 105 },
        }
      : {
          1: { x: 155, y: 105 },
          2: { x: 75, y: 60 },
          3: { x: 75, y: 150 },
          4: { x: 245, y: 105 },
        };

    const initialEdges = isLine
      ? [
          [1, 2],
          [2, 3],
          [3, 4],
        ]
      : [
          [2, 1],
          [3, 1],
          [1, 4],
        ];

    const svgEdges = initialEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isRemoved = step.removedEdges.some((re) => (re.u === u && re.v === v) || (re.u === v && re.v === u));
        const isAct = step.activeEdge && ((step.activeEdge[0] === u && step.activeEdge[1] === v) || (step.activeEdge[0] === v && step.activeEdge[1] === u));

        const color = isAct ? '#f59e0b' : isRemoved ? '#ef4444' : '#38bdf8';
        const width = isAct ? 3.5 : isRemoved ? 1.5 : 2;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isRemoved ? 'stroke-dasharray="3,2"' : ''} />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isLeaf = step.curLeaf === u;
        const degVal = step.degMap[u] ?? 0;
        const bg = isLeaf ? '#065f46' : '#1e3a8a';
        const border = isLeaf ? '#10b981' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isLeaf ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">deg:${degVal}</text>
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
          绿色为当前被移除的最小叶节点 (deg=0) | 红色虚线为已删除边 | Cayley 定理：n 个顶点的有标号生成树恰好有 n^(n-2) 种
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-prufer-sequence-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const indices = [1, 2, 3, 4];
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
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

        const parentRow = renderRow('parent[] (父节点)', step.parentArray, 'parent', '#38bdf8');
        const degRow = renderRow('deg[] (子树度数)', step.degArray, 'deg', '#10b981');
        const pSeqStr = step.pruferSequence.length > 0 ? `[ ${step.pruferSequence.join(', ')} ]` : '[ ]';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${parentRow}
              ${degRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">Prufer 序列输出:</span>
                <strong style="color: #facc15; font-family: monospace; font-size: 10.5px;">${pSeqStr}</strong>
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
  id: 'prufer-sequence',
  name: 'Prufer 序列与 Cayley 公式 (Prufer Sequence)',
  viewId: 'algo-prufer-sequence-view',
  category: 'graph',
  description: '组合图论经典：无根树与 Prufer 序列的双射双向转换、O(N) 线性双指针、Cayley 公式 n^(n-2) 定理 (洛谷 P6086)',
  icon: '🔤',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 79,
  learningGoal: '掌握 Prufer 序列与无根树的双射关系、线性双指针构造及在完全图生成树计数中的应用',
});

export { Visualizer as PruferSequenceVisualizer };
