/**
 * Class 051: 等差数列差分与两次前缀和还原 (Arithmetic Sequence Difference)
 * 二阶差分 4 点打标与 O(N) 离线批量还原 / 洛谷 P4231
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { ARITHMETIC_DIFF_051_CODES, ARITHMETIC_DIFF_051_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderArithmeticDiffBoard } from './array-049-055-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ArithmeticDiff051Step extends Array049Step {
  diff2: number[];
  l: number;
  r: number;
  s: number;
  e: number;
  d: number;
  stage: string;
}

export function buildArithmeticDiff051Steps(): ArithmeticDiff051Step[] {
  const steps: ArithmeticDiff051Step[] = [];
  const lines = ARITHMETIC_DIFF_051_LINES;

  // Step 0: 入口初始化
  steps.push({
    diff2: [0, 0, 0, 0, 0, 0, 0, 0],
    l: 2,
    r: 5,
    s: 2,
    e: 8,
    d: 2,
    stage: '准备阶段：二阶差分数组全 0',
    decision: '主函数入口：准备在区间 [2, 5] 上施加等差数列 (首项 s=2, 末项 e=8, 公差 d=2)。',
    message: '直接暴力修改单次需 O(L)，而二阶差分仅需在 4 个关键点打标，耗时 O(1)！',
    log: 'enter addArithmetic: l=2, r=5, s=2, e=8, d=2',
    codeLine: lines.entryAdd,
    metrics: { '区间': '[2, 5]', '首项/末项/公差': '2 / 8 / 2' },
  });

  // Step 1: 4点打标
  // diff2[2] += 2
  // diff2[3] += (2 - 2) = 0
  // diff2[6] -= (8 + 2) = -10
  // diff2[7] += 8
  const diffAfterMark = [0, 0, 2, 0, 0, 0, -10, 8];
  steps.push({
    diff2: diffAfterMark,
    l: 2,
    r: 5,
    s: 2,
    e: 8,
    d: 2,
    stage: '4 点打标完成 (O(1) 瞬时操作)',
    decision: '对二阶差分进行 4 点打标：diff2[2]+=2, diff2[3]+=0, diff2[6]-=10, diff2[7]+=8。',
    message: '利用二阶差分性质：首项由一阶差分引入，公差由二阶差分单点常数引入，末端通过截断和恢复消除影响。',
    log: 'mark 4 points: diff2[2]=+2, diff2[6]=-10, diff2[7]=+8',
    codeLine: lines.markPoints,
    statusBadge: { text: '打标完成', type: 'info' },
    metrics: { '打标点数': 4, '时间复杂度': 'O(1)' },
  });

  // Step 2: 第一次前缀和还原一阶差分
  // diffAfterMark: [0, 0, 2, 0, 0, 0, -10, 8]
  // prefix1: [0, 0, 2, 2, 2, 2, -8, 0]
  const prefix1 = [0, 0, 2, 2, 2, 2, -8, 0];
  steps.push({
    diff2: prefix1,
    l: 2,
    r: 5,
    s: 2,
    e: 8,
    d: 2,
    stage: '第 1 次前缀和：还原一阶差分数组 d1',
    decision: '对二阶差分做第 1 次前缀和累加，区间 [2, 5] 内的一阶增量恒为公差 2！',
    message: '可以看到下标 2 到 5 处的值全为 2，这正是等差数列相邻项相差为 2 的一阶差分！',
    log: 'first prefix sum complete -> d1 restored',
    codeLine: lines.firstPrefix,
    statusBadge: { text: '一阶差分还原', type: 'info' },
    metrics: { '一阶差分[2..5]': '全是 2', '阶段': '还原 1/2' },
  });

  // Step 3: 第二次前缀和还原原数组
  // prefix1: [0, 0, 2, 2, 2, 2, -8, 0]
  // prefix2: [0, 0, 2, 4, 6, 8, 0, 0]
  const prefix2 = [0, 0, 2, 4, 6, 8, 0, 0];
  steps.push({
    diff2: prefix2,
    l: 2,
    r: 5,
    s: 2,
    e: 8,
    d: 2,
    stage: '第 2 次前缀和：彻底还原原数组 arr',
    decision: '对一阶差分做第 2 次前缀和累加，区间 [2, 5] 正好生成等差数列 [2, 4, 6, 8]！',
    message: '且下标 6 之后完全抵消归 0，证明等差数列的增量只影响了指定区间，边界外无任何残留！',
    log: 'second prefix sum complete -> [2, 4, 6, 8] restored exactly',
    codeLine: lines.secondPrefix,
    statusBadge: { text: '原数组完美还原', type: 'success' },
    metrics: { '区间序列': '[2, 4, 6, 8]', '最终状态': '已还原' },
  });

  return steps;
}

export const arithmeticDiff051Visualizer = registerDeclarativeAlgorithm<ArithmeticDiff051Step>({
  id: 'arithmetic-sequence-difference-051',
  name: '等差数列差分与两次前缀和 (Class 051)',
  category: 'array',
  difficulty: 'hard',
  problemContent: ARRAY_049_055_PROBLEMS.arithmeticDiff051,
  sourceCodes: ARITHMETIC_DIFF_051_CODES,
  generateSteps: buildArithmeticDiff051Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderArithmeticDiffBoard(
          step.diff2,
          step.l,
          step.r,
          step.s,
          step.e,
          step.d,
          step.stage
        )}
        ${renderFormulaCard(
          '等差数列二阶差分 4 点打标公式',
          'd_2[l] \\mathrel{+}= s, \\quad d_2[l+1] \\mathrel{+}= (d - s), \\quad d_2[r+1] \\mathrel{-}= (e + d), \\quad d_2[r+2] \\mathrel{+}= e',
          '一次等差数列区间修改仅需在 4 个关键坐标上做加减打标 ($O(1)$)；所有修改完成后，连续做 2 次前缀和扫描即可在 $O(N)$ 时间内完整恢复原数组。'
        )}
      </div>
    `;
  },
});
