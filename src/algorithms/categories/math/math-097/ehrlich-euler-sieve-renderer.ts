/**
 * 埃氏筛与欧拉线性筛 (Eratosthenes vs Euler Sieve) - 声明式教学级沙盘渲染器
 * 核心原理：保证每个合数仅被其最小质因子标记一次，达到严格 O(n) 线性时间复杂度
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { EHRLICH_EULER_CODES, EHRLICH_EULER_LINES } from './math-097-stage-codes';
import { Math097Step, renderSieveGrid } from './math-097-shared';

export interface EulerSieveStep extends Math097Step {
  n: number;
}

export function buildEulerSieveSteps(n: number): EulerSieveStep[] {
  const steps: EulerSieveStep[] = [];
  const lines = EHRLICH_EULER_LINES;

  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;
  const primes: number[] = [];

  const sieveGrid: { val: number; isPrime: boolean; markedBy?: number }[] = [];
  for (let val = 2; val <= n; val++) {
    sieveGrid.push({ val, isPrime: true, markedBy: undefined });
  }

  // Step 0: 入口
  steps.push({
    n,
    curTesting: 2,
    primesFound: [],
    sieveGrid: sieveGrid.map(g => ({ ...g })),
    decision: `主函数入口：准备在 2 ~ ${n} 范围内运行欧拉线性筛`,
    message: '欧拉筛核心创新：通过 i % p == 0 剪枝，确保每个合数仅被其最小质因子标记一次',
    log: `enter eulerSieve(n=${n})`,
    codeLine: lines.entry,
    metrics: { '规模 n': `${n}`, '已发现质数': '0 个' },
  });

  // Step 1: 初始化数组
  steps.push({
    n,
    curTesting: 2,
    primesFound: [],
    sieveGrid: sieveGrid.map(g => ({ ...g })),
    decision: `初始化标记数组：boolean[] isPrime = new boolean[${n + 1}] (初始全为 true)`,
    message: '创建质数清单列表 List<Integer> primes',
    log: 'allocate isPrime and primes',
    codeLine: lines.initArray,
    metrics: { '初始状态': '2..n 全为质数候选' },
  });

  // Step 2: 循环递推
  for (let i = 2; i <= n; i++) {
    const isCurP = isPrime[i];

    steps.push({
      n,
      curTesting: i,
      primesFound: [...primes],
      sieveGrid: sieveGrid.map(g => ({ ...g })),
      decision: `外层扫描 i=${i}：当前 isPrime[${i}] = ${isCurP}`,
      message: isCurP ? `${i} 未被任何更小质因子标记，确认为新质数！` : `${i} 已被更小质因子筛除，为合数`,
      log: `scan i=${i}, isPrime=${isCurP}`,
      codeLine: lines.outerLoop,
      metrics: { '当前数值 i': `${i}`, '属性': isCurP ? '质数' : '合数' },
    });

    if (isCurP) {
      primes.push(i);
      steps.push({
        n,
        curTesting: i,
        primesFound: [...primes],
        sieveGrid: sieveGrid.map(g => ({ ...g })),
        decision: `收录质数：primes.add(${i})，当前质数表: [${primes.join(', ')}]`,
        message: '准备使用已有质数表对合数进行单调标记',
        log: `add prime ${i}`,
        codeLine: lines.foundPrime,
        metrics: { '最新收录质数': `${i}`, '质数总数': `${primes.length}` },
      });
    }

    for (const p of primes) {
      if (i * p > n) break;

      isPrime[i * p] = false;
      const targetGrid = sieveGrid.find(g => g.val === i * p);
      if (targetGrid) {
        targetGrid.isPrime = false;
        targetGrid.markedBy = p;
      }

      steps.push({
        n,
        curTesting: i * p,
        primesFound: [...primes],
        sieveGrid: sieveGrid.map(g => ({ ...g })),
        decision: `线性筛除：标记合数 ${i * p} = ${i} × ${p} 为非素数 (其最小质因子为 ${p})`,
        message: `保证 ${i * p} 绝不会被其他更大质因子重复筛除`,
        log: `mark composite ${i * p} by prime ${p}`,
        codeLine: lines.markComposite,
        metrics: { '被筛合数': `${i * p}`, '最小质因子': `${p}` },
      });

      if (i % p === 0) {
        steps.push({
          n,
          curTesting: i,
          primesFound: [...primes],
          sieveGrid: sieveGrid.map(g => ({ ...g })),
          decision: `🛑 欧拉关键剪枝：i=${i} % p=${p} == 0 ➔ 立即 break 终止质数内层循环！`,
          message: `因为 ${p} 已经是 ${i} 的质因子，若继续用更大的质数 pPrime 筛 i * pPrime，其最小质因子必定是 ${p} 而非 pPrime！剪枝彻底杜绝了重复标记！`,
          log: `euler break at i=${i}, p=${p}`,
          codeLine: lines.eulerBreak,
          metrics: { '剪枝触发': `${i} % ${p} == 0` },
        });
        break;
      }
    }
  }

  // Step 3: 收敛返回
  steps.push({
    n,
    primesFound: [...primes],
    sieveGrid: sieveGrid.map(g => ({ ...g })),
    decision: `🎉 欧拉筛运行完成！在 2 ~ ${n} 范围内共找到 ${primes.length} 个质数: [${primes.join(', ')}]，所有合数实现 0 重复筛除！`,
    message: '严格线性 O(n) 时间复杂度',
    log: `euler sieve done, total primes=${primes.length}`,
    codeLine: lines.returnPrimes,
    metrics: { '质数总数': `${primes.length}`, '素数密度': `${((primes.length / n) * 100).toFixed(1)}%` },
  });

  return steps;
}

export const ehrlichEulerSieveVisualizer = registerDeclarativeAlgorithm<EulerSieveStep>({
  id: 'ehrlich-euler-sieve-097',
  name: '欧拉线性筛法 (Euler Sieve)',
  category: 'math',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 974,
  learningGoal: '领悟欧拉筛 i % p == 0 最小质因子不重不漏筛除的核心数学设计',
  problemHtml: MATH_097_PROBLEMS.ehrlichEulerSieve.html,
  analysisHtml: MATH_097_PROBLEMS.ehrlichEulerSieve.html,
  inputs: [
    {
      id: 'input-n',
      label: '筛除范围上限 n',
      type: 'number',
      defaultValue: 30,
      min: 5,
      max: 100,
      step: 1,
      placeholder: '例如 30',
    },
  ],
  codeLanguages: EHRLICH_EULER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(5, parseInt(String(inputs?.['input-n'] ?? '30'), 10) || 30);
    return buildEulerSieveSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: EulerSieveStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 百数网格展示
    renderSieveGrid(root, step.sieveGrid || [], step.curTesting, `欧拉筛数表网格 (2 ~ ${step.n})`);

    // 2. 已收录质数序列卡片
    const primesCard = document.createElement('div');
    primesCard.style.cssText = 'padding: 10px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

    const primesHtml = (step.primesFound && step.primesFound.length > 0)
      ? step.primesFound.map(p => `
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; border: 1px solid #10b981; font-family: monospace; font-size: 12px; font-weight: 700; color: #047857;">
            ${p}
          </span>
        `).join(' ')
      : '<span style="color: #94a3b8;">暂无质数</span>';

    primesCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; justify-content: space-between;">
        <span>📜 已收集质数队列 (共 ${(step.primesFound || []).length} 个):</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">${primesHtml}</div>
      <div style="padding: 6px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px;">
        ${step.decision}
      </div>
    `;
    root.appendChild(primesCard);

    stageContainer.appendChild(root);
  },
});
