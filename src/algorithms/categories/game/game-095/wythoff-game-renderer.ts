/**
 * 威佐夫博弈 (Wythoff Game) - 声明式教学级沙盘渲染器
 * 核心原理：黄金分割比 phi = (sqrt(5)+1)/2，两堆差值 k = b - a，奇异局势 ak = floor(k * phi)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { WYTHOFF_GAME_CODES, WYTHOFF_GAME_LINES } from './game-095-stage-codes';
import {
  Game095Step,
  renderPlayerBanner,
  renderStonePiles,
} from './game-095-shared';

export interface WythoffStep extends Game095Step {
  a: number;
  b: number;
  k: number;
  phi: number;
  ak: number;
  bk: number;
  isColdPosition: boolean;
  winningMove?: string;
}

export function buildWythoffSteps(origA: number, origB: number): WythoffStep[] {
  const steps: WythoffStep[] = [];
  const lines = WYTHOFF_GAME_LINES;

  let a = origA;
  let b = origB;
  const phi = (Math.sqrt(5) + 1) / 2;

  // Step 0: 入口
  steps.push({
    a,
    b,
    k: Math.abs(b - a),
    phi,
    ak: 0,
    bk: 0,
    isColdPosition: false,
    piles: [a, b],
    decision: `主函数入口：接收两堆石子 (${a}, ${b})`,
    message: '玩家可从一堆中拿任意颗，或从两堆中拿相同颗。最后拿光者胜。利用黄金分割比奇异局势判定',
    log: `enter wythoff(a=${a}, b=${b})`,
    codeLine: lines.entry,
    metrics: { '第一堆 a': `${a}`, '第二堆 b': `${b}` },
  });

  // Step 1: 归一化排序 a <= b
  if (a > b) {
    const t = a;
    a = b;
    b = t;
    steps.push({
      a,
      b,
      k: b - a,
      phi,
      ak: 0,
      bk: 0,
      isColdPosition: false,
      piles: [a, b],
      decision: `归一化两堆：保证 a <= b ➔ 调整为 (${a}, ${b})`,
      message: '方便按差值统一计算奇异局势编号 k',
      log: `swap a and b => (${a}, ${b})`,
      codeLine: lines.swapMin,
      metrics: { '规范化 a': `${a}`, '规范化 b': `${b}` },
    });
  }

  // Step 2: 计算差值 k
  const k = b - a;
  steps.push({
    a,
    b,
    k,
    phi,
    ak: 0,
    bk: 0,
    isColdPosition: false,
    piles: [a, b],
    decision: `计算两堆石子差值：k = b - a = ${b} - ${a} = ${k}`,
    message: `第 ${k} 个奇异局势 (先手必败态) 的基底差值必须为 ${k}`,
    log: `k = ${b} - ${a} = ${k}`,
    codeLine: lines.diffK,
    metrics: { '两堆差值 k': `${k}` },
  });

  // Step 3: 计算黄金分割对应理论值 ak
  const ak = Math.floor(k * phi);
  const bk = ak + k;
  const isColdPosition = a === ak;
  const isFirstWin = !isColdPosition;

  // 构造必胜决策说明
  let winningMove = '';
  if (isFirstWin) {
    if (a < ak) {
      // 通过从两堆中拿相同数量，或者从 b 中拿
      winningMove = `当前 a=${a} != ak=${ak}。先手可通过一步操作（如从两堆中同时取走相同石子，或从某堆取走多余石子）将局势转为已知奇异局势！`;
    } else {
      winningMove = `先手可从第二堆中拿走 ${b - bk} 颗石子，使其变为第 ${k} 奇异局势 (${ak}, ${bk})，必胜！`;
    }
  }

  steps.push({
    a,
    b,
    k,
    phi,
    ak,
    bk,
    isColdPosition,
    piles: [a, b],
    winningMove,
    decision: `计算第 ${k} 奇异局势：ak = floor(k * phi) = floor(${k} * 1.61803...) = ${ak}，对应理论局势 (${ak}, ${bk})`,
    message: `对比实际较小堆 a=${a} 与理论奇异堆 ak=${ak}`,
    log: `compute ak=floor(${k}*phi)=${ak}, bk=${bk}`,
    codeLine: lines.computeAk,
    metrics: { '理论 ak': `${ak}`, '理论 bk': `${bk}`, '实际 a': `${a}` },
  });

  // Step 4: 返回
  steps.push({
    a,
    b,
    k,
    phi,
    ak,
    bk,
    isColdPosition,
    isFirstWin,
    piles: [a, b],
    winningMove,
    decision: isColdPosition
      ? `💀 判定结论：(${a}, ${b}) 恰好是第 ${k} 个奇异局势！先手必败，返回 false`
      : `🎉 判定结论：(${a}, ${b}) 不是奇异局势 (a=${a} != ak=${ak})！先手必胜，返回 true`,
    message: isColdPosition
      ? '处于奇异局势时，无论先手怎么取，后手总能重新将其恢复为某个较小的奇异局势，直到取光'
      : winningMove,
    log: `return a != ak => ${isFirstWin}`,
    codeLine: lines.returnAns,
    metrics: { '是否奇异局势': isColdPosition ? '是 (必败)' : '否 (必胜)', '终局判定': isFirstWin ? '先手胜' : '先手负' },
  });

  return steps;
}

export const wythoffGameVisualizer = registerDeclarativeAlgorithm<WythoffStep>({
  id: 'wythoff-game-095',
  name: '威佐夫博弈 (Wythoff Game)',
  category: 'game',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 956,
  learningGoal: '领略黄金分割比 phi 在威佐夫博弈奇异局势生成中的精妙数学对应',
  problemHtml: GAME_095_PROBLEMS.wythoffGame.html,
  analysisHtml: GAME_095_PROBLEMS.wythoffGame.html,
  inputs: [
    {
      id: 'input-a',
      label: '第一堆石子 a',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 100,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-b',
      label: '第二堆石子 b',
      type: 'number',
      defaultValue: 5,
      min: 0,
      max: 100,
      step: 1,
      placeholder: '例如 5',
    },
  ],
  codeLanguages: WYTHOFF_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const a = Math.max(0, parseInt(String(inputs?.['input-a'] ?? '3'), 10) || 0);
    const b = Math.max(0, parseInt(String(inputs?.['input-b'] ?? '5'), 10) || 0);
    return buildWythoffSteps(a, b);
  },
  renderCanvas: (stageContainer: HTMLElement, step: WythoffStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负 Banner
    const statusText = step.isFirstWin === undefined
      ? `差值 k=${step.k}, 正在对比奇异局势...`
      : step.isFirstWin
      ? `(${step.a}, ${step.b}) 非奇异局势 ➔ 先手必胜`
      : `(${step.a}, ${step.b}) 为第 ${step.k} 奇异局势 ➔ 先手必败`;
    const formulaText = `ak = floor(${step.k} × 1.618) = ${step.ak} ${step.a === step.ak ? '==' : '!='} a=${step.a}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠图
    renderStonePiles(root, step.piles || [step.a, step.b], step.a === step.ak ? undefined : 0);

    // 3. 黄金分割奇异局势表看板
    const coldCard = document.createElement('div');
    coldCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

    // 预计算前 7 个奇异局势
    const phi = (Math.sqrt(5) + 1) / 2;
    const sampleCold = [0, 1, 2, 3, 4, 5, 6].map(idx => {
      const calcA = Math.floor(idx * phi);
      const calcB = calcA + idx;
      const isMatch = step.a === calcA && step.b === calcB;
      return `
        <span style="padding: 3px 8px; border-radius: 6px; background: ${isMatch ? '#fee2e2' : '#f8fafc'}; border: 1.5px solid ${isMatch ? '#ef4444' : '#e2e8f0'}; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: ${isMatch ? '#b91c1c' : '#475569'};">
          k=${idx}: (${calcA}, ${calcB})
        </span>
      `;
    }).join('');

    coldCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
        <span>✨ 威佐夫奇异局势序列 (Cold Positions):</span>
        <span style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace;">φ ≈ 1.6180339887...</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0;">
        ${sampleCold}
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(coldCard);

    stageContainer.appendChild(root);
  },
});
