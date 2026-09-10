/**
 * 分裂石子游戏 SG 函数复合 (Split Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：一分为二裂变博弈，单状态 SG(x) = mex{ SG(y) ^ SG(z) | y + z = x }
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { SPLIT_GAME_CODES, SPLIT_GAME_LINES } from './game-096-stage-codes';
import {
  Game096Step,
  renderMexCard,
  renderSgTable,
  renderPlayerBanner,
} from './game-096-shared';

export interface SplitGameStep extends Game096Step {
  n: number;
  splitDetails?: { y: number; z: number; xor: number }[];
}

export function buildSplitGameSteps(n: number): SplitGameStep[] {
  const steps: SplitGameStep[] = [];
  const lines = SPLIT_GAME_LINES;

  const sg = new Array(n + 1).fill(0);

  // Step 0: 入口
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: 0,
    decision: `主函数入口：准备推导石子分裂博弈 SG(0..${n})`,
    message: '一堆石子 x (x>=2) 可裂变为两堆 (y, z)，总 SG 值为 SG(y) ^ SG(z)，单状态值为所有分裂异或值的 mex',
    log: `enter getSplitSG(n=${n})`,
    codeLine: lines.entry,
    metrics: { '目标石子规模 n': `${n}`, 'SG(1)': '0 (无法再分裂)' },
  });

  // Step 1: 内存分配与边界
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: 0,
    decision: `初始化数组：int[] sg = new int[${n + 1}]，基底 SG(0)=0, SG(1)=0`,
    message: '只有 1 颗石子时无法继续分裂，属于终局必败态 SG(1)=0',
    log: 'allocate sg array',
    codeLine: lines.init,
    metrics: { 'SG(0)': '0', 'SG(1)': '0' },
  });

  // Step 2: 循环递推 2 ~ n
  for (let i = 2; i <= n; i++) {
    const appear = new Set<number>();
    const splitDetails: { y: number; z: number; xor: number }[] = [];

    // 外层循环
    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      decision: `考察状态 x=${i}：准备枚举所有将其分为两堆 (y, z) 的方案`,
      message: `y 的范围为 1 ~ ${Math.floor(i / 2)}，对应 z = ${i} - y`,
      log: `compute SG(${i})`,
      codeLine: lines.outerLoop,
      metrics: { '当前目标 x': `${i}` },
    });

    // 枚举分裂
    for (let y = 1; y <= Math.floor(i / 2); y++) {
      const z = i - y;
      const xorVal = sg[y] ^ sg[z];
      appear.add(xorVal);
      splitDetails.push({ y, z, xor: xorVal });
    }

    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      splitDetails: [...splitDetails],
      appearSet: Array.from(appear),
      decision: `分裂方案枚举：x=${i} ➔ ${splitDetails.map(d => `(${d.y}, ${d.z}) [XOR=${sg[d.y]}^${sg[d.z]}=${d.xor}]`).join(' | ')}`,
      message: `分裂异或值集合: {${Array.from(appear).join(', ')}}，准备取 mex`,
      log: `split combinations for ${i}: ${splitDetails.map(d => `${d.y}+${d.z}=>${d.xor}`).join(',')}`,
      codeLine: lines.innerSplit,
      metrics: { '有效分裂方案数': `${splitDetails.length}`, '异或值集合': `{${Array.from(appear).join(',')}}` },
    });

    // 计算 mex
    let mex = 0;
    while (appear.has(mex)) mex++;
    sg[i] = mex;

    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      splitDetails: [...splitDetails],
      appearSet: Array.from(appear),
      computedMex: mex,
      decision: `计算 mex 得到 SG(${i}) = mex{${Array.from(appear).join(', ')}} = ${mex}`,
      message: `写入表格 sg[${i}] = ${mex}`,
      log: `sg[${i}] = ${mex}`,
      codeLine: lines.computeMex,
      metrics: { [`SG(${i})`]: `${mex}` },
    });
  }

  // Step 3: 收敛返回
  const isFirstWin = sg[n] > 0;
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: n,
    isFirstWin,
    decision: `🎉 推导完成！整个分裂博弈 SG 表: [${sg.join(', ')}]。当前目标 SG(${n}) = ${sg[n]} ➔ ${isFirstWin ? '先手必胜 (SG>0)' : '先手必败 (SG=0)'}`,
    message: '算法成功收敛，揭示游戏裂变与子博弈异或复合规律',
    log: `done split SG, result=${isFirstWin}`,
    codeLine: lines.returnAns,
    metrics: { [`SG(${n})`]: `${sg[n]}`, '最终结论': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}

export const splitGameVisualizer = registerDeclarativeAlgorithm<SplitGameStep>({
  id: 'split-game-sg-096',
  name: '分裂石子游戏 SG (Split Game)',
  category: 'game',
  icon: '🪓',
  difficulty: 3,
  levelOrder: 966,
  learningGoal: '掌握游戏裂变为两个平行子游戏的 SG 函数异或合成与状态空间递归树解析',
  problemHtml: GAME_096_PROBLEMS.splitGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.splitGameSg.html,
  inputs: [
    {
      id: 'input-n',
      label: '石子数量 n',
      type: 'number',
      defaultValue: 10,
      min: 2,
      max: 20,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: SPLIT_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(2, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildSplitGameSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SplitGameStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusText = step.isFirstWin === undefined
      ? `推导状态 x=${step.curIdx}...`
      : step.isFirstWin
      ? `SG(${step.n}) = ${step.sgTable?.[step.n]} > 0 ➔ 先手必胜`
      : `SG(${step.n}) = 0 ➔ 先手必败`;
    const formulaText = `SG(${step.curIdx}) = mex({${(step.appearSet || []).join(', ')}}) = ${step.computedMex ?? step.sgTable?.[step.curIdx ?? 0] ?? 0}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. SG 函数表
    renderSgTable(root, step.sgTable || [], step.curIdx, '分裂博弈 SG 函数打表');

    // 3. 当前步分裂方案卡片
    if (step.splitDetails && step.splitDetails.length > 0) {
      const splitCard = document.createElement('div');
      splitCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

      const detailsHtml = step.splitDetails.map(d => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; background: #f8fafc; border: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">
          <span>${step.curIdx} ➔ 分裂为 (${d.y}, ${d.z})</span>
          <span style="color: #0284c7; font-weight: 700;">SG(${d.y}) ^ SG(${d.z}) = ${d.xor}</span>
        </div>
      `).join('');

      splitCard.innerHTML = `
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
          🌿 状态 x=${step.curIdx} 的所有二分裂分支:
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
          ${detailsHtml}
        </div>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #1e40af;">
          ${step.decision}
        </div>
      `;
      root.appendChild(splitCard);
    }

    stageContainer.appendChild(root);
  },
});
