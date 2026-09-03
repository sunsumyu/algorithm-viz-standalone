/**
 * 情侣牵手 (Couples Holding Hands - 并查集置换环) 声明式可视化器
 * 核心理论: 每对情侣作为一个集合节点，相邻座位连接边形成置换环，k 个节点的置换环最少需要 k-1 次交换，全图最少交换次数 = N - 连通分量数 (LeetCode 765)
 * 架构重构：引入四语言代码高亮字典、双层沙发席位与置换环分解舱沙盘、并查集状态监视器
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  COUPLES_CODE_LANGUAGES,
  COUPLES_PROBLEM_HTML,
  COUPLES_ANALYSIS_HTML,
} from './couples-holding-hands-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface CouplesStep {
  row: number[];
  currentCouch: number;
  couchCouples: [number, number];
  disjointSetCount: number;
  minSwaps: number;
  parentArray: number[];
  activeArray?: 'parent' | 'row';
  activeSlot?: number;
  status: 'init' | 'check_couch' | 'union' | 'skip' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildCouplesSteps(preset: string = 'two_cycles'): CouplesStep[] {
  const steps: CouplesStep[] = [];

  const row: number[] =
    preset === 'perfect'
      ? [0, 1, 2, 3, 4, 5, 6, 7]
      : preset === 'big_cycle'
        ? [0, 2, 3, 4, 5, 6, 7, 1]
        : [0, 2, 1, 3, 4, 6, 5, 7];

  const m = row.length;
  const n = m / 2;
  const parent: number[] = new Array(n).fill(0);
  let sets = n;
  let currentCouch = 0;
  let currentCouples: [number, number] = [0, 0];

  function find(i: number): number {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  }

  const lines = {
    init: { cpp: 34, java: 26, python: 17, javascript: 2 },
    build: { cpp: 18, java: 8, python: 4, javascript: 3 },
    loop: { cpp: 39, java: 29, python: 20, javascript: 20 },
    union: { cpp: 40, java: 30, python: 21, javascript: 21 },
    find: { cpp: 20, java: 13, python: 9, javascript: 8 },
    merge: { cpp: 27, java: 20, python: 13, javascript: 15 },
    skip: { cpp: 26, java: 19, python: 12, javascript: 14 },
    done: { cpp: 43, java: 32, python: 22, javascript: 24 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'check_couch' | 'union' | 'skip' | 'done',
    activeArray?: 'parent' | 'row',
    activeSlot?: number
  ): void {
    const swaps = n - sets;
    const couchStr = status === 'done' ? '遍历完毕' : `沙发 ${currentCouch} (位置 ${currentCouch * 2}, ${currentCouch * 2 + 1})`;
    const phaseStr =
      status === 'done'
        ? '置换环分析完成'
        : status === 'union'
          ? '合并连通环'
          : status === 'skip'
            ? '同组已连通'
            : status === 'check_couch'
              ? '检验沙发情侣'
              : '算法初始化';

    steps.push({
      row: [...row],
      currentCouch,
      couchCouples: [currentCouples[0], currentCouples[1]],
      disjointSetCount: sets,
      minSwaps: swaps,
      parentArray: [...parent],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-disjoint-sets': `${sets} 个集合`,
        'metric-min-swaps': `${swaps} 次`,
        'metric-current-couch': couchStr,
        'metric-cycle-count': `${sets} 个独立环`,
        'metric-couples-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.init, `🚀 [算法初始化] 共有 ${m} 人坐入 ${n} 张双人沙发，情侣编码为 [0..${n - 1}]。`, 'minSwapsCouples 入口', 'init');

  // build(n)
  makeStep(lines.build, `🛠️ [启动并查集] build(${n}): 初始化各情侣对的代表元。`, 'build(n)', 'init');

  for (let i = 0; i < n; i++) {
    parent[i] = i;
    makeStep(lines.build, `📌 [代表元自环] 初始化情侣对 C${i} 的代表元 parent[${i}] = ${i}。`, `parent[${i}] = ${i}`, 'init', 'parent', i);
  }

  // 2. 逐张沙发检验相邻两人
  for (let i = 0; i < m; i += 2) {
    currentCouch = i / 2;
    const p1 = row[i];
    const p2 = row[i + 1];
    const c1 = Math.floor(p1 / 2);
    const c2 = Math.floor(p2 / 2);
    currentCouples = [c1, c2];

    makeStep(lines.loop, `🛋️ [巡查沙发 ${currentCouch}] 沙发坐着人员 [${p1}, ${p2}]，分别归属情侣对 C${c1} 与 C${c2}。`, `巡查沙发 ${currentCouch}`, 'check_couch', 'row', i);

    makeStep(lines.union, `🔗 [调用 union] union(C${c1}, C${c2}): 准备连接坐在一起的两对情侣。`, `union(${c1}, ${c2})`, 'check_couch');

    const fx = find(c1);
    makeStep(lines.find, `🔎 [查找根节点] find(C${c1}) = ${fx}。`, `find(${c1}) = ${fx}`, 'check_couch');

    const fy = find(c2);
    makeStep(lines.find, `🔎 [查找根节点] find(C${c2}) = ${fy}。`, `find(${c2}) = ${fy}`, 'check_couch');

    if (fx !== fy) {
      parent[fx] = fy;
      sets--;
      makeStep(lines.merge, `➕ [合并置换环] parent[${fx}] = ${fy}；连通块减少至 sets = ${sets}！`, `parent[${fx}] = ${fy}, sets--`, 'union', 'parent', fx);
    } else {
      makeStep(lines.skip, `⚪ [已在同一环] C${c1} 与 C${c2} 根节点相同 (${fx})，形成闭合置换环或同为一对，无需合并！`, `已连通 (${fx}==${fy})`, 'skip');
    }
  }

  // 3. 统计最少交换次数
  const ans = n - sets;
  makeStep(lines.done, `🎯 [置换环定理结算] 全图最终形成 ${sets} 个独立置换环，最少交换次数 = N - sets = ${n} - ${sets} = ${ans} 次！`, `ans = ${ans}`, 'done');

  makeStep(lines.done, `🎉 [情侣牵手分析完毕] 每次交换最多使两个孤立的情侣归位，置换环理论保证了 ${ans} 次必定可解！`, '算法结束', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CouplesStep>({
  id: 'couples-holding-hands',
  name: '情侣牵手 (Couples Holding Hands)',
  viewId: 'algo-couples-holding-hands-view',
  category: 'graph',
  icon: '👫',
  badge: {
    mode: '并查集置换环 + 最少交换定理',
    complexity: 'O(N · α(N)) · O(N)',
  },
  card1Title: '👫 沙发席位排布与置换环分解舱',
  card2Title: '📊 并查集状态监视器 (parent, row, 连通块)',
  card2Desc: '展示沙发人员情侣映射、并查集连通分量合并与最少交换次数 N - sets 计算',
  legend: [
    { label: '情侣对节点 (C0..Cn-1)', color: '#1e3a8a' },
    { label: '🛋️ 当前考察沙发人员', color: '#f59e0b' },
    { label: '🟢 置换环连边', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设座位排布',
      type: 'select',
      defaultValue: 'two_cycles',
      options: [
        { label: '4 对情侣双置换环 (2 次交换)', value: 'two_cycles' },
        { label: '4 对情侣大置换环 (3 次交换)', value: 'big_cycle' },
        { label: '4 对情侣完美归位 (0 次交换)', value: 'perfect' },
      ],
    },
  ],
  presets: [
    { label: '双环排布', values: { 'input-preset': 'two_cycles' } },
    { label: '大环排布', values: { 'input-preset': 'big_cycle' } },
    { label: '完美排布', values: { 'input-preset': 'perfect' } },
  ],
  metrics: [
    { id: 'metric-disjoint-sets', label: '并查集连通分量', color: '#10b981' },
    { id: 'metric-min-swaps', label: '最少交换次数', color: '#ef4444' },
    { id: 'metric-current-couch', label: '当前巡查沙发', color: '#38bdf8' },
    { id: 'metric-cycle-count', label: '置换环数目', color: '#f59e0b' },
  ],
  codeLanguages: COUPLES_CODE_LANGUAGES,
  problemHtml: COUPLES_PROBLEM_HTML,
  analysisHtml: COUPLES_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'two_cycles') as string;
    return buildCouplesSteps(preset);
  },
  renderCanvas: (container, step) => {
    const n = step.parentArray.length;

    // 绘制沙发人员
    const couchBoxes = Array.from({ length: n }, (_, i) => {
      const p1 = step.row[i * 2];
      const p2 = step.row[i * 2 + 1];
      const c1 = Math.floor(p1 / 2);
      const c2 = Math.floor(p2 / 2);
      const isCur = step.currentCouch === i && step.status !== 'done';
      const isMatched = c1 === c2;

      const border = isCur ? '2px solid #facc15' : isMatched ? '2px solid #10b981' : '1px solid #475569';
      const bg = isCur ? '#422006' : isMatched ? 'rgba(6, 95, 70, 0.3)' : '#1e293b';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; background: ${bg}; border: ${border}; border-radius: 6px; padding: 6px 10px; gap: 4px; min-width: 95px;">
          <span style="font-size: 9px; color: #94a3b8; font-weight: 700;">🛋️ 沙发 #${i}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #38bdf8; font-family: monospace;">${p1} <sub style="color:#f59e0b;">(C${c1})</sub></span>
            <span style="color: ${isMatched ? '#34d399' : '#64748b'}; font-size: 10px;">${isMatched ? '❤️' : '⚡'}</span>
            <span style="font-size: 11px; font-weight: 800; color: #38bdf8; font-family: monospace;">${p2} <sub style="color:#f59e0b;">(C${c2})</sub></span>
          </div>
          <span style="font-size: 8px; color: ${isMatched ? '#34d399' : '#94a3b8'}; font-weight: 600;">
            ${isMatched ? '✔ 已成对' : `连边 C${c1}↔C${c2}`}
          </span>
        </div>
      `;
    }).join('');

    // 置换环结构统计
    const cycleMap = new Map<number, number[]>();
    for (let i = 0; i < n; i++) {
      let r = i;
      while (step.parentArray[r] !== r) r = step.parentArray[r];
      if (!cycleMap.has(r)) cycleMap.set(r, []);
      cycleMap.get(r)!.push(i);
    }

    const cyclesHtml = Array.from(cycleMap.entries()).map(([root, members]) => {
      const k = members.length;
      const needSwaps = k - 1;
      const isSingle = k === 1;
      const bg = isSingle ? 'rgba(6, 95, 70, 0.3)' : 'rgba(30, 41, 59, 0.7)';
      const border = isSingle ? '#10b981' : '#38bdf8';

      return `
        <div style="background:${bg}; border:1px solid ${border}; border-radius:6px; padding:6px 10px; display:flex; flex-direction:column; gap:2px; min-width:110px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
            <span style="color:#38bdf8;">置换环 根 C${root}</span>
            <span style="color:#a7f3d0;">规模 k=${k}</span>
          </div>
          <div style="font-size:9.5px; color:#cbd5e1; font-family:monospace;">
            包含情侣: [${members.map((c) => `C${c}`).join(', ')}]
          </div>
          <div style="font-size:9px; color:#f59e0b; font-weight:600;">
            需解开交换: <b>${needSwaps} 次</b> (k-1)
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background: #0b0f19; border-radius: 8px; padding: 12px; box-sizing: border-box; gap: 10px; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🛋️ 沙发就坐人员分布</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            当前最少交换: <b style="color: #ef4444; font-size: 12px;">${step.minSwaps} 次</b>
          </span>
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; width: 100%; background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #334155;">
          ${couchBoxes}
        </div>

        <!-- 底部置换环分解舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🔄 置换环分解与理论交换舱</span>
            <div style="font-size: 11px; color: #94a3b8;">
              置换定理: <b>最少交换 = N - Sets = ${n} - ${step.disjointSetCount} = ${step.minSwaps} 次</b>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            ${cyclesHtml}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const n = step.parentArray.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">C[${idx}]</span>
              <span style="line-height: 1.1;">${val}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 120px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const parentRow = renderRow('parent[] (代表元)', step.parentArray, 'parent', '#38bdf8');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${parentRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">置换环连通块数 (Sets):</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 12px;">${step.disjointSetCount} 个独立环</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'couples-holding-hands',
  name: '情侣牵手 (Couples Holding Hands)',
  viewId: 'algo-couples-holding-hands-view',
  category: 'graph',
  description: '经典置换环模型：并查集将相邻不同情侣缩环、置换环最少交换次数定理 N - 连通分量数 (LeetCode 765)',
  icon: '👫',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 92,
  learningGoal: '掌握情侣对并查集建模技巧、置换环数学定理及最少交换次数最优解证明',
});

export { Visualizer as CouplesHoldingHandsVisualizer };
