/**
 * 加入差值绝对值直到长度固定 (大厂真实笔试) - 声明式教学级沙盘渲染器
 * 核心贪心与数论：更相减损术闭包——所有差值收敛为最大公约数 gcd(arr) 的倍数，终态长度为 max/g (+1 if hasZero)
 * 三阶段：
 *   阶段 1: 暴力集合迭代模拟扩散 (Brute-Force Set Diffusion)
 *   阶段 2: 欧几里得 GCD 数论贪心极速推演 (GCD Greedy Deduction)
 *   阶段 3: 裴蜀定理与差值闭包数学等价性证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  ABS_VALUE_ADD_STAGE1_CODES,
  ABS_VALUE_ADD_STAGE1_LINES,
  ABS_VALUE_ADD_STAGE2_CODES,
  ABS_VALUE_ADD_STAGE2_LINES,
  ABS_VALUE_ADD_STAGE3_CODES,
  ABS_VALUE_ADD_STAGE3_LINES,
} from './greedy-090-stage-codes';
import {
  Greedy090Step,
  renderGcdDiffusionGrid,
} from './greedy-090-shared';

export interface AbsValueAddStep extends Greedy090Step {
  currentArray: number[];
  newlyAdded: number[];
  comparingPair?: [number, number];
  diffResult?: number;
  gcdValue?: number;
  maxVal?: number;
  theoreticalCount?: number;
  hasZero: boolean;
}

// ==========================================
// 辅助计算与步进生成器
// ==========================================

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function parseArrayInput(raw: string): number[] {
  const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n >= 0);
  return nums.length > 0 ? nums : [3, 9];
}

export function buildAbsValueAddSteps(rawInput: string, stage: number): AbsValueAddStep[] {
  const initArr = parseArrayInput(rawInput);
  const steps: AbsValueAddStep[] = [];

  // 计算全局 GCD 和最大值
  let max = 0;
  let g = 0;
  let hasZero = false;
  const countSet = new Set<number>();

  for (const x of initArr) {
    if (x === 0 || countSet.has(x)) hasZero = true;
    countSet.add(x);
    if (x > max) max = x;
    g = gcd(g, x);
  }
  const theoretical = max === 0 ? 1 : Math.floor(max / g) + (hasZero ? 1 : 0);

  // Step 0: 入口帧
  steps.push({
    stepIndex: 0,
    currentArray: [...initArr],
    newlyAdded: [],
    gcdValue: g,
    maxVal: max,
    theoreticalCount: theoretical,
    hasZero,
    decision: '初始化数组状态',
    message: `初始数组: [${initArr.join(', ')}]，探索任意两数差值绝对值的闭包生成过程`,
    log: `[Init] 初始数组: ${initArr.join(',')}`,
    codeLine: {
      java: stage === 1 ? ABS_VALUE_ADD_STAGE1_LINES.java.init : stage === 2 ? ABS_VALUE_ADD_STAGE2_LINES.java.init : ABS_VALUE_ADD_STAGE3_LINES.java.intro,
      cpp: stage === 1 ? ABS_VALUE_ADD_STAGE1_LINES.cpp.init : stage === 2 ? ABS_VALUE_ADD_STAGE2_LINES.cpp.init : ABS_VALUE_ADD_STAGE3_LINES.cpp.intro,
      python: stage === 1 ? ABS_VALUE_ADD_STAGE1_LINES.python.init : stage === 2 ? ABS_VALUE_ADD_STAGE2_LINES.python.init : ABS_VALUE_ADD_STAGE3_LINES.python.intro,
      javascript: stage === 1 ? ABS_VALUE_ADD_STAGE1_LINES.javascript.init : stage === 2 ? ABS_VALUE_ADD_STAGE2_LINES.javascript.init : ABS_VALUE_ADD_STAGE3_LINES.javascript.intro,
    },
  });

  if (stage === 1) {
    // 阶段1: 暴力集合循环生成
    const set = new Set<number>(initArr);
    const list = [...initArr];
    let round = 1;

    while (round <= 4) {
      const beforeSize = list.length;
      let addedInRound = false;

      steps.push({
        stepIndex: steps.length,
        currentArray: [...list],
        newlyAdded: [],
        gcdValue: g,
        maxVal: max,
        theoreticalCount: theoretical,
        hasZero,
        decision: `第 ${round} 轮扩散排查`,
        message: `开始第 ${round} 轮两两作差扫描，当前集合包含 ${beforeSize} 个元素`,
        log: `[Round ${round}] 集合大小=${beforeSize}`,
        codeLine: {
          java: ABS_VALUE_ADD_STAGE1_LINES.java.whileLoop,
          cpp: ABS_VALUE_ADD_STAGE1_LINES.cpp.whileLoop,
          python: ABS_VALUE_ADD_STAGE1_LINES.python.whileLoop,
          javascript: ABS_VALUE_ADD_STAGE1_LINES.javascript.whileLoop,
        },
      });

      for (let i = 0; i < beforeSize; i++) {
        for (let j = i + 1; j < beforeSize; j++) {
          const a = list[i];
          const b = list[j];
          const diff = Math.abs(a - b);

          if (!set.has(diff)) {
            set.add(diff);
            list.push(diff);
            addedInRound = true;

            steps.push({
              stepIndex: steps.length,
              currentArray: [...list],
              newlyAdded: [diff],
              comparingPair: [a, b],
              diffResult: diff,
              gcdValue: g,
              maxVal: max,
              theoreticalCount: theoretical,
              hasZero,
              decision: `发现新差值 |${a} - ${b}| = ${diff}`,
              message: `计算两数差的绝对值 |${a} - ${b}| = ${diff}，集合中尚不存在，加入集合！集合大小变为 ${list.length}`,
              log: `[Add New] |${a} - ${b}| = ${diff} 入库`,
              codeLine: {
                java: ABS_VALUE_ADD_STAGE1_LINES.java.add,
                cpp: ABS_VALUE_ADD_STAGE1_LINES.cpp.add,
                python: ABS_VALUE_ADD_STAGE1_LINES.python.add,
                javascript: ABS_VALUE_ADD_STAGE1_LINES.javascript.add,
              },
            });
          }
        }
      }

      if (!addedInRound) {
        steps.push({
          stepIndex: steps.length,
          currentArray: [...list],
          newlyAdded: [],
          gcdValue: g,
          maxVal: max,
          theoreticalCount: theoretical,
          hasZero,
          decision: '数组大小达到固定，终止循环',
          message: `第 ${round} 轮遍历中未产生任何新差值，集合已完全封闭！最终元素总数 = ${list.length}`,
          log: `[Fix Done] 集合大小稳定在 ${list.length}`,
          codeLine: {
            java: ABS_VALUE_ADD_STAGE1_LINES.java.ret,
            cpp: ABS_VALUE_ADD_STAGE1_LINES.cpp.ret,
            python: ABS_VALUE_ADD_STAGE1_LINES.python.ret,
            javascript: ABS_VALUE_ADD_STAGE1_LINES.javascript.ret,
          },
        });
        break;
      }
      round++;
    }
    return steps;
  }

  if (stage === 2) {
    // 阶段2: GCD 数论推演
    steps.push({
      stepIndex: steps.length,
      currentArray: [...initArr],
      newlyAdded: [],
      gcdValue: g,
      maxVal: max,
      theoreticalCount: theoretical,
      hasZero,
      decision: '扫描最大值与最大公约数',
      message: `数论扫描：全体元素最大值 Max = ${max}，非零最大公约数 GCD(g) = ${g}`,
      log: `[GCD Scan] Max=${max}, GCD=${g}`,
      codeLine: {
        java: ABS_VALUE_ADD_STAGE2_LINES.java.updateGCD,
        cpp: ABS_VALUE_ADD_STAGE2_LINES.cpp.updateGCD,
        python: ABS_VALUE_ADD_STAGE2_LINES.python.updateGCD,
        javascript: ABS_VALUE_ADD_STAGE2_LINES.javascript.updateGCD,
      },
    });

    // 展现理想倍数集
    const fullClosure: number[] = [];
    if (hasZero) fullClosure.push(0);
    if (g > 0) {
      for (let v = g; v <= max; v += g) {
        fullClosure.push(v);
      }
    } else if (max === 0) {
      fullClosure.push(0);
    }

    steps.push({
      stepIndex: steps.length,
      currentArray: fullClosure,
      newlyAdded: fullClosure.filter((x) => !initArr.includes(x)),
      gcdValue: g,
      maxVal: max,
      theoreticalCount: theoretical,
      hasZero,
      decision: '数论闭包生成',
      message: `由辗转相除法可知：所有生成的数必为 ${g} 的倍数（从 ${g} 到 ${max} 共 ${max / g} 个）${hasZero ? '，加上 0 额外计 1 个' : ''}`,
      log: `[Theory Calc] 最终闭包集合包含 ${fullClosure.length} 个数`,
      codeLine: {
        java: ABS_VALUE_ADD_STAGE2_LINES.java.calcCount,
        cpp: ABS_VALUE_ADD_STAGE2_LINES.cpp.calcCount,
        python: ABS_VALUE_ADD_STAGE2_LINES.python.calcCount,
        javascript: ABS_VALUE_ADD_STAGE2_LINES.javascript.calcCount,
      },
    });

    steps.push({
      stepIndex: steps.length,
      currentArray: fullClosure,
      newlyAdded: [],
      gcdValue: g,
      maxVal: max,
      theoreticalCount: theoretical,
      hasZero,
      decision: '数论贪心 O(N log M) 极速结算',
      message: `计算公式：ans = (${max} / ${g}) + (${hasZero ? '1 (有0)' : '0 (无0)'}) = ${theoretical}`,
      log: `[Done] 最终长度=${theoretical}`,
      codeLine: {
        java: ABS_VALUE_ADD_STAGE2_LINES.java.ret,
        cpp: ABS_VALUE_ADD_STAGE2_LINES.cpp.ret,
        python: ABS_VALUE_ADD_STAGE2_LINES.python.ret,
        javascript: ABS_VALUE_ADD_STAGE2_LINES.javascript.ret,
      },
    });

    return steps;
  }

  // 阶段3: 证明
  steps.push({
    stepIndex: steps.length,
    currentArray: [3, 9, 6, 0],
    newlyAdded: [6, 0],
    comparingPair: [9, 3],
    diffResult: 6,
    gcdValue: 3,
    maxVal: 9,
    theoreticalCount: 4,
    hasZero: true,
    decision: '更相减损术数学等价性',
    message: '数学本质：古中国《九章算术》中的“更相减损术”证明，不断相减操作必然能求出任意两数的最大公约数 g',
    log: '[Proof Start] 更相减损术与欧几里得算法等价。',
    codeLine: {
      java: ABS_VALUE_ADD_STAGE3_LINES.java.gcd,
      cpp: ABS_VALUE_ADD_STAGE3_LINES.cpp.gcd,
      python: ABS_VALUE_ADD_STAGE3_LINES.python.gcd,
      javascript: ABS_VALUE_ADD_STAGE3_LINES.javascript.gcd,
    },
  });

  steps.push({
    stepIndex: steps.length,
    currentArray: [0, 3, 6, 9],
    newlyAdded: [],
    gcdValue: 3,
    maxVal: 9,
    theoreticalCount: 4,
    hasZero: true,
    decision: '裴蜀定理格点全覆盖证明',
    message: '一旦最小非零公约数 g 生成，通过 |k*g - g| = (k-1)*g，整个整数格点 {1g, 2g, ..., max} 将被彻底覆盖且无法产生其他任何多余数，闭包定理成立！',
    log: '[Proof Verified] 闭包定理严格成立。',
    codeLine: {
      java: ABS_VALUE_ADD_STAGE3_LINES.java.conclusion,
      cpp: ABS_VALUE_ADD_STAGE3_LINES.cpp.conclusion,
      python: ABS_VALUE_ADD_STAGE3_LINES.python.conclusion,
      javascript: ABS_VALUE_ADD_STAGE3_LINES.javascript.conclusion,
    },
  });

  return steps;
}

// ==========================================
// 声明式沙盘装配
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<AbsValueAddStep>({
  id: 'absolute-value-add-to-array',
  name: '加入差值绝对值直到长度固定',
  category: 'greedy',
  icon: '🔢',
  badge: {
    mode: '欧几里得GCD数论贪心',
    complexity: 'O(n log max) · O(1)',
  },
  card1Title: '🔢 差值绝对值扩散与格点沙盘',
  card2Title: '🧮 欧几里得 GCD 数论监视器',
  card2Desc: '展示两两配对作差、更相减损术生成最小公约数与格点全覆盖过程',
  legend: [
    { label: '初始/已入库元素', color: '#1e293b' },
    { label: '两数配对作差中', color: '#f59e0b' },
    { label: '新生成的有效差值', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-arr',
      label: '非负整数数组',
      type: 'text',
      defaultValue: '3, 9',
      width: '180px',
    },
  ],
  presets: [
    { label: '简单公约数 [3, 9] (生成 3,6,9)', values: { 'input-arr': '3, 9' } },
    { label: '互质数组 [4, 6, 15] (GCD=1)', values: { 'input-arr': '4, 6, 15' } },
    { label: '含相同数生成0 [2, 6, 2]', values: { 'input-arr': '2, 6, 2' } },
    { label: '含0初始 [0, 8, 12]', values: { 'input-arr': '0, 8, 12' } },
  ],
  metrics: [
    { id: 'curr-len', label: '当前数组长度', color: '#38bdf8' },
    { id: 'gcd-val', label: '全局 GCD (g)', color: '#10b981' },
    { id: 'theory-count', label: '理论终态长度', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力集合迭代模拟扩散',
      shortName: '暴力模拟',
      card2Desc: '双重循环枚举所有两数差值，动态添加到哈希表中直到大小稳定',
      codeLanguages: ABS_VALUE_ADD_STAGE1_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-arr'] || '3, 9';
        return buildAbsValueAddSteps(raw, 1);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 欧几里得 GCD 数论贪心推演',
      shortName: 'GCD数论贪心',
      card2Desc: '更相减损术收敛到 gcd(arr)，最终正数数量精确等于 max/g',
      codeLanguages: ABS_VALUE_ADD_STAGE2_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-arr'] || '3, 9';
        return buildAbsValueAddSteps(raw, 2);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 裴蜀定理与更相减损证明',
      shortName: '贪心证明',
      card2Desc: '数学证明差值闭包在正整数域严格等价于 gcd 生成的理想格点',
      codeLanguages: ABS_VALUE_ADD_STAGE3_CODES,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-arr'] || '3, 9';
        return buildAbsValueAddSteps(raw, 3);
      },
    },
  ],
  codeLanguages: ABS_VALUE_ADD_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.absoluteValueAddToArray.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 欧几里得辗转相除与差值闭包</h3>
      <p><b>更相减损术：</b></p>
      <p>对于任意两个数 $x, y$，不断将大数减去小数 $|x - y|$，最终必然能得到二者的最大公约数 $\\gcd(x, y)$。</p>
      
      <p><b>为什么整个数组是 $g$ 的所有倍数？</b></p>
      <ul>
        <li>所有数的公约数是 $g$，任何两数之差仍然是 $g$ 的倍数，绝不可能产生不是 $g$ 的倍数的数；</li>
        <li>一旦 $g$ 被减出来，它与任意数 $k \\times g$ 相减，就能生成 $(k-1) \\times g$。如同步进游标一样，将 $[g, 2g, 3g, \\dots, \\max]$ 的所有倍数全量填满！</li>
        <li>因此，正数正好有 $\\max(arr) / g$ 个。</li>
      </ul>
    </div>
  `,
  buildSteps: (inputs) => {
    const raw = inputs?.['input-arr'] || '3, 9';
    return buildAbsValueAddSteps(raw, 2);
  },
  renderCanvas: (container, step) => {
    renderGcdDiffusionGrid(container, {
      currentArray: step.currentArray,
      newlyAdded: step.newlyAdded,
      comparingPair: step.comparingPair,
      diffResult: step.diffResult,
      gcdValue: step.gcdValue,
      maxVal: step.maxVal,
      theoreticalCount: step.theoreticalCount,
    });

    const root = container.closest('.dsp-view-root') || document;
    const lenEl = root.querySelector('#metric-curr-len');
    const gcdEl = root.querySelector('#metric-gcd-val');
    const theoryEl = root.querySelector('#metric-theory-count');

    if (lenEl) lenEl.textContent = `${step.currentArray.length}`;
    if (gcdEl) gcdEl.textContent = `${step.gcdValue}`;
    if (theoryEl) theoryEl.textContent = `${step.theoreticalCount}`;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">当前数论推演:</span>
          <span style="font-size: 11px; color: #0284c7; font-weight: 700;">${step.decision}</span>
        </div>
        <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11.5px; color: #334155;">
          ${step.message}
        </div>
      </div>
    `;
  },
});

export const absoluteValueAddToArrayRenderer = Visualizer;
registerAlgorithm({
  id: 'absolute-value-add-to-array',
  name: '加入差值绝对值直到长度固定',
  viewId: 'algo-absolute-value-add-to-array-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code06：更相减损术闭包，GCD 数论极速推演与裴蜀定理证明',
  icon: '🔢',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 906,
  learningGoal: '掌握差值闭包收敛于 GCD 理想格点的数论贪心本质',
});
