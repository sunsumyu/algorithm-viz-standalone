/**
 * Class 168: 扩展中国剩余定理 (EXCRT / Extended Chinese Remainder Theorem)
 * 模数不保证互质的同余方程组求解 / 洛谷 P4777 【模板】扩展中国剩余定理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { EXCRT_CODES, EXCRT_LINES } from './advanced-167-172-stage-codes';
import { Advanced167Step, EXCRTEquation, renderEXCRTBoard } from './advanced-167-172-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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

export const excrtVisualizer = registerDeclarativeAlgorithm<EXCRTStep>({
  id: 'excrt-theorem-168',
  name: '扩展中国剩余定理 EXCRT (Class 168)',
  category: 'math',
  icon: '🧩',
  difficulty: 3,
  levelOrder: 168,
  description: '左程云算法通关课 Class 168：扩展中国剩余定理 (EXCRT)。解决模数不两两互质的线性同余方程组求解，双方程递推合并，exgcd 维护通解。',
  learningGoal: '掌握双方程合并代数构造模型，理解差值被公约数整除性判定无解与模数最小公倍数扩展',
  problemHtml: ADVANCED_167_172_PROBLEMS.excrt.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.excrt.html,
  inputs: [
    {
      id: 'preset',
      label: '同余方程组预设',
      type: 'select',
      defaultValue: 'eq_4_6_5',
      options: [
        { label: 'x=2(mod 4), x=4(mod 6), x=1(mod 5) (结果: 46, 不互质)', value: 'eq_4_6_5' },
        { label: 'x=2(mod 3), x=3(mod 5), x=2(mod 7) (结果: 23, 互质测试)', value: 'eq_coprime' },
      ],
    },
  ],
  codeLanguages: EXCRT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'eq_4_6_5');
    if (preset === 'eq_coprime') {
      return buildEXCRTSteps([
        { m: 3, r: 2 },
        { m: 5, r: 3 },
        { m: 7, r: 2 },
      ]);
    }
    return buildEXCRTSteps([
      { m: 4, r: 2 },
      { m: 6, r: 4 },
      { m: 5, r: 1 },
    ]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderEXCRTBoard(step.equations, step.mergedCount, step.currM, step.currR, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">算法泛化能力</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">不要求模数互质 (真超集)</div>
          </div>
        </div>

        ${renderFormulaCard(
          'EXCRT 双方程合并方程',
          `合并方程: M &middot; t &equiv; r_k - R (mod m_k) | 可解判定: (r_k - R) mod gcd(M, m_k) == 0 | 模数更新: M' = lcm(M, m_k) = M / gcd * m_k`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
