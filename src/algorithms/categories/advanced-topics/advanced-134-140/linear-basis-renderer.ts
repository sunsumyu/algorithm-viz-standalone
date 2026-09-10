/**
 * Class 136: 线性基与最大异或和 (Linear Basis - Max XOR)
 * 洛谷 P3812 【模板】线性基
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { LINEAR_BASIS_CODES, LINEAR_BASIS_LINES } from './advanced-134-140-stage-codes';
import { Advanced134Step, renderLinearBasisVisual } from './advanced-134-140-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface LinearBasisStep extends Advanced134Step {
  basis: number[];
  curNum: number;
  curBit: number;
  maxXor: number;
  insertedCount: number;
  finalAns?: number;
}

export function buildLinearBasisSteps(nums: number[]): LinearBasisStep[] {
  const steps: LinearBasisStep[] = [];
  const lines = LINEAR_BASIS_LINES;

  const d: number[] = new Array(62).fill(0);
  let inserted = 0;

  // Step 0: 入口
  steps.push({
    basis: [...d],
    curNum: 0,
    curBit: -1,
    maxXor: 0,
    insertedCount: 0,
    decision: `主函数入口：准备将 ${nums.length} 个正整数依次插入线性基，以求解全局最大异或和`,
    message: '线性基性质：原集合任意子集的异或和，与线性基子集的异或和完全等价',
    log: `enter getMaxXor(count=${nums.length})`,
    codeLine: lines.entry,
    metrics: { '输入数字个数': nums.length, '线性基容量': '62 bits' },
  });

  // 插入每个元素
  for (const rawX of nums) {
    let x = rawX;

    steps.push({
      basis: [...d],
      curNum: x,
      curBit: -1,
      maxXor: 0,
      insertedCount: inserted,
      decision: `开始将元素 x = ${x} (0b${x.toString(2)}) 插入线性基`,
      message: '从最高位向低位逐位扫描探测',
      log: `inserting ${x}`,
      codeLine: lines.insertBit,
      metrics: { '当前插入数': x, '已建立基底数': inserted },
    });

    for (let i = 60; i >= 0; i--) {
      if ((x & (1 << i)) !== 0) {
        steps.push({
          basis: [...d],
          curNum: x,
          curBit: i,
          maxXor: 0,
          insertedCount: inserted,
          decision: `元素 x=${x} 在第 ${i} 位为 1：检查该位的线性基槽位 d[${i}]`,
          message: d[i] === 0 ? `槽位 d[${i}] 为空，可直接作为基底驻留！` : `槽位 d[${i}] 已存在值 ${d[i]}，需要执行异或消元`,
          log: `check bit ${i}: d[${i}]=${d[i]}`,
          codeLine: lines.insertBit,
          metrics: { '检测二进制位': i, '槽位状态': d[i] === 0 ? '空置' : `占用(${d[i]})` },
        });

        if (d[i] === 0) {
          d[i] = x;
          inserted++;

          steps.push({
            basis: [...d],
            curNum: x,
            curBit: i,
            maxXor: 0,
            insertedCount: inserted,
            decision: `📌 成功占领基底槽位：令 d[${i}] = ${x} (0b${x.toString(2)})，元素插入成功！`,
            message: `基底中已有 ${inserted} 个线性无关基向量`,
            log: `d[${i}] = ${x}, inserted successfully`,
            codeLine: lines.addBasis,
            metrics: { '新增基底': `d[${i}]=${x}`, '总基底数': inserted },
            statusBadge: { text: `占位成功: d[${i}]=${x}`, type: 'success' },
          });

          break;
        }

        x ^= d[i];

        steps.push({
          basis: [...d],
          curNum: x,
          curBit: i,
          maxXor: 0,
          insertedCount: inserted,
          decision: `⚡ 异或消元：x ^= d[${i}] (${d[i]}) 得到新值 x = ${x} (0b${x.toString(2)})，消去第 ${i} 位`,
          message: `由于第 ${i} 位已有基底，将其异或消去后继续向更低位寻找基底`,
          log: `x ^= d[${i}] -> ${x}`,
          codeLine: lines.xorElim,
          metrics: { '消元后新 x': x, '消去位': i },
        });
      }
    }
  }

  // 贪心求最大异或和
  let maxXor = 0;
  for (let i = 60; i >= 0; i--) {
    if (d[i] > 0) {
      const candidate = maxXor ^ d[i];
      if (candidate > maxXor) {
        const oldMax = maxXor;
        maxXor = candidate;

        steps.push({
          basis: [...d],
          curNum: 0,
          curBit: i,
          maxXor,
          insertedCount: inserted,
          decision: `🎯 贪心最大化：当前 max (${oldMax}) ^ d[${i}] (${d[i]}) = ${maxXor} > ${oldMax}，采纳该基向量！`,
          message: `高位为 1 能够显著增大异或和，更新当前最优值`,
          log: `greedy: maxXor = ${maxXor}`,
          codeLine: lines.queryMax,
          metrics: { '考查基底': `d[${i}]=${d[i]}`, '最大异或和': maxXor },
          statusBadge: { text: `刷新最大异或和: ${maxXor}`, type: 'warning' },
        });
      }
    }
  }

  // 终态
  steps.push({
    basis: [...d],
    curNum: 0,
    curBit: -1,
    maxXor,
    insertedCount: inserted,
    finalAns: maxXor,
    decision: `✅ 线性基求解完毕！子集异或和的最大值为: ${maxXor} (0b${maxXor.toString(2)})`,
    message: `整个插入与贪心查询过程复杂度严格为 O(N log V)，单次查询仅需 O(log V) 秒出结果`,
    log: `linear basis finished, max xor = ${maxXor}`,
    codeLine: lines.returnAns,
    metrics: { '全局最大异或和': maxXor, '总基底数': inserted, '时间复杂度': 'O(N log V)' },
    statusBadge: { text: `最大异或和 = ${maxXor}`, type: 'success' },
  });

  return steps;
}

export const linearBasisVisualizer = registerDeclarativeAlgorithm<LinearBasisStep>({
  id: 'linear-basis-136',
  name: '线性基与最大异或和 (Class 136)',
  category: 'math',
  icon: '🧬',
  difficulty: 3,
  levelOrder: 136,
  learningGoal: '深刻理解线性基高位向低位贪心插入、异或消元、以及贪心求解任意子集最大异或和的数学本质',
  problemHtml: ADVANCED_134_140_PROBLEMS.linearBasis.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.linearBasis.html,
  inputs: [
    {
      id: 'numList',
      label: '输入整数序列 (逗号分隔)',
      type: 'text',
      defaultValue: '11,9,5,7',
      placeholder: '请输入正整数',
    },
  ],
  codeLanguages: LINEAR_BASIS_CODES,
  generateSteps: (input) => {
    const raw = String(input.numList || '11,9,5,7');
    const nums = raw.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
    return buildLinearBasisSteps(nums.length > 0 ? nums : [11, 9, 5, 7]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderLinearBasisVisual(step.basis, step.curBit, step.curNum, step.maxXor)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前被考查数值</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.curNum > 0 ? `${step.curNum} (0b${step.curNum.toString(2)})` : '查询阶段'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">已构建基向量总数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.insertedCount} 个基底</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前最大异或和</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.maxXor}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '线性基操作日志',
          `当前探测二进制位: ${step.curBit >= 0 ? `第 ${step.curBit} 位` : '无'} ${step.finalAns !== undefined ? `| 最终最大异或和 = ${step.finalAns}` : ''}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
