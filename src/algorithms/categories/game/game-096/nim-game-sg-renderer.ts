/**
 * 尼姆博弈 SG 函数证明 (Nim Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：后继集合为 {0, 1, ..., x - 1}，故 mex 恒为 x，数学证明 SG(x) = x
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { NIM_SG_CODES, NIM_SG_LINES } from './game-096-stage-codes';
import {
  Game096Step,
  renderMexCard,
  renderSgTable,
} from './game-096-shared';

export interface NimSgStep extends Game096Step {
  n: number;
}

export function buildNimSgSteps(n: number): NimSgStep[] {
  const steps: NimSgStep[] = [];
  const lines = NIM_SG_LINES;

  const sg: number[] = new Array(n + 1).fill(0);

  // Step 0: 入口
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: 0,
    decision: `主函数入口：准备推导规模 n=${n} 的尼姆单堆 SG 函数`,
    message: '单堆尼姆允许取 1~x 颗，后继集合为 {0, 1, ..., x-1}，我们将逐项计算 mex',
    log: `enter getNimSG(n=${n})`,
    codeLine: lines.entry,
    metrics: { '单堆规模 n': `${n}`, 'SG(0)': '0' },
  });

  // Step 1: 内存分配
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: 0,
    decision: `初始化数组：int[] sg = new int[${n + 1}]`,
    message: '设置基底 SG(0) = 0（空堆必败）',
    log: 'allocate sg array',
    codeLine: lines.init,
    metrics: { '基底态': 'SG(0)=0' },
  });

  // Step 2: 循环计算每一个 i
  for (let i = 1; i <= n; i++) {
    const successors: number[] = [];
    for (let k = 0; k < i; k++) {
      successors.push(sg[k]);
    }

    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      appearSet: [...successors],
      decision: `推导状态 x=${i}：可取 1~${i} 颗，后继状态为 {0, 1, ..., ${i - 1}}，对应后继 SG 集合为 {${successors.join(', ')}}`,
      message: `求 mex{${successors.join(', ')}}：集合中已包含 0 到 ${i - 1} 的所有非负整数，首个缺失的整数恰好为 ${i}！`,
      log: `compute SG(${i})`,
      codeLine: lines.loop,
      metrics: { '当前 x': `${i}`, '后继集合': `{0..${i - 1}}` },
    });

    sg[i] = i;

    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      appearSet: [...successors],
      computedMex: i,
      decision: `赋值确定：sg[${i}] = mex{0, 1, ..., ${i - 1}} = ${i}！`,
      message: `数学定理得证：单堆石子的 SG 值恒等于其石子数本身 (SG(x) ≡ x)`,
      log: `sg[${i}] = ${i}`,
      codeLine: lines.assign,
      metrics: { [`SG(${i})`]: `${i}` },
    });
  }

  // Step 3: 收敛返回
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: n,
    decision: `🎉 证明完毕！所有单堆 SG(x) = x 恒成立！这从数学底层严格解释了为什么多堆尼姆博弈的胜负就是各堆大小的异或和！`,
    message: '返回完整 SG 数组',
    log: 'done Nim SG proof',
    codeLine: lines.returnAns,
    metrics: { '最终定理': 'SG(x) = x 恒成立' },
  });

  return steps;
}

export const nimGameSgVisualizer = registerDeclarativeAlgorithm<NimSgStep>({
  id: 'nim-game-sg-096',
  name: '尼姆博弈 SG 证明 (Nim SG)',
  category: 'game',
  icon: '📐',
  difficulty: 3,
  levelOrder: 962,
  learningGoal: '通过数学归纳法与 mex 算子证明 SG(x) = x 恒成立，揭示 Bouton 定理本质',
  problemHtml: GAME_096_PROBLEMS.nimGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.nimGameSg.html,
  inputs: [
    {
      id: 'input-n',
      label: '单堆石子最大上限 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: NIM_SG_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildNimSgSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: NimSgStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. SG 表格展示
    renderSgTable(root, step.sgTable || [], step.curIdx, '尼姆单堆 SG 函数递推表 (SG(x) ≡ x)');

    // 2. mex 计算卡片
    if (step.appearSet) {
      renderMexCard(root, step.appearSet, step.computedMex ?? step.curIdx ?? 0, `状态 x=${step.curIdx} 的 mex 算子推导`);
    }

    // 3. 数学解说
    const mathCard = document.createElement('div');
    mathCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    mathCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        ✨ 为什么 Bouton 定理等于异或和？
      </div>
      <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
        根据 SG 定理，任意两个独立子游戏的复合游戏其 SG 值为各自 SG 值的异或：<code>SG(G1 + G2) = SG(G1) ^ SG(G2)</code>。
        既然每个单堆的 <code>SG(ai) = ai</code>，那么 <code>k</code> 堆尼姆博弈的总 SG 值必然精确等于 <code>a1 ^ a2 ^ ... ^ ak</code>！
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(mathCard);

    stageContainer.appendChild(root);
  },
});
