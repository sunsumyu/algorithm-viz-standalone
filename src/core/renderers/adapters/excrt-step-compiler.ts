import { EXCRT_LINES } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-stage-codes';
import { Advanced167Step, EXCRTEquation } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';

export interface EXCRTStep extends Advanced167Step {
  equations: EXCRTEquation[];
  mergedCount: number;
  currM: number;
  currR: number;
  ans?: number;
  stage: string;
}

function exgcd(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint } {
  if (b === 0n) return { gcd: a, x: 1n, y: 0n };
  const { gcd, x: x1, y: y1 } = exgcd(b, a % b);
  return { gcd, x: y1, y: x1 - (a / b) * y1 };
}

export function buildEXCRTSteps(eqs: EXCRTEquation[]): EXCRTStep[] {
  const steps: EXCRTStep[] = [];
  const lines = EXCRT_LINES;

  // Step 0: 入口帧
  steps.push({
    equations: [...eqs],
    mergedCount: 0,
    currM: eqs[0].m,
    currR: eqs[0].r,
    stage: '主函数入口',
    decision: `主函数入口：准备求解包含 ${eqs.length} 个非互质线性同余方程的方程组`,
    message: `采用双方程递推合并法，每次引入一个新方程，通过扩展欧几里得更新总通解`,
    log: `enter excrt: count=${eqs.length}`,
    codeLine: lines.entry,
    metrics: { '方程个数': eqs.length, '首个方程': `x = ${eqs[0].r} (mod ${eqs[0].m})` },
  });

  let M = BigInt(eqs[0].m);
  let R = BigInt(eqs[0].r);

  // Step 1: 初始方程
  steps.push({
    equations: [...eqs],
    mergedCount: 1,
    currM: Number(M),
    currR: Number(R),
    stage: '初始化基准方程',
    decision: `初始基准通解：x = ${R} (mod ${M})`,
    message: `后续所有方程均在此通解基础上建立整系数不定方程展开`,
    log: `initEq: M=${M}, R=${R}`,
    codeLine: lines.entry,
    statusBadge: { text: `基准模数: ${M}`, type: 'info' },
    metrics: { '当前总模数 M': Number(M), '当前特解 R': Number(R) },
  });

  // 迭代合并每个新方程
  for (let i = 1; i < eqs.length; i++) {
    const mi = BigInt(eqs[i].m);
    const ri = BigInt(eqs[i].r);

    // M * t = ri - R (mod mi)
    const c = (ri - (R % mi) + mi) % mi;
    const { gcd, x } = exgcd(M, mi);

    if (c % gcd !== 0n) {
      // 无解情况
      steps.push({
        equations: [...eqs],
        mergedCount: i + 1,
        currM: Number(M),
        currR: Number(R),
        ans: -1,
        stage: `合并方程 #${i + 1} 时发现矛盾`,
        decision: `❌ 方程 #${i + 1} (x = ${ri} mod ${mi}) 与当前通解矛盾无解：(r_i - R)=${c} 无法被 gcd(${M}, ${mi})=${gcd} 整除`,
        message: `同余方程组不存在同时满足所有条件的公共整数解`,
        log: `noSolution: c % gcd != 0`,
        codeLine: lines.diffCheck,
        statusBadge: { text: '方程组无解', type: 'danger' },
        metrics: { '当前差值': Number(c), '公约数 gcd': Number(gcd) },
      });
      return steps;
    }

    const modStep = mi / gcd;
    const t = ((x % modStep) * ((c / gcd) % modStep) + modStep) % modStep;
    R += M * t;
    M = (M / gcd) * mi;
    R = (R % M + M) % M;

    steps.push({
      equations: [...eqs],
      mergedCount: i + 1,
      currM: Number(M),
      currR: Number(R),
      stage: `合并方程 #${i + 1} 完成`,
      decision: `双方程合并成功：前 ${i + 1} 个方程统一通解为 x = ${R} (mod ${M})`,
      message: `引入 x = ${ri} (mod ${mi})，不定方程求得特解 t = ${t}，更新 LCM 模数至 ${M}`,
      log: `merged: i=${i + 1}, newM=${M}, newR=${R}`,
      codeLine: lines.mergeStep,
      statusBadge: { text: `已合并 ${i + 1} 个方程`, type: 'info' },
      metrics: { '当前总模数 M': Number(M), '当前特解 R': Number(R), '方程步进特解 t': Number(t) },
    });
  }

  const finalAns = Number(R);
  // 终态返回
  steps.push({
    equations: [...eqs],
    mergedCount: eqs.length,
    currM: Number(M),
    currR: Number(R),
    ans: finalAns,
    stage: '求解全部完成',
    decision: `🎉 EXCRT 扩展中国剩余定理求解完成：最小非负整数解 x = ${finalAns}`,
    message: `通解为 x = ${finalAns} + k * ${M} (k in Z)，严格满足所有 ${eqs.length} 个线性同余方程`,
    log: `returnAns: x=${finalAns}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `最小特解: ${finalAns}`, type: 'success' },
    metrics: { '最终解 x': finalAns, '总模数 LCM': Number(M) },
  });

  return steps;
}
