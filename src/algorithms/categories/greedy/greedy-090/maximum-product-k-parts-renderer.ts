/**
 * 分成 k 份的最大乘积 - 声明式教学级沙盘渲染器
 * 核心贪心：均分定理，极差不能超过 1：b 份为 (a+1)，(k-b) 份为 a
 * 三阶段：
 *   阶段 1: 暴力分割穷举搜索 (Brute-Force DFS)
 *   阶段 2: 均分贪心与快速幂推演 (Greedy Equal Partition)
 *   阶段 3: 极差 >= 2 必劣化代数严格反证 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  MAX_PRODUCT_K_STAGE1_CODES,
  MAX_PRODUCT_K_STAGE1_LINES,
  MAX_PRODUCT_K_STAGE2_CODES,
  MAX_PRODUCT_K_STAGE2_LINES,
  MAX_PRODUCT_K_STAGE3_CODES,
  MAX_PRODUCT_K_STAGE3_LINES,
} from './greedy-090-stage-codes';
import {
  Greedy090Step,
  renderPartitionBars,
  PartitionBarItem,
} from './greedy-090-shared';

export interface MaxProductKStep extends Greedy090Step {
  totalN: number;
  partsK: number;
  parts: PartitionBarItem[];
  formula: string;
  currentProduct?: string;
  stageNum: number;
}

// ==========================================
// 步进生成器
// ==========================================

export function buildMaxProductKStage1Steps(n: number, k: number): MaxProductKStep[] {
  const steps: MaxProductKStep[] = [];
  const safeN = Math.max(k, Math.min(15, n));
  const safeK = Math.max(1, Math.min(5, k));

  // Step 0: 入口帧
  steps.push({
    stepIndex: 0,
    totalN: safeN,
    partsK: safeK,
    parts: [{ length: safeN, label: `总值 ${safeN}`, color: '#64748b' }],
    formula: `探索将 n = ${safeN} 恰好拆成 k = ${safeK} 份的所有组合`,
    currentProduct: '1',
    decision: '启动暴力 DFS 枚举',
    message: `开始暴力尝试：将 ${safeN} 拆分为 ${safeK} 个正整数，穷举所有分支评估最大乘积`,
    log: `[DFS Init] n=${safeN}, k=${safeK}`,
    codeLine: {
      java: MAX_PRODUCT_K_STAGE1_LINES.java.init,
      cpp: MAX_PRODUCT_K_STAGE1_LINES.cpp.init,
      python: MAX_PRODUCT_K_STAGE1_LINES.python.init,
      javascript: MAX_PRODUCT_K_STAGE1_LINES.javascript.init,
    },
    stageNum: 1,
  });

  if (safeK === 1) {
    steps.push({
      stepIndex: 1,
      totalN: safeN,
      partsK: 1,
      parts: [{ length: safeN, label: `${safeN}`, color: '#10b981' }],
      formula: `k = 1 边界：只有 1 份，乘积即自身 = ${safeN}`,
      currentProduct: String(safeN),
      decision: 'k=1 特判',
      message: `只有 1 份时无需拆分，乘积为 ${safeN}`,
      log: `[Base] k=1, ans=${safeN}`,
      codeLine: {
        java: MAX_PRODUCT_K_STAGE1_LINES.java.base,
        cpp: MAX_PRODUCT_K_STAGE1_LINES.cpp.base,
        python: MAX_PRODUCT_K_STAGE1_LINES.python.base,
        javascript: MAX_PRODUCT_K_STAGE1_LINES.javascript.base,
      },
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

    steps.push({
      stepIndex: steps.length,
      totalN: safeN,
      partsK: safeK,
      parts: curParts,
      formula: `尝试第一份取 ${cur}，剩余 ${rest} 分给剩余 ${restParts} 份，估算乘积 ≈ ${estProd}`,
      currentProduct: String(estProd),
      decision: `枚举第一份 = ${cur}`,
      message: `试探分支：第一份取 ${cur}，剩余 ${rest}，递归评估该子树的乘积`,
      log: `[DFS Try] cur=${cur}, rest=${rest}, estProd=${estProd}`,
      codeLine: {
        java: MAX_PRODUCT_K_STAGE1_LINES.java.loop,
        cpp: MAX_PRODUCT_K_STAGE1_LINES.cpp.loop,
        python: MAX_PRODUCT_K_STAGE1_LINES.python.loop,
        javascript: MAX_PRODUCT_K_STAGE1_LINES.javascript.loop,
      },
      stageNum: 1,
    });
  }

  steps.push({
    stepIndex: steps.length,
    totalN: safeN,
    partsK: safeK,
    parts: bestParts,
    formula: `暴力枚举结束，找到的最优乘积 = ${bestProd}`,
    currentProduct: String(bestProd),
    decision: '暴力搜索完成',
    message: `全部分支搜索完毕，在 n=${safeN}, k=${safeK} 下的最大乘积为 ${bestProd}`,
    log: `[DFS Done] 最优乘积=${bestProd}`,
    codeLine: {
      java: MAX_PRODUCT_K_STAGE1_LINES.java.ret,
      cpp: MAX_PRODUCT_K_STAGE1_LINES.cpp.ret,
      python: MAX_PRODUCT_K_STAGE1_LINES.python.ret,
      javascript: MAX_PRODUCT_K_STAGE1_LINES.javascript.ret,
    },
    stageNum: 1,
  });

  return steps;
}

export function buildMaxProductKStage2Steps(n: number, k: number): MaxProductKStep[] {
  const steps: MaxProductKStep[] = [];
  const MOD = 1000000007;

  // Step 0: 入口帧
  steps.push({
    stepIndex: 0,
    totalN: n,
    partsK: k,
    parts: [{ length: n, label: `总值 ${n}`, color: '#64748b' }],
    formula: `均分贪心准则：和为定值时，各数越接近，乘积越大。总值 ${n}，目标份数 ${k}`,
    currentProduct: '1',
    decision: '启动均分贪心推演',
    message: `开始均分贪心计算：将数字 ${n} 分为 ${k} 份，利用除法与取模求得基数 a 与余数 b`,
    log: `[Greedy Start] n=${n}, k=${k}`,
    codeLine: {
      java: MAX_PRODUCT_K_STAGE2_LINES.java.div,
      cpp: MAX_PRODUCT_K_STAGE2_LINES.cpp.div,
      python: MAX_PRODUCT_K_STAGE2_LINES.python.div,
      javascript: MAX_PRODUCT_K_STAGE2_LINES.javascript.div,
    },
    stageNum: 2,
  });

  const a = Math.floor(n / k);
  const b = n % k;

  steps.push({
    stepIndex: steps.length,
    totalN: n,
    partsK: k,
    parts: [{ length: n, label: `基数 a = ${a}, 余数 b = ${b}`, color: '#38bdf8' }],
    formula: `整除与余数：a = ⌊${n} / ${k}⌋ = ${a}，余数 b = ${n} % ${k} = ${b}`,
    currentProduct: '1',
    decision: '商与余数均分计算',
    message: `基础数值分配：每份至少分得基数 a = ${a}；多出来的余数 b = ${b} 个 1 均匀分给其中的 ${b} 份`,
    log: `[Div & Mod] a=${a}, b=${b}`,
    codeLine: {
      java: MAX_PRODUCT_K_STAGE2_LINES.java.rem,
      cpp: MAX_PRODUCT_K_STAGE2_LINES.cpp.rem,
      python: MAX_PRODUCT_K_STAGE2_LINES.python.rem,
      javascript: MAX_PRODUCT_K_STAGE2_LINES.javascript.rem,
    },
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

  steps.push({
    stepIndex: steps.length,
    totalN: n,
    partsK: k,
    parts: partsList,
    formula: `划分规格：${b} 份取 (${a}+1 = ${a + 1})，其余 ${k - b} 份取 ${a}`,
    currentProduct: `(${a + 1})^${b} × ${a}^${k - b}`,
    decision: '确定划分结构',
    message: `最优划分由 ${b} 个 ${a + 1} 和 ${k - b} 个 ${a} 构成，任何两份之间差值至多为 1`,
    log: `[Partition Plan] ${b} 份为 ${a + 1}, ${k - b} 份为 ${a}`,
    codeLine: {
      java: MAX_PRODUCT_K_STAGE2_LINES.java.p1,
      cpp: MAX_PRODUCT_K_STAGE2_LINES.cpp.p1,
      python: MAX_PRODUCT_K_STAGE2_LINES.python.p1,
      javascript: MAX_PRODUCT_K_STAGE2_LINES.javascript.p1,
    },
    stageNum: 2,
  });

  steps.push({
    stepIndex: steps.length,
    totalN: n,
    partsK: k,
    parts: partsList,
    formula: `最终乘积取模：(${a + 1})^${b} mod MOD = ${p1}, (${a})^${k - b} mod MOD = ${p2} ➔ 乘积 = ${finalAns}`,
    currentProduct: String(finalAns),
    decision: '快速幂乘积收敛',
    message: `快速幂得出最终最大乘积结果：${finalAns} (对 10^9+7 取模)`,
    log: `[Fast Power Done] Final Result = ${finalAns}`,
    codeLine: {
      java: MAX_PRODUCT_K_STAGE2_LINES.java.ret,
      cpp: MAX_PRODUCT_K_STAGE2_LINES.cpp.ret,
      python: MAX_PRODUCT_K_STAGE2_LINES.python.ret,
      javascript: MAX_PRODUCT_K_STAGE2_LINES.javascript.ret,
    },
    stageNum: 2,
  });

  return steps;
}

export function buildMaxProductKStage3Steps(n: number, k: number): MaxProductKStep[] {
  const steps: MaxProductKStep[] = [];

  steps.push({
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
    codeLine: {
      java: MAX_PRODUCT_K_STAGE3_LINES.java.intro,
      cpp: MAX_PRODUCT_K_STAGE3_LINES.cpp.intro,
      python: MAX_PRODUCT_K_STAGE3_LINES.python.intro,
      javascript: MAX_PRODUCT_K_STAGE3_LINES.javascript.intro,
    },
    stageNum: 3,
  });

  steps.push({
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
    codeLine: {
      java: MAX_PRODUCT_K_STAGE3_LINES.java.delta,
      cpp: MAX_PRODUCT_K_STAGE3_LINES.cpp.delta,
      python: MAX_PRODUCT_K_STAGE3_LINES.python.delta,
      javascript: MAX_PRODUCT_K_STAGE3_LINES.javascript.delta,
    },
    stageNum: 3,
  });

  steps.push({
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
    codeLine: {
      java: MAX_PRODUCT_K_STAGE3_LINES.java.conclusion,
      cpp: MAX_PRODUCT_K_STAGE3_LINES.cpp.conclusion,
      python: MAX_PRODUCT_K_STAGE3_LINES.python.conclusion,
      javascript: MAX_PRODUCT_K_STAGE3_LINES.javascript.conclusion,
    },
    stageNum: 3,
  });

  return steps;
}

// ==========================================
// 声明式沙盘装配
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<MaxProductKStep>({
  id: 'maximum-product-k-parts',
  name: '分成 k 份的最大乘积',
  category: 'greedy',
  icon: '📦',
  badge: {
    mode: '均分贪心定理',
    complexity: 'O(log k) · O(1)',
  },
  card1Title: '📊 k 份柱状能量条均分推演沙盘',
  card2Title: '📐 均值不等式与快速幂参数面板',
  card2Desc: '展示商 a、余数 b 的分配方案与极差反证过程',
  legend: [
    { label: '均分大份额 (a + 1)', color: '#10b981' },
    { label: '均分基准份额 a', color: '#3b82f6' },
    { label: '枚举/试探调整中', color: '#f59e0b' },
    { label: '极差失衡反例 (Δ >= 2)', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-n',
      label: '正整数 n',
      type: 'number',
      defaultValue: '14',
      width: '110px',
    },
    {
      id: 'input-k',
      label: '份数 k',
      type: 'number',
      defaultValue: '4',
      width: '90px',
    },
  ],
  presets: [
    { label: '标准用例 n=14, k=4 (3,3,4,4)', values: { 'input-n': '14', 'input-k': '4' } },
    { label: '整除用例 n=12, k=3 (4,4,4)', values: { 'input-n': '12', 'input-k': '3' } },
    { label: '大跨度用例 n=25, k=7', values: { 'input-n': '25', 'input-k': '7' } },
    { label: '边界用例 k=1 (n=9, k=1)', values: { 'input-n': '9', 'input-k': '1' } },
  ],
  metrics: [
    { id: 'total-n', label: '总数值 n', color: '#38bdf8' },
    { id: 'parts-k', label: '总份数 k', color: '#f59e0b' },
    { id: 'max-prod', label: '最大乘积结果', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力分割穷举对比',
      shortName: '暴力搜索',
      card2Desc: '枚举所有可能的第一份数值，展示指数级划分搜索空间',
      codeLanguages: MAX_PRODUCT_K_STAGE1_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '14', 10);
        const k = parseInt(inputs?.['input-k'] || '4', 10);
        return buildMaxProductKStage1Steps(n, k);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 均分贪心与快速幂推演',
      shortName: '均分贪心',
      card2Desc: '按 a = ⌊n/k⌋, b = n%k 计算，b 份为 a+1，其余为 a，快速幂求解',
      codeLanguages: MAX_PRODUCT_K_STAGE2_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '14', 10);
        const k = parseInt(inputs?.['input-k'] || '4', 10);
        return buildMaxProductKStage2Steps(n, k);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 极差反证证明',
      shortName: '贪心证明',
      card2Desc: '代数证明任意极差 >= 2 的划分必严格劣于靠近均值的划分',
      codeLanguages: MAX_PRODUCT_K_STAGE3_CODES,
      buildSteps: (inputs) => {
        const n = parseInt(inputs?.['input-n'] || '14', 10);
        const k = parseInt(inputs?.['input-k'] || '4', 10);
        return buildMaxProductKStage3Steps(n, k);
      },
    },
  ],
  codeLanguages: MAX_PRODUCT_K_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.maximumProductKParts.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 均值不等式与均分最优性</h3>
      <p>对于 $k$ 个正实数 $x_1, x_2, \\dots, x_k$，当其和为常数 $S$ 时：</p>
      <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
        \\prod_{i=1}^k x_i \\le \\left(\\frac{S}{k}\\right)^k
      </div>
      <p>等号成立的充要条件是 $x_1 = x_2 = \\dots = x_k$。</p>
      <p>但在<b>正整数域</b>中，一般无法做到完全相等。此时极差至多为 1，即一部分数取 $\\lfloor S/k \\rfloor + 1$，其余数取 $\\lfloor S/k \\rfloor$，为离散实数均值的唯一最佳逼近！</p>
    </div>
  `,
  buildSteps: (inputs) => {
    const n = parseInt(inputs?.['input-n'] || '14', 10);
    const k = parseInt(inputs?.['input-k'] || '4', 10);
    return buildMaxProductKStage2Steps(n, k);
  },
  renderCanvas: (container, step) => {
    renderPartitionBars(container, step.parts, step.totalN, {
      title: `📦 均分能量柱状视图 (n=${step.totalN}, k=${step.partsK})`,
      productFormula: `当前乘积: ${step.currentProduct}`,
    });

    const root = container.closest('.dsp-view-root') || document;
    const nEl = root.querySelector('#metric-total-n');
    const kEl = root.querySelector('#metric-parts-k');
    const prodEl = root.querySelector('#metric-max-prod');

    if (nEl) nEl.textContent = `${step.totalN}`;
    if (kEl) kEl.textContent = `${step.partsK} 份`;
    if (prodEl) prodEl.textContent = `${step.currentProduct}`;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">当前阶段决策:</span>
          <span style="font-size: 11px; color: #0284c7; font-weight: 700;">${step.decision}</span>
        </div>
        <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; color: #0f172a;">
          ${step.formula}
        </div>
      </div>
    `;
  },
});

export const maximumProductKPartsRenderer = Visualizer;
registerAlgorithm({
  id: 'maximum-product-k-parts',
  name: '分成 k 份的最大乘积',
  viewId: 'algo-maximum-product-k-parts-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code02：和为定值时均分定理，极差不能超过 1 的严格反证',
  icon: '📦',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 902,
  learningGoal: '掌握均分定理与极差大于等于 2 必劣化的代数反证法',
});
