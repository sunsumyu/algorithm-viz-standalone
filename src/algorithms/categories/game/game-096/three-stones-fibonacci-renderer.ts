/**
 * 三堆石子取斐波那契数 SG 博弈 (Three Stones Pick Fibonacci) - 声明式教学级沙盘渲染器
 * 核心原理：单堆转移集合由斐波那契数限定，三堆局势通过 SG 异或合成
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { THREE_STONES_FIB_CODES, THREE_STONES_FIB_LINES } from './game-096-stage-codes';
import {
  Game096Step,
  renderPlayerBanner,
  renderSgTable,
} from './game-096-shared';

export interface ThreeStonesFibStep extends Game096Step {
  n1: number;
  n2: number;
  n3: number;
  maxN: number;
  fibs: number[];
  sg1: number;
  sg2: number;
  sg3: number;
}

export function buildThreeStonesFibSteps(
  n1: number,
  n2: number,
  n3: number
): ThreeStonesFibStep[] {
  const steps: ThreeStonesFibStep[] = [];
  const lines = THREE_STONES_FIB_LINES;

  const maxN = Math.max(n1, n2, n3);

  // 1. 生成斐波那契数转移集合
  const fibs = [1, 2];
  while (true) {
    const nextF = fibs[fibs.length - 1] + fibs[fibs.length - 2];
    if (nextF > Math.max(maxN, 2)) break;
    fibs.push(nextF);
  }

  // Step 0: 入口
  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sg1: 0,
    sg2: 0,
    sg3: 0,
    xorSum: 0,
    decision: `主函数入口：接收三堆石子 (${n1}, ${n2}, ${n3})，每步只能取斐波那契数颗`,
    message: `合法单次取法集合 F = [${fibs.join(', ')}]，准备按 mex 算子递推单堆 SG 函数`,
    log: `enter threeStonesFib(n1=${n1}, n2=${n2}, n3=${n3})`,
    codeLine: lines.entry,
    metrics: { '三堆规模': `(${n1}, ${n2}, ${n3})`, '最大堆 maxN': `${maxN}` },
  });

  // Step 1: 确定最大堆规模 maxN
  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sg1: 0,
    sg2: 0,
    sg3: 0,
    xorSum: 0,
    decision: `确定最大打表上限：maxN = max(${n1}, ${n2}, ${n3}) = ${maxN}`,
    message: `仅需自底向上计算单堆 SG(0..${maxN})，即可查表得到三堆各自的 SG 值`,
    log: `maxN = ${maxN}`,
    codeLine: lines.findMaxN,
    metrics: { '打表长度': `${maxN + 1}` },
  });

  // Step 2: 递推单堆 SG 函数
  const sg = new Array(maxN + 1).fill(0);
  for (let i = 1; i <= maxN; i++) {
    const appear = new Set<number>();
    for (const f of fibs) {
      if (f <= i) {
        appear.add(sg[i - f]);
      }
    }
    let mex = 0;
    while (appear.has(mex)) mex++;
    sg[i] = mex;
  }

  const sg1 = sg[n1];
  const sg2 = sg[n2];
  const sg3 = sg[n3];

  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sgTable: [...sg],
    sg1,
    sg2,
    sg3,
    xorSum: 0,
    decision: `完成单堆 SG 函数构建：SG(0..${maxN}) = [${sg.join(', ')}]`,
    message: `查表得到各堆 SG 值：SG(${n1})=${sg1}, SG(${n2})=${sg2}, SG(${n3})=${sg3}`,
    log: `sg1=${sg1}, sg2=${sg2}, sg3=${sg3}`,
    codeLine: lines.buildSg,
    metrics: { [`SG(${n1})`]: `${sg1}`, [`SG(${n2})`]: `${sg2}`, [`SG(${n3})`]: `${sg3}` },
  });

  // Step 3: 异或和计算
  const xorSum = sg1 ^ sg2 ^ sg3;
  const isFirstWin = xorSum !== 0;

  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sgTable: [...sg],
    sg1,
    sg2,
    sg3,
    xorSum,
    isFirstWin,
    decision: `计算三堆总 SG 异或和：xorSum = SG(${n1}) ^ SG(${n2}) ^ SG(${n3}) = ${sg1} ^ ${sg2} ^ ${sg3} = ${xorSum}`,
    message: isFirstWin ? `异或和 ${xorSum} != 0，复合游戏处于非平衡态` : '异或和为 0，复合游戏处于对称平衡态',
    log: `xorSum = ${xorSum}`,
    codeLine: lines.computeXor,
    metrics: { '总异或和': `${xorSum}`, '状态属性': isFirstWin ? 'N-position (必胜)' : 'P-position (必败)' },
  });

  // Step 4: 终局返回
  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sgTable: [...sg],
    sg1,
    sg2,
    sg3,
    xorSum,
    isFirstWin,
    decision: isFirstWin
      ? `🎉 最终结论：xorSum=${xorSum} != 0 ➔ 先手必胜！返回 true`
      : '💀 最终结论：xorSum=0 ➔ 先手必败！返回 false',
    message: isFirstWin
      ? '先手必能找到某一堆，拿走某个斐波那契数的石子，将全局异或和削至 0 留给后手！'
      : '后手掌握全局必胜反制策略',
    log: `return xorSum != 0 => ${isFirstWin}`,
    codeLine: lines.returnAns,
    metrics: { '终局判定': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}

export const threeStonesFibonacciVisualizer = registerDeclarativeAlgorithm<ThreeStonesFibStep>({
  id: 'three-stones-fibonacci-096',
  name: '三堆取斐波那契数 SG (Three Stones Fib)',
  category: 'game',
  icon: '🪨',
  difficulty: 3,
  levelOrder: 964,
  learningGoal: '掌握非传统转移步长（斐波那契数）下的单堆 SG 打表与多堆异或合成',
  problemHtml: GAME_096_PROBLEMS.threeStonesFibonacciSg.html,
  analysisHtml: GAME_096_PROBLEMS.threeStonesFibonacciSg.html,
  inputs: [
    {
      id: 'input-n1',
      label: '第一堆 n1',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 5',
    },
    {
      id: 'input-n2',
      label: '第二堆 n2',
      type: 'number',
      defaultValue: 7,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 7',
    },
    {
      id: 'input-n3',
      label: '第三堆 n3',
      type: 'number',
      defaultValue: 9,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 9',
    },
  ],
  codeLanguages: THREE_STONES_FIB_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n1 = Math.max(1, parseInt(String(inputs?.['input-n1'] ?? '5'), 10) || 5);
    const n2 = Math.max(1, parseInt(String(inputs?.['input-n2'] ?? '7'), 10) || 7);
    const n3 = Math.max(1, parseInt(String(inputs?.['input-n3'] ?? '9'), 10) || 9);
    return buildThreeStonesFibSteps(n1, n2, n3);
  },
  renderCanvas: (stageContainer: HTMLElement, step: ThreeStonesFibStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负判定 Banner
    const statusText = step.isFirstWin === undefined
      ? '推演计算中...'
      : step.isFirstWin
      ? `总异或和 X=${step.xorSum} != 0 ➔ 先手必胜`
      : '总异或和 X=0 ➔ 先手必败';
    const formulaText = `SG = ${step.sg1} ^ ${step.sg2} ^ ${step.sg3} = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 单堆 SG 表展示
    renderSgTable(root, step.sgTable || [], undefined, '单堆斐波那契 SG 递推函数表');

    // 3. 三堆异或状态分解卡片
    const pilesCard = document.createElement('div');
    pilesCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

    const piles = [
      { name: '第一堆', val: step.n1, sg: step.sg1 },
      { name: '第二堆', val: step.n2, sg: step.sg2 },
      { name: '第三堆', val: step.n3, sg: step.sg3 },
    ];

    const cardsHtml = piles.map((p, idx) => `
      <div style="flex: 1; padding: 10px; border-radius: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; text-align: center;">
        <div style="font-size: 11px; color: #64748b; font-weight: 700;">${p.name}</div>
        <div style="font-size: 16px; font-weight: 800; color: #1e293b; font-family: monospace; margin: 4px 0;">${p.val} 颗</div>
        <div style="font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; border: 1px solid #38bdf860;">
          SG(${p.val}) = ${p.sg}
        </div>
      </div>
    `).join('');

    pilesCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">
        📦 各堆 SG 状态与异或合成:
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        ${cardsHtml}
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(pilesCard);

    stageContainer.appendChild(root);
  },
});
