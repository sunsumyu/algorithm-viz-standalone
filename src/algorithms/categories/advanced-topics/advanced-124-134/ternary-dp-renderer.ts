/**
 * Class 126: 三进制状压 DP (Ternary State Compression DP)
 * POJ 2151 / 洛谷 P2704 变体
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { TERNARY_DP_CODES, TERNARY_DP_LINES } from './advanced-124-134-stage-codes';
import { AdvancedStep } from './advanced-124-134-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface TernaryDpStep extends AdvancedStep {
  n: number;
  m: number;
  curRow: number;
  totalStates: number;
  validStateCount: number;
  bestAns: number;
  topStates: { state: number; ternaryStr: string; val: number }[];
}

export function buildTernaryDpSteps(n: number, m: number): TernaryDpStep[] {
  const steps: TernaryDpStep[] = [];
  const lines = TERNARY_DP_LINES;

  const totalStates = Math.pow(3, m);
  const pow3: number[] = [1];
  for (let i = 1; i <= m; i++) pow3.push(pow3[i - 1] * 3);

  function toTernaryStr(s: number): string {
    let str = '';
    for (let c = 0; c < m; c++) {
      const digit = Math.floor(s / pow3[c]) % 3;
      str = digit + str;
    }
    return str;
  }

  // Step 0: 入口
  steps.push({
    n,
    m,
    curRow: 0,
    totalStates,
    validStateCount: 1,
    bestAns: 0,
    topStates: [{ state: 0, ternaryStr: '0'.repeat(m), val: 0 }],
    decision: `主函数入口：开始求解 ${n} x ${m} 网格中跨两行约束的最大装置放置数`,
    message: `使用三进制状态压缩：0 表示空闲可放，1 表示受上 1 行影响，2 表示当前行刚放装置`,
    log: `enter ternaryDp(n=${n}, m=${m})`,
    codeLine: lines.entry,
    metrics: { '网格尺寸': `${n} x ${m}`, '三进制总状态数': totalStates, '基底': '3^M' },
  });

  steps.push({
    n,
    m,
    curRow: 0,
    totalStates,
    validStateCount: 1,
    bestAns: 0,
    topStates: [{ state: 0, ternaryStr: '0'.repeat(m), val: 0 }],
    decision: `预处理三进制位权：pow3 = [${pow3.join(', ')}]，总状态空间大小为 3^${m} = ${totalStates}`,
    message: `每个三进制位代表一列中当前的冷却/覆盖剩余步数`,
    log: `init power of 3`,
    codeLine: lines.initPower,
    metrics: { '状态空间': totalStates },
  });

  let dp: number[] = new Array(totalStates).fill(-1);
  dp[0] = 0;

  for (let r = 0; r < n; r++) {
    const nxt: number[] = new Array(totalStates).fill(-1);

    steps.push({
      n,
      m,
      curRow: r,
      totalStates,
      validStateCount: dp.filter(v => v >= 0).length,
      bestAns: Math.max(0, ...dp),
      topStates: dp
        .map((v, s) => ({ state: s, ternaryStr: toTernaryStr(s), val: v }))
        .filter(x => x.val >= 0)
        .slice(0, 6),
      decision: `推进至第 ${r} 行：遍历上一行留下的所有合法三进制冷却状态`,
      message: `原状态中非零位将自动递减衰减：2 ➔ 1, 1 ➔ 0`,
      log: `rowLoop(r=${r})`,
      codeLine: lines.rowLoop,
      metrics: { '当前行': r, '上一行有效状态': dp.filter(v => v >= 0).length },
    });

    // 行内尝试
    for (let s = 0; s < totalStates; s++) {
      if (dp[s] < 0) continue;

      // 生成下一行基础衰减状态
      let baseNext = 0;
      for (let c = 0; c < m; c++) {
        const digit = Math.floor(s / pow3[c]) % 3;
        const nxtDigit = Math.max(0, digit - 1);
        baseNext += nxtDigit * pow3[c];
      }

      // 决策 1: 当前行全不放
      nxt[baseNext] = Math.max(nxt[baseNext], dp[s]);

      // 决策 2: 在允许列放 1 个装置
      for (let c = 0; c < m; c++) {
        const curDigit = Math.floor(s / pow3[c]) % 3;
        if (curDigit === 0) {
          // 当前列无上方约束，可放置
          const placedNext = baseNext + 2 * pow3[c];
          nxt[placedNext] = Math.max(nxt[placedNext], dp[s] + 1);
        }
      }
    }

    dp = nxt;

    steps.push({
      n,
      m,
      curRow: r,
      totalStates,
      validStateCount: dp.filter(v => v >= 0).length,
      bestAns: Math.max(0, ...dp),
      topStates: dp
        .map((v, s) => ({ state: s, ternaryStr: toTernaryStr(s), val: v }))
        .filter(x => x.val >= 0)
        .slice(0, 6),
      decision: `第 ${r} 行计算完毕：产生 ${dp.filter(v => v >= 0).length} 个合法后继状态，当前累计最大放置数 = ${Math.max(0, ...dp)}`,
      message: `成功通过三进制位运算排除不合法冲突方案`,
      log: `dfsRow finished for row ${r}, best = ${Math.max(0, ...dp)}`,
      codeLine: lines.dfsRow,
      metrics: { '已处理行': r + 1, '当前最优放置数': Math.max(0, ...dp) },
    });
  }

  const finalAns = Math.max(0, ...dp);

  // 终态
  steps.push({
    n,
    m,
    curRow: n - 1,
    totalStates,
    validStateCount: dp.filter(v => v >= 0).length,
    bestAns: finalAns,
    topStates: dp
      .map((v, s) => ({ state: s, ternaryStr: toTernaryStr(s), val: v }))
      .filter(x => x.val >= 0)
      .slice(0, 6),
    decision: `✅ 三进制状压 DP 搜索完成！在 ${n} x ${m} 网格中满足跨两行互不侵犯条件的最大放置数为: ${finalAns}`,
    message: `三进制状态完美解决了二值状态无法区分“自身放置”与“前驱一层覆盖”的技术瓶颈，时间复杂度 O(N x 3^M)`,
    log: `ternary dp finished, max placement = ${finalAns}`,
    codeLine: lines.returnAns,
    metrics: { '最终最大放置数': finalAns, '复杂度': 'O(N x 3^M)' },
    statusBadge: { text: `最大放置数 = ${finalAns}`, type: 'success' },
  });

  return steps;
}

export const ternaryDpVisualizer = registerDeclarativeAlgorithm<TernaryDpStep>({
  id: 'ternary-dp-126',
  name: '三进制状压 DP (Class 126)',
  category: 'dynamic-programming',
  icon: '🔺',
  difficulty: 3,
  levelOrder: 126,
  learningGoal: '掌握三进制状态表示法解决跨步长多层约束问题，理解 3^M 状态空间设计与衰减转移',
  problemHtml: ADVANCED_124_134_PROBLEMS.ternaryDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.ternaryDp.html,
  inputs: [
    {
      id: 'n',
      label: '网格行数 N',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 5,
    },
    {
      id: 'm',
      label: '网格列数 M',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 4,
    },
  ],
  codeLanguages: TERNARY_DP_CODES,
  generateSteps: (input) => {
    const n = Math.min(5, Math.max(1, Number(input.n) || 3));
    const m = Math.min(4, Math.max(1, Number(input.m) || 3));
    return buildTernaryDpSteps(n, m);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            🔺 三进制状态活跃样本池 (0:自由, 1:受覆, 2:已放)
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${step.topStates.map(item => `
              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 11px;">
                <span style="font-weight: 700; color: #6366f1;">#${item.state} (${item.ternaryStr}_3)</span>: 
                <span style="color: #059669; font-weight: 700;">+${item.val} 装置</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前推进到行</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">第 ${step.curRow} 行</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">有效合法状态总数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.validStateCount} / ${step.totalStates}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前最大放置装置数</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.bestAns}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '三进制状态转移',
          `当前最优解: ${step.bestAns} | 状态衰减法则: digit = max(0, digit - 1)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
