/**
 * Class 139: 扩展欧几里得算法 (Extended GCD / ExGCD)
 * 洛谷 P1082 同余方程 / Bézout 定理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { EXGCD_CODES, EXGCD_LINES } from './advanced-134-140-stage-codes';
import { Advanced134Step } from './advanced-134-140-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ExgcdFrame {
  a: number;
  b: number;
  q?: number; // floor(a/b)
  x?: number;
  y?: number;
  gcd?: number;
  status: 'call' | 'base' | 'returned';
}

export interface ExgcdStep extends Advanced134Step {
  callStack: ExgcdFrame[];
  curA: number;
  curB: number;
  x?: number;
  y?: number;
  gcd?: number;
  finalAns?: { x: number; y: number; gcd: number };
}

export function buildExgcdSteps(initA: number, initB: number): ExgcdStep[] {
  const steps: ExgcdStep[] = [];
  const lines = EXGCD_LINES;

  const stack: ExgcdFrame[] = [];

  // Step 0: 入口
  steps.push({
    callStack: [],
    curA: initA,
    curB: initB,
    decision: `主函数入口：开始对 a = ${initA}, b = ${initB} 求解裴蜀等式 a * x + b * y = gcd(a, b)`,
    message: '基于辗转相除递归，在回溯时应用递推公式 x = y\', y = x\' - floor(a/b) * y\' 恢复整数组解',
    log: `enter exgcd(a=${initA}, b=${initB})`,
    codeLine: lines.entry,
    metrics: { '参数 a': initA, '参数 b': initB },
  });

  function recurse(a: number, b: number): { x: number; y: number; gcd: number } {
    const frame: ExgcdFrame = { a, b, status: 'call' };
    stack.push(frame);

    steps.push({
      callStack: stack.map(f => ({ ...f })),
      curA: a,
      curB: b,
      decision: `递归深入：调用 exgcd(a=${a}, b=${b})，准备检查基底条件`,
      message: b === 0 ? '到达递归边界 b = 0' : `计算带余除法：${a} = ${Math.floor(a / b)} * ${b} + ${a % b}`,
      log: `call exgcd(${a}, ${b})`,
      codeLine: lines.recursive,
      metrics: { '当前层 a': a, '当前层 b': b, '递归深度': stack.length },
    });

    if (b === 0) {
      frame.x = 1;
      frame.y = 0;
      frame.gcd = a;
      frame.status = 'base';

      steps.push({
        callStack: stack.map(f => ({ ...f })),
        curA: a,
        curB: b,
        x: 1,
        y: 0,
        gcd: a,
        decision: `🎯 触发基底边界 (b == 0)：gcd(${a}, 0) = ${a}，直接返回基底特解 x = 1, y = 0`,
        message: `验证等式：${a} * 1 + 0 * 0 = ${a} 恒成立！`,
        log: `base case: x=1, y=0, gcd=${a}`,
        codeLine: lines.baseCase,
        metrics: { '基底解 x': 1, '基底解 y': 0, 'gcd': a },
        statusBadge: { text: `边界触发: gcd=${a}`, type: 'warning' },
      });

      return { x: 1, y: 0, gcd: a };
    }

    const q = Math.floor(a / b);
    frame.q = q;

    const nxt = recurse(b, a % b);

    const x = nxt.y;
    const y = nxt.x - q * nxt.y;

    frame.x = x;
    frame.y = y;
    frame.gcd = nxt.gcd;
    frame.status = 'returned';

    steps.push({
      callStack: stack.map(f => ({ ...f })),
      curA: a,
      curB: b,
      x,
      y,
      gcd: nxt.gcd,
      decision: `🔙 回溯计算解：利用下层解 (x'=${nxt.x}, y'=${nxt.y}) 与商 q=${q}，计算 x = ${x}, y = ${nxt.x} - ${q} * ${nxt.y} = ${y}`,
      message: `等式验证：${a} * (${x}) + ${b} * (${y}) = ${a * x + b * y} == gcd (${nxt.gcd}) 完美匹配！`,
      log: `calcXY: a=${a}, b=${b} -> x=${x}, y=${y}`,
      codeLine: lines.calcXY,
      metrics: { '当前 x': x, '当前 y': y, '等式验证': `${a}*${x} + ${b}*${y} = ${nxt.gcd}` },
      statusBadge: { text: `回溯解: (${x}, ${y})`, type: 'info' },
    });

    stack.pop();
    return { x, y, gcd: nxt.gcd };
  }

  const res = recurse(initA, initB);

  // 终态
  steps.push({
    callStack: [{ a: initA, b: initB, x: res.x, y: res.y, gcd: res.gcd, status: 'returned' }],
    curA: initA,
    curB: initB,
    x: res.x,
    y: res.y,
    gcd: res.gcd,
    finalAns: res,
    decision: `✅ 扩展欧几里得求解完成！特解为: x = ${res.x}, y = ${res.y}，最大公约数 gcd(${initA}, ${initB}) = ${res.gcd}`,
    message: `裴蜀等式：${initA} * (${res.x}) + ${initB} * (${res.y}) = ${initA * res.x + initB * res.y} == ${res.gcd}。时间复杂度严格 O(log min(a, b))`,
    log: `exgcd finished, x=${res.x}, y=${res.y}, gcd=${res.gcd}`,
    codeLine: lines.returnAns,
    metrics: { '最终解 x': res.x, '最终解 y': res.y, '最大公约数': res.gcd },
    statusBadge: { text: `解: (${res.x}, ${res.y})`, type: 'success' },
  });

  return steps;
}

export const exgcdVisualizer = registerDeclarativeAlgorithm<ExgcdStep>({
  id: 'exgcd-139',
  name: '扩展欧几里得算法 (Class 139)',
  category: 'math',
  icon: '🤝',
  difficulty: 2,
  levelOrder: 139,
  learningGoal: '深刻理解辗转相除递归深入与利用 x = y\', y = x\' - floor(a/b)*y\' 逐层回溯构建裴蜀等式解的数学原理',
  problemHtml: ADVANCED_134_140_PROBLEMS.exgcd.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.exgcd.html,
  inputs: [
    {
      id: 'a',
      label: '系数 a',
      type: 'number',
      defaultValue: 47,
      min: 1,
      max: 1000,
    },
    {
      id: 'b',
      label: '系数 b',
      type: 'number',
      defaultValue: 30,
      min: 0,
      max: 1000,
    },
  ],
  codeLanguages: EXGCD_CODES,
  generateSteps: (input) => {
    const a = Math.max(1, Number(input.a) || 47);
    const b = Math.max(0, Number(input.b) || 30);
    return buildExgcdSteps(a, b);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;">
            🪜 ExGCD 递归栈帧调用链 (栈深度: ${step.callStack.length})
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${step.callStack.map((f, idx) => `
              <div style="background: ${f.status === 'base' ? '#fef3c7' : f.status === 'returned' ? '#ecfdf5' : '#ffffff'}; border: 1px solid ${f.status === 'base' ? '#f59e0b' : f.status === 'returned' ? '#10b981' : '#cbd5e1'}; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                <span style="font-weight: 700; color: #1e293b;">Frame #${idx}: exgcd(${f.a}, ${f.b})</span>
                <span style="color: #64748b;">${f.q !== undefined ? `商 q=${f.q}` : ''}</span>
                <span style="font-weight: 700; color: #6366f1;">${f.x !== undefined ? `解 x=${f.x}, y=${f.y} (gcd=${f.gcd})` : '等待递归返回'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">特解 x</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.x !== undefined ? step.x : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">特解 y</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.y !== undefined ? step.y : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">最大公约数 gcd</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.gcd !== undefined ? step.gcd : '-'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '裴蜀等式求解进度',
          `当前层: a=${step.curA}, b=${step.curB} ${step.finalAns ? `| 最终等式: ${step.curA}*(${step.finalAns.x}) + ${step.curB}*(${step.finalAns.y}) = ${step.finalAns.gcd}` : ''}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
