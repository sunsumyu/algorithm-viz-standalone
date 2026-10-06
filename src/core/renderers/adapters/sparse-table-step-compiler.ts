/**
 * ST 表 (Sparse Table) RMQ 算法步骤编译器深模块 (SparseTableStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与严格一行一步代码行号联动规范
 */

import { Tree117Step } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import {
  SPARSE_TABLE_CODES,
  SPARSE_TABLE_LINES,
} from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-stage-codes';

export { SPARSE_TABLE_CODES, SPARSE_TABLE_LINES };

export interface SparseTableStep extends Tree117Step {
  nums: number[];
  st: number[][];
  activeI: number;
  activeJ: number;
  queryL: number;
  queryR: number;
  maxAns: number;
}

export function buildSparseTableSteps(
  nums: number[],
  ql: number,
  qr: number
): SparseTableStep[] {
  const steps: SparseTableStep[] = [];
  const lines = SPARSE_TABLE_LINES;
  const n = nums.length;
  if (n === 0) return steps;

  const maxK = Math.floor(Math.log2(n)) + 1;
  const st: number[][] = Array.from({ length: n }, () => new Array(maxK).fill(0));

  // 初始化第 0 列 (长度为 1 的最值即自身)
  for (let i = 0; i < n; i++) {
    st[i][0] = nums[i];
  }

  // 倍增递推构建 ST 表
  for (let j = 1; j < maxK; j++) {
    const span = 1 << (j - 1);
    for (let i = 0; i + (1 << j) - 1 < n; i++) {
      st[i][j] = Math.max(st[i][j - 1], st[i + span][j - 1]);
    }
  }

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    st: st.map(r => [...r]),
    activeI: -1,
    activeJ: -1,
    queryL: ql,
    queryR: qr,
    maxAns: 0,
    decision: `主函数入口：接收序列 nums=[${nums.join(', ')}] (长 ${n})，准备在 O(1) 内查询区间 [${ql}..${qr}] 的最大值`,
    message: 'ST 表已完成 O(N log N) 倍增预处理，任意区间查询可通过重叠覆盖瞬间完成',
    log: `enter queryRMQ(ql=${ql}, qr=${qr})`,
    codeLine: lines.entry,
    metrics: { '数据规模 n': n, '目标区间': `[${ql}..${qr}]`, '倍增列数': maxK },
  });

  // Step 1: 计算幂次 k
  const len = Math.max(1, qr - ql + 1);
  const k = Math.floor(Math.log2(len));
  const span = 1 << k;

  steps.push({
    nums: [...nums],
    st: st.map(r => [...r]),
    activeI: ql,
    activeJ: k,
    queryL: ql,
    queryR: qr,
    maxAns: 0,
    decision: `计算覆盖幂次：区间长度 len = ${qr} - ${ql} + 1 = ${len} ➔ k = log2(${len}) = ${k} (2^${k} = ${span})`,
    message: `使用两段长度为 ${span} 的子区间 [${ql}..${ql + span - 1}] 与 [${qr - span + 1}..${qr}] 完美重叠覆盖原区间`,
    log: `calc k=log2(${len})=${k}`,
    codeLine: lines.calcK,
    metrics: { '区间长度': len, '最大幂次 k': k, '跨度 2^k': span },
    statusBadge: { text: `k = ${k}`, type: 'info' },
  });

  // Step 2: 提取两段重叠区间的最大值
  const leftVal = st[ql][k];
  const rightStart = qr - span + 1;
  const rightVal = st[rightStart][k];
  const ans = Math.max(leftVal, rightVal);

  steps.push({
    nums: [...nums],
    st: st.map(r => [...r]),
    activeI: ql,
    activeJ: k,
    queryL: ql,
    queryR: qr,
    maxAns: ans,
    decision: `🏆 O(1) 最值瞬间合并：max(ST[${ql}][${k}] (${leftVal}), ST[${rightStart}][${k}] (${rightVal})) = ${ans}！返回 ${ans}`,
    message: '因为 max 运算满足幂等性 (x max x = x)，中间重叠部分不影响最值结果，单次耗时严格为 O(1)',
    log: `return max(${leftVal}, ${rightVal}) = ${ans}`,
    codeLine: lines.queryAns,
    metrics: { '左半跨度值': leftVal, '右半跨度值': rightVal, '最终最大值': ans },
    statusBadge: { text: `最大值 = ${ans}`, type: 'success' },
  });

  return steps;
}
