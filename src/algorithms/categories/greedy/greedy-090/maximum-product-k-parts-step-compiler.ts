import { getGreedy090Anchor } from './greedy-090-stage-codes';
import { Greedy090Step, PartitionBarItem } from './greedy-090-shared';

export interface MaxProductKStep extends Greedy090Step {
  totalN: number;
  partsK: number;
  parts: PartitionBarItem[];
  formula: string;
  currentProduct?: string;
  stageNum: number;
}

export function buildMaxProductKStage1Steps(n: number, k: number): MaxProductKStep[] {
  const steps: MaxProductKStep[] = [];
  const safeN = Math.max(k, Math.min(15, n));
  const safeK = Math.max(1, Math.min(5, k));

  const initAnchor = getGreedy090Anchor('max-product-k', 1, 'init');
  // Step 0: 入口帧
  steps.push({
    line: initAnchor.java,
    stepIndex: 0,
    totalN: safeN,
    partsK: safeK,
    parts: [{ length: safeN, label: `总值 ${safeN}`, color: '#64748b' }],
    formula: `探索将 n = ${safeN} 恰好拆成 k = ${safeK} 份的所有组合`,
    currentProduct: '1',
    decision: '启动暴力 DFS 枚举',
    message: `开始暴力尝试：将 ${safeN} 拆分为 ${safeK} 个正整数，穷举所有分支评估最大乘积`,
    log: `[DFS Init] n=${safeN}, k=${safeK}`,
    codeLine: initAnchor,
    stageNum: 1,
  });

  if (safeK === 1) {
    const baseAnchor = getGreedy090Anchor('max-product-k', 1, 'base');
    steps.push({
      line: baseAnchor.java,
      stepIndex: 1,
      totalN: safeN,
      partsK: 1,
      parts: [{ length: safeN, label: `${safeN}`, color: '#10b981' }],
      formula: `k = 1 边界：只有 1 份，乘积即自身 = ${safeN}`,
      currentProduct: String(safeN),
      decision: 'k=1 特判',
      message: `只有 1 份时无需拆分，乘积为 ${safeN}`,
      log: `[Base] k=1, ans=${safeN}`,
      codeLine: baseAnchor,
      stageNum: 1,
    });
    return steps;
  }

  // 模拟分支遍历
  const maxFirst = safeN - safeK + 1;
  let bestProd = 0;
  let bestParts: PartitionBarItem[] = [];

  for (let cur = 1; cur <= Math.min(maxFirst, 4); cur++) {
    const rest = safeN - cur;
    const restParts = safeK - 1;
    // 估算剩余部分的乘积
    const avgRest = Math.floor(rest / restParts);
    const estProd = cur * Math.pow(Math.max(1, avgRest), restParts);

    const curParts: PartitionBarItem[] = [
      { length: cur, label: `当前份: ${cur}`, color: '#f59e0b', highlighted: true },
      { length: rest, label: `剩余 ${restParts} 份之和: ${rest}`, color: '#3b82f6' },
    ];

    if (estProd > bestProd) {
      bestProd = estProd;
      bestParts = [
        { length: cur, label: `${cur}`, color: '#10b981' },
        { length: rest, label: `${rest}`, color: '#10b981' },
      ];
    }

    const loopAnchor = getGreedy090Anchor('max-product-k', 1, 'loop');
    steps.push({
      line: loopAnchor.java,
      stepIndex: steps.length,
      totalN: safeN,
      partsK: safeK,
      parts: curParts,
      formula: `尝试第一份取 ${cur}，剩余 ${rest} 分给剩余 ${restParts} 份，估算乘积 ≈ ${estProd}`,
      currentProduct: String(estProd),
      decision: `枚举第一份 = ${cur}`,
      message: `试探分支：第一份取 ${cur}，剩余 ${rest}，递归评估该子树的乘积`,
      log: `[DFS Try] cur=${cur}, rest=${rest}, estProd=${estProd}`,
      codeLine: loopAnchor,
      stageNum: 1,
    });
  }

  const retAnchor = getGreedy090Anchor('max-product-k', 1, 'ret');
  steps.push({
    line: retAnchor.java,
    stepIndex: steps.length,
    totalN: safeN,
    partsK: safeK,
    parts: bestParts,
    formula: `暴力枚举结束，找到的最优乘积 = ${bestProd}`,
    currentProduct: String(bestProd),
    decision: '暴力搜索完成',
    message: `全部分支搜索完毕，在 n=${safeN}, k=${safeK} 下的最大乘积为 ${bestProd}`,
    log: `[DFS Done] 最优乘积=${bestProd}`,
    codeLine: retAnchor,
    stageNum: 1,
  });

  return steps;
}

export function buildMaxProductKStage2Steps(n: number, k: number): MaxProductKStep[] {
  const steps: MaxProductKStep[] = [];
  const MOD = 1000000007;

  const divAnchor = getGreedy090Anchor('max-product-k', 2, 'div');
  // Step 0: 入口帧
  steps.push({
    line: divAnchor.java,
    stepIndex: 0,
    totalN: n,
    partsK: k,
    parts: [{ length: n, label: `总值 ${n}`, color: '#64748b' }],
    formula: `均分贪心准则：和为定值时，各数越接近，乘积越大。总值 ${n}，目标份数 ${k}`,
    currentProduct: '1',
    decision: '启动均分贪心推演',
    message: `开始均分贪心计算：将数字 ${n} 分为 ${k} 份，利用除法与取模求得基数 a 与余数 b`,
    log: `[Greedy Start] n=${n}, k=${k}`,
    codeLine: divAnchor,
    stageNum: 2,
  });

  const a = Math.floor(n / k);
  const b = n % k;

  const remAnchor = getGreedy090Anchor('max-product-k', 2, 'rem');
  steps.push({
    line: remAnchor.java,
    stepIndex: steps.length,
    totalN: n,
    partsK: k,
    parts: [{ length: n, label: `基数 a = ${a}, 余数 b = ${b}`, color: '#38bdf8' }],
    formula: `整除与余数：a = ⌊${n} / ${k}⌋ = ${a}，余数 b = ${n} % ${k} = ${b}`,
    currentProduct: '1',
    decision: '商与余数均分计算',
    message: `基础数值分配：每份至少分得基数 a = ${a}；多出来的余数 b = ${b} 个 1 均匀分给其中的 ${b} 份`,
    log: `[Div & Mod] a=${a}, b=${b}`,
    codeLine: remAnchor,
    stageNum: 2,
  });

  const partsList: PartitionBarItem[] = [];
  for (let i = 0; i < Math.min(10, b); i++) {
    partsList.push({ length: a + 1, label: `${a + 1}`, color: '#10b981', highlighted: true });
  }
  for (let i = 0; i < Math.min(10, k - b); i++) {
    partsList.push({ length: a, label: `${a}`, color: '#3b82f6' });
  }

  // 快速幂计算
  function powMod(base: number, exp: number): number {
    let res = 1;
    let bVal = base % MOD;
    let eVal = exp;
    while (eVal > 0) {
      if (eVal % 2 === 1) res = Number((BigInt(res) * BigInt(bVal)) % BigInt(MOD));
      bVal = Number((BigInt(bVal) * BigInt(bVal)) % BigInt(MOD));
      eVal = Math.floor(eVal / 2);
    }
    return res;
  }

  const p1 = powMod(a + 1, b);
  const p2 = powMod(a, k - b);
  const finalAns = Number((BigInt(p1) * BigInt(p2)) % BigInt(MOD));

  const p1Anchor = getGreedy090Anchor('max-product-k', 2, 'p1');
  steps.push({
    line: p1Anchor.java,
    stepIndex: steps.length,
    totalN: n,
    partsK: k,
    parts: partsList,
    formula: `划分规格：${b} 份取 (${a}+1 = ${a + 1})，其余 ${k - b} 份取 ${a}`,
    currentProduct: `(${a + 1})^${b} × ${a}^${k - b}`,
    decision: '确定划分结构',
    message: `最优划分由 ${b} 个 ${a + 1} 和 ${k - b} 个 ${a} 构成，任何两份之间差值至多为 1`,
    log: `[Partition Plan] ${b} 份为 ${a + 1}, ${k - b} 份为 ${a}`,
    codeLine: p1Anchor,
    stageNum: 2,
  });

  const retAnchor2 = getGreedy090Anchor('max-product-k', 2, 'ret');
  steps.push({
    line: retAnchor2.java,
    stepIndex: steps.length,
    totalN: n,
    partsK: k,
    parts: partsList,
    formula: `最终乘积取模：(${a + 1})^${b} mod MOD = ${p1}, (${a})^${k - b} mod MOD = ${p2} ➔ 乘积 = ${finalAns}`,
    currentProduct: String(finalAns),
    decision: '快速幂乘积收敛',
    message: `快速幂得出最终最大乘积结果：${finalAns} (对 10^9+7 取模)`,
    log: `[Fast Power Done] Final Result = ${finalAns}`,
    codeLine: retAnchor2,
    stageNum: 2,
  });

  return steps;
}

export function buildMaxProductKStage3Steps(n: number, k: number): MaxProductKStep[] {
  const steps: MaxProductKStep[] = [];

  const introAnchor = getGreedy090Anchor('max-product-k', 3, 'intro');
  steps.push({
    line: introAnchor.java,
    stepIndex: 0,
    totalN: n,
    partsK: k,
    parts: [
      { length: 6, label: 'x = 6', color: '#ef4444' },
      { length: 2, label: 'y = 2', color: '#ef4444' },
    ],
    formula: '极差反证假设：假设存在两份 x 和 y，满足差值 x - y >= 2',
    currentProduct: '原乘积: xy = 6 × 2 = 12',
    decision: '设定反证前提',
    message: '反证法设问：如果最优解中存在极差 >= 2 的两份数，能否通过靠近均值获得更大乘积？',
    log: '[Proof Start] 假设存在 x - y >= 2',
    codeLine: introAnchor,
    stageNum: 3,
  });

  const deltaAnchor = getGreedy090Anchor('max-product-k', 3, 'delta');
  steps.push({
    line: deltaAnchor.java,
    stepIndex: 1,
    totalN: n,
    partsK: k,
    parts: [
      { length: 5, label: 'x - 1 = 5', color: '#10b981', highlighted: true },
      { length: 3, label: 'y + 1 = 3', color: '#10b981', highlighted: true },
    ],
    formula: '均分微调：令 x 减少 1，y 增加 1 (总和不变: 5+3=8)。新乘积: (x-1)(y+1) = 5 × 3 = 15',
    currentProduct: '新乘积: 15 > 12',
    decision: '代数展开比较',
    message: '展开公式：(x - 1)(y + 1) - xy = xy + x - y - 1 - xy = (x - y) - 1。因为 x - y >= 2，所以增量 Δ >= 1 > 0 严格成立！',
    log: '[Proof Calc] (x-1)(y+1) - xy = (x-y) - 1 >= 1 > 0',
    codeLine: deltaAnchor,
    stageNum: 3,
  });

  const conclAnchor = getGreedy090Anchor('max-product-k', 3, 'conclusion');
  steps.push({
    line: conclAnchor.java,
    stepIndex: 2,
    totalN: n,
    partsK: k,
    parts: [
      { length: 5, label: '5 (最优均分)', color: '#10b981' },
      { length: 3, label: '3 (最优均分)', color: '#10b981' },
    ],
    formula: '结论成立：任何极差 >= 2 的划分都严格劣于靠近均值的划分，故最优解各份极差必 <= 1',
    currentProduct: '数学证明成立',
    decision: '反证结论收敛',
    message: '代数证明完毕：只要两数之差大于等于 2，移花接木各取 1 必定使乘积严格增大。因此全局最优解中任意两份的差绝对不可能超过 1，均分定理得证！',
    log: '[Proof Verified] 均分极差 <= 1 贪心最优性证明成立。',
    codeLine: conclAnchor,
    stageNum: 3,
  });

  return steps;
}
