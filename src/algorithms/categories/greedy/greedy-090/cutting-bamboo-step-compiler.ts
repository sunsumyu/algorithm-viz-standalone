import { getGreedy090Anchor } from './greedy-090-stage-codes';
import { Greedy090Step, PartitionBarItem } from './greedy-090-shared';

export interface BambooStep extends Greedy090Step {
  bambooLength: number;
  parts: PartitionBarItem[];
  currentProduct: string;
  formula: string;
  stageNum: number;
}

export function buildBambooStage1Steps(n: number): BambooStep[] {
  const steps: BambooStep[] = [];
  const safeN = Math.max(2, Math.min(10, n)); // 暴力防超容

  const initAnchor = getGreedy090Anchor('cutting-bamboo', 1, 'init');
  // Step 0: 入口帧
  steps.push({
    line: initAnchor.java,
    stepIndex: 0,
    bambooLength: safeN,
    parts: [{ length: safeN, label: `原始长 ${safeN}`, color: '#64748b' }],
    currentProduct: '1',
    formula: `探索竹子总长 n = ${safeN} 的所有分割方案`,
    decision: '初始化暴力尝试',
    message: `开始暴力尝试：探索正整数 ${safeN} 分割成多段的所有可能乘积`,
    log: `[Init] 开始探索 n=${safeN} 的所有切分组合。`,
    codeLine: initAnchor,
    stageNum: 1,
  });

  if (safeN <= 3) {
    const ans = safeN - 1;
    const baseAnchor = getGreedy090Anchor('cutting-bamboo', 1, 'base');
    steps.push({
      line: baseAnchor.java,
      stepIndex: steps.length,
      bambooLength: safeN,
      parts: [
        { length: 1, label: '1', color: '#f59e0b' },
        { length: safeN - 1, label: `${safeN - 1}`, color: '#3b82f6' },
      ],
      currentProduct: String(ans),
      formula: `n <= 3 特殊边界：拆为 1 和 ${safeN - 1}，乘积 = ${ans}`,
      decision: '小规模边界特判',
      message: `按题意要求至少切成 2 段：n=${safeN} 必须拆分为 1 和 ${safeN - 1}，最大乘积为 ${ans}`,
      log: `[Base] n=${safeN} <= 3，答案为 ${ans}。`,
      codeLine: baseAnchor,
      stageNum: 1,
    });
    return steps;
  }

  // 模拟 DFS 遍历第一刀的各种切法
  let bestProd = 0;
  let bestParts: PartitionBarItem[] = [];

  for (let cut = 1; cut < safeN; cut++) {
    const rest = safeN - cut;
    // 粗略模拟剩余部分的最优值
    const restProd = rest <= 4 ? rest : Math.floor(Math.pow(3, rest / 3));
    const prod = cut * restProd;

    const currentParts: PartitionBarItem[] = [
      { length: cut, label: `首刀: ${cut}`, color: '#f59e0b', highlighted: true },
      { length: rest, label: `剩余: ${rest}`, color: '#3b82f6' },
    ];

    if (prod > bestProd) {
      bestProd = prod;
      bestParts = [
        { length: cut, label: `${cut}`, color: '#10b981' },
        { length: rest, label: `${rest}`, color: '#10b981' },
      ];
    }

    const loopAnchor = getGreedy090Anchor('cutting-bamboo', 1, 'loop');
    steps.push({
      line: loopAnchor.java,
      stepIndex: steps.length,
      bambooLength: safeN,
      parts: currentParts,
      currentProduct: String(prod),
      formula: `尝试首刀切出 ${cut}，剩余 ${rest}：预计估算乘积 = ${cut} × ${restProd} = ${prod}`,
      decision: `枚举切分: 首段 ${cut}`,
      message: `首刀试探切出长度 ${cut}，剩余部分长度 ${rest}，递归评估分支乘积 = ${prod}`,
      log: `[DFS Try] 首刀=${cut}, 剩余=${rest}, 分支乘积=${prod}`,
      codeLine: loopAnchor,
      stageNum: 1,
    });
  }

  const retAnchor = getGreedy090Anchor('cutting-bamboo', 1, 'ret');
  steps.push({
    line: retAnchor.java,
    stepIndex: steps.length,
    bambooLength: safeN,
    parts: bestParts,
    currentProduct: String(bestProd),
    formula: `暴力枚举结束：最佳切分乘积 = ${bestProd}`,
    decision: '暴力搜索完成',
    message: `全部分支搜索完毕，在小规模 n=${safeN} 下找到的最优组合乘积为 ${bestProd}`,
    log: `[DFS Done] 暴力完成，最优乘积=${bestProd}`,
    codeLine: retAnchor,
    stageNum: 1,
  });

  return steps;
}

export function buildBambooStage2Steps(n: number): BambooStep[] {
  const steps: BambooStep[] = [];
  const MOD = 1000000007;

  const initAnchor = getGreedy090Anchor('cutting-bamboo', 2, 'check2');
  // Step 0: 入口帧
  steps.push({
    line: initAnchor.java,
    stepIndex: 0,
    bambooLength: n,
    parts: [{ length: n, label: `待拆总长 ${n}`, color: '#64748b' }],
    currentProduct: '1',
    formula: `贪心准则：尽最大可能拆出长度为 3 的竹子，模数 MOD = ${MOD}`,
    decision: '启动贪心模运算推演',
    message: `开始贪心求解：总长度 n = ${n}，考察对 3 取模的余数决定最终切分策略`,
    log: `[Greedy Start] n=${n}, 考察模3特征。`,
    codeLine: initAnchor,
    stageNum: 2,
  });

  if (n === 2) {
    const check2Anchor = getGreedy090Anchor('cutting-bamboo', 2, 'check2');
    steps.push({
      line: check2Anchor.java,
      stepIndex: 1,
      bambooLength: 2,
      parts: [
        { length: 1, label: '1', color: '#3b82f6' },
        { length: 1, label: '1', color: '#3b82f6' },
      ],
      currentProduct: '1',
      formula: 'n = 2 唯一拆法: 1 + 1 = 2，乘积 = 1',
      decision: '特判 n=2',
      message: '特判边界：长度 2 必须拆成两段 1，乘积为 1',
      log: '[Base] n=2, return 1.',
      codeLine: check2Anchor,
      stageNum: 2,
    });
    return steps;
  }

  if (n === 3) {
    const check3Anchor = getGreedy090Anchor('cutting-bamboo', 2, 'check3');
    steps.push({
      line: check3Anchor.java,
      stepIndex: 1,
      bambooLength: 3,
      parts: [
        { length: 1, label: '1', color: '#3b82f6' },
        { length: 2, label: '2', color: '#10b981' },
      ],
      currentProduct: '2',
      formula: 'n = 3 必须拆为 2 段: 1 + 2 = 3，乘积 = 2',
      decision: '特判 n=3',
      message: '特判边界：长度 3 必须拆为至少两段，最优拆法 1 × 2 = 2',
      log: '[Base] n=3, return 2.',
      codeLine: check3Anchor,
      stageNum: 2,
    });
    return steps;
  }

  const rem = n % 3;
  let m = Math.floor(n / 3);
  let ans = 1;

  const mod3Anchor = getGreedy090Anchor('cutting-bamboo', 2, 'mod3');
  steps.push({
    line: mod3Anchor.java,
    stepIndex: steps.length,
    bambooLength: n,
    parts: [{ length: n, label: `总长 ${n}`, color: '#64748b' }],
    currentProduct: '1',
    formula: `计算余数：${n} % 3 = ${rem}，理论最多可拆 m = ${m} 个 3`,
    decision: '余数分析',
    message: `分析余数情况：n % 3 = ${rem}。当余数是 1 时需退回一个 3 组成 2×2；余数是 2 时直接乘 2；余数是 0 时全拆 3`,
    log: `[Remainder] rem=${rem}, m=${m}`,
    codeLine: mod3Anchor,
    stageNum: 2,
  });

  const partsList: PartitionBarItem[] = [];

  if (rem === 1) {
    m -= 1;
    ans = 4;
    const rem1Anchor = getGreedy090Anchor('cutting-bamboo', 2, 'rem1');
    steps.push({
      line: rem1Anchor.java,
      stepIndex: steps.length,
      bambooLength: n,
      parts: [
        { length: 2, label: '2', color: '#3b82f6', highlighted: true },
        { length: 2, label: '2', color: '#3b82f6', highlighted: true },
      ],
      currentProduct: '4',
      formula: `余数为 1！退回一个 3：将 (3 + 1) 合并为 4，再拆成 2 × 2 = 4 (优于 3 × 1 = 3)`,
      decision: '余数 1 退换处理 (2 × 2)',
      message: `关键贪心修正：若保留长度 1，对乘积没有任何增益；借出一个 3 变为 4，拆成 2 × 2 产生乘积 4！3 的个数变为 ${m}`,
      log: `[Rem 1 Fix] 借出1个3，构成 2*2，剩余3的个数 m=${m}`,
      codeLine: rem1Anchor,
      stageNum: 2,
    });
    partsList.push({ length: 2, label: '2', color: '#3b82f6' });
    partsList.push({ length: 2, label: '2', color: '#3b82f6' });
  } else if (rem === 2) {
    ans = 2;
    const rem2Anchor = getGreedy090Anchor('cutting-bamboo', 2, 'rem2');
    steps.push({
      line: rem2Anchor.java,
      stepIndex: steps.length,
      bambooLength: n,
      parts: [{ length: 2, label: '2', color: '#3b82f6', highlighted: true }],
      currentProduct: '2',
      formula: `余数为 2！直接独立分出一段长度为 2 的竹子，3 的个数为 ${m}`,
      decision: '余数 2 独立保留',
      message: `余数为 2，直接作为单独一段（乘积 × 2），无需退还 3`,
      log: `[Rem 2] 独立保留一段 2，3 的个数 m=${m}`,
      codeLine: rem2Anchor,
      stageNum: 2,
    });
    partsList.push({ length: 2, label: '2', color: '#3b82f6' });
  }

  // 快速幂计算 3^m
  for (let i = 0; i < Math.min(10, m); i++) {
    partsList.unshift({ length: 3, label: '3', color: '#10b981' });
  }

  let base = 3;
  let exp = m;
  let powerRes = 1;
  while (exp > 0) {
    if (exp % 2 === 1) powerRes = (powerRes * base) % MOD;
    base = (base * base) % MOD;
    exp = Math.floor(exp / 2);
  }

  const finalProd = (ans * powerRes) % MOD;
  const powAnchor = getGreedy090Anchor('cutting-bamboo', 2, 'pow');

  steps.push({
    line: powAnchor.java,
    stepIndex: steps.length,
    bambooLength: n,
    parts: partsList,
    currentProduct: String(finalProd),
    formula: `快速幂计算：3^${m} % MOD = ${powerRes} ➔ 最终最大乘积 = (${ans} × ${powerRes}) % MOD = ${finalProd}`,
    decision: '快速幂求模收敛',
    message: `利用快速幂在 O(log m) 时间内求出 3^${m} 对 10^9+7 的余数，再与尾巴系数 ${ans} 相乘得出全局最优解`,
    log: `[Fast Power] 3^${m} mod ${MOD} = ${powerRes}, Final Answer = ${finalProd}`,
    codeLine: powAnchor,
    stageNum: 2,
  });

  return steps;
}

export function buildBambooStage3Steps(n: number): BambooStep[] {
  const steps: BambooStep[] = [];

  const introAnchor = getGreedy090Anchor('cutting-bamboo', 3, 'intro');
  steps.push({
    line: introAnchor.java,
    stepIndex: 0,
    bambooLength: n,
    parts: [
      { length: 3, label: '3 (最优)', color: '#10b981' },
      { length: 2, label: '2 (次优)', color: '#3b82f6' },
      { length: 4, label: '4 (等价于2*2)', color: '#a855f7' },
    ],
    currentProduct: 'f(e) 连续最大',
    formula: '连续函数极值分析：设拆成 x 份均分，目标最大化 f(x) = x^(1/x)',
    decision: '连续极值反证法引入',
    message: '数学证明视角：将离散整数拆分推广为实数域函数 f(x) = x^(1/x) 并求导寻驻点',
    log: '[Proof Start] 构建实数导数模型 f(x) = x^(1/x)',
    codeLine: introAnchor,
    stageNum: 3,
  });

  const derivAnchor = getGreedy090Anchor('cutting-bamboo', 3, 'deriv');
  steps.push({
    line: derivAnchor.java,
    stepIndex: 1,
    bambooLength: n,
    parts: [
      { length: 3, label: 'f(3) ≈ 1.442', color: '#10b981', highlighted: true },
      { length: 2, label: 'f(2) ≈ 1.414', color: '#3b82f6' },
    ],
    currentProduct: 'x = e ≈ 2.718 为极值点',
    formula: "求导 f'(x) = x^(1/x) * (1 - ln x) / x^2 ➔ 令导数为0解得 x = e ≈ 2.71828",
    decision: '求导寻得驻点 e',
    message: "导数在 x < e 时大于0（单调增），在 x > e 时小于0（单调减）。驻点 x = e ≈ 2.718 处取得连续全局唯一最大值！",
    log: "[Proof Deriv] x = e 是极大值点。",
    codeLine: derivAnchor,
    stageNum: 3,
  });

  const compAnchor = getGreedy090Anchor('cutting-bamboo', 3, 'comp');
  steps.push({
    line: compAnchor.java,
    stepIndex: 2,
    bambooLength: n,
    parts: [
      { length: 3, label: '3^2 = 9', color: '#10b981', highlighted: true },
      { length: 2, label: '2^3 = 8', color: '#ef4444' },
    ],
    currentProduct: '3^2 (9) > 2^3 (8)',
    formula: '离散化对比：和为 6 时，拆为 3+3=6 (乘积 9)；拆为 2+2+2=6 (乘积 8) ➔ 9 > 8 严格支配！',
    decision: '离散取整贪心成立',
    message: '离散正整数中与自然常数 e 最近的数是 3，其次是 2。相同总和 6 时，两个 3 乘积为 9，三个 2 乘积只有 8。故贪心尽全力拆 3 为全局唯一最优解！',
    log: '[Proof Verified] 3^2 > 2^3，尽力拆3贪心策略数学证明成立。',
    codeLine: compAnchor,
    stageNum: 3,
  });

  return steps;
}
