/**
 * Class 159: 莫队算法 (Mo's Algorithm) 步进推演编译器
 * 核心：区间离线询问、sqrt(N) 奇偶分块排序与四向双指针平滑伸缩
 */

import { Advanced155Step } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { MO_ALGORITHM_LINES } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-stage-codes';

export interface MoStep extends Advanced155Step {
  arr: number[];
  blockSize: number;
  curL: number;
  curR: number;
  targetL: number;
  targetR: number;
  curAns: number;
}

export function buildMoSteps(arr: number[], queries: { l: number; r: number; id: number }[]): MoStep[] {
  const steps: MoStep[] = [];
  const lines = MO_ALGORITHM_LINES;

  const n = arr.length;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    blockSize,
    curL: 0,
    curR: -1,
    targetL: -1,
    targetR: -1,
    curAns: 0,
    decision: `主函数入口：开始对 ${n} 个元素的数组执行莫队算法，共处理 ${queries.length} 个区间询问`,
    message: `取块长 B = sqrt(N) = ${blockSize}。将所有离线询问按左端点所属块排序，块内按右端点奇偶交错排序`,
    log: `enter moAlgorithm(n=${n}, b=${blockSize})`,
    codeLine: lines.entry,
    metrics: { '数组长度 N': n, '块长 B': blockSize, '离线询问数': queries.length },
  });

  // 1. 奇偶分块排序
  const sortedQ = [...queries].sort((a, b) => {
    const bA = Math.floor(a.l / blockSize);
    const bB = Math.floor(b.l / blockSize);
    if (bA !== bB) return bA - bB;
    return (bA & 1) ? a.r - b.r : b.r - a.r;
  });

  steps.push({
    arr: [...arr],
    blockSize,
    curL: 0,
    curR: -1,
    targetL: sortedQ[0].l,
    targetR: sortedQ[0].r,
    curAns: 0,
    decision: `离线排序完成：双关键字奇偶排序使双指针在相邻询问间无需频繁折返，将指针移动次数减半`,
    message: `排序后询问顺序: [${sortedQ.map(q => `[${q.l}..${q.r}]`).join(', ')}]`,
    log: `sortBlockComplete`,
    codeLine: lines.sortBlock,
    statusBadge: { text: '奇偶排序完成', type: 'info' },
    metrics: { '排序后首个询问': `[${sortedQ[0].l}..${sortedQ[0].r}]` },
  });

  // 2. 双指针挪动
  let curL = 0;
  let curR = -1;
  const cnt = new Map<number, number>();
  let curAns = 0;

  const add = (idx: number) => {
    const val = arr[idx];
    const c = cnt.get(val) || 0;
    cnt.set(val, c + 1);
    if (c === 0) curAns++; // 新增相异元素
  };

  const del = (idx: number) => {
    const val = arr[idx];
    const c = cnt.get(val) || 0;
    if (c === 1) {
      cnt.delete(val);
      curAns--;
    } else {
      cnt.set(val, c - 1);
    }
  };

  for (let qIdx = 0; qIdx < sortedQ.length; qIdx++) {
    const q = sortedQ[qIdx];

    // 移动右端点
    while (curR < q.r) {
      curR++;
      add(curR);
    }
    while (curR > q.r) {
      del(curR);
      curR--;
    }

    // 移动左端点
    while (curL > q.l) {
      curL--;
      add(curL);
    }
    while (curL < q.l) {
      del(curL);
      curL++;
    }

    steps.push({
      arr: [...arr],
      blockSize,
      curL,
      curR,
      targetL: q.l,
      targetR: q.r,
      curAns,
      decision: `处理询问 ${qIdx + 1}/${sortedQ.length} (区间 [${q.l}, ${q.r}])：双指针移达目标，区间相异数字种类为 ${curAns}`,
      message: `指针移动到目标位置，记录询问 id=${q.id} 的答案为 ${curAns}`,
      log: `solveQuery: q=[${q.l}, ${q.r}], ans=${curAns}`,
      codeLine: lines.returnAns,
      statusBadge: { text: `区间 [${q.l}..${q.r}] 答案: ${curAns}`, type: 'success' },
      metrics: { '目标区间': `[${q.l}..${q.r}]`, '相异种类数': curAns, '当前双指针': `[${curL}, ${curR}]` },
    });
  }

  return steps;
}
