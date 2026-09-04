/**
 * 树上众数求和 (Tree Dominant Color - CF600E) 声明式可视化器
 * 进阶树论启发式合并: DSU on Tree 动态维护最值与频次和、轻重儿子判定
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (col, sz, son, cnt, ans) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_DOMINANT_CODE_LANGUAGES,
  TREE_DOMINANT_PROBLEM_HTML,
  TREE_DOMINANT_ANALYSIS_HTML,
} from './tree-dominant-color-problem-content';

export interface TreeDominantStep {
  curNode: number;
  nodeColors: Record<number, number>;
  heavySon: Record<number, number>;
  colorCount: Record<number, number>;
  maxFreq: number;
  sumColors: number;
  ans: Record<number, number>;
  szArray: number[];
  activeArray?: 'col' | 'sz' | 'son' | 'cnt' | 'ans';
  activeSlot?: number;
  status: 'init' | 'dfs_init' | 'heavy' | 'light' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildTreeDominantColorSteps(preset: string = 'cf600e_5node'): TreeDominantStep[] {
  const steps: TreeDominantStep[] = [];
  const isBicolor = preset === 'bicolor_5node';
  const n = 5;

  // 节点颜色定义
  // cf600e_5node: 1:1, 2:2, 3:1, 4:1, 5:3 -> ans: 1:1, 2:6, 3:1, 4:1, 5:3
  // bicolor_5node: 1:1, 2:2, 3:2, 4:2, 5:2 -> 众数为2, ans[1]=2
  const colors = isBicolor ? [0, 1, 2, 2, 2, 2] : [0, 1, 2, 1, 1, 3];

  const treeEdges: Array<[number, number]> = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
  ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of treeEdges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const sz: number[] = new Array(n + 1).fill(0);
  const son: number[] = new Array(n + 1).fill(0);
  const cnt: number[] = new Array(n + 1).fill(0);
  const ans: number[] = new Array(n + 1).fill(0);

  let maxCnt = 0;
  let sumColor = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'dfs_init' | 'heavy' | 'light' | 'update' | 'done',
    curNode: number = 1,
    activeArray?: 'col' | 'sz' | 'son' | 'cnt' | 'ans',
    activeSlot?: number
  ): void {
    const colMap: Record<number, number> = {};
    const sonMap: Record<number, number> = {};
    const cntMap: Record<number, number> = {};
    const ansMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      colMap[i] = colors[i];
      sonMap[i] = son[i];
      cntMap[i] = cnt[i];
      ansMap[i] = ans[i];
    }

    const phaseStr =
      status === 'done'
        ? '众数统计完成'
        : status === 'update'
          ? '频次桶更新与众数结算'
          : status === 'heavy'
            ? '重儿子递归 (keep=true)'
            : status === 'light'
              ? '轻儿子递归 (keep=false)'
              : status === 'dfs_init'
                ? '预处理子树大小与重儿子'
                : '初始化';

    steps.push({
      curNode,
      nodeColors: colMap,
      heavySon: sonMap,
      colorCount: cntMap,
      maxFreq: maxCnt,
      sumColors: sumColor,
      ans: ansMap,
      szArray: [...sz],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-root': `Node ${curNode}`,
        'metric-max-freq': `最高频次: ${maxCnt}`,
        'metric-sum-colors': `众数颜色和: ${sumColor}`,
        'metric-dominant-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 18: DominantColorSolver(n, colors)
  makeStep(18, `🚀 [算法初始化] DominantColorSolver(n=${n})：准备统计 5 节点树上各子树众数之和。`, `DominantColorSolver(${n})`, 'init', 1);

  // 行 22-26: 分配状态数组
  makeStep([22, 26], '📊 [分配状态数组] 拷贝颜色 col[]，分配 sz[], son[], cnt[], ans[] 数组。', '分配状态数组', 'init', 1);

  // 逐条加边
  for (const [u, v] of treeEdges) {
    makeStep(30, `🔗 [添加树边] addEdge(${u}, ${v})：连接无向树边 (${u}, ${v})。`, `addEdge(${u}, ${v})`, 'init', u);
  }

  // ==================== 2. 第一次 DFS：求子树大小 sz 与重儿子 son ====================
  function dfsInit(u: number, p: number): void {
    // 行 35-36: dfsInit(u, p), sz[u] = 1
    sz[u] = 1;
    makeStep(36, `📐 [子树初始化] sz[${u}] = 1; 访问节点 ${u}。`, `sz[${u}] = 1`, 'dfs_init', u, 'sz', u);

    // 行 37: 遍历邻居
    for (const v of adj[u]) {
      // 行 38: if (v != p)
      if (v !== p) {
        // 行 39: dfsInit(v, u);
        dfsInit(v, u);

        // 行 40: sz[u] += sz[v];
        sz[u] += sz[v];
        makeStep(40, `➕ [子树累加] sz[${u}] += sz[${v}] (${sz[v]}) -> sz[${u}] = ${sz[u]}。`, `sz[${u}] += sz[${v}]`, 'dfs_init', u, 'sz', u);

        // 行 41: if (sz[v] > sz[son[u]]) son[u] = v;
        if (sz[v] > sz[son[u]]) {
          son[u] = v;
          makeStep(41, `⭐ [确认重儿子] son[${u}] = ${v}；节点 ${v} 成为 ${u} 的重儿子！`, `son[${u}] = ${v}`, 'dfs_init', u, 'son', u);
        }
      }
    }
  }

  dfsInit(1, 0);

  // ==================== 3. 第二次 DFS：启发式合并维护众数 ====================
  function addNode(u: number, p: number, val: number, skipSon: number): void {
    const c = colors[u];
    // 行 47: cnt[col[u]] += val;
    cnt[c] += val;

    // 行 48-52: 动态更新 maxCnt 与 sumColor
    if (cnt[c] > maxCnt) {
      maxCnt = cnt[c];
      sumColor = c;
    } else if (cnt[c] === maxCnt && maxCnt > 0) {
      sumColor += c;
    }

    makeStep([47, 52], `🎨 [更新颜色桶] 节点 ${u} 色 ${c}：cnt[${c}] ${val > 0 ? '+' : '-'}= 1 -> 频次 ${cnt[c]}；当前最高频次=${maxCnt}，众数和=${sumColor}。`, `cnt[${c}] += ${val}`, 'update', u, 'cnt', c);

    for (const v of adj[u]) {
      if (v !== p && v !== skipSon) {
        addNode(v, u, val, skipSon);
      }
    }
  }

  function dfsSolve(u: number, p: number, keep: boolean): void {
    // 1. 递归所有轻儿子 (不保留数据)
    for (const v of adj[u]) {
      if (v !== p && v !== son[u]) {
        makeStep(61, `🍃 [深入轻儿子] dfsSolve(${v}, keep=false): 递归轻子树 ${v}，数据算完即清空。`, `递归轻儿子 ${v}`, 'light', v);
        dfsSolve(v, u, false);
      }
    }

    // 2. 递归重儿子 (保留数据)
    if (son[u] !== 0) {
      makeStep(63, `👑 [深入重儿子] dfsSolve(${son[u]}, keep=true): 递归重子树 ${son[u]}，数据完整保留在桶中！`, `递归重儿子 ${son[u]}`, 'heavy', son[u]);
      dfsSolve(son[u], u, true);
    }

    // 3. 暴力合并轻子树贡献与自身
    // 行 65: addNode(u, p, 1, son[u]);
    makeStep(65, `⚡ [合并轻子树] 遍历节点 ${u} 及所有轻子树节点颜色，加入全局频次桶。`, `合并轻子树至 ${u}`, 'update', u);
    addNode(u, p, 1, son[u]);

    // 4. 记录答案
    // 行 66: ans[u] = sumColor;
    ans[u] = sumColor;
    makeStep(66, `📝 [记录众数答案] ans[${u}] = sumColor = ${sumColor}！子树 ${u} 众数求和完毕！`, `ans[${u}] = ${sumColor}`, 'update', u, 'ans', u);

    // 5. 若是轻儿子，回溯清空本子树
    if (!keep) {
      // 行 69-70: 清空
      makeStep([69, 70], `🧹 [清空轻子树] addNode(${u}, -1, 0); maxCnt = 0; sumColor = 0; 回溯撤销子树 ${u} 贡献。`, `清空子树 ${u}`, 'update', u);
      addNode(u, p, -1, 0);
      maxCnt = 0;
      sumColor = 0;
    }
  }

  dfsSolve(1, 0, true);

  // 终态
  makeStep(66, `🎉 [树上众数求解完成] DSU on Tree 合并统计完毕！各节点众数之和：${Array.from({ length: n }, (_, i) => `ans[${i + 1}]=${ans[i + 1]}`).join(', ')}！`, '求解完成', 'done', 1);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreeDominantStep>({
  id: 'tree-dominant-color',
  name: '树上众数求和 (Tree Dominant Color)',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: 'DSU on Tree + 动态众数和',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌳 树形拓扑与节点颜色沙盘',
  card2Title: '📊 DSU 多数组 (col, sz, son, cnt, ans) 实时监控器',
  card2Desc: '逐行对齐重儿子子树保留 (keep=true)、轻儿子回溯清空 (keep=false) 与颜色频次桶动态最值维护',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 当前操作节点', color: '#f59e0b' },
    { label: '👑 重儿子 (Heavy)', color: '#f59e0b' },
    { label: '🟡 重边 (实线)', color: '#facc15' },
    { label: '⚪ 轻边 (虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树结构',
      type: 'select',
      defaultValue: 'cf600e_5node',
      options: [
        { label: 'CF600E 经典 5 节点 (ans: 1, 6, 1, 1, 3)', value: 'cf600e_5node' },
        { label: '双色交错树 (根节点众数为 2)', value: 'bicolor_5node' },
      ],
    },
  ],
  presets: [
    { label: 'CF600E 经典 5 节点', values: { 'input-preset': 'cf600e_5node' } },
    { label: '双色交错树', values: { 'input-preset': 'bicolor_5node' } },
  ],
  metrics: [
    { id: 'metric-cur-root', label: '当前子树根', color: '#f59e0b' },
    { id: 'metric-max-freq', label: '最高出现频次', color: '#10b981' },
    { id: 'metric-sum-colors', label: '当前众数颜色和', color: '#38bdf8' },
    { id: 'metric-dominant-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TREE_DOMINANT_CODE_LANGUAGES,
  problemHtml: TREE_DOMINANT_PROBLEM_HTML,
  analysisHtml: TREE_DOMINANT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'cf600e_5node') as string;
    return buildTreeDominantColorSteps(preset);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 40 },
      2: { x: 95, y: 105 },
      3: { x: 215, y: 105 },
      4: { x: 55, y: 170 },
      5: { x: 135, y: 170 },
    };

    const treeEdges = [
      [1, 2],
      [1, 3],
      [2, 4],
      [2, 5],
    ];

    const colorPalettes: Record<number, string> = {
      1: '#38bdf8', // 蓝色
      2: '#ec4899', // 粉色
      3: '#10b981', // 绿色
    };

    const svgEdges = treeEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isHeavy = step.heavySon[u] === v;
        const color = isHeavy ? '#facc15' : '#475569';
        const width = isHeavy ? 3.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isHeavy ? '' : 'stroke-dasharray="4,2"'} />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const c = step.nodeColors[u] || 1;
        const colBg = colorPalettes[c] || '#64748b';
        const ansVal = step.ans[u] || 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${colBg}" stroke="${isCur ? '#facc15' : '#ffffff'}" stroke-width="${isCur ? 3.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">色${c} ans:${ansVal}</text>
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
          节点底部为 节点颜色与当前已结算的众数之和 ans[u] | 金色实线为重边 (Heavy Edge)
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-tree-dominant-color-view') ||
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
        const indices = [1, 2, 3, 4, 5];
        const renderRow = (name: string, arr: any[] | Record<number, number>, activeName: string, color: string) => {
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

        const szRow = renderRow('sz[] (子树大小)', step.szArray, 'sz', '#38bdf8');
        const cntRow = renderRow('cnt[] (颜色频次)', step.colorCount, 'cnt', '#10b981');
        const ansRow = renderRow('ans[] (众数和)', step.ans, 'ans', '#f59e0b');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${szRow}
              ${cntRow}
              ${ansRow}
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
  id: 'tree-dominant-color',
  name: '树上众数求和 (Tree Dominant Color)',
  viewId: 'algo-tree-dominant-color-view',
  category: 'graph',
  description: '进阶树论启发式合并：DSU on Tree 树链剖分、动态维护桶内最高频次与众数颜色和 (CF600E)',
  icon: '🌳',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '掌握 DSU on Tree 维护子树众数方法、O(1) 动态调整最大频次与消除撤销开销技巧',
});

export { Visualizer as TreeDominantColorVisualizer };
