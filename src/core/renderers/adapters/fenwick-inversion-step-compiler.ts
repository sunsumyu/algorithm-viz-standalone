/**
 * Class 109: 树状数组求逆序对数 (Inversion Count) 步骤编译器
 * 洛谷 P1908
 * 深模块核心编译器 (Deep Module)
 */

import { FENWICK_INVERSION_CODES, FENWICK_INVERSION_LINES } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-stage-codes';
import { Tree108Step } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';
import { lowbit } from './fenwick-tree-step-compiler';

export interface FenwickInversionStep extends Tree108Step {
  nums: number[];
  ranks: number[];
  curIdx: number;
  curNum: number;
  curRank: number;
  smallerCount: number;
  totalInversions: number;
  bitTree: number[];
}

export { FENWICK_INVERSION_CODES, FENWICK_INVERSION_LINES };

export function discretize(nums: number[]): number[] {
  const sorted = [...nums].sort((a, b) => a - b);
  const unique = Array.from(new Set(sorted));
  return nums.map(x => unique.indexOf(x) + 1);
}

export function buildFenwickInversionSteps(nums: number[]): FenwickInversionStep[] {
  const steps: FenwickInversionStep[] = [];
  const lines = FENWICK_INVERSION_LINES;
  const currentNums = [...nums];
  const n = currentNums.length;
  const ranks = discretize(currentNums);
  const bitTree = new Array(n + 1).fill(0);

  // Helper BIT operations
  const bitAdd = (idx: number, v: number) => {
    for (; idx <= n; idx += lowbit(idx)) bitTree[idx] += v;
  };
  const bitQuery = (idx: number): number => {
    let s = 0;
    for (; idx > 0; idx -= lowbit(idx)) s += bitTree[idx];
    return s;
  };

  // Step 0: 入口
  steps.push({
    nums: [...currentNums],
    ranks: [...ranks],
    curIdx: -1,
    curNum: 0,
    curRank: 0,
    smallerCount: 0,
    totalInversions: 0,
    bitTree: [...bitTree],
    decision: `主函数入口：接收待统计序列 nums=[${currentNums.join(', ')}] (长 ${n})`,
    message: '准备通过离散化映射 + 树状数组倒序扫描，在 O(N log N) 内求出逆序对总数',
    log: `enter countInversions(nums=${currentNums.length})`,
    codeLine: lines.entry,
    metrics: { '数据规模': n, '当前逆序对': 0 },
  });

  // Step 1: 离散化
  steps.push({
    nums: [...currentNums],
    ranks: [...ranks],
    curIdx: -1,
    curNum: 0,
    curRank: 0,
    smallerCount: 0,
    totalInversions: 0,
    bitTree: [...bitTree],
    decision: `离散化处理完成：原数组映射为排名 Ranks=[${ranks.join(', ')}] (值域 1 ~ ${Math.max(...ranks, 0)})`,
    message: '值域收敛到 [1..n]，支持作为树状数组合法下标',
    log: `discretized ranks: [${ranks.join(', ')}]`,
    codeLine: lines.discretize,
    metrics: { '离散化项数': n, '当前逆序对': 0 },
  });

  let totalInversions = 0;

  // 倒序扫描
  for (let i = n - 1; i >= 0; i--) {
    const num = currentNums[i];
    const rank = ranks[i];

    // 查询右侧比自身小的个数
    const smallerCount = bitQuery(rank - 1);
    totalInversions += smallerCount;

    steps.push({
      nums: [...currentNums],
      ranks: [...ranks],
      curIdx: i,
      curNum: num,
      curRank: rank,
      smallerCount,
      totalInversions,
      bitTree: [...bitTree],
      decision: `🔍 统计右侧较小元素：nums[${i}]=${num} (Rank=${rank})，查询比其小的已入库元素数量 bit.query(${rank - 1}) = ${smallerCount}`,
      message: `累计贡献逆序对 +${smallerCount}，当前总逆序对增至 ${totalInversions}`,
      log: `at index ${i}, num=${num}, rank=${rank}, smaller=${smallerCount}, total=${totalInversions}`,
      codeLine: lines.queryCnt,
      metrics: { '当前元素': num, '单步新增逆序对': smallerCount, '累计逆序对': totalInversions },
      statusBadge: smallerCount > 0 ? { text: `+${smallerCount} 逆序对`, type: 'warning' } : { text: '+0', type: 'info' },
    });

    // 将自身 rank 写入树状数组
    bitAdd(rank, 1);

    steps.push({
      nums: [...currentNums],
      ranks: [...ranks],
      curIdx: i,
      curNum: num,
      curRank: rank,
      smallerCount,
      totalInversions,
      bitTree: [...bitTree],
      decision: `📥 当前元素入库：执行 bit.add(rank=${rank}, 1)，将其记录入树状数组`,
      message: '供后续左侧的更大元素检索',
      log: `bit.add(${rank}, 1)`,
      codeLine: lines.addVal,
      metrics: { '当前元素': num, '已入库元素数': n - i, '累计逆序对': totalInversions },
    });
  }

  // Step End: 终局
  steps.push({
    nums: [...currentNums],
    ranks: [...ranks],
    curIdx: -1,
    curNum: 0,
    curRank: 0,
    smallerCount: 0,
    totalInversions,
    bitTree: [...bitTree],
    decision: `🏆 算法完成：原数组逆序对总数为 ${totalInversions} 对！返回 ${totalInversions}`,
    message: `整个统计流程仅需 O(N log N) 复杂度`,
    log: `return totalInversions=${totalInversions}`,
    codeLine: lines.returnAns,
    metrics: { '最终逆序对数': totalInversions },
    statusBadge: { text: `共 ${totalInversions} 对`, type: 'success' },
  });

  return steps;
}
