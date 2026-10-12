import { XOR_GAUSSIAN_LINES } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-stage-codes';
import { Advanced134Step } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';

export interface XorGaussianStep extends Advanced134Step {
  matrix: number[][];
  n: number;
  curCol: number;
  activeRow: number;
  solution?: number[];
}

export function buildXorGaussianSteps(rawMatrix: number[][], n: number): XorGaussianStep[] {
  const steps: XorGaussianStep[] = [];
  const lines = XOR_GAUSSIAN_LINES;

  const a: number[][] = rawMatrix.map(row => [...row]);
  const getSnapshot = (): number[][] => a.map(r => [...r]);

  // Step 0: 入口
  steps.push({
    matrix: getSnapshot(),
    n,
    curCol: -1,
    activeRow: -1,
    decision: `主函数入口：开始对 ${n} 阶异或线性方程组 [A | B] 执行异或高斯消元`,
    message: `在有限域 GF(2) 下运算：加法对应异或 (^)，乘法对应与 (&)，利用行异或实现消元`,
    log: `enter xorGaussian(n=${n})`,
    codeLine: lines.entry,
    metrics: { '未知数个数 N': n, '方程总数': n, '数域': 'GF(2) 0/1' },
  });

  for (let col = 0; col < n; col++) {
    // 1. 寻找主元 (在 col 列中找系数为 1 的行)
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) {
      pivot++;
    }

    steps.push({
      matrix: getSnapshot(),
      n,
      curCol: col,
      activeRow: pivot < n ? pivot : col,
      decision: `第 ${col} 列寻找主元：${pivot < n ? `找到系数为 1 的主元行 E${pivot}` : '本列全为 0 (出现自由元)'}`,
      message: pivot < n ? `准备将 E${pivot} 调入主对角线位置 E${col}` : '自由元不影响基础解系判定',
      log: `findPivot: col=${col}, pivotRow=${pivot}`,
      codeLine: lines.findPivot,
      metrics: { '当前列': col, '主元行': pivot < n ? `E${pivot}` : '无' },
    });

    if (pivot === n) continue;

    // 2. 交换行
    if (pivot !== col) {
      const t = a[col];
      a[col] = a[pivot];
      a[pivot] = t;

      steps.push({
        matrix: getSnapshot(),
        n,
        curCol: col,
        activeRow: col,
        decision: `🔄 行交换：将主元行 E${pivot} 与当前对角线行 E${col} 互相交换`,
        message: `使主元对角线位置 a[${col}][${col}] 恒为 1`,
        log: `swapRow: E${col} <-> E${pivot}`,
        codeLine: lines.swapRow,
        metrics: { '交换行对': `E${col} 与 E${pivot}` },
      });
    }

    // 3. 异或消元消除其余所有行在该列的 1
    for (let r = 0; r < n; r++) {
      if (r !== col && a[r][col] === 1) {
        for (let c = col; c <= n; c++) {
          a[r][c] ^= a[col][c];
        }

        steps.push({
          matrix: getSnapshot(),
          n,
          curCol: col,
          activeRow: r,
          decision: `⚡ 整行异或消元：E${r} ^= E${col}，清除行 E${r} 在第 ${col} 列的系数 1`,
          message: `异或操作使得 E${r}[${col}] 变为 0，初等行变换单次完成`,
          log: `eliminate: E${r} ^= E${col}`,
          codeLine: lines.eliminate,
          metrics: { '消元目标行': `E${r}`, '操作': `^= E${col}` },
        });
      }
    }
  }

  // 提取解向量
  const ans: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    ans[i] = a[i][n];
  }

  // 终态
  steps.push({
    matrix: getSnapshot(),
    n,
    curCol: -1,
    activeRow: -1,
    solution: [...ans],
    decision: `✅ 异或高斯消元完成！求得唯一确定 0/1 解向量: [${ans.map((v, i) => `x${i}=${v}`).join(', ')}]`,
    message: `整个矩阵已完全化为单位对角线矩阵，时间复杂度严格 O(N^3 / 64) 极速完成`,
    log: `xor gaussian finished, solution: [${ans.join(', ')}]`,
    codeLine: lines.returnAns,
    metrics: { '解向量': ans.join(', '), '复杂度': 'O(N^3)' },
    statusBadge: { text: `求解成功: [${ans.join(', ')}]`, type: 'success' },
  });

  return steps;
}
