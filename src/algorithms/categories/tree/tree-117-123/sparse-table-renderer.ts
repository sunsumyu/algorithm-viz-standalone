/**
 * Class 117: ST 表 (Sparse Table) RMQ
 * 洛谷 P3865 【模板】ST 表
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import { SPARSE_TABLE_CODES, SPARSE_TABLE_LINES } from './tree-117-123-stage-codes';
import { Tree117Step, renderSparseTableVisual } from './tree-117-123-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  const len = qr - ql + 1;
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

export const sparseTableVisualizer = registerDeclarativeAlgorithm<SparseTableStep>({
  id: 'sparse-table-117',
  name: 'ST 表 (Sparse Table) RMQ (Class 117)',
  category: 'tree',
  icon: '📊',
  difficulty: 2,
  levelOrder: 117,
  learningGoal: '掌握 ST 表倍增状态设计与可重复贡献性质（Idempotent），理解 O(1) 常数时间静态区间最值查询原理',
  problemHtml: TREE_117_123_PROBLEMS.sparseTable.html,
  analysisHtml: TREE_117_123_PROBLEMS.sparseTable.html,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (逗号分隔)',
      type: 'text',
      defaultValue: '3,2,4,5,6,8,1,2,9,7',
      placeholder: '请输入正整数序列',
    },
    {
      id: 'ql',
      label: '查询左端点 ql (0-based)',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 20,
    },
    {
      id: 'qr',
      label: '查询右端点 qr (0-based)',
      type: 'number',
      defaultValue: 7,
      min: 0,
      max: 20,
    },
  ],
  codeLanguages: SPARSE_TABLE_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '3,2,4,5,6,8,1,2,9,7').split(',').map(Number).filter(n => !isNaN(n));
    const ql = Math.max(0, Math.min(nums.length - 1, Number(input.ql) || 0));
    const qr = Math.max(ql, Math.min(nums.length - 1, Number(input.qr) || (nums.length - 1)));
    return buildSparseTableSteps(nums, ql, qr);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderSparseTableVisual(step.nums, step.st, step.activeI, step.activeJ)}

        ${renderFormulaCard(
          'ST 表 O(1) 查询公式',
          `k = log2(${step.queryR - step.queryL + 1}) | max(ST[${step.queryL}][k], ST[${step.queryR - (1 << Math.floor(Math.log2(step.queryR - step.queryL + 1))) + 1}][k]) = ${step.maxAns}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
