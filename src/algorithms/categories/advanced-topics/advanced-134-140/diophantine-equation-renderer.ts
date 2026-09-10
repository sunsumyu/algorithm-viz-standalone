/**
 * Class 140: 二元一次不定方程 (Diophantine Equation)
 * 洛谷 P5656 【模板】二元一次不定方程 (exgcd)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { DIOPHANTINE_CODES, DIOPHANTINE_LINES } from './advanced-134-140-stage-codes';
import { Advanced134Step } from './advanced-134-140-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DiophantineStep extends Advanced134Step {
  a: number;
  b: number;
  c: number;
  gcd?: number;
  hasSolution: boolean;
  baseX?: number;
  baseY?: number;
  scaleX?: number;
  dx?: number;
  minPositiveX?: number;
  correspondingY?: number;
}

export function buildDiophantineSteps(
  a: number,
  b: number,
  c: number
): DiophantineStep[] {
  const steps: DiophantineStep[] = [];
  const lines = DIOPHANTINE_LINES;

  // Step 0: 入口
  steps.push({
    a,
    b,
    c,
    hasSolution: true,
    decision: `主函数入口：开始求解二元一次不定方程 ${a} * x + ${b} * y = ${c}`,
    message: '根据裴蜀定理：方程存在整数解的充要条件是 gcd(a, b) 能够整除 c',
    log: `enter minPositiveX(a=${a}, b=${b}, c=${c})`,
    codeLine: lines.entry,
    metrics: { '方程': `${a}x + ${b}y = ${c}` },
  });

  // exgcd 求解 gcd(a, b)
  function exgcd(u: number, v: number): { x: number; y: number; gcd: number } {
    if (v === 0) return { x: 1, y: 0, gcd: u };
    const nxt = exgcd(v, u % v);
    return {
      x: nxt.y,
      y: nxt.x - Math.floor(u / v) * nxt.y,
      gcd: nxt.gcd,
    };
  }

  const res = exgcd(a, b);
  const g = res.gcd;

  steps.push({
    a,
    b,
    c,
    gcd: g,
    hasSolution: true,
    baseX: res.x,
    baseY: res.y,
    decision: `调用 exgcd 计算最大公约数：gcd(${a}, ${b}) = ${g}，对应特解方程 ${a} * (${res.x}) + ${b} * (${res.y}) = ${g}`,
    message: `准备利用 ${g} 判定常数 c = ${c} 的整除性`,
    log: `callExgcd: g=${g}, x0=${res.x}, y0=${res.y}`,
    codeLine: lines.callExgcd,
    metrics: { '最大公约数 gcd': g, '基底解 x': res.x, '基底解 y': res.y },
  });

  // 判定整除
  if (c % g !== 0) {
    steps.push({
      a,
      b,
      c,
      gcd: g,
      hasSolution: false,
      decision: `❌ 裴蜀定理无解判定：c = ${c} 不能被 gcd(${a}, ${b}) = ${g} 整除 (余数 ${c % g} != 0)`,
      message: `任意整数 x, y 产生的组合 ${a}x + ${b}y 均为 ${g} 的倍数，故该方程无整数解！`,
      log: `no solution: ${c} % ${g} !== 0`,
      codeLine: lines.checkMod,
      metrics: { '判定结果': '无解', '余数': c % g },
      statusBadge: { text: '方程无整数解 (-1)', type: 'danger' },
    });
    return steps;
  }

  steps.push({
    a,
    b,
    c,
    gcd: g,
    hasSolution: true,
    baseX: res.x,
    baseY: res.y,
    decision: `✅ 整除检验通过：${c} 是 gcd = ${g} 的 ${c / g} 倍！方程必定存在无穷多组整数解`,
    message: `准备将基底特解按比例放大 ${c / g} 倍`,
    log: `checkMod passed: ${c} % ${g} === 0`,
    codeLine: lines.checkMod,
    metrics: { '倍率 c/g': c / g },
    statusBadge: { text: '方程必定有解', type: 'success' },
  });

  // 特解放大
  const scale = c / g;
  const scaleX = res.x * scale;
  const dx = Math.abs(b / g);

  steps.push({
    a,
    b,
    c,
    gcd: g,
    hasSolution: true,
    baseX: res.x,
    baseY: res.y,
    scaleX,
    dx,
    decision: `特解放大与周期步长：初级特解 x_spec = x0 * ${scale} = ${scaleX}，解的周期步长 dx = |b / gcd| = ${dx}`,
    message: `通解形式为：x = ${scaleX} + k * ${dx} (k 为任意整数)`,
    log: `scaleSpec: scaleX=${scaleX}, dx=${dx}`,
    codeLine: lines.scaleSpec,
    metrics: { '放大特解': scaleX, '通解周期 dx': dx },
  });

  // 模化出最小正整数解
  const minX = ((scaleX % dx) + dx - 1) % dx + 1;
  const correspY = (c - a * minX) / b;

  // 终态
  steps.push({
    a,
    b,
    c,
    gcd: g,
    hasSolution: true,
    baseX: res.x,
    baseY: res.y,
    scaleX,
    dx,
    minPositiveX: minX,
    correspondingY: correspY,
    decision: `🎉 最小正整数解求解成功！x 的最小正整数解为: ${minX}，此时 y = ${correspY}`,
    message: `代入验证：${a} * ${minX} + ${b} * (${correspY}) = ${a * minX + b * correspY} == ${c}！通解公式为 x = ${minX} + k * ${dx}`,
    log: `return minPositiveX = ${minX}, y = ${correspY}`,
    codeLine: lines.returnAns,
    metrics: { '最小正整数 x': minX, '对应 y': correspY, '通解周期': dx },
    statusBadge: { text: `最小正整数解 x = ${minX}`, type: 'success' },
  });

  return steps;
}

export const diophantineVisualizer = registerDeclarativeAlgorithm<DiophantineStep>({
  id: 'diophantine-equation-140',
  name: '二元一次不定方程 (Class 140)',
  category: 'math',
  icon: '⚖️',
  difficulty: 2,
  levelOrder: 140,
  learningGoal: '掌握二元一次不定方程 ax + by = c 的裴蜀定理无解判定、特解放大与利用周期 dx 模化求最小正整数解机制',
  problemHtml: ADVANCED_134_140_PROBLEMS.diophantineEquation.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.diophantineEquation.html,
  inputs: [
    {
      id: 'a',
      label: '系数 a',
      type: 'number',
      defaultValue: 24,
      min: 1,
      max: 1000,
    },
    {
      id: 'b',
      label: '系数 b',
      type: 'number',
      defaultValue: 15,
      min: 1,
      max: 1000,
    },
    {
      id: 'c',
      label: '常数 c',
      type: 'number',
      defaultValue: 18,
      min: 1,
      max: 1000,
    },
  ],
  codeLanguages: DIOPHANTINE_CODES,
  generateSteps: (input) => {
    const a = Math.max(1, Number(input.a) || 24);
    const b = Math.max(1, Number(input.b) || 15);
    const c = Math.max(1, Number(input.c) || 18);
    return buildDiophantineSteps(a, b, c);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            📐 不定方程解析式: ${step.a}x + ${step.b}y = ${step.c}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            ${step.gcd ? `最大公约数: gcd(${step.a}, ${step.b}) = ${step.gcd} | 整除判定: ${step.c} % ${step.gcd} = ${step.c % step.gcd}` : '待计算'}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">解的存在性</div>
            <div style="font-size: 18px; font-weight: 700; color: ${step.hasSolution ? '#059669' : '#dc2626'};">
              ${step.hasSolution ? '必定有解' : '无整数解 (-1)'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">最小正整数 x</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.minPositiveX !== undefined ? step.minPositiveX : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">通解周期 dx</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.dx !== undefined ? step.dx : '-'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '二元一次不定方程状态',
          `方程: ${step.a}x + ${step.b}y = ${step.c} ${step.minPositiveX !== undefined ? `| 最小正整数解: x=${step.minPositiveX}, y=${step.correspondingY}` : ''}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
