/**
 * Class 050: 二维前缀和与区域检索 (Range Sum Query 2D - Immutable)
 * 几何容斥原理与 O(1) 瞬时区域检索 / LeetCode 304
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { PREFIX_SUM_2D_050_CODES, PREFIX_SUM_2D_050_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderPrefixSum2DBoard } from './array-049-055-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PrefixSum2D050Step extends Array049Step {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  sumVal: number;
  desc: string;
}

export function buildPrefixSum2D050Steps(): PrefixSum2D050Step[] {
  const steps: PrefixSum2D050Step[] = [];
  const lines = PREFIX_SUM_2D_050_LINES;

  // Step 0: 入口与初始化
  steps.push({
    r1: 0,
    c1: 0,
    r2: 0,
    c2: 0,
    sumVal: 0,
    desc: '初始化 (N+1)x(M+1) 前缀和矩阵 sum[][]，多开一行一列避免边界越界判定。',
    decision: '主函数入口：构建 2D 矩阵前缀和，原矩阵尺寸 3x3。',
    message: '利用二维几何容斥原理：sum[i][j] = 上 + 左 - 左上重叠 + 当前格子值。',
    log: 'enter build2DPrefix: matrix 3x3 initialized',
    codeLine: lines.entryBuild,
    metrics: { '矩阵大小': '3x3', '状态': '建表中' },
  });

  // Step 1: 容斥建表完成
  steps.push({
    r1: 0,
    c1: 0,
    r2: 0,
    c2: 0,
    sumVal: 0,
    desc: '遍历完成，2D 前缀和累加表 sum 全部填充就绪，支持任意区间 O(1) 瞬时响应。',
    decision: '矩阵填充完成：已将所有子矩形面积预处理完毕。',
    message: '预处理耗时严格为 O(N*M)，单次询问耗时严格 O(1)。',
    log: '2D prefix table build complete: O(NM)',
    codeLine: lines.fillSum,
    statusBadge: { text: '前缀和表就绪', type: 'info' },
    metrics: { '预处理复杂度': 'O(N*M)', '查询复杂度': 'O(1)' },
  });

  // Step 2: 查询区域 (0, 1) 到 (1, 2)
  steps.push({
    r1: 0,
    c1: 1,
    r2: 1,
    c2: 2,
    sumVal: 12,
    desc: 'sumRegion(0, 1, 1, 2) = sum[2][3] - sum[0][3] - sum[2][1] + sum[0][1] = 18 - 0 - 6 + 0 = 12。',
    decision: '瞬时检索矩形子区域 [(0,1) -> (1,2)]。',
    message: '运用容斥原理展开 4 个端点前缀和，相减并加上双重减去的左上角。',
    log: 'query sumRegion(0,1,1,2) -> 12',
    codeLine: lines.calcRegion,
    statusBadge: { text: '区域和 = 12', type: 'success' },
    metrics: { '检索区域': '(0,1)->(1,2)', '区域和': 12 },
  });

  // Step 3: 查询区域 (1, 1) 到 (2, 2)
  steps.push({
    r1: 1,
    c1: 1,
    r2: 2,
    c2: 2,
    sumVal: 20,
    desc: 'sumRegion(1, 1, 2, 2) = sum[3][3] - sum[1][3] - sum[3][1] + sum[1][1] = 36 - 8 - 12 + 4 = 20。',
    decision: '瞬时检索右下角 2x2 矩形子区域 [(1,1) -> (2,2)]。',
    message: '单次加减运算即刻获知闭合区域内部所有元素总和。',
    log: 'query sumRegion(1,1,2,2) -> 20',
    codeLine: lines.calcRegion,
    statusBadge: { text: '区域和 = 20', type: 'success' },
    metrics: { '检索区域': '(1,1)->(2,2)', '区域和': 20 },
  });

  return steps;
}

export const prefixSum2D050Visualizer = registerDeclarativeAlgorithm<PrefixSum2D050Step>({
  id: 'prefix-sum-2d-050',
  name: '二维前缀和与区域检索 (Class 050)',
  category: 'array',
  difficulty: 'medium',
  problemContent: ARRAY_049_055_PROBLEMS.prefixSum2D050,
  sourceCodes: PREFIX_SUM_2D_050_CODES,
  generateSteps: buildPrefixSum2D050Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderPrefixSum2DBoard(
          step.r1,
          step.c1,
          step.r2,
          step.c2,
          step.sumVal,
          step.desc
        )}
        ${renderFormulaCard(
          '二维几何容斥核心定理',
          '\\text{sumRegion}(r_1, c_1, r_2, c_2) = S[r_2+1][c_2+1] - S[r_1][c_2+1] - S[r_2+1][c_1] + S[r_1][c_1]',
          '利用容斥原理在大矩形中扣除上矩形和左矩形，并对重叠扣除的左上矩形进行 1 次补回，从而在 $O(1)$ 常数时间内完成任意矩形区域和查询。'
        )}
      </div>
    `;
  },
});
