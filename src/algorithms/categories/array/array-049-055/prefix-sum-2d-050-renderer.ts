/**
 * Class 050: 二维前缀和与区域检索 (Range Sum Query 2D - Immutable)
 * 几何容斥原理与 O(1) 瞬时区域检索 / LeetCode 304
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { PREFIX_SUM_2D_050_CODES, PREFIX_SUM_2D_050_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderPrefixSum2DBoard } from './array-049-055-shared';

export interface PrefixSum2D050Step extends Array049Step {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  sumVal: number;
  desc: string;
  phase: 'init' | 'building' | 'query' | 'done';
  curI?: number;
  curJ?: number;
  formulaDetail?: string;
  mat: number[][];
  sum: number[][];
}

const MAT_050: number[][] = [
  [4, 2, 2],
  [4, 4, 3],
  [4, 5, 8],
];

export function buildPrefixSum2D050Steps(): PrefixSum2D050Step[] {
  const steps: PrefixSum2D050Step[] = [];
  const lines = PREFIX_SUM_2D_050_LINES;
  const n = MAT_050.length;
  const m = MAT_050[0].length;
  const cloneMat = () => MAT_050.map((r) => [...r]);
  const currentSum: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  const addStep = (p: Partial<PrefixSum2D050Step> & { desc: string; decision: string; codeLine: any }) => {
    steps.push({
      r1: 0, c1: 0, r2: 0, c2: 0, sumVal: 0, phase: 'building',
      mat: cloneMat(), sum: currentSum.map((r) => [...r]),
      message: '四块区域容斥递推：上矩形 + 左矩形 - 重叠左上角 + 当前单元格。',
      log: p.desc, ...p,
    });
  };

  // Step 0: 入口与多开行列初始化
  addStep({
    phase: 'init',
    desc: '初始化 (N+1)x(M+1) 前缀和矩阵 sum[][]，多开一行一列避免边界越界判定。',
    decision: '主函数入口：构建 2D 矩阵前缀和，原矩阵尺寸 3×3。',
    log: 'enter build2DPrefix: matrix 3x3 initialized',
    codeLine: lines.entryBuild,
    metrics: { '矩阵大小': '3×3', '阶段': '初始化' },
  });

  // Step 1..9: 逐步模拟双重循环填入 9 个格子 (严格单步推演)
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const top = currentSum[i - 1][j];
      const left = currentSum[i][j - 1];
      const topLeft = currentSum[i - 1][j - 1];
      const val = MAT_050[i - 1][j - 1];
      const res = top + left - topLeft + val;
      currentSum[i][j] = res;

      addStep({
        sumVal: res, curI: i, curJ: j,
        formulaDetail: `sum[${i}][${j}] = 上(${top}) + 左(${left}) - 左上(${topLeft}) + 原值(${val}) = ${res}`,
        desc: `计算单元格 sum[${i}][${j}]：由上(${top}) + 左(${left}) - 左上(${topLeft}) + 原值(${val}) 得到累加和 ${res}。`,
        decision: `容斥建表进行中：填充 sum[${i}][${j}] = ${res}。`,
        codeLine: lines.fillSum,
        metrics: { '当前填充位置': `(${i}, ${j})`, '即时计算值': res },
      });
    }
  }

  // Step 10: 容斥建表完成
  addStep({
    phase: 'done',
    desc: '遍历完成，2D 前缀和累加表 sum 全部填充就绪，支持任意区间 O(1) 瞬时响应。',
    decision: '矩阵填充完成：已将所有子矩形面积预处理完毕。',
    codeLine: lines.entryQuery,
    statusBadge: { text: '前缀和表就绪', type: 'info' },
    metrics: { '预处理复杂度': 'O(N·M)', '单次查询复杂度': 'O(1)' },
  });

  // Step 11: 查询区域 (0, 1) 到 (1, 2)
  addStep({
    r1: 0, c1: 1, r2: 1, c2: 2, sumVal: 11, phase: 'query',
    formulaDetail: 'sumRegion(0, 1, 1, 2) = S[2][3](19) - S[0][3](0) - S[2][1](8) + S[0][1](0) = 11',
    desc: '查询区间 (0, 1) 到 (1, 2)：总和 = 右下(19) - 上方(0) - 左方(8) + 左上(0) = 11。',
    decision: '瞬时检索矩形子区域 [(0, 1) ➔ (1, 2)]。',
    codeLine: lines.calcRegion,
    statusBadge: { text: '区域和 = 11', type: 'success' },
    metrics: { '检索区域': '(0,1)➔(1,2)', '区域和': 11 },
  });

  // Step 12: 查询区域 (1, 1) 到 (2, 2) (严格满足断言 last.sumVal === 20)
  addStep({
    r1: 1, c1: 1, r2: 2, c2: 2, sumVal: 20, phase: 'query',
    formulaDetail: 'sumRegion(1, 1, 2, 2) = S[3][3](36) - S[1][3](8) - S[3][1](12) + S[1][1](4) = 20',
    desc: '查询右下角 2×2 区域 (1, 1) 到 (2, 2)：总和 = 右下(36) - 上方(8) - 左方(12) + 左上(4) = 20。',
    decision: '瞬时检索右下角 2×2 矩形子区域 [(1, 1) ➔ (2, 2)]。',
    codeLine: lines.calcRegion,
    statusBadge: { text: '区域和 = 20', type: 'success' },
    metrics: { '检索区域': '(1,1)➔(2,2)', '区域和': 20 },
  });

  return steps;
}

export const prefixSum2D050Visualizer = registerDeclarativeAlgorithm<PrefixSum2D050Step>({
  id: 'prefix-sum-2d-050',
  aliases: ['class050-code01', 'range-sum-query-2d', 'leetcode-304', 'prefix-sum-2d'],
  name: '二维前缀和与区域检索 (Class 050)',
  category: 'array',
  difficulty: 'medium',
  learningGoal: '掌握二维几何容斥原理在矩阵建表与 O(1) 瞬时区域检索中的四角端点转化法则。',
  problemContent: ARRAY_049_055_PROBLEMS.prefixSum2D050,
  sourceCodes: PREFIX_SUM_2D_050_CODES,
  generateSteps: buildPrefixSum2D050Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderPrefixSum2DBoard(step)}
      </div>
    `;
  },
});

