/**
 * 巴什博弈 (Bash Game) - 声明式教学级沙盘渲染器
 * 核心原理：n % (m + 1) != 0 则先手必胜
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { BASH_GAME_CODES, BASH_GAME_LINES } from './game-095-stage-codes';
import {
  Game095Step,
  renderPlayerBanner,
  renderStonePiles,
} from './game-095-shared';

export interface BashGameStep extends Game095Step {
  n: number;
  m: number;
  r: number;
  firstTake: number;
}

export function buildBashGameSteps(n: number, m: number): BashGameStep[] {
  const steps: BashGameStep[] = [];
  const lines = BASH_GAME_LINES;

  // Step 0: 入口
  steps.push({
    n,
    m,
    r: 0,
    firstTake: 0,
    piles: [n],
    decision: `主函数入口：接收参数 n=${n} 颗石子，每次最多取 m=${m} 颗`,
    message: '双方轮流取 1~m 颗，取光者胜。准备分析模 (m+1) 周期',
    log: `enter bash(n=${n}, m=${m})`,
    codeLine: lines.entry,
    metrics: { '石子总数 n': `${n}`, '单次上限 m': `${m}` },
  });

  // Step 1: 边界合法性校验
  if (n <= 0 || m <= 0) {
    steps.push({
      n,
      m,
      r: 0,
      firstTake: 0,
      piles: [Math.max(0, n)],
      isFirstWin: false,
      decision: `边界特判：n=${n}, m=${m} 非法参数，先手判负`,
      message: '参数必须大于 0',
      log: 'invalid parameters, return false',
      codeLine: lines.guard,
      metrics: { '判定结果': '参数非法 / 先手负' },
    });
    return steps;
  }

  // Step 2: 计算余数
  const r = n % (m + 1);
  const isFirstWin = r !== 0;
  const firstTake = isFirstWin ? r : 1;

  steps.push({
    n,
    m,
    r,
    firstTake,
    piles: [n],
    decision: `计算模周期余数：r = n % (m + 1) = ${n} % (${m} + 1) = ${r}`,
    message: `周期长度为 m+1=${m + 1}。若余数不为 0，先手可以拿走余数 ${r} 颗，将 (m+1) 的倍数留给对手`,
    log: `compute r = ${n} % ${m + 1} = ${r}`,
    codeLine: lines.computeMod,
    metrics: { '周期 m+1': `${m + 1}`, '余数 r': `${r}` },
  });

  // Step 3: 博弈推演与策略解说
  if (isFirstWin) {
    steps.push({
      n,
      m,
      r,
      firstTake: r,
      piles: [n - r],
      activePileIdx: 0,
      isFirstWin: true,
      decision: `先手制胜策略：先手首轮取走 r=${r} 颗石子，剩余 ${n - r} 颗（刚好为 ${m + 1} 的 ${(n - r) / (m + 1)} 倍）`,
      message: `后续无论后手拿 k 颗 (1 <= k <= ${m})，先手只需拿 ${m + 1} - k 颗，确保每轮二人合计拿走 ${m + 1} 颗，先手必胜！`,
      log: `first player takes ${r} stones, leaves ${n - r}`,
      codeLine: lines.computeMod,
      metrics: { '首轮取走': `${r} 颗`, '剩余石子': `${n - r} 颗` },
    });
  } else {
    steps.push({
      n,
      m,
      r,
      firstTake: 0,
      piles: [n],
      activePileIdx: 0,
      isFirstWin: false,
      decision: `先手必败态 (P-position)：n=${n} 刚好是 m+1=${m + 1} 的整数倍！`,
      message: `无论先手首轮拿走 k 颗 (1 <= k <= ${m})，后手只需对应拿走 ${m + 1} - k 颗，后手将永远掌控局势并取走最后一颗石子`,
      log: `n is multiple of m+1, first player is in P-position`,
      codeLine: lines.computeMod,
      metrics: { '局势分析': '先手无论取几颗均会被后手凑成 m+1' },
    });
  }

  // Step 4: 返回终局结论
  steps.push({
    n,
    m,
    r,
    firstTake,
    piles: [isFirstWin ? Math.max(0, n - r) : n],
    isFirstWin,
    decision: isFirstWin
      ? `🎉 结论：r=${r} != 0 ➔ 先手必胜！返回 true`
      : `💀 结论：r=0 ➔ 先手必败（后手必胜）！返回 false`,
    message: isFirstWin ? '先手拥有完美必胜策略' : '后手拥有完美必胜策略',
    log: `return ${isFirstWin}`,
    codeLine: lines.returnAns,
    metrics: { '终局判定': isFirstWin ? '先手必胜 (true)' : '先手必败 (false)' },
  });

  return steps;
}

export const bashGameVisualizer = registerDeclarativeAlgorithm<BashGameStep>({
  id: 'bash-game-095',
  name: '巴什博弈 (Bash Game)',
  category: 'game',
  icon: '🪨',
  difficulty: 2,
  levelOrder: 951,
  learningGoal: '掌握经典巴什博弈的周期剩余与互补配对制胜原理',
  problemHtml: GAME_095_PROBLEMS.bashGame.html,
  analysisHtml: GAME_095_PROBLEMS.bashGame.html,
  inputs: [
    {
      id: 'input-n',
      label: '石子总数 n',
      type: 'number',
      defaultValue: 15,
      min: 1,
      max: 100,
      step: 1,
      placeholder: '例如 15',
    },
    {
      id: 'input-m',
      label: '单次上限 m',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: BASH_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '15'), 10) || 15);
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildBashGameSteps(n, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: BashGameStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负判定 Banner
    const statusText = step.isFirstWin === undefined
      ? '推演计算中...'
      : step.isFirstWin
      ? `余数 r=${step.r} != 0 ➔ 先手必胜`
      : `余数 r=0 ➔ 先手必败 (后手必胜)`;
    const formulaText = `n % (m + 1) = ${step.n} % ${step.m + 1} = ${step.r}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠视图
    renderStonePiles(root, step.piles || [step.n], step.activePileIdx);

    // 3. 策略推导核心解说卡片
    const card = document.createElement('div');
    card.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    card.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
        <span>🎯 博弈对称性策略剖析:</span>
      </div>
      <div>
        石子总数 <strong>n = ${step.n}</strong>，每次取 <strong>1 ~ ${step.m}</strong> 颗，周期基底 <strong>m + 1 = ${step.m + 1}</strong>。
      </div>
      <div style="margin-top: 6px; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(card);

    stageContainer.appendChild(root);
  },
});
