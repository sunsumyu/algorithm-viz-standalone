import { CANTOR_EXPANSION_LINES } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-stage-codes';
import { Advanced142Step } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';

export interface CantorStep extends Advanced142Step {
  perm: number[];
  n: number;
  curIndex: number;
  smallerCounts: number[];
  factorialWeights: number[];
  rank: number;
}

export function buildCantorSteps(perm: number[]): CantorStep[] {
  const steps: CantorStep[] = [];
  const lines = CANTOR_EXPANSION_LINES;
  const n = perm.length;

  // 预计算阶乘
  const fact = new Array(n + 1).fill(1);
  for (let i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;

  const smallerCounts = new Array(n).fill(0);
  const cloneSmall = () => [...smallerCounts];

  let rank = 1;

  // Step 0: 入口
  steps.push({
    perm: [...perm],
    n,
    curIndex: -1,
    smallerCounts: cloneSmall(),
    factorialWeights: [...fact],
    rank: 1,
    decision: `主函数入口：开始计算全排列 [${perm.join(', ')}] 的康托展开字典序排名`,
    message: `康托展开是一个全双射，将 1 ~ N 的全排列映射为 1 ~ N! 的字典序序号`,
    log: `enter cantor(perm=[${perm.join(', ')}], n=${n})`,
    codeLine: lines.entry,
    metrics: { '排列长度 N': n, '全排列总数 N!': fact[n], '初始排名': 1 },
  });

  for (let i = 0; i < n; i++) {
    // 统计右侧较小数字个数
    let smaller = 0;
    for (let j = i + 1; j < n; j++) {
      if (perm[j] < perm[i]) smaller++;
    }
    smallerCounts[i] = smaller;

    steps.push({
      perm: [...perm],
      n,
      curIndex: i,
      smallerCounts: cloneSmall(),
      factorialWeights: [...fact],
      rank,
      decision: `扫描位置 [${i}] 元素 ${perm[i]}：右侧未出现且比 ${perm[i]} 小的数字共有 ${smaller} 个`,
      message: `说明在第 ${i} 位上，若填入比 ${perm[i]} 小的数，可构成更小的字典序排列`,
      log: `countSmall: i=${i}, perm[i]=${perm[i]}, smaller=${smaller}`,
      codeLine: lines.countSmall,
      metrics: { '当前位置': i, '当前数字': perm[i], '右侧更小数个数': smaller },
    });

    const weight = fact[n - 1 - i];
    const addVal = smaller * weight;
    rank += addVal;

    steps.push({
      perm: [...perm],
      n,
      curIndex: i,
      smallerCounts: cloneSmall(),
      factorialWeights: [...fact],
      rank,
      decision: `累加位置 [${i}] 贡献：${smaller} &times; ${n - 1 - i}! (${weight}) = +${addVal}，当前排名累计为 ${rank}`,
      message: `后续 ${n - 1 - i} 个位置的全排列数共有 ${weight} 种可能`,
      log: `accumRank: i=${i}, weight=${weight}, add=${addVal}, newRank=${rank}`,
      codeLine: lines.accumRank,
      metrics: { '阶乘位权': `${n - 1 - i}! = ${weight}`, '本位贡献': addVal, '累计 Rank': rank },
    });
  }

  // Step: 终态返回
  steps.push({
    perm: [...perm],
    n,
    curIndex: -1,
    smallerCounts: cloneSmall(),
    factorialWeights: [...fact],
    rank,
    decision: `🎉 计算完成：排列 [${perm.join(', ')}] 的康托展开字典序排名为 ${rank}`,
    message: `康托展开建立在变进制数论基础之上，逆展开可用除法与模运算逐位还原排列`,
    log: `returnAns: rank=${rank}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `字典序第 ${rank} 位`, type: 'success' },
    metrics: { '最终字典序排名': rank, '全排列占比': `${((rank / fact[n]) * 100).toFixed(1)}%` },
  });

  return steps;
}
