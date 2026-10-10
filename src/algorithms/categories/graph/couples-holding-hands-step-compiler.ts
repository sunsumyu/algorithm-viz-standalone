/**
 * 情侣牵手 (Couples Holding Hands · LeetCode 765) 步进编译器
 * 纯逻辑与状态步进推演，零 DOM 依赖与零视觉内联
 */

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
    init: { cpp: 27, java: 26, python: 17, javascript: 2 },
    build: { cpp: 11, java: 8, python: 4, javascript: 3 },
    loop: { cpp: 32, java: 29, python: 20, javascript: 20 },
    union: { cpp: 33, java: 30, python: 21, javascript: 21 },
    find: { cpp: 13, java: 13, python: 9, javascript: 8 },
    merge: { cpp: 20, java: 20, python: 13, javascript: 15 },
    skip: { cpp: 19, java: 19, python: 12, javascript: 14 },
    done: { cpp: 36, java: 32, python: 22, javascript: 24 },
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
