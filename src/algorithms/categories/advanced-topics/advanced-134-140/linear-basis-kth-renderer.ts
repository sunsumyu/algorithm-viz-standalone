/**
 * Class 137: 线性基重构与第 K 小异或和 (Linear Basis - Kth XOR)
 * HDU 3949 / 洛谷 P3857 彩灯
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { LINEAR_BASIS_KTH_CODES, LINEAR_BASIS_KTH_LINES } from './advanced-134-140-stage-codes';
import { Advanced134Step, renderLinearBasisVisual } from './advanced-134-140-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface LinearBasisKthStep extends Advanced134Step {
  basis: number[];
  p: number[];
  k: number;
  curPIdx?: number;
  ans: number;
  finalAns?: number;
}

export function buildLinearBasisKthSteps(rawNums: number[], k: number): LinearBasisKthStep[] {
  const steps: LinearBasisKthStep[] = [];
  const lines = LINEAR_BASIS_KTH_LINES;

  // 1. 常规插入
  const d: number[] = new Array(62).fill(0);
  for (let x of rawNums) {
    for (let i = 60; i >= 0; i--) {
      if ((x & (1 << i)) !== 0) {
        if (d[i] === 0) {
          d[i] = x;
          break;
        }
        x ^= d[i];
      }
    }
  }

  // Step 0: 入口
  steps.push({
    basis: [...d],
    p: [],
    k,
    ans: 0,
    decision: `主函数入口：开始利用线性基重构算法求解第 K = ${k} 小的子集异或和`,
    message: '通过高位消低位重构基底，使每个基向量独占独立的最高有效位，从而直接与 K 的二进制位建立一一映射',
    log: `enter getKthXor(k=${k})`,
    codeLine: lines.entry,
    metrics: { '目标第 K 小': k, '初始非零基底': d.filter(x => x > 0).length },
  });

  // 2. 高位消低位重构基底
  for (let i = 0; i <= 60; i++) {
    if (d[i] === 0) continue;
    for (let j = 0; j < i; j++) {
      if ((d[i] & (1 << j)) !== 0 && d[j] > 0) {
        d[i] ^= d[j];

        steps.push({
          basis: [...d],
          p: [],
          k,
          ans: 0,
          decision: `高位消低位：基向量 d[${i}] 在第 ${j} 位存在重叠，执行 d[${i}] ^= d[${j}] 消除第 ${j} 位的 1`,
          message: `消元重构后 d[${i}] = ${d[i]} (0b${d[i].toString(2)})，使得各基底二进制权值正交独立`,
          log: `rebuild: d[${i}] ^= d[${j}]`,
          codeLine: lines.rebuild,
          metrics: { '正交化消除位': j, '基底': `d[${i}]=${d[i]}` },
        });
      }
    }
  }

  // 3. 提取紧凑基底数组 p
  const p: number[] = [];
  for (let i = 0; i <= 60; i++) {
    if (d[i] !== 0) p.push(d[i]);
  }

  steps.push({
    basis: [...d],
    p: [...p],
    k,
    ans: 0,
    decision: `收集非零独立基向量：共提取出 ${p.length} 个紧凑基底向量 [${p.join(', ')}]`,
    message: `总计能够生成 2^${p.length} - 1 = ${(1 << p.length) - 1} 种非零不同异或和`,
    log: `collect p: [${p.join(', ')}]`,
    codeLine: lines.collectP,
    metrics: { '有效基底数': p.length, '可表达种类数': (1 << p.length) - 1 },
    statusBadge: { text: `提取 ${p.length} 个独立基底`, type: 'info' },
  });

  // 4. 二进制拆分 K
  let ans = 0;
  for (let i = 0; i < p.length; i++) {
    const isBitSet = (k & (1 << i)) !== 0;

    steps.push({
      basis: [...d],
      p: [...p],
      k,
      curPIdx: i,
      ans,
      decision: `检查 K = ${k} 的第 ${i} 位 (权值 2^${i}): ${isBitSet ? `为 1，将基向量 p[${i}]=${p[i]} 异或加入结果` : '为 0，跳过'}`,
      message: `基向量 p[${i}] 独占的特征位保证了按字典序精确对应第 K 小`,
      log: `combineK: bit ${i} of k is ${isBitSet ? 1 : 0}`,
      codeLine: lines.combineK,
      metrics: { '当前考查位': i, '基向量': p[i], '是否采纳': isBitSet ? '是' : '否' },
    });

    if (isBitSet) {
      ans ^= p[i];
    }
  }

  // 终态
  steps.push({
    basis: [...d],
    p: [...p],
    k,
    ans,
    finalAns: ans,
    decision: `✅ 求解完成！第 K = ${k} 小的异或和为: ${ans} (0b${ans.toString(2)})`,
    message: `整个第 K 小查询时间严格为 O(log V)，无需全量枚举 2^N 种组合，极致高效`,
    log: `kth xor result = ${ans}`,
    codeLine: lines.returnAns,
    metrics: { '最终结果': ans, '查询复杂度': 'O(log V)' },
    statusBadge: { text: `第 ${k} 小异或和 = ${ans}`, type: 'success' },
  });

  return steps;
}

export const linearBasisKthVisualizer = registerDeclarativeAlgorithm<LinearBasisKthStep>({
  id: 'linear-basis-kth-137',
  name: '线性基第 K 小异或和 (Class 137)',
  category: 'math',
  icon: '🎚️',
  difficulty: 3,
  levelOrder: 137,
  learningGoal: '深刻理解线性基高位消低位正交化重构、紧凑基底数组收集与利用 K 的二进制拆分求解第 K 小异或和原理',
  problemHtml: ADVANCED_134_140_PROBLEMS.linearBasisKth.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.linearBasisKth.html,
  inputs: [
    {
      id: 'numList',
      label: '输入整数集合 (逗号分隔)',
      type: 'text',
      defaultValue: '3,5,6',
      placeholder: '请输入正整数',
    },
    {
      id: 'k',
      label: '目标第 K 小 (K >= 1)',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100,
    },
  ],
  codeLanguages: LINEAR_BASIS_KTH_CODES,
  generateSteps: (input) => {
    const raw = String(input.numList || '3,5,6');
    const nums = raw.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
    const k = Math.max(1, Number(input.k) || 3);
    return buildLinearBasisKthSteps(nums.length > 0 ? nums : [3, 5, 6], k);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderLinearBasisVisual(step.basis, step.curPIdx !== undefined ? step.curPIdx : -1, 0, step.ans)}

        <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
          <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">
            🎚️ 重构后的紧凑基底向量组 p[] (共 ${step.p.length} 个)
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${step.p.map((val, idx) => `
              <div style="background: ${idx === step.curPIdx ? '#e0e7ff' : '#ffffff'}; border: 1px solid ${idx === step.curPIdx ? '#6366f1' : '#cbd5e1'}; border-radius: 6px; padding: 6px 10px; font-size: 11px;">
                <span style="font-weight: 700; color: #1e293b;">p[${idx}]</span>: 
                <span style="color: #6366f1; font-weight: 700;">${val}</span> 
                <span style="font-size: 9px; color: #64748b;">(0b${val.toString(2)})</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">目标查询</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">第 ${step.k} 小 (0b${step.k.toString(2)})</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前异或累积值</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.ans}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">最终第 K 小异或和</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.finalAns !== undefined ? step.finalAns : '合成中'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '第 K 小二进制映射进度',
          `K 的二进制分解: ${step.k.toString(2)} | 当前输出: ${step.ans}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
