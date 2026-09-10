/**
 * Class 138: 01 分数规划 (Fractional Programming)
 * POJ 2976 Dropping Tests / 洛谷 P4377 Talent Show
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { FRACTIONAL_PROGRAMMING_CODES, FRACTIONAL_PROGRAMMING_LINES } from './advanced-134-140-stage-codes';
import { Advanced134Step, renderFractionalVisual } from './advanced-134-140-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface FractionalStep extends Advanced134Step {
  a: number[];
  b: number[];
  k: number;
  l: number;
  r: number;
  mid: number;
  transformed: { id: number; a: number; b: number; w: number }[];
  totalGain: number;
  isFeasible: boolean;
  finalAns?: number;
}

export function buildFractionalSteps(
  a: number[],
  b: number[],
  k: number
): FractionalStep[] {
  const steps: FractionalStep[] = [];
  const lines = FRACTIONAL_PROGRAMMING_LINES;

  let l = 0.0;
  let r = 20.0; // 搜索上界
  const maxIters = 12; // 教学演示取 12 次二分

  // Step 0: 入口
  steps.push({
    a: [...a],
    b: [...b],
    k,
    l,
    r,
    mid: (l + r) / 2.0,
    transformed: a.map((val, idx) => ({ id: idx, a: val, b: b[idx], w: val })),
    totalGain: 0,
    isFeasible: false,
    decision: `主函数入口：开始对 ${a.length} 个物品选取 ${k} 个，最大化收益与代价之比 sum(a)/sum(b)`,
    message: `Dinkelbach 算法思想：将非线性比值优化转化为二分判定 sum(a - mid * b) >= 0`,
    log: `enter maxRatio(k=${k})`,
    codeLine: lines.entry,
    metrics: { '物品总数': a.length, '选取个数 k': k, '初始二分区间': `[${l}, ${r}]` },
  });

  for (let iter = 1; iter <= maxIters; iter++) {
    const mid = (l + r) / 2.0;

    // 计算转化权值 w = a - mid * b
    const list = a.map((val, idx) => ({
      id: idx,
      a: val,
      b: b[idx],
      w: val - mid * b[idx],
    }));

    // 按 w 降序排序，取前 k 个
    list.sort((x, y) => y.w - x.w);
    const topK = list.slice(0, k);
    const totalGain = topK.reduce((acc, cur) => acc + cur.w, 0);
    const isFeasible = totalGain >= -1e-7;

    steps.push({
      a: [...a],
      b: [...b],
      k,
      l,
      r,
      mid,
      transformed: list,
      totalGain,
      isFeasible,
      decision: `第 ${iter} 轮二分测试比率 mid = ${mid.toFixed(4)}：将各物品权值变换为 w = a - ${mid.toFixed(2)} * b`,
      message: `选取权值最大的前 ${k} 个物品，累计转化收益总和 sum(w) = ${totalGain.toFixed(4)}`,
      log: `iter ${iter}: mid=${mid.toFixed(4)}, sum_w=${totalGain.toFixed(4)}`,
      codeLine: lines.calcMid,
      metrics: { '当前测试 mid': mid.toFixed(4), '前 k 项收益和': totalGain.toFixed(4) },
    });

    if (isFeasible) {
      l = mid;

      steps.push({
        a: [...a],
        b: [...b],
        k,
        l,
        r,
        mid,
        transformed: list,
        totalGain,
        isFeasible: true,
        decision: `✅ 判定成功：累计收益 sum(w) = ${totalGain.toFixed(4)} >= 0！说明可以达到该性价比，提高下界 l = ${mid.toFixed(4)}`,
        message: `向右半区间搜索更高比率`,
        log: `check passed, l = ${l.toFixed(4)}`,
        codeLine: lines.checkTrue,
        metrics: { '新下界 l': l.toFixed(4), '目标判定': '可行' },
        statusBadge: { text: `比率 ${mid.toFixed(3)} 可行`, type: 'success' },
      });
    } else {
      r = mid;

      steps.push({
        a: [...a],
        b: [...b],
        k,
        l,
        r,
        mid,
        transformed: list,
        totalGain,
        isFeasible: false,
        decision: `❌ 判定失败：累计收益 sum(w) = ${totalGain.toFixed(4)} < 0！无法达到该性价比，降低上界 r = ${mid.toFixed(4)}`,
        message: `向左半区间降低预期比率`,
        log: `check failed, r = ${r.toFixed(4)}`,
        codeLine: lines.checkTrue,
        metrics: { '新上界 r': r.toFixed(4), '目标判定': '不可行' },
        statusBadge: { text: `比率 ${mid.toFixed(3)} 过高`, type: 'danger' },
      });
    }
  }

  // 终态
  const finalAns = l;
  const finalList = a.map((val, idx) => ({
    id: idx,
    a: val,
    b: b[idx],
    w: val - finalAns * b[idx],
  }));
  finalList.sort((x, y) => y.w - x.w);
  const finalTopK = finalList.slice(0, k);
  const sumA = finalTopK.reduce((s, i) => s + i.a, 0);
  const sumB = finalTopK.reduce((s, i) => s + i.b, 0);

  steps.push({
    a: [...a],
    b: [...b],
    k,
    l,
    r,
    mid: l,
    transformed: finalList,
    totalGain: 0,
    isFeasible: true,
    finalAns,
    decision: `🎉 01 分数规划收敛完毕！最大性价比为: ${finalAns.toFixed(4)} (最佳组合: sum(a)=${sumA} / sum(b)=${sumB} = ${(sumA / sumB).toFixed(4)})`,
    message: `选中的前 ${k} 个最佳物品 ID 为: [${finalTopK.map(i => `#${i.id}`).join(', ')}]，Dinkelbach 算法完美达到理论精度`,
    log: `fractional programming finished, ans = ${finalAns.toFixed(4)}`,
    codeLine: lines.returnAns,
    metrics: { '最大性价比': finalAns.toFixed(4), '收益和': sumA, '代价和': sumB },
    statusBadge: { text: `最大比率: ${finalAns.toFixed(3)}`, type: 'success' },
  });

  return steps;
}

export const fractionalProgrammingVisualizer = registerDeclarativeAlgorithm<FractionalStep>({
  id: 'fractional-programming-138',
  name: '01 分数规划 (Class 138)',
  category: 'greedy',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 138,
  learningGoal: '深刻理解 01 分数规划 Dinkelbach 二分判定转化 sum(a - mid*b) >= 0 与贪心排序选取的数学原理',
  problemHtml: ADVANCED_134_140_PROBLEMS.fractionalProgramming.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.fractionalProgramming.html,
  inputs: [
    {
      id: 'aList',
      label: '收益数组 a[i] (逗号分隔)',
      type: 'text',
      defaultValue: '5,1,3,4,8',
      placeholder: '请输入各物品收益',
    },
    {
      id: 'bList',
      label: '代价数组 b[i] (逗号分隔)',
      type: 'text',
      defaultValue: '2,2,1,5,3',
      placeholder: '请输入各物品代价',
    },
    {
      id: 'k',
      label: '选取物品个数 K',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10,
    },
  ],
  codeLanguages: FRACTIONAL_PROGRAMMING_CODES,
  generateSteps: (input) => {
    const a = String(input.aList || '5,1,3,4,8').split(',').map(Number);
    const b = String(input.bList || '2,2,1,5,3').split(',').map(Number);
    const k = Math.max(1, Math.min(a.length, Number(input.k) || 3));
    return buildFractionalSteps(a, b, k);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderFractionalVisual(step.a, step.b, step.mid, step.transformed, step.totalGain)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前二分区间</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">[${step.l.toFixed(3)}, ${step.r.toFixed(3)}]</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">测试目标比率 mid</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.mid.toFixed(4)}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">最终最大性价比</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.finalAns !== undefined ? step.finalAns.toFixed(4) : '二分逼近中'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          'Dinkelbach 二分判定状态',
          `当前测试比率: ${step.mid.toFixed(4)} | 综合增益: ${step.totalGain.toFixed(4)} (${step.isFeasible ? '可达' : '过高'})`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
