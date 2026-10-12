import { EXGCD_LINES } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-stage-codes';
import { Advanced134Step } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';

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
