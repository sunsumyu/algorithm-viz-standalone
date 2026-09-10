/**
 * Class 146: 康托展开与逆康托展开 (Cantor Expansion)
 * 洛谷 P5367 【模板】康托展开 / 洛谷 P3014 [USACO11FEB] Cow Line G
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { CANTOR_EXPANSION_CODES, CANTOR_EXPANSION_LINES } from './advanced-142-148-stage-codes';
import { Advanced142Step, renderCantorBoard } from './advanced-142-148-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CantorStep extends Advanced142Step {
  perm: number[];
  n: number;
  curIndex: number;
  smallerCounts: number[];
  factorialWeights: number[];
  rank: number;
}

export function buildCantorSteps(perm: number[]): CantorStep[] {
  const steps: CantorStep[] = [];
  const lines = CANTOR_EXPANSION_LINES;
  const n = perm.length;

  // 预计算阶乘
  const fact = new Array(n + 1).fill(1);
  for (let i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;

  const smallerCounts = new Array(n).fill(0);
  const cloneSmall = () => [...smallerCounts];

  let rank = 1;

  // Step 0: 入口
  steps.push({
    perm: [...perm],
    n,
    curIndex: -1,
    smallerCounts: cloneSmall(),
    factorialWeights: [...fact],
    rank: 1,
    decision: `主函数入口：开始计算全排列 [${perm.join(', ')}] 的康托展开字典序排名`,
    message: `康托展开是一个全双射，将 1 ~ N 的全排列映射为 1 ~ N! 的字典序序号`,
    log: `enter cantor(perm=[${perm.join(', ')}], n=${n})`,
    codeLine: lines.entry,
    metrics: { '排列长度 N': n, '全排列总数 N!': fact[n], '初始排名': 1 },
  });

  for (let i = 0; i < n; i++) {
    // 统计右侧较小数字个数
    let smaller = 0;
    for (let j = i + 1; j < n; j++) {
      if (perm[j] < perm[i]) smaller++;
    }
    smallerCounts[i] = smaller;

    steps.push({
      perm: [...perm],
      n,
      curIndex: i,
      smallerCounts: cloneSmall(),
      factorialWeights: [...fact],
      rank,
      decision: `扫描位置 [${i}] 元素 ${perm[i]}：右侧未出现且比 ${perm[i]} 小的数字共有 ${smaller} 个`,
      message: `说明在第 ${i} 位上，若填入比 ${perm[i]} 小的数，可构成更小的字典序排列`,
      log: `countSmall: i=${i}, perm[i]=${perm[i]}, smaller=${smaller}`,
      codeLine: lines.countSmall,
      metrics: { '当前位置': i, '当前数字': perm[i], '右侧更小数个数': smaller },
    });

    const weight = fact[n - 1 - i];
    const addVal = smaller * weight;
    rank += addVal;

    steps.push({
      perm: [...perm],
      n,
      curIndex: i,
      smallerCounts: cloneSmall(),
      factorialWeights: [...fact],
      rank,
      decision: `累加位置 [${i}] 贡献：${smaller} &times; ${n - 1 - i}! (${weight}) = +${addVal}，当前排名累计为 ${rank}`,
      message: `后续 ${n - 1 - i} 个位置的全排列数共有 ${weight} 种可能`,
      log: `accumRank: i=${i}, weight=${weight}, add=${addVal}, newRank=${rank}`,
      codeLine: lines.accumRank,
      metrics: { '阶乘位权': `${n - 1 - i}! = ${weight}`, '本位贡献': addVal, '累计 Rank': rank },
    });
  }

  // Step: 终态返回
  steps.push({
    perm: [...perm],
    n,
    curIndex: -1,
    smallerCounts: cloneSmall(),
    factorialWeights: [...fact],
    rank,
    decision: `🎉 计算完成：排列 [${perm.join(', ')}] 的康托展开字典序排名为 ${rank}`,
    message: `康托展开建立在变进制数论基础之上，逆展开可用除法与模运算逐位还原排列`,
    log: `returnAns: rank=${rank}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `字典序第 ${rank} 位`, type: 'success' },
    metrics: { '最终字典序排名': rank, '全排列占比': `${((rank / fact[n]) * 100).toFixed(1)}%` },
  });

  return steps;
}

export const cantorExpansionVisualizer = registerDeclarativeAlgorithm<CantorStep>({
  id: 'cantor-expansion-146',
  name: '康托展开与逆康托展开 (Class 146)',
  category: 'math',
  icon: '🔢',
  difficulty: 2,
  levelOrder: 146,
  description: '左程云算法通关课 Class 146：康托展开与逆展开。将一个全排列双射映射为其在全体全排列中的字典序序号，基于阶乘变进制数展开。',
  learningGoal: '掌握康托展开与逆展开在变进制阶乘数系统中的双射映射与字典序排名算法',
  problemHtml: ADVANCED_142_148_PROBLEMS.cantorExpansion.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.cantorExpansion.html,
  inputs: [
    {
      id: 'preset',
      label: '输入全排列预设',
      type: 'select',
      defaultValue: 'perm_34152',
      options: [
        { label: '[3, 4, 1, 5, 2] (5元素典型用例)', value: 'perm_34152' },
        { label: '[2, 4, 1, 3] (4元素用例)', value: 'perm_2413' },
        { label: '[1, 2, 3, 4] (最小初始全排列)', value: 'perm_1234' },
      ],
    },
  ],
  codeLanguages: CANTOR_EXPANSION_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'perm_34152');
    if (preset === 'perm_2413') {
      return buildCantorSteps([2, 4, 1, 3]);
    }
    if (preset === 'perm_1234') {
      return buildCantorSteps([1, 2, 3, 4]);
    }
    return buildCantorSteps([3, 4, 1, 5, 2]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCantorBoard(
          step.perm,
          step.curIndex,
          step.smallerCounts,
          step.factorialWeights,
          step.rank
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">正在考察的位索引</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              ${step.curIndex >= 0 ? `位置 [${step.curIndex}] (值 ${step.perm[step.curIndex]})` : '展开就绪'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前累计字典序 Rank</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">第 ${step.rank} 名</div>
          </div>
        </div>

        ${renderFormulaCard(
          '康托展开数码映射引擎',
          `Rank = 1 + &sum;_{i=0}^{N-1} a[i] &times; (N - 1 - i)! | a[i] 为右侧比当前数小的数字个数`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
