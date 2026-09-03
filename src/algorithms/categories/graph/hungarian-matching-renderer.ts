/**
 * 匈牙利算法二分图最大匹配 (Hungarian Algorithm - Maximum Bipartite Matching) 声明式可视化器
 * 进阶图论: 增广路探索、交错路寻找、协商腾位与反向边翻转、增广路定理 (洛谷 P3386)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（外层循环、visited重置、DFS深入、已访问continue、腾位递归、匹配边反转均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  HUNGARIAN_CODE_LANGUAGES,
  HUNGARIAN_PROBLEM_HTML,
  HUNGARIAN_ANALYSIS_HTML,
} from './hungarian-matching-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface HungarianStep {
  matchedEdges: Array<[string, string]>;
  curLeft: string;
  curAugmentPath: string[];
  activeEdge?: [string, string];
  conflictTarget?: string;
  matchCount: number;
  matchArray: number[];
  visitedArray: boolean[];
  activeArray?: 'match' | 'visited';
  activeSlot?: number;
  status: 'init' | 'augment' | 'flip' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildHungarianSteps(preset: string = 'four_nodes'): HungarianStep[] {
  const steps: HungarianStep[] = [];
  const is4Node = preset === 'four_nodes';
  const nLeft = is4Node ? 4 : 3;
  const nRight = is4Node ? 4 : 3;

  const graph: number[][] = is4Node
    ? [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
      ]
    : [
        [0, 1],
        [0, 2],
        [1, 2],
      ];

  const match: number[] = new Array(nRight).fill(-1);
  let visited: boolean[] = new Array(nRight).fill(false);
  let matchCount = 0;
  let curLeft = 'L0';
  let curAugmentPath: string[] = [];
  let activeEdge: [string, string] | undefined = undefined;
  let conflictTarget: string | undefined = undefined;

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    mainFunc: { cpp: 27, java: 21, python: 2, javascript: 8 },
    initMatch: { cpp: 28, java: 22, python: 9, javascript: 9 },
    initCount: { cpp: 29, java: 24, python: 23, javascript: 24 },
    loopU: { cpp: 31, java: 26, python: 24, javascript: 25 },
    initVisited: { cpp: 32, java: 27, python: 25, javascript: 26 },
    checkDfs: { cpp: 33, java: 28, python: 26, javascript: 27 },
    dfsEntry: { cpp: 13, java: 8, python: 11, javascript: 11 },
    loopV: { cpp: 14, java: 9, python: 12, javascript: 12 },
    checkVisited: { cpp: 15, java: 10, python: 13, javascript: 13 },
    markVisited: { cpp: 16, java: 11, python: 15, javascript: 14 },
    checkMatchOrDfs: { cpp: 19, java: 13, python: 18, javascript: 16 },
    applyMatch: { cpp: 20, java: 14, python: 19, javascript: 17 },
    returnTrue: { cpp: 21, java: 15, python: 20, javascript: 18 },
    returnFalse: { cpp: 24, java: 18, python: 21, javascript: 21 },
    incCount: { cpp: 34, java: 29, python: 27, javascript: 27 },
    returnCount: { cpp: 37, java: 32, python: 29, javascript: 29 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'augment' | 'flip' | 'done',
    activeArray?: 'match' | 'visited',
    activeSlot?: number
  ): void {
    const matchedPairs: Array<[string, string]> = [];
    for (let v = 0; v < nRight; v++) {
      if (match[v] !== -1) {
        matchedPairs.push([`L${match[v]}`, `R${v}`]);
      }
    }

    const pathStr = curAugmentPath.length > 0 ? curAugmentPath.join(' ➔ ') : '寻找增广路中';
    const phaseStr =
      status === 'done'
        ? '匹配完成'
        : status === 'flip'
          ? '增广路翻转加边'
          : status === 'augment'
            ? '交错路探索协商'
            : '初始化';

    steps.push({
      matchedEdges: matchedPairs,
      curLeft,
      curAugmentPath: [...curAugmentPath],
      activeEdge,
      conflictTarget,
      matchCount,
      matchArray: [...match],
      visitedArray: [...visited],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-hungarian-left': curLeft,
        'metric-hungarian-count': `${matchCount} 对匹配`,
        'metric-hungarian-path': pathStr,
        'metric-hungarian-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.mainFunc, `🚀 [算法初始化] maxMatching(nLeft=${nLeft}, nRight=${nRight})：准备寻找二分图最大匹配。`, 'maxMatching 入口', 'init');
  makeStep(lines.initMatch, `📊 [初始化匹配数组] int[] match = new int[${nRight}]；初始填充 -1 (所有右部节点均无伴侣)。`, 'Arrays.fill(match, -1)', 'init', 'match');
  makeStep(lines.initCount, '🔢 [初始化匹配计数] int count = 0；记录成功配对的匹配边总数。', 'int count = 0', 'init');

  // DFS 增广函数
  function dfs(u: number): boolean {
    curLeft = `L${u}`;
    curAugmentPath.push(`L${u}`);
    makeStep(lines.dfsEntry, `🔎 [进入 DFS] dfs(u=${u})：左部节点 L${u} 开始寻找增广路径。`, `dfs(L${u})`, 'augment');

    for (const v of graph[u]) {
      activeEdge = [`L${u}`, `R${v}`];
      curAugmentPath.push(`R${v}`);

      makeStep(lines.loopV, `  ↳ [考察出边] for (int v : graph[${u}]) -> 考察意向边 (L${u} ➔ R${v})。`, `edge (L${u}, R${v})`, 'augment');

      makeStep(lines.checkVisited, `  🔎 [检查是否已访问] if (visited[${v}]) -> (${visited[v]})。`, `visited[${v}]?`, 'augment', 'visited', v);
      if (visited[v]) {
        makeStep(lines.checkVisited, `  ⏭️ [跳过已探节点] R${v} 本轮已被询问过，避免环路死锁，跳过。`, `skip visited R${v}`, 'augment');
        curAugmentPath.pop();
        continue;
      }

      visited[v] = true;
      makeStep(lines.markVisited, `  🏷️ [标记本轮访问] visited[${v}] = true；锁定节点 R${v} 本轮协商状态。`, `visited[${v}] = true`, 'augment', 'visited', v);

      const oldMatch = match[v];
      if (oldMatch === -1) {
        makeStep(lines.checkMatchOrDfs, `  ✨ [发现空闲节点] if (match[${v}] == -1) -> (R${v} 处于单身状态)！增广路成功闭合！`, `match[${v}] == -1`, 'augment', 'match', v);

        match[v] = u;
        makeStep(lines.applyMatch, `  🎉 [建立新匹配] match[${v}] = ${u}：将边 (L${u} ➔ R${v}) 纳入匹配，完成增广翻转！`, `match[${v}] = ${u}`, 'flip', 'match', v);

        makeStep(lines.returnTrue, `  ✔ [返回成功] return true：节点 L${u} 成功配对！`, `dfs(L${u}) -> true`, 'flip');
        activeEdge = undefined;
        return true;
      } else {
        conflictTarget = `L${oldMatch}`;
        makeStep(lines.checkMatchOrDfs, `  ⚡ [协商腾位递归] R${v} 已与 L${oldMatch} 配对，递归调用 dfs(match[${v}]=${oldMatch}) 尝试为其寻找替代伴侣！`, `dfs(L${oldMatch}) 腾位`, 'augment');

        if (dfs(oldMatch)) {
          makeStep(lines.checkMatchOrDfs, `  🤝 [让位成功] 原配 L${oldMatch} 成功找到新伴侣，R${v} 顺利腾出名额！`, `L${oldMatch} 让位成功`, 'flip');

          match[v] = u;
          makeStep(lines.applyMatch, `  🎉 [更新配对关系] match[${v}] = ${u}：节点 R${v} 与新伴侣 L${u} 建立新匹配！`, `match[${v}] = ${u}`, 'flip', 'match', v);

          makeStep(lines.returnTrue, `  ✔ [增广路整体翻转成功] return true！增广路径翻转使匹配数 +1！`, `return true (augment succeeded)`, 'flip');
          conflictTarget = undefined;
          activeEdge = undefined;
          return true;
        } else {
          makeStep(lines.checkMatchOrDfs, `  ❌ [腾位失败] 原配 L${oldMatch} 无法找到其他伴侣，协商失败，继续尝试 L${u} 的下一个意向。`, `L${oldMatch} 腾位失败`, 'augment');
          conflictTarget = undefined;
          curAugmentPath.pop();
        }
      }
    }

    makeStep(lines.returnFalse, `⚠️ [无路可走] return false：左部节点 L${u} 所有出边均无法形成增广路。`, `dfs(L${u}) -> false`, 'augment');
    curAugmentPath.pop();
    activeEdge = undefined;
    return false;
  }

  // 2. 外层循环
  for (let u = 0; u < nLeft; u++) {
    curLeft = `L${u}`;
    curAugmentPath = [];
    makeStep(lines.loopU, `🔁 [外层遍历] for (int u = ${u}; u < ${nLeft}; u++)：为左部工人/任务 L${u} 寻求匹配。`, `for u = ${u}`, 'augment');

    visited = new Array(nRight).fill(false);
    makeStep(lines.initVisited, `🧹 [重置访问数组] boolean[] visited = new boolean[${nRight}]；新一轮增广重置标记。`, 'new visited[]', 'augment', 'visited');

    makeStep(lines.checkDfs, `🔎 [启动增广探索] if (dfs(${u}, graph, match, visited))。`, `call dfs(${u})`, 'augment');

    if (dfs(u)) {
      matchCount++;
      makeStep(lines.incCount, `📈 [匹配数累加] count++ -> 当前最大匹配对数刷新为 ${matchCount} 对！`, `count = ${matchCount}`, 'flip');
    }
  }

  curLeft = '全部匹配完成';
  curAugmentPath = [];
  makeStep(lines.returnCount, `🎉 [匈牙利算法完成] return count = ${matchCount}！二分图最大匹配对数锁定为 ${matchCount}！`, `return ${matchCount}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<HungarianStep>({
  id: 'hungarian-matching',
  name: '二分图最大匹配 (Hungarian Algorithm)',
  viewId: 'algo-hungarian-matching-view',
  category: 'graph',
  icon: '💘',
  badge: {
    mode: '增广路定理 · DFS 让位与反转',
    complexity: 'O(V · E) · O(V)',
  },
  card1Title: '💘 二分图拓扑与增广路协商沙盘',
  card2Title: '📊 匹配状态监视器 (match[], visited[])',
  card2Desc: '展示右部配对数组 match[v] 映射、本轮探查标记 visited[v] 与增广路交错腾位全流程',
  legend: [
    { label: '💖 匹配成功的稳定配对边', color: '#10b981' },
    { label: '⚡ 当前正在探索的交错路边', color: '#f59e0b' },
    { label: '⚪ 二分图潜在意向边', color: '#334155' },
    { label: '🤝 协商让位原配节点', color: '#ec4899' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设二分图结构',
      type: 'select',
      defaultValue: 'four_nodes',
      options: [
        { label: '4 对 4 经典二分图 (含多次腾位协商，完备匹配 4 对)', value: 'four_nodes' },
        { label: '3 对 3 入门二分图 (含单次腾位让位，完备匹配 3 对)', value: 'three_nodes' },
      ],
    },
  ],
  presets: [
    { label: '4 对 4 经典图 (4 对匹配)', values: { 'input-preset': 'four_nodes' } },
    { label: '3 对 3 简易图 (3 对匹配)', values: { 'input-preset': 'three_nodes' } },
  ],
  metrics: [
    { id: 'metric-hungarian-left', label: '当前探寻节点', color: '#38bdf8' },
    { id: 'metric-hungarian-count', label: '当前匹配对数', color: '#10b981' },
    { id: 'metric-hungarian-path', label: '增广交错路径', color: '#f59e0b' },
    { id: 'metric-hungarian-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: HUNGARIAN_CODE_LANGUAGES,
  problemHtml: HUNGARIAN_PROBLEM_HTML,
  analysisHtml: HUNGARIAN_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'four_nodes') as string;
    return buildHungarianSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is4 = step.matchArray.length === 4;
    const n = is4 ? 4 : 3;

    const leftX = 65;
    const rightX = 245;
    const startY = 35;
    const gapY = is4 ? 40 : 55;

    const leftCoords: Record<number, { x: number; y: number }> = {};
    const rightCoords: Record<number, { x: number; y: number }> = {};

    for (let i = 0; i < n; i++) {
      leftCoords[i] = { x: leftX, y: startY + i * gapY };
      rightCoords[i] = { x: rightX, y: startY + i * gapY };
    }

    const graph: number[][] = is4
      ? [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
        ]
      : [
          [0, 1],
          [0, 2],
          [1, 2],
        ];

    const isMatched = (u: number, v: number) => {
      return step.matchedEdges.some(([lu, rv]) => lu === `L${u}` && rv === `R${v}`);
    };

    const isActive = (u: number, v: number) => {
      return step.activeEdge && step.activeEdge[0] === `L${u}` && step.activeEdge[1] === `R${v}`;
    };

    const svgEdges: string[] = [];
    for (let u = 0; u < n; u++) {
      for (const v of graph[u]) {
        const p1 = leftCoords[u];
        const p2 = rightCoords[v];
        if (!p1 || !p2) continue;

        const matched = isMatched(u, v);
        const act = isActive(u, v);

        const color = act ? '#f59e0b' : matched ? '#10b981' : '#334155';
        const width = act ? 3.5 : matched ? 3 : 1.2;
        const dash = act ? '4,4' : 'none';

        svgEdges.push(`
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash}" />
        `);
      }
    }

    const svgNodes: string[] = [];
    for (let i = 0; i < n; i++) {
      const pl = leftCoords[i];
      const isCurL = step.curLeft === `L${i}`;
      const isConflict = step.conflictTarget === `L${i}`;
      const bgL = isCurL ? '#b45309' : isConflict ? '#831843' : '#1e293b';
      const borderL = isCurL ? '#facc15' : isConflict ? '#f43f5e' : '#38bdf8';

      svgNodes.push(`
        <g>
          <circle cx="${pl.x}" cy="${pl.y}" r="14" fill="${bgL}" stroke="${borderL}" stroke-width="${isCurL || isConflict ? 2.5 : 1.5}" />
          <text x="${pl.x}" y="${pl.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">L${i}</text>
        </g>
      `);

      const pr = rightCoords[i];
      const matchU = step.matchArray[i];
      const isVis = step.visitedArray[i];
      const bgR = matchU !== -1 ? '#065f46' : isVis ? '#1e3a8a' : '#1e293b';
      const borderR = matchU !== -1 ? '#10b981' : isVis ? '#38bdf8' : '#475569';

      svgNodes.push(`
        <g>
          <circle cx="${pr.x}" cy="${pr.y}" r="14" fill="${bgR}" stroke="${borderR}" stroke-width="${matchU !== -1 ? 2.5 : 1.5}" />
          <text x="${pr.x}" y="${pr.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">R${i}</text>
          <text x="${pr.x + 24}" y="${pr.y + 4}" fill="${matchU !== -1 ? '#10b981' : '#64748b'}" font-size="8.5" font-family="monospace" text-anchor="start">
            ${matchU !== -1 ? `➔ L${matchU}` : '未配'}
          </text>
        </g>
      `);
    }

    const pathDisplay = step.curAugmentPath.length > 0
      ? `<div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
          ${step.curAugmentPath.map((node, idx) => `
            <span style="background: ${node.startsWith('L') ? '#0284c7' : '#059669'}; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px; font-weight: 700;">${node}</span>
            ${idx < step.curAugmentPath.length - 1 ? '<span style="color: #f59e0b; font-size: 10px;">➔</span>' : ''}
          `).join('')}
        </div>`
      : '<span style="font-size: 10.5px; color: #64748b;">(本轮增广探索结束)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">💘 二分图拓扑 (左侧 L部 ➔ 右侧 R部)</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            已建立匹配: <b style="color: #10b981;">${step.matchCount}</b> / ${n} 对
          </span>
        </div>

        <div style="width: 100%; min-height: 180px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 180px;" viewBox="0 0 310 180">
            ${svgEdges.join('')}
            ${svgNodes.join('')}
          </svg>
        </div>

        <!-- 底部增广路交错腾位舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🔍 增广路交错探索与反转腾位舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              当前探查: <b>${step.curLeft}</b>
            </div>
          </div>

          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 6px 10px;">
            ${pathDisplay}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const n = step.matchArray.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const renderRow = (name: string, arr: any[], activeName: string, color: string, formatVal: (v: any) => string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx];
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = formatVal(val);
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">R[${idx}]</span>
              <span style="line-height: 1.1;">${displayVal}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const matchRow = renderRow('match[] (右部配对)', step.matchArray, 'match', '#10b981', (v) => v === -1 ? '未配' : `L${v}`);
    const visRow = renderRow('visited[] (本轮标记)', step.visitedArray, 'visited', '#38bdf8', (v) => v ? 'T' : 'F');

    const matchedPairsStr = step.matchedEdges.length > 0
      ? step.matchedEdges.map(([lu, rv]) => `${lu} 💖 ${rv}`).join(', ')
      : '暂无匹配';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${matchRow}
          ${visRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #ec4899; font-size: 10.5px; font-weight: 700;">当前已确定匹配对:</span>
            <strong style="color: #ec4899; font-family: monospace; font-size: 11px;">[ ${matchedPairsStr} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'hungarian-matching',
  name: '二分图最大匹配 (Hungarian Algorithm)',
  viewId: 'algo-hungarian-matching-view',
  category: 'graph',
  description: '左程云 Class 069 核心：二分图最大匹配、匈牙利算法、DFS 递归让位与增广路反转 (洛谷 P3386)',
  icon: '💘',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 23,
  learningGoal: '深刻理解增广路定理、交错路的寻找方式以及递归协商腾位的本质机制',
});

export { Visualizer as HungarianMatchingVisualizer };
