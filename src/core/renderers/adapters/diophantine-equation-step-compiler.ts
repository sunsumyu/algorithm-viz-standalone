import { DIOPHANTINE_LINES } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-stage-codes';
import { Advanced134Step } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';

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
