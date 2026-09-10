/**
 * Class 165: 莫比乌斯反演 (Möbius Inversion)
 * sum_{d} mu(d) * floor(n/d) * floor(m/d) / 洛谷 P3455 [POI2007] ZAP-Queries
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { MOBIUS_INVERSION_CODES, MOBIUS_INVERSION_LINES } from './advanced-161-166-stage-codes';
import { Advanced161Step, MobiusBlockView, renderMobiusBoard } from './advanced-161-166-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MobiusStep extends Advanced161Step {
  n: number;
  m: number;
  blocks: MobiusBlockView[];
  currentSum: number;
  stage: string;
}

// 预处理线性筛 mu 数组与前缀和
const MAX_N = 1000;
const isPrime = new Uint8Array(MAX_N + 1).fill(1);
const primes: number[] = [];
const mu = new Int32Array(MAX_N + 1);
const sumMu = new Int32Array(MAX_N + 1);

isPrime[0] = isPrime[1] = 0;
mu[1] = 1;
for (let i = 2; i <= MAX_N; i++) {
  if (isPrime[i]) {
    primes.push(i);
    mu[i] = -1;
  }
  for (let j = 0; j < primes.length && i * primes[j] <= MAX_N; j++) {
    isPrime[i * primes[j]] = 0;
    if (i % primes[j] === 0) {
      mu[i * primes[j]] = 0;
      break;
    } else {
      mu[i * primes[j]] = -mu[i];
    }
  }
}
for (let i = 1; i <= MAX_N; i++) {
  sumMu[i] = sumMu[i - 1] + mu[i];
}

export function buildMobiusSteps(n: number, m: number): MobiusStep[] {
  const steps: MobiusStep[] = [];
  const lines = MOBIUS_INVERSION_LINES;
  const limit = Math.min(n, m);

  // Step 0: 入口帧
  steps.push({
    n,
    m,
    blocks: [],
    currentSum: 0,
    stage: '主函数入口',
    decision: `主函数入口：统计 1<=i<=${n}, 1<=j<=${m} 范围内互质数对 gcd(i, j) == 1 的总数`,
    message: `反演展开为 sum_{d=1}^${limit} mu(d) * floor(${n}/d) * floor(${m}/d)，利用数论分块在 O(sqrt(N)+sqrt(M)) 内求和`,
    log: `enter countCoprimePairs: N=${n}, M=${m}, limit=${limit}`,
    codeLine: lines.entry,
    metrics: { '区间 N': n, '区间 M': m, '枚举上限 min(N,M)': limit, '核心反演性质': 'sum_{d|n} mu(d) = [n=1]' },
  });

  const blocks: MobiusBlockView[] = [];
  let totalAns = 0;

  for (let l = 1, r = 0; l <= limit; l = r + 1) {
    const nd = Math.floor(n / l);
    const md = Math.floor(m / l);
    r = Math.min(Math.floor(n / nd), Math.floor(m / md));

    const deltaMu = sumMu[r] - sumMu[l - 1];
    const termAns = deltaMu * nd * md;
    totalAns += termAns;

    blocks.push({
      l,
      r,
      nDiv: nd,
      mDiv: md,
      deltaMu,
      termAns,
    });

    steps.push({
      n,
      m,
      blocks: [...blocks],
      currentSum: totalAns,
      stage: `数论分块 [${l}, ${r}]`,
      decision: `整除分块 [${l}, ${r}]：在此区间内 floor(N/d)=${nd}, floor(M/d)=${md} 保持恒定`,
      message: `区间 mu 增量 = sumMu[${r}] - sumMu[${l - 1}] = ${deltaMu}，本段贡献 = ${deltaMu} * ${nd} * ${md} = ${termAns}`,
      log: `calcBlock: [${l}, ${r}], deltaMu=${deltaMu}, termAns=${termAns}, total=${totalAns}`,
      codeLine: lines.calcBlock,
      statusBadge: { text: `分块 [${l}, ${r}]`, type: deltaMu === 0 ? 'info' : (deltaMu > 0 ? 'success' : 'warning') },
      metrics: { '当前分块': `[${l}, ${r}]`, '商积 (N/l)*(M/l)': nd * md, '区间 mu 增量': deltaMu, '当前互质数对': totalAns },
    });
  }

  // Step 2: 终态返回
  steps.push({
    n,
    m,
    blocks: [...blocks],
    currentSum: totalAns,
    stage: '互质数对统计完成',
    decision: `🎉 莫比乌斯反演计算全部完成：1<=i<=${n}, 1<=j<=${m} 互质数对总计 ${totalAns} 对`,
    message: `数论分块将原本 O(N*M) 的暴力枚举压缩至 O(sqrt(N) + sqrt(M))，单次多组询问极速响应`,
    log: `returnAns: total=${totalAns}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `总互质数对: ${totalAns}`, type: 'success' },
    metrics: { '最终互质数对': totalAns, '总分块数': blocks.length, '单次复杂度': 'O(sqrt(N) + sqrt(M))' },
  });

  return steps;
}

export const mobiusInversionVisualizer = registerDeclarativeAlgorithm<MobiusStep>({
  id: 'mobius-inversion-165',
  name: '莫比乌斯反演 (Class 165)',
  category: 'math',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 165,
  description: '左程云算法通关课 Class 165：莫比乌斯反演。利用因数容斥性质 sum_{d|n} mu(d) = [n=1]，配合二维数论分块，O(sqrt(N)+sqrt(M)) 极速统计区间互质数对。',
  learningGoal: '掌握莫比乌斯函数因数容斥本质，理解整除分块在二维双曲区域内的公共跳跃区间划分技巧',
  problemHtml: ADVANCED_161_166_PROBLEMS.mobiusInversion.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.mobiusInversion.html,
  inputs: [
    {
      id: 'preset',
      label: '矩形区域 N 与 M 规模',
      type: 'select',
      defaultValue: 'rect_6x8',
      options: [
        { label: 'N = 6, M = 8 (标准互质 32 对测试)', value: 'rect_6x8' },
        { label: 'N = 10, M = 10 (方阵互质 63 对测试)', value: 'rect_10x10' },
        { label: 'N = 5, M = 5 (小规模方阵互质 19 对)', value: 'rect_5x5' },
      ],
    },
  ],
  codeLanguages: MOBIUS_INVERSION_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'rect_6x8');
    if (preset === 'rect_10x10') return buildMobiusSteps(10, 10);
    if (preset === 'rect_5x5') return buildMobiusSteps(5, 5);
    return buildMobiusSteps(6, 8);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderMobiusBoard(step.n, step.m, step.blocks, step.currentSum, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #0369a1;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">算法加速幅度</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">O(N&middot;M) -&gt; O(&radic;N + &radic;M)</div>
          </div>
        </div>

        ${renderFormulaCard(
          '莫比乌斯反演互质双曲求和引擎',
          `核心性质: &sum;_{d|n} &mu;(d) = [n=1] | 双元整除分块: r = min(&lfloor;n/&lfloor;n/l&rfloor;&rfloor;, &lfloor;m/&lfloor;m/l&rfloor;&rfloor;) | 单次询问复杂度: O(&radic;N + &radic;M)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
