/**
 * 巴什博弈与 SG 函数打表 (Bash Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：后继状态取 mex，自底向上严格归纳出 SG(x) = x % (m + 1)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { BASH_SG_CODES, BASH_SG_LINES } from './game-096-stage-codes';
import {
  Game096Step,
  renderMexCard,
  renderSgTable,
} from './game-096-shared';

export interface BashSgStep extends Game096Step {
  n: number;
  m: number;
}

export function buildBashSgSteps(n: number, m: number): BashSgStep[] {
  const steps: BashSgStep[] = [];
  const lines = BASH_SG_LINES;

  const sg: number[] = new Array(n + 1).fill(0);

  // Step 0: 入口
  steps.push({
    n,
    m,
    sgTable: [...sg],
    curIdx: 0,
    decision: `主函数入口：准备对参数 n=${n}, m=${m} 进行 SG 函数自底向上打表`,
    message: `初始化状态表：SG(0)=0 代表无石子可取为终局必败态。单次允许取 1~${m} 颗`,
    log: `enter getBashSG(n=${n}, m=${m})`,
    codeLine: lines.entry,
    metrics: { '规模 n': `${n}`, '单次上限 m': `${m}` },
  });

  // Step 1: 内存分配
  steps.push({
    n,
    m,
    sgTable: [...sg],
    curIdx: 0,
    decision: `分配数组空间：int[] sg = new int[${n + 1}]，基底 SG(0) = 0`,
    message: '准备进入 1 ~ n 的状态递推计算',
    log: 'allocate sg array',
    codeLine: lines.init,
    metrics: { 'SG(0)': '0' },
  });

  // Step 2: 循环计算每个 i 的 SG 值
  for (let i = 1; i <= n; i++) {
    const appearSet: number[] = [];
    const transitions: { from: number; to: number; toSg: number }[] = [];

    // 外层循环
    steps.push({
      n,
      m,
      sgTable: [...sg],
      curIdx: i,
      decision: `外层循环：准备推导状态 x=${i} 的 SG 值`,
      message: `从 ${i} 颗石子拿走 1 ~ ${m} 颗，考察所有可到达的后继状态`,
      log: `compute SG(${i})`,
      codeLine: lines.outerLoop,
      metrics: { '当前目标 x': `${i}` },
    });

    // 内层转移
    for (let j = 1; j <= m && i - j >= 0; j++) {
      const prev = i - j;
      const prevSg = sg[prev];
      appearSet.push(prevSg);
      transitions.push({ from: i, to: prev, toSg: prevSg });
    }

    steps.push({
      n,
      m,
      sgTable: [...sg],
      curIdx: i,
      appearSet: [...appearSet],
      transitions,
      decision: `枚举后继状态：从 ${i} 拿取 1~${Math.min(m, i)} 颗 ➔ 后继状态 {${transitions.map(t => t.to).join(', ')}}，对应 SG 集合 {${appearSet.join(', ')}}`,
      message: '准备计算集合中未出现的最小非负整数 mex',
      log: `transitions for ${i}: ${transitions.map(t => `SG(${t.to})=${t.toSg}`).join(', ')}`,
      codeLine: lines.innerLoop,
      metrics: { '后继 SG 集合': `{${appearSet.join(',')}}` },
    });

    // 计算 mex
    let mex = 0;
    const appeared = new Set(appearSet);
    while (appeared.has(mex)) {
      mex++;
    }
    sg[i] = mex;

    steps.push({
      n,
      m,
      sgTable: [...sg],
      curIdx: i,
      appearSet: [...appearSet],
      computedMex: mex,
      decision: `计算 mex 结果：SG(${i}) = mex{${appearSet.join(', ')}} = ${mex}！`,
      message: `填入表项 sg[${i}] = ${mex} (恰好等于 ${i} % ${m + 1} = ${i % (m + 1)})`,
      log: `sg[${i}] = ${mex}`,
      codeLine: lines.computeMex,
      metrics: { [`SG(${i})`]: `${mex}`, '模(m+1)验证': `${i % (m + 1)}` },
    });
  }

  // Step 3: 归纳收敛返回
  const isFirstWin = sg[n] > 0;
  steps.push({
    n,
    m,
    sgTable: [...sg],
    curIdx: n,
    computedMex: sg[n],
    isFirstWin,
    decision: `🎉 打表完成！整个序列 SG(0..${n}) = [${sg.join(', ')}]，完全印证 SG(x) ≡ x % (m + 1)！终局 SG(${n}) = ${sg[n]} ➔ ${isFirstWin ? '先手必胜 (SG>0)' : '先手必败 (SG=0)'}`,
    message: '算法成功收敛并严格证实周期律',
    log: `done bash SG, result=${isFirstWin}`,
    codeLine: lines.returnAns,
    metrics: { [`SG(${n})`]: `${sg[n]}`, '最终结论': isFirstWin ? '先手必胜' : '先手必败' },
  });

  return steps;
}

export const bashGameSgVisualizer = registerDeclarativeAlgorithm<BashSgStep>({
  id: 'bash-game-sg-096',
  name: '巴什博弈 SG 打表 (Bash SG)',
  category: 'game',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 961,
  learningGoal: '通过自底向上推导与 mex 算子观察巴什博弈 SG(x) = x % (m+1) 周期性的诞生',
  problemHtml: GAME_096_PROBLEMS.bashGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.bashGameSg.html,
  inputs: [
    {
      id: 'input-n',
      label: '打表石子数 n',
      type: 'number',
      defaultValue: 12,
      min: 1,
      max: 30,
      step: 1,
      placeholder: '例如 12',
    },
    {
      id: 'input-m',
      label: '单次上限 m',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: BASH_SG_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '12'), 10) || 12);
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildBashSgSteps(n, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: BashSgStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. SG 函数表格看板
    renderSgTable(root, step.sgTable || [], step.curIdx, `巴什博弈 SG 函数打表 (m=${step.m})`);

    // 2. 当前步 mex 计算卡片
    if (step.appearSet) {
      renderMexCard(root, step.appearSet, step.computedMex ?? 0, `求解 SG(${step.curIdx}) 的 mex 算子`);
    }

    // 3. 周期规律验证卡片
    const infoCard = document.createElement('div');
    infoCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    infoCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        💡 周期律归纳观察:
      </div>
      <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
        因为每次只能从前 <strong>m=${step.m}</strong> 项转移，因此后继集合的大小为 m，其 mex 必然落在 <code>0 ~ m</code> 之间，从而严格形成长度为 <strong>m+1=${step.m + 1}</strong> 的循环节！
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(infoCard);

    stageContainer.appendChild(root);
  },
});
