/**
 * 二进制快速幂 (Quick Power) - 声明式教学级沙盘渲染器
 * 核心原理：将指数拆分为二进制权重，底数反复平方累乘，实现 O(log b) 极速幂运算
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { QUICK_POWER_CODES, QUICK_POWER_LINES } from './math-098-stage-codes';
import { Math098Step, renderExpBits } from './math-098-shared';

export interface QuickPowerStep extends Math098Step {
  a?: number;
  b?: number;
  mod?: number;
  curA: number;
  curB: number;
  curAns: number;
  bitIndex?: number;
}

export function buildQuickPowerSteps(
  a: number,
  b: number,
  mod: number = 1000000007
): QuickPowerStep[] {
  const steps: QuickPowerStep[] = [];
  const lines = QUICK_POWER_LINES;

  let base = BigInt(a) % BigInt(mod);
  let exp = BigInt(b);
  const m = BigInt(mod);
  let ans = 1n;

  // Step 0: 入口
  steps.push({
    decision: `主函数入口：计算 (${a}^${b}) % ${mod}`,
    message: `指数 ${b} 的二进制表示为 ${b.toString(2)}，准备进行快速幂逐位求解`,
    log: `enter power(a=${a}, b=${b}, mod=${mod})`,
    codeLine: lines.entry,
    metrics: { '底数 a': `${a}`, '指数 b': `${b}`, '模数 mod': `${mod}` },
    curA: Number(base),
    curB: Number(exp),
    curAns: Number(ans),
  } as QuickPowerStep);

  // Step 1: 初始化 ans
  steps.push({
    decision: '初始化答案累乘器：long ans = 1',
    message: '当指数二进制对应位为 1 时，将当前底数贡献乘入 ans',
    log: 'init ans = 1',
    codeLine: lines.initAns,
    metrics: { '当前 ans': '1' },
    curA: Number(base),
    curB: Number(exp),
    curAns: 1,
  } as QuickPowerStep);

  // Step 2: 循环推演
  let bitIdx = 0;
  while (exp > 0n) {
    const isBitOne = (exp & 1n) === 1n;

    steps.push({
      decision: `检查指数最低位：b=${exp} (末位为 ${isBitOne ? '1' : '0'})`,
      message: isBitOne ? '末位为 1，当前底数权重有效，准备乘入 ans' : '末位为 0，当前底数权重跳过',
      log: `while loop: exp=${exp}, bit0=${isBitOne ? 1 : 0}`,
      codeLine: lines.whileLoop,
      metrics: { '指数 b': `${exp}`, '末位二进制': isBitOne ? '1' : '0', '当前权重': `${base}` },
      curA: Number(base),
      curB: Number(exp),
      curAns: Number(ans),
      bitIndex: bitIdx,
    } as QuickPowerStep);

    if (isBitOne) {
      const prevAns = ans;
      ans = (ans * base) % m;
      steps.push({
        decision: `累乘生效：ans = (${prevAns} * ${base}) % ${mod} = ${ans}`,
        message: `将当前底数贡献并入答案，ans 变为 ${ans}`,
        log: `ans = (${prevAns} * ${base}) % ${mod} = ${ans}`,
        codeLine: lines.accumulate,
        metrics: { '累乘后 ans': `${ans}` },
        curA: Number(base),
        curB: Number(exp),
        curAns: Number(ans),
        bitIndex: bitIdx,
      } as QuickPowerStep);
    }

    const prevBase = base;
    base = (base * base) % m;
    steps.push({
      decision: `底数自乘翻倍：a = (${prevBase} * ${prevBase}) % ${mod} = ${base}`,
      message: '为指数的下一个更高二进制位做好底数准备',
      log: `base squared: ${prevBase}^2 => ${base}`,
      codeLine: lines.squareBase,
      metrics: { '新底数': `${base}` },
      curA: Number(base),
      curB: Number(exp),
      curAns: Number(ans),
      bitIndex: bitIdx,
    } as QuickPowerStep);

    exp >>= 1n;
    bitIdx++;

    steps.push({
      decision: `指数右移：b >>= 1 ➔ 新指数 b=${exp} (二进制 ${exp.toString(2) || '0'})`,
      message: '处理下一个二进制高位',
      log: `exp shift right to ${exp}`,
      codeLine: lines.shiftExp,
      metrics: { '剩余指数 b': `${exp}` },
      curA: Number(base),
      curB: Number(exp),
      curAns: Number(ans),
      bitIndex: bitIdx,
    } as QuickPowerStep);
  }

  // Step 3: 收敛返回
  steps.push({
    decision: `🎉 快速幂推演完成！(${a}^${b}) % ${mod} = ${ans}`,
    message: '算法在 O(log b) 步内成功收敛',
    log: `return ${ans}`,
    codeLine: lines.returnAns,
    metrics: { '最终结果': `${ans}` },
    curA: Number(base),
    curB: 0,
    curAns: Number(ans),
    finalValue: Number(ans),
  } as QuickPowerStep);

  return steps;
}

export const quickPowerVisualizer = registerDeclarativeAlgorithm<QuickPowerStep>({
  id: 'quick-power-098',
  name: '二进制快速幂 (Quick Power)',
  category: 'math',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 981,
  learningGoal: '深刻理解指数二进制权值拆解与底数逐轮自乘平方的高效性',
  problemHtml: MATH_098_PROBLEMS.quickPower.html,
  analysisHtml: MATH_098_PROBLEMS.quickPower.html,
  inputs: [
    {
      id: 'input-a',
      label: '底数 a',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-b',
      label: '指数 b',
      type: 'number',
      defaultValue: 13,
      min: 0,
      max: 1000000,
      step: 1,
      placeholder: '例如 13',
    },
    {
      id: 'input-mod',
      label: '模数 mod',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 1000000007,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: QUICK_POWER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const a = parseInt(String(inputs?.['input-a'] ?? '3'), 10) || 3;
    const b = parseInt(String(inputs?.['input-b'] ?? '13'), 10) || 13;
    const mod = parseInt(String(inputs?.['input-mod'] ?? '1000000007'), 10) || 1000000007;
    return buildQuickPowerSteps(a, b, mod);
  },
  renderCanvas: (stageContainer: HTMLElement, step: QuickPowerStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 指数二进制分解看板
    renderExpBits(root, step.b || 0, step.bitIndex);

    // 2. 核心状态数据监控面板
    const statusBox = document.createElement('div');
    statusBox.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';
    statusBox.innerHTML = `
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1.5px solid #cbd5e1; text-align: center;">
        <div style="font-size: 11px; color: #64748b; font-weight: 700;">当前底数 a</div>
        <div style="font-size: 16px; font-weight: 800; color: #1e293b; font-family: monospace; margin-top: 2px;">${step.curA}</div>
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1.5px solid #cbd5e1; text-align: center;">
        <div style="font-size: 11px; color: #64748b; font-weight: 700;">当前剩余指数 b</div>
        <div style="font-size: 16px; font-weight: 800; color: #0284c7; font-family: monospace; margin-top: 2px;">${step.curB}</div>
      </div>
      <div style="padding: 8px 12px; background: #ecfdf5; border-radius: 6px; border: 1.5px solid #10b981; text-align: center;">
        <div style="font-size: 11px; color: #047857; font-weight: 700;">累乘答案 ans</div>
        <div style="font-size: 16px; font-weight: 800; color: #059669; font-family: monospace; margin-top: 2px;">${step.curAns}</div>
      </div>
    `;
    root.appendChild(statusBox);

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
