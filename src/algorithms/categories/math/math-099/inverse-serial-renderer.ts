/**
 * 线性递推求逆元 (Linear Inverses 1 to n) - 声明式教学级沙盘渲染器
 * 核心原理：inv[i] = (p - floor(p / i)) * inv[p % i] % p，O(n) 线性打表
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { INVERSE_SERIAL_CODES, INVERSE_SERIAL_LINES } from './math-099-stage-codes';
import { Math099Step, renderInverseCards } from './math-099-shared';

export interface InverseSerialStep extends Math099Step {
  n: number;
  p: number;
}

export function buildInverseSerialSteps(n: number, p: number = 1000000007): InverseSerialStep[] {
  const steps: InverseSerialStep[] = [];
  const lines = INVERSE_SERIAL_LINES;

  const inv: number[] = new Array(n + 1).fill(0);
  const table: { num: number; inv: number }[] = [];

  // Step 0: 入口
  steps.push({
    n,
    p,
    decision: `主函数入口：准备在 O(n) 时间内递推求解 1 ~ ${n} 的全部逆元 (模 p=${p})`,
    message: '基于 p = k * i + r 的带余除法，可在常数步内由前序已求逆元转移至当前逆元',
    log: `enter buildInverses(n=${n}, p=${p})`,
    codeLine: lines.entry,
    metrics: { '规模 n': `${n}`, '质数模数 p': `${p}` },
  });

  // Step 1: inv[1] = 1
  inv[1] = 1;
  table.push({ num: 1, inv: 1 });
  steps.push({
    n,
    p,
    inversesTable: [...table],
    activeNum: 1,
    decision: '设置基底初值：inv[1] = 1 (1 × 1 ≡ 1 mod p)',
    message: '从 i = 2 开始自小到大递推',
    log: 'inv[1] = 1',
    codeLine: lines.initBase,
    metrics: { 'inv[1]': '1' },
  });

  // Step 2: 递推计算 2..n
  for (let i = 2; i <= n; i++) {
    const k = Math.floor(p / i);
    const r = p % i;

    steps.push({
      n,
      p,
      inversesTable: [...table],
      activeNum: i,
      decision: `循环递推 i=${i}：带余除法 p = ${p} = ${k} × ${i} + ${r}`,
      message: `依赖状态：inv[p % i] = inv[${r}] = ${inv[r]}`,
      log: `loop i=${i}, k=${k}, r=${r}`,
      codeLine: lines.loopHeader,
      metrics: { '当前数值 i': `${i}`, '商 k': `${k}`, '余数 r': `${r}` },
    });

    const curInv = Number((BigInt(p - k) * BigInt(inv[r])) % BigInt(p));
    inv[i] = curInv;
    table.push({ num: i, inv: curInv });

    steps.push({
      n,
      p,
      inversesTable: [...table],
      activeNum: i,
      decision: `状态转移：inv[${i}] = (p - floor(p/${i})) × inv[${r}] % p = (${p - k} × ${inv[r]}) % ${p} = ${curInv}！`,
      message: `已写入 inv[${i}] = ${curInv}`,
      log: `inv[${i}] = ${curInv}`,
      codeLine: lines.computeInv,
      metrics: { [`inv[${i}]`]: `${curInv}` },
    });
  }

  // Step 3: 收敛返回
  steps.push({
    n,
    p,
    inversesTable: [...table],
    decision: `🎉 线性递推完成！1 ~ ${n} 的逆元全部求出，整个过程仅耗时 O(n)！`,
    message: '算法成功收敛',
    log: `done linear inverses`,
    codeLine: lines.returnAns,
    metrics: { '已求出逆元数': `${n}` },
  });

  return steps;
}

export const inverseSerialVisualizer = registerDeclarativeAlgorithm<InverseSerialStep>({
  id: 'inverse-serial-099',
  name: '线性递推求逆元 (Linear Inverses)',
  category: 'math',
  icon: '📈',
  difficulty: 3,
  levelOrder: 992,
  learningGoal: '掌握带余除法向模逆元递推式 inv[i] = (p - p/i) * inv[p%i] % p 的推导与 O(n) 实现',
  problemHtml: MATH_099_PROBLEMS.inverseSerial.html,
  analysisHtml: MATH_099_PROBLEMS.inverseSerial.html,
  inputs: [
    {
      id: 'input-n',
      label: '递推上限 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 50,
      step: 1,
      placeholder: '例如 10',
    },
    {
      id: 'input-p',
      label: '模数 p (质数)',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 1000000007,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: INVERSE_SERIAL_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    const p = Math.max(2, parseInt(String(inputs?.['input-p'] ?? '1000000007'), 10) || 1000000007);
    return buildInverseSerialSteps(n, p);
  },
  renderCanvas: (stageContainer: HTMLElement, step: InverseSerialStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 逆元表格展示
    if (step.inversesTable) {
      renderInverseCards(root, step.inversesTable, step.activeNum, step.p);
    }

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
