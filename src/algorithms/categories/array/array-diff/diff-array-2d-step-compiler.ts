/**
 * 二维差分与二维前缀和步骤编译器
 * 负责推演四角点差分标记与二维前缀和容斥还原步骤
 */

import { DIFF_2D_LINES } from './array-diff-stage-codes';
import { ArrayDiffStep } from './array-diff-shared';

export interface Diff2DStep extends ArrayDiffStep {
  n: number;
  m: number;
  ops: number[][];
}

export function buildDiff2DSteps(ops: number[][], n: number, m: number): Diff2DStep[] {
  const steps: Diff2DStep[] = [];
  const lines = DIFF_2D_LINES;

  const diff = Array.from({ length: n + 2 }, () => new Array(m + 2).fill(0));

  // Step 0: 入口
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: [],
    decision: `主函数入口：处理 ${ops.length} 组二维子矩阵增量操作，网格规模 ${n}×${m}`,
    message: '利用二维容斥原理，每次子矩阵增量修改仅需在 4 个关键角点执行 O(1) 增减',
    log: `enter solve(ops, n=${n}, m=${m})`,
    codeLine: lines.entry,
    metrics: { '行数 n': `${n}`, '列数 m': `${m}`, '操作数': `${ops.length}` },
  });

  // Step 1: 内存分配
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: [],
    decision: `分配二维差分矩阵：int[][] diff = new int[${n + 2}][${m + 2}]`,
    message: '外围保留边界哨兵避免越界',
    log: 'init 2D diff matrix',
    codeLine: lines.initDiff,
    metrics: { '矩阵尺寸': `${n + 2}×${m + 2}` },
  });

  // Step 2: 遍历操作修改四个角点
  for (const op of ops) {
    const [x1, y1, x2, y2, val] = op;
    diff[x1][y1] += val;
    diff[x2 + 1][y1] -= val;
    diff[x1][y2 + 1] -= val;
    diff[x2 + 1][y2 + 1] += val;

    steps.push({
      n,
      m,
      ops,
      diffMatrix: diff.map(r => [...r]),
      ansMatrix: [],
      decision: `标记子矩阵 (${x1}, ${y1}) ~ (${x2}, ${y2}) 加 ${val}：
diff[${x1}][${y1}] += ${val}, diff[${x2 + 1}][${y1}] -= ${val}, diff[${x1}][${y2 + 1}] -= ${val}, diff[${x2 + 1}][${y2 + 1}] += ${val}`,
      message: '四角点增减抵消完成',
      log: `op [${x1},${y1}] to [${x2},${y2}] val=${val}`,
      codeLine: lines.updateCorners,
      metrics: { '修改区域': `(${x1},${y1})~(${x2},${y2})`, '增量': `+${val}` },
    });
  }

  // Step 3: 二维前缀和还原
  const ans = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: ans.map(r => [...r]),
    decision: `开始二维前缀和扫描还原：int[][] ans = new int[${n + 1}][${m + 1}]`,
    message: '递推式 ans[i][j] = ans[i-1][j] + ans[i][j-1] - ans[i-1][j-1] + diff[i][j]',
    log: 'start 2D prefix sum scan',
    codeLine: lines.initAns,
    metrics: { '还原进度': '准备扫描' },
  });

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      ans[i][j] = ans[i - 1][j] + ans[i][j - 1] - ans[i - 1][j - 1] + diff[i][j];
    }
  }

  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: ans.map(r => [...r]),
    decision: '二维前缀和容斥扫描完成！全矩阵真实值成功恢复',
    message: '每一个格子均为左方、上方和左上方的容斥叠加',
    log: '2D prefix sum scan finished',
    codeLine: lines.prefix2D,
    metrics: { '还原状态': '已完成' },
  });

  // Step 4: 返回
  steps.push({
    n,
    m,
    ops,
    diffMatrix: diff.map(r => [...r]),
    ansMatrix: ans.map(r => [...r]),
    decision: `🎉 二维差分计算完成！最终还原的 ${n}×${m} 网格已完全收敛`,
    message: '算法成功收敛',
    log: 'done 2D diff',
    codeLine: lines.returnAns,
    metrics: { '最终结果': `${n}×${m} 矩阵已还原` },
  });

  return steps;
}
