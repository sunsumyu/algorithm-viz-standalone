/**
 * 双堆巴什博弈与 SG 矩阵 (Two Stones Bash Game) - 声明式教学级沙盘渲染器
 * 核心原理：独立游戏 SG 定理，SG(n1, n2) = SG(n1) ^ SG(n2) = (n1 % (m+1)) ^ (n2 % (m+1))
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { TWO_STONES_BASH_CODES, TWO_STONES_BASH_LINES } from './game-096-stage-codes';
import { Game096Step, renderPlayerBanner } from './game-096-shared';

export interface TwoStonesBashStep extends Game096Step {
  n1: number;
  n2: number;
  m: number;
  sg1: number;
  sg2: number;
  xorSum: number;
}

export function buildTwoStonesBashSteps(n1: number, n2: number, m: number): TwoStonesBashStep[] {
  const steps: TwoStonesBashStep[] = [];
  const lines = TWO_STONES_BASH_LINES;

  // Step 0: 入口
  steps.push({
    n1,
    n2,
    m,
    sg1: 0,
    sg2: 0,
    xorSum: 0,
    decision: `主函数入口：接收双堆参数 (n1=${n1}, n2=${n2})，单次拿取上限 m=${m}`,
    message: '两堆石子各自为独立巴什博弈，总局势 SG 值为两堆各自 SG 值的异或',
    log: `enter twoStonesBash(n1=${n1}, n2=${n2}, m=${m})`,
    codeLine: lines.entry,
    metrics: { '第一堆 n1': `${n1}`, '第二堆 n2': `${n2}`, '单次上限 m': `${m}` },
  });

  // Step 1: 计算第一堆 SG
  const sg1 = n1 % (m + 1);
  steps.push({
    n1,
    n2,
    m,
    sg1,
    sg2: 0,
    xorSum: 0,
    decision: `计算第一堆的 SG 值：sg1 = n1 % (m + 1) = ${n1} % (${m} + 1) = ${sg1}`,
    message: `第一堆的单堆博弈能力等价于 SG 值 ${sg1}`,
    log: `sg1 = ${n1} % ${m + 1} = ${sg1}`,
    codeLine: lines.computeSg1,
    metrics: { 'sg1': `${sg1}` },
  });

  // Step 2: 计算第二堆 SG
  const sg2 = n2 % (m + 1);
  steps.push({
    n1,
    n2,
    m,
    sg1,
    sg2,
    xorSum: 0,
    decision: `计算第二堆的 SG 值：sg2 = n2 % (m + 1) = ${n2} % (${m} + 1) = ${sg2}`,
    message: `第二堆的单堆博弈能力等价于 SG 值 ${sg2}`,
    log: `sg2 = ${n2} % ${m + 1} = ${sg2}`,
    codeLine: lines.computeSg2,
    metrics: { 'sg1': `${sg1}`, 'sg2': `${sg2}` },
  });

  // Step 3: SG 异或合成与胜负返回
  const xorSum = sg1 ^ sg2;
  const isFirstWin = xorSum !== 0;

  steps.push({
    n1,
    n2,
    m,
    sg1,
    sg2,
    xorSum,
    isFirstWin,
    decision: isFirstWin
      ? `🎉 复合判定：SG(总) = sg1 ^ sg2 = ${sg1} ^ ${sg2} = ${xorSum} != 0 ➔ 先手必胜！返回 true`
      : `💀 复合判定：SG(总) = sg1 ^ sg2 = ${sg1} ^ ${sg2} = 0 ➔ 局势完全对称平衡，先手必败！返回 false`,
    message: isFirstWin
      ? `两堆石子模 ${m + 1} 余数不同 (sg1=${sg1}, sg2=${sg2})，先手总能把余数较大的一堆调整为与另一堆相等，使总异或和变为 0 甩给对手！`
      : `两堆石子模 ${m + 1} 余数相等 (均为 ${sg1})，对手可以完全模仿先手在另一堆的操作，先手必败！`,
    log: `return (${sg1} ^ ${sg2}) != 0 => ${isFirstWin}`,
    codeLine: lines.returnAns,
    metrics: { '全局 SG 异或和': `${xorSum}`, '终局判定': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}

export const twoStonesBashVisualizer = registerDeclarativeAlgorithm<TwoStonesBashStep>({
  id: 'two-stones-bash-096',
  name: '双堆巴什博弈 SG 矩阵 (Two Stones Bash)',
  category: 'game',
  icon: '🧱',
  difficulty: 3,
  levelOrder: 963,
  learningGoal: '通过二维 SG 状态转移矩阵理解两个独立博弈子系统的异或合成与对称平衡',
  problemHtml: GAME_096_PROBLEMS.twoStonesBashSg.html,
  analysisHtml: GAME_096_PROBLEMS.twoStonesBashSg.html,
  inputs: [
    {
      id: 'input-n1',
      label: '第一堆石子 n1',
      type: 'number',
      defaultValue: 7,
      min: 0,
      max: 20,
      step: 1,
      placeholder: '例如 7',
    },
    {
      id: 'input-n2',
      label: '第二堆石子 n2',
      type: 'number',
      defaultValue: 5,
      min: 0,
      max: 20,
      step: 1,
      placeholder: '例如 5',
    },
    {
      id: 'input-m',
      label: '单次上限 m',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 6,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: TWO_STONES_BASH_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n1 = Math.max(0, parseInt(String(inputs?.['input-n1'] ?? '7'), 10) || 7);
    const n2 = Math.max(0, parseInt(String(inputs?.['input-n2'] ?? '5'), 10) || 5);
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildTwoStonesBashSteps(n1, n2, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: TwoStonesBashStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 胜负判定 Banner
    const statusText = step.isFirstWin === undefined
      ? '推演中...'
      : step.isFirstWin
      ? `SG(总) = ${step.xorSum} != 0 ➔ 先手必胜`
      : 'SG(总) = 0 ➔ 局势对称 (先手必败)';
    const formulaText = `SG = (${step.n1} % ${step.m + 1}) ^ (${step.n2} % ${step.m + 1}) = ${step.sg1} ^ ${step.sg2} = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 二维 SG 矩阵热力图展示 (以当前 n1, n2 为中心局部渲染 0..min(12, n1+2) x 0..min(12, n2+2))
    const matrixCard = document.createElement('div');
    matrixCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: auto;';

    const maxR = Math.min(10, Math.max(step.n1, step.n2, 6));
    let rowsHtml = '';

    // 矩阵头
    let headerCells = '<th style="padding: 4px 6px; font-size: 10px; color: #64748b; font-family: monospace;">n1\\n2</th>';
    for (let c = 0; c <= maxR; c++) {
      headerCells += `<th style="padding: 4px 6px; font-size: 10px; color: ${c === step.n2 ? '#2563eb' : '#64748b'}; font-family: monospace; font-weight: 700;">${c}</th>`;
    }
    rowsHtml += `<tr>${headerCells}</tr>`;

    for (let r = 0; r <= maxR; r++) {
      let cells = `<td style="padding: 4px 6px; font-size: 10px; color: ${r === step.n1 ? '#2563eb' : '#64748b'}; font-family: monospace; font-weight: 700;">${r}</td>`;
      for (let c = 0; c <= maxR; c++) {
        const val = (r % (step.m + 1)) ^ (c % (step.m + 1));
        const isTarget = r === step.n1 && c === step.n2;
        const isZero = val === 0;

        let bg = isZero ? '#fef2f2' : '#f0fdf4';
        let border = isZero ? '#fca5a5' : '#bbf7d0';
        let color = isZero ? '#b91c1c' : '#15803d';

        if (isTarget) {
          bg = '#3b82f6';
          border = '#1d4ed8';
          color = '#ffffff';
        }

        cells += `
          <td style="padding: 3px 6px; text-align: center; background: ${bg}; border: 1px solid ${border}; font-family: monospace; font-size: 11px; font-weight: 700; color: ${color};">
            ${val}
          </td>
        `;
      }
      rowsHtml += `<tr>${cells}</tr>`;
    }

    matrixCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; font-size: 12px; display: flex; justify-content: space-between;">
        <span>🌐 双堆 SG 二维状态热力矩阵 [SG(r, c) = (r % ${step.m + 1}) ^ (c % ${step.m + 1})]</span>
        <span style="font-size: 11px; color: #64748b;">红色=0 (必败) | 绿色>0 (必胜) | 蓝色=当前坐标</span>
      </div>
      <table style="border-collapse: collapse; margin: 0 auto;">${rowsHtml}</table>
      <div style="margin-top: 8px; font-size: 12px; color: #475569; background: #f8fafc; padding: 6px 12px; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(matrixCard);

    stageContainer.appendChild(root);
  },
});
