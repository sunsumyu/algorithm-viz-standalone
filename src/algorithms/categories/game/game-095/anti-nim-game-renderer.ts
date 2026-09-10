/**
 * 反尼姆博弈 / SJ 定理 (Anti-Nim Game) - 声明式教学级沙盘渲染器
 * 核心原理：拿最后一颗石子者判负。所有堆<=1看堆数奇偶，存在>1堆看异或和是否非0
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { ANTI_NIM_CODES, ANTI_NIM_LINES } from './game-095-stage-codes';
import {
  Game095Step,
  renderBitwiseXorBoard,
  renderPlayerBanner,
  renderStonePiles,
} from './game-095-shared';

export interface AntiNimStep extends Game095Step {
  piles: number[];
  curPileIdx: number;
  xorSum: number;
  maxPile: number;
  isAllOneOrZero: boolean;
}

export function buildAntiNimSteps(initialPiles: number[]): AntiNimStep[] {
  const steps: AntiNimStep[] = [];
  const lines = ANTI_NIM_LINES;
  const piles = [...initialPiles];

  // Step 0: 入口
  steps.push({
    piles: [...piles],
    curPileIdx: -1,
    xorSum: 0,
    maxPile: 0,
    isAllOneOrZero: false,
    decision: `主函数入口：接收 ${piles.length} 堆石子 [${piles.join(', ')}]，规则为【拿最后一颗石子者输】`,
    message: '应用贾志鹏 SJ 定理进行两分支判定：纯单石子堆 vs 包含多石子堆',
    log: `enter antiNim(piles=[${piles.join(', ')}])`,
    codeLine: lines.entry,
    metrics: { '总堆数': `${piles.length}`, '规则': '取走最后石子者判负 (Misère)' },
  });

  // Step 1: 初始化变量
  let xorSum = 0;
  let maxPile = 0;
  steps.push({
    piles: [...piles],
    curPileIdx: -1,
    xorSum: 0,
    maxPile: 0,
    isAllOneOrZero: false,
    decision: '初始化追踪变量：xorSum = 0, maxPile = 0',
    message: '准备遍历所有堆统计最大单堆大小与全局异或和',
    log: 'init xorSum = 0, maxPile = 0',
    codeLine: lines.initVars,
    metrics: { '当前 xorSum': '0', '当前 maxPile': '0' },
  });

  // Step 2: 循环逐堆考察
  for (let i = 0; i < piles.length; i++) {
    const stones = piles[i];
    xorSum ^= stones;
    maxPile = Math.max(maxPile, stones);

    // 循环头
    steps.push({
      piles: [...piles],
      curPileIdx: i,
      xorSum,
      maxPile,
      isAllOneOrZero: maxPile <= 1,
      decision: `扫描第 ${i + 1} 堆：石子数 = ${stones}`,
      message: `异或和累加至 ${xorSum}，当前最大堆更新为 ${maxPile}`,
      log: `pile #${i + 1} stones=${stones}, xorSum=${xorSum}, maxPile=${maxPile}`,
      codeLine: lines.compute,
      metrics: { '当前处理堆': `第 ${i + 1} 堆`, '当前 maxPile': `${maxPile}`, '当前 xorSum': `${xorSum}` },
    });
  }

  // Step 3: 判定分类
  const isAllOneOrZero = maxPile <= 1;

  steps.push({
    piles: [...piles],
    curPileIdx: -1,
    xorSum,
    maxPile,
    isAllOneOrZero,
    decision: isAllOneOrZero
      ? `SJ 定理分支一：所有堆的石子数均 <= 1 (maxPile=${maxPile})，退化为单纯计数博弈！`
      : `SJ 定理分支二：存在至少一堆石子数 > 1 (maxPile=${maxPile})，等价于异或和非0判定！`,
    message: isAllOneOrZero
      ? `总堆数 k=${piles.length}。每人每轮只能拿1颗。堆数为偶数时先手拿偶数堆，后手被迫拿最后一颗输掉！`
      : `先手必胜当且仅当 xorSum != 0 (当前 xorSum=${xorSum})`,
    log: `check branch: isAllOneOrZero=${isAllOneOrZero}`,
    codeLine: lines.checkAllOne,
    metrics: { '分支类别': isAllOneOrZero ? '纯孤立堆模式 (<=1)' : '常规多石子模式 (>1)' },
  });

  let isFirstWin = false;
  if (isAllOneOrZero) {
    isFirstWin = piles.length % 2 === 0;
    steps.push({
      piles: [...piles],
      curPileIdx: -1,
      xorSum,
      maxPile,
      isAllOneOrZero,
      isFirstWin,
      decision: isFirstWin
        ? `🎉 判定结论：堆数 ${piles.length} 为偶数 ➔ 先手必胜！返回 true`
        : `💀 判定结论：堆数 ${piles.length} 为奇数 ➔ 先手必败！返回 false`,
      message: isFirstWin ? '后手将不得不拿走最后一个石子' : '先手将不得不拿走最后一个石子',
      log: `return piles.length % 2 == 0 => ${isFirstWin}`,
      codeLine: lines.returnSpecial,
      metrics: { '判定依据': `总堆数 ${piles.length} % 2 === 0`, '终局结论': isFirstWin ? '先手胜' : '先手负' },
    });
  } else {
    isFirstWin = xorSum !== 0;
    steps.push({
      piles: [...piles],
      curPileIdx: -1,
      xorSum,
      maxPile,
      isAllOneOrZero,
      isFirstWin,
      decision: isFirstWin
        ? `🎉 判定结论：存在 >1 堆且 xorSum=${xorSum} != 0 ➔ 先手必胜！返回 true`
        : `💀 判定结论：存在 >1 堆且 xorSum=0 ➔ 先手必败！返回 false`,
      message: isFirstWin
        ? '先手可始终将异或和维持为 0，且在只剩一个充裕堆时有权决定留奇数或偶数个 1 给对手！'
        : '后手掌握全局反制权',
      log: `return xorSum != 0 => ${isFirstWin}`,
      codeLine: lines.returnGeneral,
      metrics: { '判定依据': `xorSum (${xorSum}) !== 0`, '终局结论': isFirstWin ? '先手胜' : '先手负' },
    });
  }

  return steps;
}

export const antiNimGameVisualizer = registerDeclarativeAlgorithm<AntiNimStep>({
  id: 'anti-nim-game-095',
  name: '反尼姆博弈 (Anti-Nim / SJ 定理)',
  category: 'game',
  icon: '🪞',
  difficulty: 3,
  levelOrder: 954,
  learningGoal: '掌握 Misère 反博弈、SJ (Sprague-Grundy for Misère) 定理与充裕堆控制权',
  problemHtml: GAME_095_PROBLEMS.antiNimGame.html,
  analysisHtml: GAME_095_PROBLEMS.antiNimGame.html,
  inputs: [
    {
      id: 'input-piles',
      label: '各堆石子数 (逗号隔开)',
      type: 'text',
      defaultValue: '1, 1, 1, 1',
      placeholder: '例如 1, 1, 1, 1 或 3, 5, 7',
    },
  ],
  codeLanguages: ANTI_NIM_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-piles'] ?? '1, 1, 1, 1');
    const piles = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
    return buildAntiNimSteps(piles.length > 0 ? piles : [1, 1, 1, 1]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: AntiNimStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负 Banner
    const statusText = step.isFirstWin === undefined
      ? `正在扫描第 ${step.curPileIdx + 1} 堆...`
      : step.isFirstWin
      ? 'SJ 定理判定 ➔ 先手必胜'
      : 'SJ 定理判定 ➔ 先手必败';
    const formulaText = step.isAllOneOrZero
      ? `纯孤立堆: 堆数=${step.piles.length} (偶数胜/奇数败)`
      : `充裕堆模式: XOR=${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠图
    renderStonePiles(root, step.piles, step.curPileIdx);

    // 3. 二进制异或展开面板 (当存在 > 1 堆时显示)
    if (!step.isAllOneOrZero) {
      renderBitwiseXorBoard(root, step.piles, step.xorSum);
    }

    // 4. SJ 定理逻辑图解卡片
    const theoryCard = document.createElement('div');
    theoryCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    theoryCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        📜 贾志鹏 SJ 定理 (Anti-Nim 黄金准则):
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div style="padding: 8px 10px; border-radius: 6px; background: ${step.isAllOneOrZero ? '#eff6ff' : '#f8fafc'}; border: 1.5px solid ${step.isAllOneOrZero ? '#3b82f6' : '#e2e8f0'};">
          <div style="font-weight: 700; color: #1e40af;">情形一：所有堆石子数 <= 1</div>
          <div style="font-size: 11px; color: #64748b;">先手必胜 ⟺ 堆数为偶数 (k % 2 == 0)</div>
        </div>
        <div style="padding: 8px 10px; border-radius: 6px; background: ${!step.isAllOneOrZero ? '#eff6ff' : '#f8fafc'}; border: 1.5px solid ${!step.isAllOneOrZero ? '#3b82f6' : '#e2e8f0'};">
          <div style="font-weight: 700; color: #1e40af;">情形二：至少一堆石子数 > 1</div>
          <div style="font-size: 11px; color: #64748b;">先手必胜 ⟺ 异或和 X != 0</div>
        </div>
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(theoryCard);

    stageContainer.appendChild(root);
  },
});
