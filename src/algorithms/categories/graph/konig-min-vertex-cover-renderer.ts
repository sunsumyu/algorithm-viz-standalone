/**
 * 二分图最小点覆盖与 König 定理 (König's Theorem - Min Vertex Cover) 声明式可视化器
 * 进阶匹配理论: 最大匹配数 = 最小点覆盖数、未匹配点交错路 DFS 染色提取覆盖集与最大独立集 (洛谷 P6062)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (matchL, matchR, visL, visR) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  KONIG_COVER_CODE_LANGUAGES,
  KONIG_COVER_PROBLEM_HTML,
  KONIG_COVER_ANALYSIS_HTML,
} from './konig-min-vertex-cover-problem-content';

export interface KonigStep {
  matchedEdges: Array<[string, string]>;
  visitedLeft: string[];
  visitedRight: string[];
  coverSet: string[];
  independentSet?: string[];
  curAlternatingPath?: string[];
  activeEdge?: [string, string];
  matchLArray: number[];
  matchRArray: number[];
  visLArray: boolean[];
  visRArray: boolean[];
  activeArray?: 'matchL' | 'matchR' | 'visL' | 'visR';
  activeSlot?: number;
  status: 'init' | 'match' | 'alternating' | 'cover' | 'independent' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildKonigSteps(preset: string = 'classic'): KonigStep[] {
  const steps: KonigStep[] = [];
  const isClassic = preset === 'classic';

  // 经典图: 左 4 右 3；简单图: 左 3 右 2
  const n = isClassic ? 4 : 3;
  const m = isClassic ? 3 : 2;

  // 有向二分边 [u, v] (u 在左 1..n, v 在右 1..m)
  // classic: L1-R1, L2-R1, L2-R2, L3-R2, L4-R3
  // simple: L1-R1, L2-R2, L3-R1
  const edges: Array<[number, number]> = isClassic
    ? [
        [1, 1],
        [2, 1],
        [2, 2],
        [3, 2],
        [4, 3],
      ]
    : [
        [1, 1],
        [2, 2],
        [3, 1],
      ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  const matchL: number[] = new Array(n + 1).fill(0);
  const matchR: number[] = new Array(m + 1).fill(0);
  const vis: boolean[] = new Array(m + 1).fill(false);
  const visL: boolean[] = new Array(n + 1).fill(false);
  const visR: boolean[] = new Array(m + 1).fill(false);
  const coverSet: string[] = [];
  const independentSet: string[] = [];

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'match' | 'alternating' | 'cover' | 'independent' | 'done',
    activeEdge?: [string, string],
    activeArray?: 'matchL' | 'matchR' | 'visL' | 'visR',
    activeSlot?: number
  ): void {
    const matched: Array<[string, string]> = [];
    for (let u = 1; u <= n; u++) {
      if (matchL[u] > 0) {
        matched.push([`L${u}`, `R${matchL[u]}`]);
      }
    }

    const vL: string[] = [];
    for (let u = 1; u <= n; u++) if (visL[u]) vL.push(`L${u}`);

    const vR: string[] = [];
    for (let v = 1; v <= m; v++) if (visR[v]) vR.push(`R${v}`);

    const phaseStr =
      status === 'done'
        ? '求解完成'
        : status === 'independent'
          ? '构造最大独立集'
          : status === 'cover'
            ? '构造最小点覆盖'
            : status === 'alternating'
              ? '交错路 DFS 染色'
              : status === 'match'
                ? '匈牙利最大匹配'
                : '初始化';

    steps.push({
      matchedEdges: matched,
      visitedLeft: vL,
      visitedRight: vR,
      coverSet: [...coverSet],
      independentSet: [...independentSet],
      activeEdge,
      matchLArray: [...matchL],
      matchRArray: [...matchR],
      visLArray: [...visL],
      visRArray: [...visR],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-match-size': `${matched.length} 对`,
        'metric-cover-size': coverSet.length > 0 ? `${coverSet.length} 个点` : '推导中',
        'metric-indep-size': independentSet.length > 0 ? `${independentSet.length} 个点` : '—',
        'metric-konig-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 12: init(numL, numR)
  makeStep(12, `🚀 [算法初始化] init(numL=${n}, numR=${m})：准备在左部 ${n} 点、右部 ${m} 点的二分图上运行 König 定理。`, `init(${n}, ${m})`, 'init');

  // 行 17-21: 分配状态数组
  makeStep([17, 21], '📊 [分配状态数组] 分配 matchL[], matchR[], vis[], visL[], visR[] 数组。', '分配状态数组', 'init');

  // 逐条建边
  for (const [u, v] of edges) {
    // 行 24: addEdge(u, v)
    adj[u].push(v);
    makeStep(24, `🔗 [添加二分边] addEdge(L${u}, R${v})：连接左部点 L${u} 到右部点 R${v}。`, `addEdge(L${u}, R${v})`, 'init', [`L${u}`, `R${v}`]);
  }

  // ==================== 2. 匈牙利算法求最大匹配 ====================
  // 行 42: maxMatching()
  makeStep(42, '⚡ [启动匈牙利算法] maxMatching(): 第一阶段——求解二分图基准最大匹配。', 'maxMatching() 入口', 'match');

  function dfs(u: number): boolean {
    // 行 28: dfs(u)
    for (const v of adj[u]) {
      // 行 29-30: if (!vis[v])
      if (!vis[v]) {
        vis[v] = true;
        makeStep([29, 31], `🔎 [检查右部点] 尝试匹配 (L${u} ➔ R${v})：vis[R${v}] 置 true。`, `vis[R${v}] = true`, 'match', [`L${u}`, `R${v}`]);

        // 行 32: if (matchR[v] == 0 || dfs(matchR[v]))
        if (matchR[v] === 0 || dfs(matchR[v])) {
          matchR[v] = u;
          matchL[u] = v;
          makeStep([33, 35], `❤️ [配对成功] matchL[L${u}] = R${v}, matchR[R${v}] = L${u}；增广成功！`, `L${u} ➔ R${v} 匹配`, 'match', [`L${u}`, `R${v}`], 'matchL', u);
          return true;
        }
      }
    }
    return false;
  }

  // 运行匹配
  for (let i = 1; i <= n; i++) {
    vis.fill(false);
    makeStep(46, `🎯 [尝试为 L${i} 寻找匹配] 清空 vis 数组，发起 dfs(${i})。`, `dfs(L${i})`, 'match');
    dfs(i);
  }

  // ==================== 3. König 定理交错路 DFS 染色 ====================
  // 行 65: getMinVertexCover()
  makeStep(65, '👑 [启动 König 覆盖集构造] getMinVertexCover(): 从所有【未匹配的左部点】出发，沿交错路走未匹配边到右部、沿匹配边走回左部进行标记！', 'getMinVertexCover() 入口', 'alternating');

  function alternatingDfs(u: number): void {
    // 行 54: visL[u] = true;
    visL[u] = true;
    makeStep(54, `🏷️ [左部标记] visL[L${u}] = true; 左部点 L${u} 属于交错树节点。`, `visL[L${u}] = true`, 'alternating', undefined, 'visL', u);

    // 行 55: for (int v : adj.get(u))
    for (const v of adj[u]) {
      // 行 56: if (!visR[v] && v != matchL[u]) 沿未匹配边走向右部
      if (!visR[v] && v !== matchL[u]) {
        // 行 57: visR[v] = true;
        visR[v] = true;
        makeStep(57, `🏷️ [右部标记] 沿未匹配边到达 R${v}: visR[R${v}] = true。`, `visR[R${v}] = true`, 'alternating', [`L${u}`, `R${v}`], 'visR', v);

        // 行 58-59: if (matchR[v] != 0 && !visL[matchR[v]]) alternatingDfs(matchR[v]); 沿匹配边走回左部
        if (matchR[v] !== 0 && !visL[matchR[v]]) {
          const nextL = matchR[v];
          makeStep(59, `🔄 [匹配边反推] 沿匹配边走回左部：L${nextL} = matchR[R${v}]。`, `沿匹配边反向回 L${nextL}`, 'alternating', [`L${nextL}`, `R${v}`]);
          alternatingDfs(nextL);
        }
      }
    }
  }

  // 行 68-70: 从未匹配左部点发起交错遍历
  for (let u = 1; u <= n; u++) {
    if (matchL[u] === 0 && !visL[u]) {
      makeStep([69, 70], `🔍 [未匹配点出发] 左部点 L${u} 未被匹配，从它开始进行交错路 DFS 染色！`, `从 L${u} 启动 alternatingDfs`, 'alternating');
      alternatingDfs(u);
    }
  }

  // ==================== 4. 提取最小点覆盖集合 ====================
  // 行 74: List<String> cover = new ArrayList<>();
  // 行 75-76: 收集 !visL[u]
  for (let u = 1; u <= n; u++) {
    if (!visL[u]) {
      coverSet.push(`L${u}`);
      makeStep(76, `🛡️ [选中左部点] !visL[L${u}] 成立 -> 节点 L${u} 加入最小点覆盖！`, `选中 L${u}`, 'cover');
    }
  }

  // 行 78-79: 收集 visR[v]
  for (let v = 1; v <= m; v++) {
    if (visR[v]) {
      coverSet.push(`R${v}`);
      makeStep(79, `🛡️ [选中右部点] visR[R${v}] 成立 -> 节点 R${v} 加入最小点覆盖！`, `选中 R${v}`, 'cover');
    }
  }

  // ==================== 5. 提取最大独立集 (互补点集) ====================
  // 左部 visL + 右部 !visR
  for (let u = 1; u <= n; u++) {
    if (visL[u]) independentSet.push(`L${u}`);
  }
  for (let v = 1; v <= m; v++) {
    if (!visR[v]) independentSet.push(`R${v}`);
  }
  makeStep(81, `✨ [互补最大独立集] 独立集 = 全集 \\ 覆盖集: { ${independentSet.join(', ')} }！`, '构造最大独立集', 'independent');

  // 终态
  makeStep(81, `🎉 [König 定理验证完成] 最小点覆盖集 = { ${coverSet.join(', ')} } (大小 ${coverSet.length}) 严格等于最大匹配数！`, 'König 定理求解完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KonigStep>({
  id: 'konig-min-vertex-cover',
  name: '二分图最小点覆盖与 König 定理 (König Theorem)',
  viewId: 'algo-konig-min-vertex-cover-view',
  category: 'graph',
  icon: '🛡️',
  badge: {
    mode: '匈牙利匹配 + 交错轨提取',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🛡️ 二分图拓扑、交错路染色与覆盖集沙盘',
  card2Title: '📊 König 多数组 (matchL, matchR, visL, visR) 监控器',
  card2Desc: '逐行对齐未匹配左部点出发的交错路 DFS 染色、!visL 与 visR 最小点覆盖提取及互补最大独立集',
  legend: [
    { label: '左部未覆盖点', color: '#1e3a8a' },
    { label: '右部未覆盖点', color: '#581c87' },
    { label: '🛡️ 最小点覆盖点', color: '#ef4444' },
    { label: '🟢 匹配边 (实线)', color: '#10b981' },
    { label: '⚪ 非匹配边 (虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '图预设拓扑',
      type: 'select',
      defaultValue: 'classic',
      options: [
        { label: '经典用例 (左4右3，覆盖集: L4, R1, R2)', value: 'classic' },
        { label: '简单用例 (左3右2，覆盖集大小 2)', value: 'simple' },
      ],
    },
  ],
  presets: [
    { label: '经典用例 (左4右3)', values: { 'input-preset': 'classic' } },
    { label: '简单用例 (左3右2)', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-match-size', label: '二分图最大匹配数', color: '#10b981' },
    { id: 'metric-cover-size', label: '最小点覆盖集大小', color: '#ef4444' },
    { id: 'metric-indep-size', label: '最大独立集大小', color: '#38bdf8' },
    { id: 'metric-konig-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: KONIG_COVER_CODE_LANGUAGES,
  problemHtml: KONIG_COVER_PROBLEM_HTML,
  analysisHtml: KONIG_COVER_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic') as string;
    return buildKonigSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isClassic = step.visLArray.length > 4;
    const leftCount = isClassic ? 4 : 3;
    const rightCount = isClassic ? 3 : 2;

    const leftNodes = Array.from({ length: leftCount }, (_, i) => `L${i + 1}`);
    const rightNodes = Array.from({ length: rightCount }, (_, i) => `R${i + 1}`);

    const nodeCoords: Record<string, { x: number; y: number }> = {};
    leftNodes.forEach((id, i) => {
      nodeCoords[id] = { x: 75, y: 35 + i * (170 / Math.max(leftCount - 1, 1)) };
    });
    rightNodes.forEach((id, i) => {
      nodeCoords[id] = { x: 235, y: 45 + i * (150 / Math.max(rightCount - 1, 1)) };
    });

    const allEdges = isClassic
      ? [
          ['L1', 'R1'],
          ['L2', 'R1'],
          ['L2', 'R2'],
          ['L3', 'R2'],
          ['L4', 'R3'],
        ]
      : [
          ['L1', 'R1'],
          ['L2', 'R2'],
          ['L3', 'R1'],
        ];

    const svgEdges = allEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isMatched = step.matchedEdges.some(([a, b]) => a === u && b === v);
        const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isAct ? '#f59e0b' : isMatched ? '#10b981' : '#475569';
        const width = isAct ? 3.5 : isMatched ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isMatched ? '' : 'stroke-dasharray="4,2"'} />`;
      })
      .join('');

    const allNodes = [...leftNodes, ...rightNodes];
    const svgNodes = allNodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const isLeft = id.startsWith('L');
        const inCover = step.coverSet.includes(id);
        const inVisL = isLeft && step.visitedLeft.includes(id);
        const inVisR = !isLeft && step.visitedRight.includes(id);

        const bg = inCover ? '#991b1b' : isLeft ? '#0284c7' : '#581c87';
        const border = inCover ? '#ef4444' : inVisL || inVisR ? '#f59e0b' : isLeft ? '#38bdf8' : '#a855f7';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${inCover ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="${inCover ? '#f87171' : '#94a3b8'}" font-size="8" font-weight="700" text-anchor="middle">${inCover ? '🛡️覆盖' : isLeft ? (inVisL ? '交错访问' : '未访问') : inVisR ? '交错访问' : '未访问'}</text>
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
          绿色实线为匹配边 | 红色为最小覆盖点：左部未被交错路访问点 (!visL) ∪ 右部已被交错路访问点 (visR)
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-konig-min-vertex-cover-view') ||
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
        const renderRow = (name: string, arr: any[], indices: number[], activeName: string, color: string, prefix: string) => {
          const cells = indices
            .map((idx) => {
              const val = arr[idx];
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">${prefix}${idx}</span>
                <span style="line-height: 1.1;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 110px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const leftIdxs = Array.from({ length: leftCount }, (_, i) => i + 1);
        const rightIdxs = Array.from({ length: rightCount }, (_, i) => i + 1);

        const matchLRow = renderRow('matchL[] (左配右)', step.matchLArray, leftIdxs, 'matchL', '#38bdf8', 'L');
        const matchRRow = renderRow('matchR[] (右配左)', step.matchRArray, rightIdxs, 'matchR', '#a855f7', 'R');
        const visLRow = renderRow('visL[] (交错左)', step.visLArray, leftIdxs, 'visL', '#10b981', 'L');
        const visRRow = renderRow('visR[] (交错右)', step.visRArray, rightIdxs, 'visR', '#f59e0b', 'R');

        const coverStr = step.coverSet.length > 0 ? `{ ${step.coverSet.join(', ')} }` : '推导中';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${matchLRow}
              ${matchRRow}
              ${visLRow}
              ${visRRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                <span style="color: #ef4444; font-size: 10px; font-weight: 700;">🛡️ 最小点覆盖集:</span>
                <strong style="color: #f87171; font-family: monospace; font-size: 10.5px;">${coverStr}</strong>
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
  id: 'konig-min-vertex-cover',
  name: '二分图最小点覆盖与 König 定理 (König Theorem)',
  viewId: 'algo-konig-min-vertex-cover-view',
  category: 'graph',
  description: '进阶匹配理论经典：最大匹配数等于最小点覆盖数、未匹配左部点交错路 DFS 染色、构造覆盖集与最大独立集 (洛谷 P6062)',
  icon: '🛡️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 74,
  learningGoal: '掌握 König 定理证明思想、交错路标记法构造最小点覆盖及最大独立集对偶互补关系',
});

export { Visualizer as KonigMinVertexCoverVisualizer };
