import { EXBSGS_LINES } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-stage-codes';
import { Advanced167Step } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';

export interface EXBSGSStep extends Advanced167Step {
  a: number;
  b: number;
  p: number;
  reducedA: number;
  reducedB: number;
  reducedP: number;
  d: number;
  cnt: number;
  ans?: number;
  stage: string;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function standardBSGS(a: number, b: number, p: number, d: number): number {
  if (p === 1) return 0;
  const m = Math.ceil(Math.sqrt(p));
  const table = new Map<number, number>();

  // Baby-step: b * a^j (0 <= j <= m)
  let cur = BigInt(b);
  const ba = BigInt(a);
  const bp = BigInt(p);

  for (let j = 0; j <= m; j++) {
    table.set(Number(cur), j);
    cur = (cur * ba) % bp;
  }

  // Giant-step: a^(i*m)
  let am = 1n;
  for (let i = 0; i < m; i++) am = (am * ba) % bp;

  let base = BigInt(d);
  for (let i = 1; i <= m + 1; i++) {
    base = (base * am) % bp;
    const key = Number(base);
    if (table.has(key)) {
      const j = table.get(key)!;
      return i * m - j;
    }
  }
  return -1;
}

export function buildEXBSGSSteps(origA: number, origB: number, origP: number): EXBSGSStep[] {
  const steps: EXBSGSStep[] = [];
  const lines = EXBSGS_LINES;

  // Step 0: 入口帧
  steps.push({
    a: origA,
    b: origB,
    p: origP,
    reducedA: origA,
    reducedB: origB,
    reducedP: origP,
    d: 1,
    cnt: 0,
    stage: '主函数入口',
    decision: `主函数入口：求解离散对数方程 ${origA}^x = ${origB} (mod ${origP})`,
    message: `因 gcd(${origA}, ${origP}) 可能大于 1，必须连续提取公因子消去，降模后转换为互质 BSGS`,
    log: `enter exbsgs: a=${origA}, b=${origB}, p=${origP}`,
    codeLine: lines.entry,
    metrics: { '底数 a': origA, '目标 b': origB, '模数 p': origP, '初始公约数': gcd(origA, origP) },
  });

  // 特判 b == 1 或 p == 1
  if (origB === 1 || origP === 1) {
    steps.push({
      a: origA,
      b: origB,
      p: origP,
      reducedA: origA,
      reducedB: origB,
      reducedP: origP,
      d: 1,
      cnt: 0,
      ans: 0,
      stage: '特判 0 次幂',
      decision: `特判命中：${origA}^0 = 1 恒成立，最小非负整数解为 x = 0`,
      message: `任意非零数的 0 次幂均为 1`,
      log: `baseCheck: b=1, ans=0`,
      codeLine: lines.baseCheck,
      statusBadge: { text: 'x = 0', type: 'success' },
      metrics: { '最终解 x': 0 },
    });
    return steps;
  }

  let a = origA;
  let b = origB;
  let p = origP;
  let d = 1;
  let cnt = 0;

  // 消公因子循环
  while (true) {
    const g = gcd(a, p);
    if (g === 1) break;

    if (b % g !== 0) {
      // 无解
      steps.push({
        a: origA,
        b: origB,
        p: origP,
        reducedA: a,
        reducedB: b,
        reducedP: p,
        d,
        cnt,
        ans: -1,
        stage: '公因子无法整除判定无解',
        decision: `❌ 无解：当前模数与底数公因子 gcd(${a}, ${p}) = ${g}，但目标 b=${b} 无法被 ${g} 整除`,
        message: `左侧 a^x 必然包含质因数 ${g}，而右侧 b 不包含，方程必然无整数解`,
        log: `noSolution: b % g != 0`,
        codeLine: lines.extractGCD,
        statusBadge: { text: '方程无解', type: 'danger' },
        metrics: { '不可除公因子': g, '当前 b': b },
      });
      return steps;
    }

    cnt++;
    b = Math.floor(b / g);
    p = Math.floor(p / g);
    d = Number((BigInt(d) * BigInt(Math.floor(a / g))) % BigInt(p));

    steps.push({
      a: origA,
      b: origB,
      p: origP,
      reducedA: a,
      reducedB: b,
      reducedP: p,
      d,
      cnt,
      stage: `提取公因子 round #${cnt}`,
      decision: `消去第 ${cnt} 次公因子 g=${g}：方程等价转化为 ${d} * ${a}^(x-${cnt}) = ${b} (mod ${p})`,
      message: `两边同除以 ${g}，缩小模数至 ${p}，系数前缀累积 d=${d}`,
      log: `divFactor: cnt=${cnt}, g=${g}, p=${p}, d=${d}`,
      codeLine: lines.divFactor,
      statusBadge: { text: `模数降至 ${p}`, type: 'warning' },
      metrics: { '提取次数 cnt': cnt, '当前公因子': g, '新模数 p': p, '前缀积 d': d },
    });

    if (d === b) {
      // 提前命中
      steps.push({
        a: origA,
        b: origB,
        p: origP,
        reducedA: a,
        reducedB: b,
        reducedP: p,
        d,
        cnt,
        ans: cnt,
        stage: '降模阶段直接命中解',
        decision: `🎉 前缀系数 d=${d} 恰好等于当前 b=${b}，直接得到解 x = cnt = ${cnt}`,
        message: `说明 x-${cnt} = 0 即为满足方程的最小非负解`,
        log: `earlyHit: ans=${cnt}`,
        codeLine: lines.returnAns,
        statusBadge: { text: `x = ${cnt}`, type: 'success' },
        metrics: { '最终解 x': cnt },
      });
      return steps;
    }
  }

  // 此时 gcd(a, p) == 1，调用标准 BSGS
  const subAns = standardBSGS(a, b, p, d);
  const finalAns = subAns === -1 ? -1 : subAns + cnt;

  steps.push({
    a: origA,
    b: origB,
    p: origP,
    reducedA: a,
    reducedB: b,
    reducedP: p,
    d,
    cnt,
    ans: finalAns,
    stage: '互质标准 BSGS 求解完成',
    decision: finalAns === -1
      ? `❌ 经标准 BSGS 检索，在 mod ${p} 下无可行离散对数解`
      : `🎉 标准 BSGS 求解成功：求得子方程解 ${subAns}，合并提取次数得到最终解 x = ${subAns} + ${cnt} = ${finalAns}`,
    message: `时间复杂度 O(sqrt(P))，彻底解决底数与模数不互质情形`,
    log: `returnAns: ans=${finalAns}`,
    codeLine: lines.returnAns,
    statusBadge: { text: finalAns === -1 ? '无解' : `x = ${finalAns}`, type: finalAns === -1 ? 'danger' : 'success' },
    metrics: { '最终解 x': finalAns, '提取轮次': cnt, 'BSGS 步长': Math.ceil(Math.sqrt(p)) },
  });

  return steps;
}
