import { Dp079Step } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-shared';
import { KNUTH_QUADRANGLE_083_LINES } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-stage-codes';

export interface Knuth083Step extends Dp079Step {
  stones: number[];
  i: number;
  j: number;
  optL: number;
  optR: number;
  bestK: number;
  minCost: number;
}

export function buildKnuth083Steps(input?: number[] | { stones?: number[] }): Knuth083Step[] {
  const steps: Knuth083Step[] = [];
  const lines = KNUTH_QUADRANGLE_083_LINES;

  let stones = [3, 2, 4, 1];
  if (Array.isArray(input)) {
    stones = input;
  } else if (input && Array.isArray(input.stones)) {
    stones = input.stones;
  }
  const n = stones.length;

  const sum: number[] = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    sum[i + 1] = sum[i]! + stones[i]!;
  }

  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const opt: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    opt[i]![i] = i;
  }

  // Step 0: 入口
  steps.push({
    stones,
    i: 0,
    j: 0,
    optL: 0,
    optR: 0,
    bestK: 0,
    minCost: 0,
    decision: `主函数入口：开始为石子数组 [${stones.join(', ')}] (共 ${n} 堆) 求解最小合并代价。`,
    message: '四边形不等式证明了决策单调性：opt[i][j-1] <= opt[i][j] <= opt[i+1][j]，可大幅剪除无效切分枚举。',
    log: `enter mergeStones: stones=[${stones.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '石子堆数': n, '总石子数': sum[n]! },
  });

  // Step 1: 长度为 1 决策基准初始化
  steps.push({
    stones,
    i: 0,
    j: 0,
    optL: 0,
    optR: 0,
    bestK: 0,
    minCost: 0,
    decision: '初始化单石子区间决策点：对于所有 i，opt[i][i] = i，单堆石子合并代价为 0。',
    message: '长度为 1 的基准状态已确立，为长度为 2 的决策区间提供左右夹逼边界。',
    log: 'init base opt[i][i] = i',
    codeLine: lines.initOptBase,
    statusBadge: { text: '基准决策点就绪', type: 'info' },
    metrics: { '基准点数': n, '单堆代价': 0 },
  });

  for (let len = 2; len <= n; len++) {
    steps.push({
      stones,
      i: 0,
      j: len - 1,
      optL: 0,
      optR: len - 1,
      bestK: 0,
      minCost: dp[0]![len - 1]!,
      decision: `推进至合并跨度 len = ${len}：自底向上枚举所有长度为 ${len} 的连续子区间。`,
      message: `区间 DP 遵循无后效性，长度为 ${len} 的最优划分完全由严格更短的子区间最优解导出。`,
      log: `len loop: len = ${len}`,
      codeLine: lines.lenLoop,
      statusBadge: { text: `跨度 len = ${len}`, type: 'info' },
      metrics: { '当前合并跨度': len, '待处理区间数': n - len + 1 },
    });

    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i]![j] = Infinity;

      const optL = opt[i]![j - 1]!;
      const optR = Math.min(j - 1, opt[i + 1] ? opt[i + 1]![j]! : j - 1);

      steps.push({
        stones,
        i,
        j,
        optL,
        optR,
        bestK: optL,
        minCost: 0,
        decision: `计算区间 [${i}, ${j}]：Knuth 剪枝将决策切分点范围极速收窄至 [${optL}, ${optR}]！`,
        message: `原本需要枚举 [${i} .. ${j - 1}] 共 ${j - i} 个切点，现在只需在 [${optL} .. ${optR}] 内验证 ${optR - optL + 1} 个切点。`,
        log: `range [${i}, ${j}]: opt in [${optL}, ${optR}]`,
        codeLine: lines.knuthRange,
        statusBadge: { text: `剪枝范围 [${optL}, ${optR}]`, type: 'info' },
        metrics: { '区间': `[${i}, ${j}]`, '剪枝左界': optL, '剪枝右界': optR },
      });

      for (let k = optL; k <= optR; k++) {
        const cost = dp[i]![k]! + dp[k + 1]![j]! + sum[j + 1]! - sum[i]!;
        if (cost < dp[i]![j]!) {
          dp[i]![j] = cost;
          opt[i]![j] = k;
        }
      }

      steps.push({
        stones,
        i,
        j,
        optL,
        optR,
        bestK: opt[i]![j]!,
        minCost: dp[i]![j]!,
        decision: `区间 [${i}, ${j}] 求解完毕：在 k=${opt[i]![j]} 处切分最优，最小合并代价为 ${dp[i]![j]}，记录 opt[${i}][${j}] = ${opt[i]![j]}。`,
        message: `合并划分子段 [${i}..${opt[i]![j]}] 与 [${opt[i]![j] + 1}..${j}]，加上区间和 ${sum[j + 1]! - sum[i]!}，总代价为 ${dp[i]![j]}。`,
        log: `update opt: [${i}, ${j}] best k=${opt[i]![j]}, minCost=${dp[i]![j]}`,
        codeLine: lines.updateOpt,
        statusBadge: { text: `[${i}, ${j}] = ${dp[i]![j]}`, type: 'success' },
        metrics: { '最优切点': opt[i]![j]!, '区间最小代价': dp[i]![j]! },
      });
    }
  }

  const finalCost = dp[0]![n - 1]!;

  steps.push({
    stones,
    i: 0,
    j: n - 1,
    optL: opt[0]![n - 2] ?? 0,
    optR: opt[1]![n - 1] ?? (n - 2),
    bestK: opt[0]![n - 1]!,
    minCost: finalCost,
    decision: `四边形不等式优化终结：合并整条序列 [${stones.join(', ')}] 的全局最小代价为 dp[0][${n - 1}] = ${finalCost}！`,
    message: '决策单调性保证了区间端点移动时决策点非严格递增，总枚举次数构成了伸缩求和，将 O(N^3) 严格优化至 O(N^2)。',
    log: `mergeStones complete -> return ${finalCost}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `全局最优代价: ${finalCost}`, type: 'success' },
    metrics: { '全局最小代价': finalCost, '时间复杂度': 'O(N^2)' },
  });

  return steps;
}
